<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerPortalController;
use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;

// Public Website Endpoints
Route::prefix('public')->group(function () {
    Route::get('/packages', [PublicController::class, 'packages']);
    Route::get('/packages/{slugOrId}', [PublicController::class, 'showPackage']);
    Route::get('/destinations', [PublicController::class, 'destinations']);
    Route::get('/blogs', [PublicController::class, 'blogs']);
    Route::get('/blogs/{slugOrId}', [PublicController::class, 'showBlog']);
    Route::get('/settings', [PublicController::class, 'settings']);
    Route::post('/enquiries', [PublicController::class, 'createEnquiry'])->middleware('throttle:10,1');
    Route::post('/bookings', [PublicController::class, 'createBooking'])->middleware('throttle:10,1');
    Route::post('/subscribers', [PublicController::class, 'subscribe'])->middleware('throttle:5,1');
});

// Customer Portal Authentication (Unauthenticated)
Route::prefix('customer/auth')->group(function () {
    Route::post('/request-otp', [CustomerPortalController::class, 'requestOtp'])->middleware('throttle:10,1');
    Route::post('/verify-otp', [CustomerPortalController::class, 'verifyOtp'])->middleware('throttle:10,1');
});

// Protected Customer Portal Routes (Strict customer authorization)
Route::middleware(['auth:sanctum'])->prefix('customer')->group(function () {
    Route::post('/auth/logout', [CustomerPortalController::class, 'logout']);
    Route::get('/me', [CustomerPortalController::class, 'me']);
    Route::get('/dashboard', [CustomerPortalController::class, 'dashboard']);
    Route::get('/bookings', [CustomerPortalController::class, 'bookings']);
    Route::get('/bookings/{id}', [CustomerPortalController::class, 'showBooking']);
    Route::get('/notifications', [CustomerPortalController::class, 'notifications']);
    Route::get('/documents/{id}/download', [CustomerPortalController::class, 'downloadDocument']);
});

// Admin Authentication Endpoints (Single administrator only, rate limited)
Route::prefix('admin')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:60,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Protected Admin CRM Routes (Protected by auth:sanctum and admin.only)
Route::middleware(['auth:sanctum', 'admin.only'])->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/search', [AdminController::class, 'globalSearch']);
    Route::get('/reports/data', [AdminController::class, 'reports']);
    Route::post('/enquiries/{id}/convert', [AdminController::class, 'convertEnquiry']);
    Route::post('/quotations/{id}/convert', [AdminController::class, 'convertQuotation']);
    Route::post('/bookings/{id}/invoice', [AdminController::class, 'createInvoice']);
    Route::post('/documents', [AdminController::class, 'uploadDocument']);
    Route::get('/documents/{id}/download', [AdminController::class, 'downloadDocument']);
    Route::get('/{module}', [AdminController::class, 'index']);
    Route::post('/{module}', [AdminController::class, 'store']);
    Route::put('/{module}/{id}', [AdminController::class, 'update']);
    Route::delete('/{module}/{id}', [AdminController::class, 'destroy']);
});
