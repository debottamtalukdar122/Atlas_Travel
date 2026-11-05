<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate the single administrator.
     * Supports email or mobile number, server-side rate limiting (max 5 failed attempts),
     * and configurable token session length (12 hours normal, 30 days when Remember Me is enabled).
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'nullable|string',
            'login' => 'nullable|string',
            'identifier' => 'nullable|string',
            'password' => 'required|string',
            'remember' => 'nullable|boolean',
        ]);

        $identifier = trim((string)(
            $request->input('email') ??
            $request->input('login') ??
            $request->input('identifier') ??
            ''
        ));

        if ($identifier === '') {
            throw ValidationException::withMessages([
                'email' => ['Please enter your email address or mobile number.'],
            ]);
        }

        $throttleKey = Str::transliterate(Str::lower($identifier) . '|' . $request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => "Too many failed login attempts. Please try again in {$seconds} seconds.",
                'seconds_remaining' => $seconds,
            ], 429);
        }

        $user = User::where('is_admin', true)
            ->where(function ($q) use ($identifier) {
                $q->where('email', $identifier);
                if (Schema::hasColumn('users', 'mobile')) {
                    $q->orWhere('mobile', $identifier);
                }
            })
            ->first();

        if (!$user || !Hash::check($request->string('password'), $user->password)) {
            RateLimiter::hit($throttleKey, 300); // 5-minute lockout decay
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        RateLimiter::clear($throttleKey);

        $remember = $request->boolean('remember');
        // Standard normal session is 12 hours; Remember Me extends to 30 days
        $expiresAt = $remember ? now()->addDays(30) : now()->addHours(12);

        // Revoke prior admin tokens so only the current active session is maintained
        $user->tokens()->delete();

        $tokenResult = $user->createToken('admin', ['admin'], $expiresAt);

        return response()->json([
            'token' => $tokenResult->plainTextToken,
            'expires_at' => $expiresAt->toISOString(),
            'remember' => $remember,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'mobile' => $user->mobile ?? null,
            ],
        ]);
    }

    /**
     * Terminate the admin session and revoke the current access token.
     */
    public function logout(Request $request): Response
    {
        $request->user()?->currentAccessToken()?->delete();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        auth()->guard('web')->logout();
        auth()->forgetGuards();

        return response()->noContent();
    }

    /**
     * Return authenticated administrator information.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->only('id', 'name', 'email', 'mobile'),
        ]);
    }

    /**
     * Request a password reset link.
     * Uses Laravel password broker and logs/sends the reset notification.
     * Never reveals whether an email is registered (timing-safe generic response).
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $throttleKey = 'forgot-password|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => "Too many password reset requests. Please try again in {$seconds} seconds.",
                'seconds_remaining' => $seconds,
            ], 429);
        }

        RateLimiter::hit($throttleKey, 60);

        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $data['email'])
            ->where('is_admin', true)
            ->first();

        if ($user) {
            $token = Password::broker()->createToken($user);
            $user->sendPasswordResetNotification($token);
        }

        return response()->json([
            'message' => 'If that email address is registered, a password reset link has been sent.',
        ]);
    }

    /**
     * Complete password reset using token and update credentials securely.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => [
                'required',
                'string',
                'confirmed',
                PasswordRule::min(8)->letters()->mixedCase()->numbers(),
            ],
        ], [
            'password.confirmed' => 'The password confirmation does not match.',
            'password.min' => 'The password must be at least 8 characters and include uppercase, lowercase, and numeric characters.',
        ]);

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Revoke all existing tokens upon password change
                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Your password has been reset successfully. You can now sign in with your new password.',
            ]);
        }

        return response()->json([
            'message' => 'This password reset token is invalid or has expired.',
        ], 422);
    }
}
