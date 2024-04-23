<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'job_id',
        'customer_id',
        'original_report_id',
        'revised_report_id',
        'is_revised',
        'notes',
        'recommendation',
        'completed_at',
        'pdf'
    ];

    protected $casts = [
        'is_revised' => 'boolean',
        'notes' => 'array',
        'completed_at' => 'datetime',
    ];

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d h:i A');
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class, 'job_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }
    
    public function reportItems(): HasMany
    {
        return $this->hasMany(ReportItem::class, 'report_id');
    }
    public function originalReport(): BelongsTo
    {
        return $this->belongsTo(Report::class, 'original_report_id');
    }

    public function revisedReports(): HasMany
    {
        return $this->hasMany(Report::class, 'original_report_id');
    }
}
