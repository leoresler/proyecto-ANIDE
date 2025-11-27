<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaterialGuardado extends Model
{
    use HasFactory;

    protected $table = 'material_guardado';

    protected $fillable = [
        'user_id',
        'material_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function material()
    {
        return $this->belongsTo(InstitucionMaterial::class, 'material_id');
    }
}
