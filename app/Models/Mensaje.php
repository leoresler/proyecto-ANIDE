<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\Factories\HasFactory;

// class Mensaje extends Model
// {
//     use HasFactory;

//     protected $fillable = ['chat_id', 'emisor_id', 'contenido', 'leido_en', 'leido'];

//     protected $casts = [
//         'leido' => 'boolean',
//     ];
//     public function chat()
//     {
//         return $this->belongsTo(Chat::class);
//     }

//     public function emisor()
//     {
//         return $this->belongsTo(User::class, 'emisor_id');
//     }
// }

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Mensaje extends Model
{
    use HasFactory;

    protected $fillable = ['chat_id', 'emisor_id', 'contenido', 'leido_en', 'leido'];

    protected $casts = [
        'leido' => 'boolean',
    ];
    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public function emisor()
    {
        return $this->belongsTo(User::class, 'emisor_id');
    }
}

