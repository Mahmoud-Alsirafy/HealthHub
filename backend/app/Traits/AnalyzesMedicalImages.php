<?php

namespace App\Traits;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Exception;

trait AnalyzesMedicalImages
{
    protected function analyzeMedicalImage(string|int $userIdOrFolder, string|int $folderOrModelId, ?string $filename = null): string
    {
        // Handle both new format (userId, folder, filename) and old format (folder, modelId, filename)
        if (is_string($userIdOrFolder) && is_int($folderOrModelId)) {
            // Old format: folder, modelId, filename
            $folder = $userIdOrFolder;
            $modelId = $folderOrModelId;
            $imagePath = 'attachments/' . $folder . '/' . $modelId . '/' . $filename;
        } else {
            // New format: userId, folder, filename
            $userId = $userIdOrFolder;
            $folder = $folderOrModelId;
            $imagePath = 'attachments/' . $userId . '/' . $folder . '/' . $filename;
        }

        $fullPath = Storage::disk('upload_attachments')->path($imagePath);

        Log::info('Medical image analysis started', [
            'image_path' => $imagePath,
            'full_path' => $fullPath,
        ]);

        if (!file_exists($fullPath)) {
            throw new Exception('Image file not found at: ' . $fullPath);
        }

        if (!is_readable($fullPath)) {
            throw new Exception('Image file is not readable: ' . $fullPath);
        }

        $apiKey = config('services.openrouter.key');
        if (!$apiKey) {
            throw new Exception('OpenRouter API key is not configured.');
        }

        // Get MIME type using multiple methods for better compatibility
        $mimeType = $this->getMimeType($fullPath);
        if (!$mimeType) {
            throw new Exception('Could not determine image MIME type.');
        }

        $imageData = base64_encode(file_get_contents($fullPath));

        Log::info('Image encoded successfully', [
            'mime_type' => $mimeType,
            'size' => strlen($imageData),
        ]);

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
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type'  => 'application/json',
            'HTTP-Referer' => 'healthhub.local',
        ])->timeout(90)->post('https://openrouter.ai/api/v1/chat/completions', [
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

        Log::info('API response received', [
            'status' => $response->status(),
        ]);

        // ✅ Check for rate limit
        if ($response->status() === 429) {
            throw new Exception('AI service is busy. Please try again in a minute.');
        }

        // ✅ Check for authentication errors
        if ($response->status() === 401) {
            throw new Exception('API authentication failed. Check your OpenRouter API key.');
        }

        // ✅ Check for other errors
        if ($response->failed()) {
            $errorBody = $response->body();
            $errorJson = json_decode($errorBody, true);
            $errorMsg = $errorJson['error']['message'] ?? $errorBody;
            Log::error('API error response', [
                'status' => $response->status(),
                'body' => $errorMsg,
            ]);
            throw new Exception('OpenRouter API error (' . $response->status() . '): ' . $errorMsg);
        }

        // ✅ Parse and validate response
        $result = $response->json();

        if (!isset($result['choices']) || !is_array($result['choices']) || count($result['choices']) === 0) {
            Log::error('Invalid API response', ['response' => $result]);
            throw new Exception('Invalid response from AI service: no choices returned.');
        }

        if (!isset($result['choices'][0]['message']['content'])) {
            throw new Exception('No content in AI response.');
        }

        return $result['choices'][0]['message']['content'];
    }

    private function getMimeType(string $filePath): ?string
    {
        // Try finfo first (most reliable)
        if (function_exists('finfo_file')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo) {
                $mime = finfo_file($finfo, $filePath);
                finfo_close($finfo);
                if ($mime) {
                    return $mime;
                }
            }
        }

        // Fallback to mime_content_type if available
        if (function_exists('mime_content_type')) {
            $mime = mime_content_type($filePath);
            if ($mime) {
                return $mime;
            }
        }

        // Fallback to extension-based detection
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
        ];

        return $mimeTypes[$extension] ?? null;
    }

    protected function isAnalyzableImage(string $filename): bool
    {
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        return in_array($extension, ['jpg', 'jpeg', 'png', 'webp']);
    }
}
