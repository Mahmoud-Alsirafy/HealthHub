<?php

namespace App\Http\Controllers\Image;

use Spatie\PdfToText\Pdf;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;

class ImageController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Image Process Page']);
    }

    // public function store(Request $request)
    // {
    //     $image = $request->file('file');
    //     $imageData = base64_encode(file_get_contents($image->getRealPath()));

    //     $apiKey = env('GEMINI_API_KEY');

    //     $response = Http::withHeaders([
    //         'Content-Type' => 'application/json',
    //     ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey", [
    //         "contents" => [
    //             [
    //                 "parts" => [
    //                     [
    //                         "text" => "explain onle the medical info from this image in arabic"
    //                     ],
    //                     [
    //                         "inline_data" => [
    //                             "mime_type" => $image->getMimeType(), // auto set: image/jpeg or image/png
    //                             "data"      => $imageData
    //                         ]
    //                     ]
    //                 ]
    //             ]
    //         ]
    //     ]);

    //     $response = $response->json();
    //     if (!empty($response['candidates'])) {
    //         $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? '';
    //     } else {
    //         $text = 'No text found from the image.';
    //     }
    //     return back()->with('text', $text);
    //     // dd($response->json());
    // }

    public function store(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'file' => 'required|mimes:pdf|max:10000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('file');
            $text = (new Pdf())
                ->setPdf($file)
                ->text();
            
            return response()->json([
                'message' => 'File processed successfully',
                'extracted_text' => $text
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to process file',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
