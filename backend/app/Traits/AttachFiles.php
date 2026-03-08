<?php

namespace App\Traits;

use App\Models\Image;
use Illuminate\Support\Facades\Storage;

trait AttachFiles
{
    public function uploadFile($request, $model, $folder)
{
    $files = $request->file('files');

    // ✅ لو ملف واحد حوّله لـ array
    if (!is_array($files)) {
        $files = [$files];
    }

    foreach ($files as $file) {
        $fileName = $file->getClientOriginalName();

        $file->storeAs('attachments/' . $folder . '/' . $model->id, $fileName, 'upload_attachments');

        $model->images()->create([
            'filename' => $fileName,
            'type'     => $request->type,
            'title'    => $request->title,
            'notes'    => $request->notes,
            'date'     => $request->date,
        ]);
    }
}


    public function deleteFile($id, $folder)
    {
        $path = 'attachments/' . $folder . '/' . $id;

        if (Storage::disk('upload_attachments')->exists($path)) {
            Storage::disk('upload_attachments')->deleteDirectory($path);
        }
    }

    public function deleteFileByRecord($image, $folder)
    {
        $path = 'attachments/' . $folder . '/' . $image->imageable_id . '/' . $image->filename;

        if (Storage::disk('upload_attachments')->exists($path)) {
            Storage::disk('upload_attachments')->delete($path);
        }
    }
}
