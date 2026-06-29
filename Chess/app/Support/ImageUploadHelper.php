<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadHelper
{
    public static function store(UploadedFile $file, string $directory): string
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');
        $filename = Str::uuid().'.'.$extension;
        $path = $file->storeAs($directory, $filename, 'public');

        return '/storage/'.$path;
    }

    public static function delete(?string $imagePath): void
    {
        if (! $imagePath || str_starts_with($imagePath, 'http')) {
            return;
        }

        $relative = ltrim(str_replace('/storage/', '', $imagePath), '/');

        if ($relative !== '') {
            Storage::disk('public')->delete($relative);
        }
    }
}
