<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class ComunidadController extends Controller
{
    public function index()
    {
        return Inertia::render('Comunidad/Index');
    }
}
