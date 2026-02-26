<div class="">
    @php
$type = 'web';

if (auth('doctor')->check()) {
$type = 'doctor';
} elseif (auth('lap')->check()) {
$type = 'lap';
} elseif (auth('pharma')->check()) {
$type = 'pharma';
}
elseif (auth('paramedic')->check()) {
$type = 'paramedic';
}

@endphp



<form method="POST" action="{{ route('logout', $type) }}">
    @csrf
    {{ $type }}
    <a class="dropdown-item" href="#" onclick="event.preventDefault();this.closest('form').submit();"><i
            class="bx bx-log-out"></i>تسجيل الخروج</a>

</form>


{{-- <a href="{{route('qrcode.index')}}">Qr</a> --}}

</div>
