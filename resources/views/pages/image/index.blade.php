<form method="post" action="{{ route('image.store') }}" enctype="multipart/form-data">
    @csrf
    <input type="file" name="file">
    <br>
    <br>
    <br>
    <button type="submit">send</button>


    @session('text')
        {{ $value }}
    @endsession
</form>
