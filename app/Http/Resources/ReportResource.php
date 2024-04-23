<?php

namespace App\Http\Resources;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $report = [
            'id' => $this['id'],
            'job_id' => $this['job_id'],
            'job_number' => $this->job['job_number'],
            'category' => $this->job->category['name'],
            'site_address' => $this->job['site_address'],
            'inspector' => $this->job->inspector['first'] . " " . $this->job->inspector['last'],
            'customer_id' => $this['customer_id'],
            'customer_name' => $this->customer['name_on_report'],
            'customer_email' => $this->customer['email'],
            'customer_phone' => $this->customer['phone'],
            'original_report_id' => $this['original_report_id'],
            'is_revised' => $this['is_revised'],
            'notes' => $this['notes'],
            'recommendation' => $this['recommendation'],
            'completed_at' => $this['completed_at'] === null ? null : $this['completed_at']->format('Y-m-d h:i A'),
        ];

        $emptyRevisedReport = Report::where('original_report_id', $this['id'])->where('completed_at', null)->first();
        if ($emptyRevisedReport) {
            $report['revised_report_id'] = $emptyRevisedReport['id'];
        }

        return $report;
    }
}
