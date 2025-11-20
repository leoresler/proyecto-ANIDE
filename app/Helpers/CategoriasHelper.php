<?php

namespace App\Helpers;

class CategoriasHelper
{
    /**
     * Lista de categorías disponibles (debe coincidir con frontend)
     */
    public const CATEGORIAS = [
        "Tecnología",
        "Medicina",
        "Derecho",
        "Ingeniería",
        "Arte y Diseño",
        "Deportes",
        "Enfermería",
        "Psicología",
        "Educación",
        "Arquitectura",
        "Administración",
        "Contabilidad",
        "Marketing",
        "Turismo",
        "Gastronomía",
        "Música",
        "Comunicación",
        "Ciencias Exactas",
        "Ciencias Sociales",
        "Idiomas"
    ];

    public const MAX_INTERESES_USUARIO = 8;
    public const MAX_CATEGORIAS_PUBLICACION = 5;

    /**
     * Valida que las categorías sean válidas
     */
    public static function validarCategorias(array $categorias): bool
    {
        foreach ($categorias as $categoria) {
            if (!in_array($categoria, self::CATEGORIAS)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Obtiene todas las categorías disponibles
     */
    public static function todas(): array
    {
        return self::CATEGORIAS;
    }
}
