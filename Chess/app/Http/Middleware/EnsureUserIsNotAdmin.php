<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsNotAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->isAdmin()) {
            return response()->json([
                'message' => 'لا يمكن لحسابات المدير الوصول إلى ميزات العملاء.',
            ], 403);
        }

        return $next($request);
    }
}
