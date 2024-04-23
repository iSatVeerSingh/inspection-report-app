<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'item_id',
        'report_id',
        'name',
        'images',
        'note',
        'height',
        'previous_report_item_id',
        'opening_paragraph',
        'closing_paragraph',
        'embedded_image',
        'original_report_item_id',
        'is_revised',
    ];

    protected $casts = [
        'images' => 'array',
        'is_revised' => 'boolean',
    ];

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d h:i A');
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class, 'report_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

    public function previousItem(): BelongsTo
    {
        return $this->belongsTo(ReportItem::class, 'previous_report_item_id');
    }
}
