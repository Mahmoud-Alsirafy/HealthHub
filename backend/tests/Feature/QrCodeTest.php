<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Lab;
use App\Models\Paramedic;
use App\Models\Pharma;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class QrCodeTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_qr_code_generation_and_cache()
    {
        Mail::fake();
        Storage::fake('local');

        $admin = Admin::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'type' => 'doctor' // from the enum: doctor, lab, pharma, paramedic
        ]);

        $response = $this->actingAs($admin, 'admin')->getJson('/api/admin/qr');

        $response->assertStatus(200);
        $response->assertJsonStructure(['qr_image', 'qr_code']);
        
        $this->assertNotNull($admin->fresh()->qr_code);

        // Check Cache
        $cacheKey = 'qr_admin_' . $admin->id;
        $this->assertTrue(Cache::has($cacheKey));

        // Test Regenerate
        $oldQr = $admin->fresh()->qr_code;
        $responseRegen = $this->actingAs($admin, 'admin')->postJson('/api/admin/qr/regenerate');
        
        $responseRegen->assertStatus(200);
        $newQr = $admin->fresh()->qr_code;
        $this->assertNotEquals($oldQr, $newQr);
    }

    public function test_lab_qr_code_generation_and_cache()
    {
        Mail::fake();
        Storage::fake('local');

        $lab = Lab::create([
            'name' => 'Lab Test',
            'email' => 'lab@test.com',
            'password' => bcrypt('password')
        ]);

        $response = $this->actingAs($lab, 'lab')->getJson('/api/lab/qr');

        $response->assertStatus(200);
        $response->assertJsonStructure(['qr_image', 'qr_code']);
    }

    public function test_paramedic_qr_code_generation_and_cache()
    {
        Mail::fake();
        Storage::fake('local');

        $paramedic = Paramedic::create([
            'name' => 'Paramedic Test',
            'email' => 'paramedic@test.com',
            'password' => bcrypt('password')
        ]);

        $response = $this->actingAs($paramedic, 'paramedic')->getJson('/api/paramedic/qr');

        $response->assertStatus(200);
        $response->assertJsonStructure(['qr_image', 'qr_code']);
    }

    public function test_pharma_qr_code_generation_and_cache()
    {
        Mail::fake();
        Storage::fake('local');

        $pharma = Pharma::create([
            'name' => 'Pharma Test',
            'email' => 'pharma@test.com',
            'password' => bcrypt('password')
        ]);

        $response = $this->actingAs($pharma, 'pharma')->getJson('/api/pharma/qr');

        $response->assertStatus(200);
        $response->assertJsonStructure(['qr_image', 'qr_code']);
    }
}
