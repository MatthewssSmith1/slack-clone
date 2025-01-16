<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\{Auth, Storage};
use App\Models\Message;

class AttachmentController extends Controller
{
    use AuthorizesRequests;

    public function download(Message $message)
    {
        $this->authorize('view', $message->channel);

        if (!$message->attachment_path) 
            return response()->json(['error' => 'No attachment found'], 404);

        return Storage::download($message->attachment_path, $message->attachment_name);
    }
} 