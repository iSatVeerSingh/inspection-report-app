<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $reportItem = [
            'id' => $this['id'],
            'report_id' => $this['report_id'],
            'name' => $this['name'],
            'total_images' => count($this->images),
            'note' => $this['note'],
            'is_revised' => $this['is_revised'],
        ];

        if ($this['previous_report_item_id']) {
            $previousItem = $this->previousItem;
            $reportItem['total_images'] = count($this->images) + count($previousItem['images']);
        }

        if ($this['item_id']) {
            $reportItem['item_id'] = $this['item_id'];
            $reportItem['category'] = $this->item->category['name'];
        } else {
            $reportItem['category'] = "Custom";
        }

        return $reportItem;
    }
}
