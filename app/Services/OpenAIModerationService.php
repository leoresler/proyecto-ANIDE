<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class OpenAIModerationService
{
    protected $client;
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
        $this->client = new Client([
            'base_uri' => 'https://api.openai.com/v1/',
            'timeout' => 10,
        ]);
    }

    /**
     * Moderar texto usando OpenAI Moderation API + filtro local
     */
    public function moderate(string $text): array
    {
        try {
            $localCheck = $this->localModeration($text);
            
            if (!$localCheck['is_safe']) {
                return $localCheck;
            }

            // Cache para evitar moderar el mismo texto múltiples veces
            $cacheKey = 'moderation_' . md5($text);

            return Cache::remember($cacheKey, 3600, function () use ($text) {
                $response = $this->client->post('moderations', [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $this->apiKey,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'input' => $text,
                        'model' => 'text-moderation-latest'
                    ],
                ]);

                $data = json_decode($response->getBody()->getContents(), true);
                $result = $data['results'][0] ?? null;

                if (!$result) {
                    return [
                        'is_safe' => true,
                        'detected_words' => [],
                        'message' => '',
                    ];
                }

                $isFlagged = $result['flagged'];

                Log::info('Moderación OpenAI', [
                    'is_flagged' => $isFlagged,
                    'categories' => array_keys(array_filter($result['categories'])),
                ]);

                if ($isFlagged) {
                    return [
                        'is_safe' => false,
                        'detected_words' => [],
                        'message' => 'El comentario contiene lenguaje inapropiado detectado por el sistema de moderación.',
                        'categories' => array_keys(array_filter($result['categories'])),
                    ];
                }

                return [
                    'is_safe' => true,
                    'detected_words' => [],
                    'message' => '',
                ];
            });
        } catch (\Exception $e) {
            Log::error('Error en moderación OpenAI: ' . $e->getMessage());
            // En caso de error, usar solo filtro local
            return $this->localModeration($text);
        }
    }

    /**
     * Normaliza texto para detección
     */
    protected function normalizeText(string $text): string
    {
        $text = mb_strtolower($text, 'UTF-8');

        // Remover tildes
        $text = strtr($text, [
            'á' => 'a', 'à' => 'a', 'ä' => 'a', 'â' => 'a',
            'é' => 'e', 'è' => 'e', 'ë' => 'e', 'ê' => 'e',
            'í' => 'i', 'ì' => 'i', 'ï' => 'i', 'î' => 'i',
            'ó' => 'o', 'ò' => 'o', 'ö' => 'o', 'ô' => 'o',
            'ú' => 'u', 'ù' => 'u', 'ü' => 'u', 'û' => 'u',
            'ñ' => 'n',
        ]);

        // Reemplazar símbolos y números comúnmente usados para ofuscar
        $replacements = [
            '@' => 'a',
            '4' => 'a',
            '3' => 'e',
            '1' => 'i',
            '!' => 'i',
            '|' => 'i',
            '0' => 'o',
            '$' => 's',
            '5' => 's',
            '+' => 't',
            '8' => 'b',
            '&' => 'a',
            '7' => 't',
            '9' => 'g',
        ];

        $text = str_replace(array_keys($replacements), array_values($replacements), $text);

        return $text;
    }

    /**
     * Construye patrón regex simple pero efectivo
     */
    protected function buildFlexiblePattern(string $word): string
    {
        $normalized = $this->normalizeText($word);
        $letters = mb_str_split($normalized);
        
        $pattern = '';
        foreach ($letters as $letter) {
            // Escapar el carácter
            $escaped = preg_quote($letter, '/');
            // Permitir repeticiones y separadores
            $pattern .= $escaped . '+[\s\.\-_\*@#]*';
        }
        
        // Buscar el patrón con límites flexibles
        return '/(?<![a-z])' . $pattern . '(?![a-z])/i';
    }

    /**
     * Verifica si es un falso positivo
     */
    protected function isFalsePositive(string $text, string $badWord): bool
    {
        $normalized = $this->normalizeText($text);
        $badWordNormalized = $this->normalizeText($badWord);

        // Whitelist de palabras legítimas
        $whitelist = [
            'computadora', 'computador', 'computo', 'computacion',
            'reputacion', 'diputado', 'diputada', 'disputar', 'disputa',
            'imputar', 'input', 'inputar',
            'ejecutar', 'ejecutivo', 'ejecutado', 'ejecuta',
            'cojin', 'cojines',
            'acoger', 'acogedor', 'acogida',
            'escoja', 'escoger', 'escogido',
            'recoja', 'recoger', 'recogido',
            'conjugar', 'conjugacion',
        ];

        foreach ($whitelist as $validWord) {
            $validNormalized = $this->normalizeText($validWord);
            
            if (stripos($normalized, $validNormalized) !== false && 
                stripos($validNormalized, $badWordNormalized) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Moderación local robusta
     */
    protected function localModeration(string $text): array
    {
        $badWords = $this->getBadWordsList();
        $detectedWords = [];
        $normalized = $this->normalizeText($text);

        foreach ($badWords as $word) {
            // Verificar falsos positivos primero
            if ($this->isFalsePositive($text, $word)) {
                continue;
            }

            $pattern = $this->buildFlexiblePattern($word);
            
            if (@preg_match($pattern, $normalized, $matches)) {
                $detectedWords[] = $word;
                
                Log::info('Palabra prohibida detectada', [
                    'word' => $word,
                    'matched' => $matches[0] ?? '',
                    'original_text' => substr($text, 0, 100),
                ]);
            }
        }

        if (count($detectedWords) > 0) {
            $count = count($detectedWords);
            $message = $count === 1 
                ? 'Tu comentario contiene una palabra prohibida. Por favor, usa un lenguaje apropiado.'
                : "Tu comentario contiene {$count} palabras prohibidas. Por favor, usa un lenguaje apropiado.";

            return [
                'is_safe' => false,
                'detected_words' => $detectedWords,
                'message' => $message,
            ];
        }

        return [
            'is_safe' => true,
            'detected_words' => [],
            'message' => '',
        ];
    }

    /**
     * Lista de palabras prohibidas
     */
    protected function getBadWordsList(): array
    {
        return [
            // Insultos graves
            'puto', 'puta', 'mierda', 'carajo', 'cono', 'conho',
            'cojones', 'pendejo', 'imbecil', 'idiota', 'estupido',
            'boludo', 'pelotudo', 'tarado', 'gilipollas', 'cabron',
            'forro', 'miserable', 'zorra', 'perra', 'bastardo',
            'malparido', 'careverga', 'culiao', 'culiado', 'cornudo',
            'choto', 'pelmazo', 'baboso', 'inutil', 'payaso',

            // Vulgaridades sexuales
            'pija', 'verga', 'chingar', 'joder', 'cagar', 'mamar',
            'culo', 'ojete', 'ano', 'concha', 'conchudo', 'pajero',
            'cagon', 'cojer', 'follar', 'tirar', 'pene', 'vagina',
            'chocho',

            // Expresiones combinadas comunes
            'hijo de puta', 'hijo de perra', 'hijo puta',
            'concha de tu madre', 'concha tu madre', 'concha madre',
            'me cago en', 'vete a la mierda', 'anda a cagar',
            'vete al carajo', 'la puta madre', 'puta madre',
            'tonto de mierda', 'de mierda',

            // Lenguaje discriminatorio
            'marica', 'maricon', 'trava', 'putete', 'tortillera',
            'sidoso', 'negro de mierda', 'negra de mierda',
            'sudaca', 'villero', 'grone', 'bolita', 'paragua',
            'cabecita', 'mono',

            // Amenazas
            'te voy a matar', 'te mato', 'te reviento',
            'te hago mierda', 'te pego', 'te rompo',
            'te violar', 'violarte', 'violacion',
            'asesinar', 'matarte',

            // Acoso y misoginia
            'puta barata', 'zorra de mierda', 'callate mujer',
            'te voy a coger', 'perra sucia', 'lava los platos',

            // Otros
            'basura humana', 'escoria', 'asqueroso', 'repugnante',
            'maldito', 'sorete', 'lacra', 'gusano', 'demonio',
        ];
    }

    /**
     * Verificar si un texto es seguro
     */
    public function isSafe(string $text): bool
    {
        $result = $this->moderate($text);
        return $result['is_safe'];
    }

    /**
     * Obtener mensaje de error si no es seguro
     */
    public function getErrorMessage(string $text): ?string
    {
        $result = $this->moderate($text);
        return $result['is_safe'] ? null : $result['message'];
    }

    /**
     * Obtener palabras detectadas
     */
    public function getDetectedWords(string $text): array
    {
        $result = $this->moderate($text);
        return $result['detected_words'] ?? [];
    }
}