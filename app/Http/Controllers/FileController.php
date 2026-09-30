<?php

namespace App\Http\Controllers;

use App\Enums\FieldType;
use App\Models\FormAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    /**
     * Download a file a student uploaded. Only the student and admins may see it.
     */
    public function __invoke(Request $request, FormAnswer $answer): StreamedResponse
    {
        $user = $request->user();

        abort_unless($user->isAdmin() || $answer->user_id === $user->id, 403);
        abort_unless($answer->field?->type === FieldType::File && $answer->value, 404);

        $file = json_decode($answer->value, true);

        abort_unless(is_array($file) && isset($file['path']) && Storage::disk('local')->exists($file['path']), 404);

        return Storage::disk('local')->response($file['path'], $file['name'] ?? null);
    }
}
