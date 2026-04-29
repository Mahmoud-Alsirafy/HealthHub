<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Image;
use App\Traits\AnalyzesMedicalImages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MedicalImageAnalysisController extends Controller
{
    use AnalyzesMedicalImages;

    /**
     * Analyze medical image - accepts image_id
     * The image_id tells us which Image record to analyze
     */
    public function analyze(Request $request)
    {
        // Accept either image_id or the old format for backwards compatibility
        if ($request->has('image_id')) {
            $request->validate([
                'image_id' => 'required|integer|exists:images,id',
            ]);

            $image = Image::find($request->image_id);
            if (!$image) {
                return response()->json([
                    'success' => false,
                    'message' => 'Image not found.',
                ], 404);
            }

            // Get user_id from the imageable relationship
            $imageable = $image->imageable;
            if (!$imageable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Image is not attached to a valid model.',
                ], 400);
            }

            $userId = $imageable->user_id ?? $imageable->id;
            $folder = class_basename($imageable); // Gets 'PatientProfile' or 'LabReport'
            $filename = $image->filename;
        } else {
            // Old format for backwards compatibility
            $request->validate([
                'folder'   => 'required|string',
                'model_id' => 'required|integer',
                'filename' => 'required|string',
            ]);

            $userId = $request->input('user_id'); // New required parameter
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID is required when using old API format.',
                ], 400);
            }

            $folder = $request->folder;
            $filename = $request->filename;
        }

        if (!$this->isAnalyzableImage($filename)) {
            return response()->json([
                'success' => false,
                'message' => 'Only image files can be analyzed (JPG, PNG, WEBP).',
            ], 422);
        }

        try {
            $explanation = $this->analyzeMedicalImage(
                $userId,
                $folder,
                $filename
            );

            return response()->json([
                'success'     => true,
                'explanation' => $explanation,
            ]);

        } catch (\Exception $exception) {
            Log::error('Medical image analysis error: ' . $exception->getMessage(), [
                'image_id' => $request->input('image_id'),
                'folder' => $folder ?? $request->folder,
                'filename' => $filename ?? $request->filename,
                'trace' => $exception->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], 500);
        }
    }
}
