<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class BundleController extends Controller
{
    public function index()
    {
        return Inertia::render('bundle/index', [
            'bundles' => [],
        ]);
    }
}
