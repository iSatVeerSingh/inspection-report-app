<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class Job extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'active',
        'jobNumber',
        'category_id',
        'customer_id',
        'inspector_id',
        'startsAt',
        'siteAddress',
        'status',
        'completedAt',
        'description',
    ];

    protected $casts = [
        'active' => 'boolean',
        'startsAt' => 'datetime',
        'completedAt' => 'datetime',
    ];

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d h:i A');
    }

    /**
     * Get the category that owns the Job
     * category_id belongs to JobCategory Model
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(JobCategory::class, 'category_id')->withDefault([
            'name' => "N/A"
        ]);
    }

    /**
     * Get the customer that owns the Job
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    /**
     * Get the inspector that owns the Job
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id')->withDefault([
            'name' => 'Not Assigned'
        ]);
    }

    /**
     * Get all of the inspectionItems for the Job
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function inspectionItems(): HasMany
    {
        return $this->hasMany(InspectionItem::class, 'job_id');
    }
}
