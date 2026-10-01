<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Only let users with the given role through; send everyone else to
     * their own dashboard instead of showing an error page.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();
        $isAdmin = $user?->isAdmin() ?? false;

        if ($user && ($role === User::ROLE_ADMIN) !== $isAdmin) {
            return redirect($user->homePath());
        }

        return $next($request);
    }
}
