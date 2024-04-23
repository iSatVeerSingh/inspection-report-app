<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FullReportItemResource extends JsonResource
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
            'images' => $this['images'],
            'note' => $this['note'],
            'is_revised' => $this['is_revised'],
            'original_report_item_id' => $this['original_report_item_id'],
            'height' => $this['height']
        ];

        if ($this['previous_report_item_id']) {
            $previousItem = $this->previousItem;
            $allImages = [];
            array_push($allImages, ...$this['images'], ...$previousItem['images']);
            $reportItem['images'] = $allImages;
        }

        if ($this['item_id']) {
            $reportItem['item_id'] = $this['item_id'];
            $reportItem['category'] = $this->item->category['name'];
            $reportItem['summary'] = $this->item['summary'];
        } else {
            $reportItem['opening_paragraph'] = $this['opening_paragraph'];
            $reportItem['closing_paragraph'] = $this['closing_paragraph'];
            $reportItem['embedded_image'] = $this['embedded_image'];
            $reportItem['category'] = "Custom";
        }

        return $reportItem;
    }
}
