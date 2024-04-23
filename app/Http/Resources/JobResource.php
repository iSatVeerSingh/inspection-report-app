<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $customer = $this->customer;

        $job = [
            "id" => $this['id'],
            "job_number" => $this['job_number'],
            "category_id" => $this['category_id'],
            "category" => $this->category['name'],
            "customer" => [
                "id" => $customer['id'],
                "name_on_report" => $customer["name_on_report"],
                "name" => $customer["name"],
                "email" => $customer["email"],
                "phone" => $customer["phone"],
                "builder_email" => $customer['builder_email'],
                "supervisor_email" => $customer['supervisor_email'],
            ],
            "site_address" => $this['site_address'],
            "starts_at" => $this['starts_at'] === null ? null : $this['starts_at']->format('Y-m-d h:i A'),
            "status" => $this['status'],
            "completed_at" => $this['completed_at'] === null ? null : $this['completed_at']->format('Y-m-d h:i A'),
            "description" => $this["description"],
            "inspector" => $this->inspector['first'] . " " . $this->inspector['last'],
            "inspector_id" => $this['inspector_id'],
            "type" => $this->category['type'],
            "stage_of_works" => $this->category['stage_of_works']
        ];

        return $job;
    }
}
