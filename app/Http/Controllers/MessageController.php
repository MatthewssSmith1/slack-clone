<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\Message;
use App\Jobs\MessageEmbeddingJob;
use App\Data\AssistantOptions;
use App\Events\MessagePosted;
use Illuminate\Http\{JsonResponse, Request};
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

        // TODO: select only needed columns (get data from userStore via user_id instead of including related user)
        $query = $channel->messages()
            ->select('messages.*')
            ->with('user:id,name,profile_picture')
            ->with(['reactions' => function ($query) {
                $query->select('emoji_code', 'user_id', 'message_id');
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
        foreach ($messages as $msg) {
            $msg['is_continuation'] = $prevMsg && 
                $msg->user_id && 
                $prevMsg->user_id && 
                $msg->user_id === $prevMsg->user_id;
            $prevMsg = $msg;

            $msg->setRelation('reactions', 
                collect($msg->reactions->groupBy('emoji_code'))->map(function ($group) {
                    return [
                        'emoji' => $group[0]->emoji_code,
                        'userIds' => $group->pluck('user_id')->toArray(),
                    ];
                })->values()
            );
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
            'content' => ['nullable', 'string', 'max:2000'],
            'attachment' => ['sometimes', File::default()->max('10mb')],
            'parentId' => ['sometimes', 'integer', 'exists:messages,id'],
            ...AssistantOptions::validationRules('assistantOpts'),
        ]);

        $message = $channel->messages()->create($this->getMessageFields($validated));

        // send to other users in channel
        broadcast(new MessagePosted($message));
        
        // assistant responds, eventually broadcasted to the authed user's assistant channel
        MessageEmbeddingJob::dispatch(
            $message, 
            isset($validated['assistantOpts']) ? AssistantOptions::fromJson($validated['assistantOpts']) : null
        );

        return $message->load('user:id,name,profile_picture');
    }

    private function getMessageFields(array $data): array
    {
        $validated['content'] ??= '';
        $fields = ['user_id' => Auth::id(), 'content' => $data['content']];

        if (isset($data['parentId'])) $fields['parent_id'] = $data['parentId'];

        if (isset($data['attachment'])) {
            $file = $data['attachment'];
            $fields['attachment_name'] = $file->getClientOriginalName();
            $fields['attachment_path'] = Storage::putFile('attachments', $file);
        }

        return $fields;
    }
} 

