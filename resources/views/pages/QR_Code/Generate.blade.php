<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>توليد QR للرقم القومي</title>
</head>
<body>
    {{-- @dump(Session::all()) --}}
    <h2>توليد QR للرقم القومي</h2>

    <form action="{{ route('generate') }}" method="POST">
        @csrf
        <div>
            <button type="submit">توليد QR</button>
        </div>
    </form>


    <br><br><br>
    @if(Session::has("qrCode"))
    <div class="mt-5">
        {{  Session::get("qrCode")  }}
    </div>
    @endif
</body>
</html>
