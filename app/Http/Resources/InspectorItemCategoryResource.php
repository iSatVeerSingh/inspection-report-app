<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InspectorItemCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $itemCategory = [
            "id" => $this['id'],
            "name" => $this['name'],
            "active" => $this['deleted_at'] === null
        ];

        return $itemCategory;
    }
}
