<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class EventController extends Controller
{
    public function index()
    {
        return Inertia::render('event/index', [
            'events' => [],
        ]);
    }
}
