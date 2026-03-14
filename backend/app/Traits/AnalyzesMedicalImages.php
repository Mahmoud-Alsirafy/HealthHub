<?php

namespace App\Traits;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Exception;

trait AnalyzesMedicalImages
{
    protected function analyzeMedicalImage(string $folder, int $modelId, string $filename): string
    {
        $imagePath = 'attachments/' . $folder . '/' . $modelId . '/' . $filename;
        $fullPath  = Storage::disk('upload_attachments')->path($imagePath);

        if (!file_exists($fullPath)) {
            throw new Exception('Image file not found.');
        }

        $imageData = base64_encode(file_get_contents($fullPath));
        $mimeType  = mime_content_type($fullPath);

        $prompt = "You are a professional medical imaging assistant.
               Analyze this medical image and provide:
               1. Type of medical image (X-Ray, MRI, CT Scan, etc.)
               2. Main observations and findings
               3. Any visible abnormalities or areas of concern
               4. General description suitable for a patient

               Important: Always remind the patient to consult their doctor
               for a professional diagnosis. Keep the explanation clear and
               not overly technical.";

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.openrouter.key'),
            'Content-Type'  => 'application/json',
        ])->post('https://openrouter.ai/api/v1/chat/completions', [
            'model' => 'nvidia/nemotron-nano-12b-v2-vl:free',
            'messages' => [
                [
                    'role'    => 'user',
                    'content' => [
                        [
                            'type'      => 'image_url',
                            'image_url' => ['url' => 'data:' . $mimeType . ';base64,' . $imageData],
                        ],
                        [
                            'type' => 'text',
                            'text' => $prompt,
                        ],
                    ],
                ],
            ],
        ]);

        // ✅ الـ error checks الأول
        if ($response->status() === 429) {
            throw new Exception('AI service is busy. Please try again in a minute.');
        }

        if ($response->failed()) {
            throw new Exception('OpenRouter API error: ' . $response->body());
        }

        // ✅ الـ return في الآخر
        $result = $response->json();
        return $result['choices'][0]['message']['content']
            ?? 'Could not analyze the image. Please try again.';
    }

    protected function isAnalyzableImage(string $filename): bool
    {
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        return in_array($extension, ['jpg', 'jpeg', 'png', 'webp']);
    }
}
