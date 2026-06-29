<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    /**
     * Send password reset link (always returns generic success — OWASP).
     */
    public function sendResetLink(ForgotPasswordRequest $request): JsonResponse
    {
        Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'إذا كان البريد مسجلاً لدينا، فقد أُرسل رابط إعادة تعيين كلمة المرور.',
        ]);
    }

    /**
     * Reset password using Laravel Password Broker (single-use token, 60 min expiry).
     */
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();

                // Invalidate all Sanctum tokens after password change
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [$this->translateResetStatus($status)],
            ]);
        }

        return response()->json([
            'message' => 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.',
        ]);
    }

    private function translateResetStatus(string $status): string
    {
        return match ($status) {
            Password::INVALID_TOKEN => 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية.',
            Password::INVALID_USER => 'تعذر العثور على حساب بهذا البريد الإلكتروني.',
            Password::RESET_THROTTLED => 'يرجى الانتظار قبل إعادة المحاولة.',
            default => 'تعذر إعادة تعيين كلمة المرور. يرجى طلب رابط جديد.',
        };
    }
}
