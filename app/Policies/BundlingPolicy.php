<?php

namespace App\Policies;

use App\Models\Bundling;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class BundlingPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Bundling $bundling): bool
    {
        return $user->id === $bundling->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Bundling $bundling): bool
    {
        return $user->id === $bundling->user_id;
    }

    public function delete(User $user, Bundling $bundling): bool
    {
        return $user->id === $bundling->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Bundling $bundling): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Bundling $bundling): bool
    {
        return false;
    }
}
