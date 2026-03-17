<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;

trait AttachFiles
{
    public function uploadFile($request, $model, $folder, $userId = null)
    {
        $files = $request->file('files');

        if (!is_array($files)) {
            $files = [$files];
        }

        $userId = $userId ?? $model->user_id ?? $model->id;

        foreach ($files as $file) {
            if (!$file) continue; // ✅ تجاهل لو null

            $fileName = $file->getClientOriginalName();

            $file->storeAs(
                'attachments/' . $userId . '/' . $folder,
                $fileName,
                'upload_attachments'
            );

            $model->images()->create([
                'filename' => $fileName,
                'type'     => $request->type ?? $folder,    // ✅ لو مش متبعت بناخد اسم الـ folder
                'title'    => $request->title ?? $fileName, // ✅ لو مش متبعت بناخد اسم الملف
                'notes'    => $request->notes ?? null,
                'date'     => $request->date ?? now(),       // ✅ لو مش متبعت بناخد التاريخ الحالي
            ]);
        }
    }

    public function deleteFile($userId, $folder)
    {
        // ✅ بنمسح الـ folder بتاع الـ user
        $path = 'attachments/' . $userId . '/' . $folder;

        if (Storage::disk('upload_attachments')->exists($path)) {
            Storage::disk('upload_attachments')->deleteDirectory($path);
        }
    }

    public function deleteFileByRecord($image, $folder)
    {
        // ✅ بنجيب الـ user_id من الـ imageable
        $userId = $image->imageable->user_id ?? $image->imageable_id;

        $path = 'attachments/' . $userId . '/' . $folder . '/' . $image->filename;

        if (Storage::disk('upload_attachments')->exists($path)) {
            Storage::disk('upload_attachments')->delete($path);
        }
    }
}
