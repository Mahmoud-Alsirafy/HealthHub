<div class="">
    @php
    $type = 'web';



    @endphp



    <form method="POST" action="{{ route('logout', $type) }}">
        @csrf
        {{ $type }}
        <a class="dropdown-item" href="#" onclick="event.preventDefault();this.closest('form').submit();"><i
                class="bx bx-log-out"></i>تسجيل الخروج</a>

    </form>

    Hi {{ auth()->user()->name }}


    <div class="tab-pane fade active show" id="students" role="tabpanel" aria-labelledby="students-tab">
        <div class="table-responsive mt-15">
            <table style="text-align: center" class="table center-aligned-table table-hover mb-0">
                <thead>
                    <tr class="table-info text-danger">
                        <th>#</th>
                        <th>{{ __('Teacher_trans.student_name') }}</th>
                        <th>{{ __('Teacher_trans.Email') }}</th>
                        <th>{{ __('Teacher_trans.Gender') }}</th>
                        <th>{{ __('Teacher_trans.grade') }}</th>
                        <th>{{ __('Teacher_trans.classroom') }}</th>
                        <th>{{ __('Teacher_trans.section') }}</th>
                        <th>{{ __('Teacher_trans.created_at') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($doctors as $doctor)
                    <tr>
                        {{-- <td>{{++$key}}</td> --}}
                        <td>{{$doctor->name}}</td>
                        <td>{{$doctor->email}}</td>
                        {{-- <td>{{$student->grade->Name}}</td>
                        <td>{{$student->classroom->Name_Class}}</td>
                        <td>{{$student->section->Name_Section}}</td>
                        <td class="text-success">{{$student->created_at}}</td> --}}
                    </tr>
                    @empty
                    <tr>
                        <td class="alert-danger" colspan="8">{{ __('Teacher_trans.no_data') }}</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>


    {{-- search for a user --}}
@if ($errors->any())
                        <div class="alert alert-danger">
                            <ul>
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif
    <form method="post" action="{{route('find')}}"  >
        @csrf
        <input type="text" placeholder="email" name="email">
        <input type="text" placeholder="password" name="password">
        <button type="submit">find</button>
    </form>
</div>
