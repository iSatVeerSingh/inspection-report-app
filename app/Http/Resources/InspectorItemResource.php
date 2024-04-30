<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InspectorItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $item = [
            "id" => $this['id'],
            "name" => $this['name'],
            "category_id" => $this['category_id'],
            "summary" => $this['summary'],
            "active" => $this['deleted_at'] === null
        ];

        if ($this['deleted_at'] === null) {
            $item["category"] = $this->category['name'];
        }

        return $item;
    }
}
