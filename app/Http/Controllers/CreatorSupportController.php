<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class CreatorSupportController extends Controller
{
    public function index()
    {
        return Inertia::render('creator-support/index');
    }
}
