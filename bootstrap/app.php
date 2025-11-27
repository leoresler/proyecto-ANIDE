<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Session\TokenMismatchException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\EnsureProfileIsComplete::class,
        ]);
        $middleware->alias([
            'check.persona' => \App\Http\Middleware\CheckPersona::class,
            'check.institucion' => \App\Http\Middleware\CheckInstitucion::class,
        ]);
        $middleware->use([
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // 404 Not Found
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            return Inertia::render('Errors/ErrorPage', [
                'status' => 404,
                'message' => 'La página que buscás no existe.',
            ])->toResponse($request)->setStatusCode(404);
        });

        // 419 Session Expired (TokenMismatch)
        $exceptions->render(function (TokenMismatchException $e, Request $request) {
            return Inertia::render('Errors/ErrorPage', [
                'status' => 419,
                'message' => 'Tu sesión expiró. Volvé a iniciar sesión.',
            ])->toResponse($request)->setStatusCode(419);
        });

        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            return Inertia::render('Errors/ErrorPage', [
                'status' => 405,
                'message' => 'El método HTTP utilizado no está permitido.',
            ])->toResponse($request)->setStatusCode(405);
        });

        // Errores genericos HTTP (401, 403, 500, etc.)
        $exceptions->render(function (HttpExceptionInterface $e, Request $request) {
            $status = $e->getStatusCode();

            return Inertia::render('Errors/ErrorPage', [
                'status' => $status,
                'message' => $e->getMessage() ?: null,
            ])->toResponse($request)->setStatusCode($status);
        });
    })->create();
