<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ReportTemplate extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'heading',
        'body',
        'order',
        'page_break',
        'is_template'
    ];

    protected $casts = [
        'page_break' => 'boolean',
        'is_template' => 'boolean',
    ];

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d h:i A');
    }
}
