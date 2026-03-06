<?php

namespace App\Http\Controllers;


class HomeController extends Controller
{
    public function index(){
        return response()->json(['message' => 'Selection Page for user , doctor , and outhers']);
    }

    public function dashboard() {
        return response()->json(['message' => 'Dashboard']);
    }
}
