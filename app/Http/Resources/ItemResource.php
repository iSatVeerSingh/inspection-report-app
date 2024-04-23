<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $item = [
            "id" => $this['id'],
            "name" => $this['name'],
            "summary" => $this['summary'],
            "created_at" => $this['created_at']->format('Y-m-d h:i A'),
            "updated_at" => $this['updated_at']->format('Y-m-d h:i A'),
            "category" => $this->category['name'],
        ];
        return $item;
    }
}
