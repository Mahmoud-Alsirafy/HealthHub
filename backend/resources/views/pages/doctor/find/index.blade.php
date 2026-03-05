<table class="table table-striped table-hover" style="text-align:center">
                                        <tbody>
                                        <tr>
                                            <th scope="row">name</th>
                                            <td>{{ $user->name }}</td>
                                            <th scope="row">email</th>
                                            <td>{{$user->email}}</td>

                                        </tr>

                                        </tbody>
                                    </table>


                                    <a href="{{ route('doctor.edit',$user->id) }}">edite</a>
