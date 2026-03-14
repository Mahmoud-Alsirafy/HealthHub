<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Traits\AnalyzesMedicalImages;
use Illuminate\Http\Request;

class MedicalImageAnalysisController extends Controller
{
    use AnalyzesMedicalImages;

    public function analyze(Request $request)
    {
        $request->validate([
            'folder'   => 'required|string',
            'model_id' => 'required|integer',
            'filename' => 'required|string',
        ]);

        if (!$this->isAnalyzableImage($request->filename)) {
            return response()->json([
                'success' => false,
                'message' => 'Only image files can be analyzed (JPG, PNG, WEBP).',
            ], 422);
        }

        try {
            $explanation = $this->analyzeMedicalImage(
                $request->folder,
                $request->model_id,
                $request->filename
            );

            return response()->json([
                'success'     => true,
                'explanation' => $explanation,
            ]);

        } catch (\Exception $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], 500);
        }
    }
}
