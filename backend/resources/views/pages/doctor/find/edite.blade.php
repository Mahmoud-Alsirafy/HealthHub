@if ($errors->any())
<div class="alert alert-danger">
    <ul>
        @foreach ($errors->all() as $error)
        <li>{{ $error }}</li>
        @endforeach
    </ul>
</div>
@endif
<form method="post" action="{{route('doctor.update','test')}}" enctype="multipart/form-data">
    @method('PUT')
    @csrf
    <div class="col-md-6">
        <div class="form-group">
            <label>email </label>
            <input type="email" value="{{ $user->email }}" name="email" class="form-control">
        </div>
    </div>
    <input type="text" hidden value="{{ $user->id }}" name="id">
    <div class="col-md-6">
        <div class="form-group">
            <label>password</label>
            <input value="{{ $user->password }}" type="text" name="password" class="form-control">
        </div>
    </div>
    <div class="form-group">
        <label for="academic_year">المرفقات : <span class="text-danger">*</span></label>
        <input type="file"  name="file_name[]" multiple required>
    </div>
    <button type="submit">update</button>
</form>
