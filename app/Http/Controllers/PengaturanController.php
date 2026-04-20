<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PengaturanController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        return Inertia::render('pengaturan/index', [
            'user' => [
                'name'    => $user->name,
                'email'   => $user->email,
                'no_hp'   => $user->no_hp   ?? '',
                'bio'     => $user->bio      ?? '',
                'website' => $user->website  ?? '',
            ],
        ]);
    }
}
