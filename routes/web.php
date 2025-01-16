<?php

use App\Http\Controllers\{ReactionController, ChannelController, MessageController, ProfileController, UserController, SearchController, AttachmentController};
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
    })->name('dashboard');

    Route::resource('channels', ChannelController::class);
    Route::resource('users', UserController::class);

    Route::get('/messages/{channel}', [MessageController::class, 'index'])->name('messages.index');
    Route::post('/messages/{channel}', [MessageController::class, 'store'])->name('messages.store');

    Route::post('/reactions/{message}', [ReactionController::class, 'store'])->name('reactions.store');
    Route::delete('/reactions/{message}', [ReactionController::class, 'destroy'])->name('reactions.destroy');
    
    Route::get('/attachments/{message}', [AttachmentController::class, 'download'])->name('attachments.download');

    Route::get('/search', [SearchController::class, 'search'])->name('search');
});


require __DIR__.'/auth.php';
