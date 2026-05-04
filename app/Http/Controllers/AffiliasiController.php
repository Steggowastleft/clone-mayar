<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class AffiliasiController extends Controller
{
    public function index()
    {
        return Inertia::render('affiliasi/index', [
            'affiliators' => [],
        ]);
    }
}
