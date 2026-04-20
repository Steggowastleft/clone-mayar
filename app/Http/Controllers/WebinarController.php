<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class WebinarController extends Controller
{
    public function index()
    {
        return Inertia::render('webinar/index', [
            'webinars' => [],
        ]);
    }
}
