<?php

namespace App\Http\Controllers;

use App\Http\Resources\FullReportItemResource;
use App\Http\Resources\ReportItemCollection;
use App\Models\Report;
use App\Models\ReportItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReportItemController extends Controller
{
    public function index(Request $request)
    {
        $reportItems = ReportItem::query();

        if ($request->has('report_id')) {
            $report = Report::find($request->report_id);
            if ($report['is_revised'] && $report['original_report_id']) {
                $reportItems->where('report_id', $report['id'])
                    ->orWhere(function (Builder $query) use ($report) {
                        $query->where('report_id', $report['original_report_id'])
                            ->where('is_revised', false);
                    });
            } else {
                $reportItems->where('report_id', $request->report_id);
            }
        }

        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');
            $reportItems->where('name', 'like', "%$keyword%");
        }

        return new ReportItemCollection($reportItems->orderBy('updated_at', 'desc')->simplePaginate());
    }

    public function show(Request $request, ReportItem $reportItem)
    {
        return new FullReportItemResource($reportItem);
    }

    public function store(Request $request)
    {
        if ($request->has('bulk') && $request->bulk === 'true') {
            $reportItems = $request->input('report_items');
            $deletedReportItems = $request->input('deleted_report_items');

            if ($reportItems && !is_array($reportItems)) {
                return response()->json(['message' => 'Invalid request'], Response::HTTP_BAD_REQUEST);
            }

            if (is_array($deletedReportItems) && count($deletedReportItems) > 0) {
                ReportItem::destroy($deletedReportItems);
            }

            $createdReportItems = [];

            foreach ($reportItems as $item) {
                if (!ReportItem::find($item['id'])) {
                    $reportItem = new ReportItem($item);
                    $reportItem->save();
                    array_push($createdReportItems, $reportItem['id']);
                }
            }

            return response()->json($createdReportItems, Response::HTTP_CREATED);
        }

        $validated = $request->validate([
            'id' => 'required',
            'item_id' => 'sometimes',
            'report_id' => 'required|exists:reports,id',
            'name' => 'required',
            'images' => 'required',
            'note' => 'sometimes',
            'height' => 'required',
            'previous_report_item_id' => 'sometimes',
            'opening_paragraph' => 'sometimes',
            'closing_paragraph' => 'sometimes',
            'embedded_image' => 'sometimes',
            'is_revised' => 'sometimes',
            'original_report_item_id' => 'sometimes'
        ]);

        if (array_key_exists('original_report_item_id', $validated)) {
            $originalReportItem = ReportItem::find($validated['original_report_item_id']);
            if ($originalReportItem) {
                $originalReportItem->update(['is_revised' => true]);
            }
        }

        $reportItem = new ReportItem($validated);
        $reportItem->save();
        if (array_key_exists('original_report_item_id', $validated)) {
            return response()->json(['message' => 'Report item revised successfully'], Response::HTTP_CREATED);
        }
        return response()->json(['message' => 'Report item created  successfully'], Response::HTTP_CREATED);
    }

    public function update(Request $request, ReportItem $reportItem)
    {
        $validated = $request->validate([
            'item_id' => 'sometimes',
            'name' => 'sometimes',
            'images' => 'sometimes',
            'note' => 'sometimes',
            'height' => 'sometimes',
            'previous_report_item_id' => 'sometimes',
            'opening_paragraph' => 'sometimes',
            'closing_paragraph' => 'sometimes',
            'embedded_image' => 'sometimes',
            'is_revised' => 'sometimes'
        ]);

        $reportItem->update($validated);
        return response()->json(['message' => 'Report item updated or revised successfully']);
    }

    public function destroy(Request $request, ReportItem $reportItem)
    {
        $reportItem->delete();
        return response()->json(['message' => 'Report item deleted successfully']);
    }
}
