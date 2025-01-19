<?php

namespace App\Http\Controllers;

use App\Models\{Channel, Message, Link};
use App\Jobs\MessageEmbeddingJob;
use App\Data\AssistantOptions;
use App\Events\MessagePosted;
use Illuminate\Http\{JsonResponse, Request};
use Probots\Pinecone\Client as Pinecone;
use Illuminate\Support\Facades\{Auth, DB, Log, Storage};
use Illuminate\Validation\Rules\File;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class MessageController extends Controller
{
    use AuthorizesRequests;
    
    public const CHUNK_SIZE = 50;

    public function index(Request $request, Channel $channel): JsonResponse
    {
        $this->authorize('view', $channel);

        $validated = $request->validate([
            'parentId' => ['sometimes', 'integer', 'exists:messages,id'],
            'cursor' => ['sometimes', 'integer', 'min:0']
        ]);

        $query = $channel->messages()
            ->select('messages.*')
            ->with('user:id,name,profile_picture')
            ->with(['reactions' => function ($query) {
                $query->select('emoji_code', 'user_id', 'message_id');
            }])
            ->with(['links' => function ($query) {
                $query->select('id', 'message_id', 'tgt_msg_id', 'rank', 'attachment_path', 'attachment_name');
            }]);

        if (isset($validated['parentId'])) {
            $parentId = $validated['parentId'];
            $query->where(function($q) use ($parentId) {
                $q->where('parent_id', $parentId)->orWhere('id', $parentId);
            });
        } else {
            $query->whereNull('parent_id');
        }

        if (isset($validated['cursor'])) 
            $query->where('created_at', '<', date('Y-m-d H:i:s', $validated['cursor']));

        $messages = $query->orderBy('created_at', 'desc')->limit(self::CHUNK_SIZE)->get();

        $prevMsg = null;
        foreach ($messages as $i => $msg) {
            $msg->setRelation('reactions', 
                collect($msg->reactions->groupBy('emoji_code'))->map(function ($group) {
                    return [
                        'emoji' => $group[0]->emoji_code,
                        'userIds' => $group->pluck('user_id')->toArray(),
                    ];
                })->values()
            );

            $prevMsg['is_continuation'] = $prevMsg && ($prevMsg->user_id === $msg->user_id);
            $prevMsg = $msg;
        }
        if ($prevMsg) $prevMsg['is_continuation'] = false;

        $nextCursor = $messages->count() === self::CHUNK_SIZE 
            ? $messages->last()->created_at->timestamp : null;
        
        return response()->json([
            'messages' => $messages->values(),
            'nextCursor' => $nextCursor
        ]);
    }

    public function store(Request $request, Channel $channel)
    {
        $this->authorize('view', $channel);

        $validated = $request->validate([
            'content' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'attachment' => ['sometimes', File::default()->max('10mb')],
            'parentId' => ['sometimes', 'integer', 'exists:messages,id'],
            ...AssistantOptions::validationRules('assistantOpts'),
        ]);
        $validated['content'] ??= '';

        $message = DB::transaction(function () use ($channel, $validated) {
            $message = $channel->messages()->create([
                'user_id' => Auth::id(),
                'content' => $validated['content'],
                'parent_id' => $validated['parentId'] ?? null,
            ]);

            if (isset($validated['attachment'])) {
                $file = $validated['attachment'];
                $path = Storage::putFile('attachments', $file);
                
                $message->links()->create([
                    'attachment_path' => $path,
                    'attachment_name' => $file->getClientOriginalName(),
                    'rank' => null, // null rank indicates owned attachment
                ]);
            }

            return $message;
        });

        broadcast(new MessagePosted($message));
        
        MessageEmbeddingJob::dispatch(
            $message, 
            isset($validated['assistantOpts']) ? AssistantOptions::fromJson($validated['assistantOpts']) : null
        );

        return $message->load(['user:id,name,profile_picture', 'links']);
    }

    public function destroy(Pinecone $pinecone, Message $message): JsonResponse
    {
        $this->authorize('destroy', $message);

        try {   
            DB::transaction(function () use ($message) {
                // Delete any owned attachments (where rank is null)
                foreach ($message->links()->whereNull('rank')->get() as $link) {
                    if ($link->attachment_path) {
                        Storage::delete($link->attachment_path);
                    }
                }
                
                $message->links()->delete();
                $message->delete();
            });

            // TODO: something like $pinecone->data()->vectors()->delete([$message->id]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
} 

