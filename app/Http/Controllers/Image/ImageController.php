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
        return view('pages.image.index');
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
        $request->validate([
            'file' => "required",
            "mimes:png,jpg,png",
            "max:10000",
        ]);
        $file = $request->file('file');
        $text = (new Pdf())
            ->setPdf($file)
            ->text();
            return back()->with('text', $text);
    }
}
