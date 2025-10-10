<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class UsuariosController extends Controller
{
    public function index()
    {
        return Inertia::render('Usuarios/Index');
    }
}
