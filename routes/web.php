<?php

use App\Http\Controllers\{ReactionController, ChannelController, ChannelMessagesController, MessageController, ProfileController, UserController};
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// TODO: use Route::resource where applicable
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->middleware(['auth', 'verified'])->name('dashboard');

    Route::resource('channels', ChannelController::class);

    Route::get('/channels/{channel}/messages', [ChannelMessagesController::class, 'index'])->name('channel.messages.index');
    Route::post('/channels/{channel}/messages', [MessageController::class, 'store'])->name('messages.store');
    Route::post('/user/status', [UserStatusController::class, 'update'])->name('user.status.update');
    Route::get('/users', [UserController::class, 'index'])->name('users.index');

    Route::post('/messages/{message}/reaction', [ReactionController::class, 'store']);
    Route::delete('/messages/{message}/reaction', [ReactionController::class, 'destroy']);
});

require __DIR__.'/auth.php';
