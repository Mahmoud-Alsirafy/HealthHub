<?php

namespace App\Traits;

use App\Models\Image;
use Illuminate\Support\Facades\Storage;

trait AttachFiles
{
    public function uploadFile($files, $model, $folder)
    {
        foreach ($files as $file) {

            $fileName = $file->getClientOriginalName();

            $file->storeAs('attachments/', $folder . "/" . $model->id . "/" . $fileName, 'upload_attachments');


            $model->images()->create([
                'filename' => $fileName,
            ]);
        }
    }


    public function deleteFile($id, $folder)
    {
        $path = 'attachments/' . $folder . '/' . $id;

        if (Storage::disk('upload_attachments')->exists($path)) {
            Storage::disk('upload_attachments')->deleteDirectory($path);
            Image::where('imageable_id', $id)->delete();
        }
    }
}
