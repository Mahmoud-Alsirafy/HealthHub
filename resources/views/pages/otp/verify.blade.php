<x-guest-layout>
    <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {{ __('This is a secure area of the application. Please confirm your OTP Code before continuing.') }}
    </div>

    <form method="POST" action="{{ route('OTP.store') }}">
        @csrf

        <!-- Password -->
        <div>
            <x-input-label for="OTP" :value="__('OTP')" />

            <x-text-input id="password" class="block mt-1 w-full" type="text" name="otp" required
                autocomplete="current-password" />

            <x-input-error :messages="$errors->get('OTP')" class="mt-2" />
        </div>
        <div class="resend">
            <a href="{{ route('OTP.resend') }}" style="background-color: skyblue;">
                resend The Code
            </a>
        </div>
        <div class="flex justify-end mt-4">
            <x-primary-button>
                {{ __('Confirm') }}
            </x-primary-button>
        </div>
    </form>
</x-guest-layout>
