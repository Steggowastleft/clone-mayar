<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AccountSettingsController extends Controller
{
    public function updateBusiness(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'website' => 'nullable|url|max:255',
            'business_email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'country' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'currency' => 'nullable|string|max:10',
        ]);

        $user->business_name = $validated['business_name'];
        $user->website = $validated['website'];
        $user->business_email = $validated['business_email'];
        $user->phone = $validated['phone'];
        $user->address = $validated['address'];
        $user->country = $validated['country'];
        $user->province = $validated['province'];
        $user->city = $validated['city'];
        $user->district = $validated['district'];
        $user->currency = $validated['currency'];
        $user->save();

        return redirect()->back()->with('success', 'Detail bisnis berhasil disimpan.');
    }

    public function updateBank(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'provider' => 'required|string|max:255',
            'account_number' => 'required|string|max:100',
            'account_name' => 'required|string|max:255',
        ]);

        $user->bank_provider = $validated['provider'];
        $user->bank_account_number = $validated['account_number'];
        $user->bank_account_name = $validated['account_name'];
        $user->save();

        return redirect()->back()->with('success', 'Data rekening berhasil disimpan.');
    }
}
