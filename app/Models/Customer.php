<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasUuids;

    protected $fillable = [
        'name_on_report',
        'name',
        'email',
        'phone',
        'billing_address',
        'builder',
        'builder_email',
        'builder_phone',
        'supervisor',
        'supervisor_email',
        'supervisor_phone'
    ];

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class, 'customer_id');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'customer_id');
    }
}
