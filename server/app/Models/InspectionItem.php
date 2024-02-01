<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class InspectionItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'uuid',
        'active',
        'job_id',
        'item_id',
        'images',
        'note',
        'custom',
        'name',
        'openingParagraph',
        'closingParagraph',
        'embeddedImage',
        'previousItem',
        'previous_item_id'
    ];

    protected $casts = [
        'active' => 'boolean',
        'images' => 'array',
        'previousItem' => 'boolean'
    ];

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d h:i A');
    }

    /**
     * Get the item that owns the InspectionItem
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id');
    }
}
