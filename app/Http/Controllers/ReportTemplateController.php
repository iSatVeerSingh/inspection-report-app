<?php

namespace App\Http\Controllers;

use App\Models\ReportTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReportTemplateController extends Controller
{
    public function index(Request $request)
    {
        $templates = ReportTemplate::all();
        return $templates;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'heading' => 'required|max:255|unique:report_templates,heading',
            'body' => 'required',
            'order' => 'required',
            'page_break' => 'required'
        ]);


        $reportTemplate = new ReportTemplate($validated);
        $reportTemplate->save();

        $nextSection = ReportTemplate::where('order', $validated['order'])->first();
        if ($nextSection) {
            $nextSection->update(['order' => $reportTemplate['id']]);
        }

        return response()->json(['message' => 'Report template section created successfully'], 201);
    }

    public function update(Request $request, ReportTemplate $reportTemplate)
    {
        $validated = $request->validate([
            'heading' => 'sometimes|max:255|unique:report_templates,heading',
            'body' => 'sometimes',
            'order' => 'sometimes',
            'page_break' => 'sometimes'
        ]);

        if (array_key_exists('order', $validated) && $validated['order'] === $reportTemplate['id']) {
            return response()->json(['message' => 'Invalid order'], Response::HTTP_BAD_REQUEST);
        }

        if (array_key_exists('order', $validated)) {
            $oldNextOfOrder = ReportTemplate::where('order', $validated['order'])->first();
            $oldBeforeOfCurrent = ReportTemplate::find($reportTemplate['order']);
            $oldNextOfCurrent = ReportTemplate::where('order', $reportTemplate['id'])->first();

            if ($oldNextOfOrder) {
                $oldNextOfOrder->update(['order' => $reportTemplate['id']]);
            }

            if ($oldBeforeOfCurrent && $oldNextOfCurrent) {
                $oldNextOfCurrent->update(['order' => $oldBeforeOfCurrent['id']]);
            }
        }

        $reportTemplate->update($validated);
        return response()->json(['message' => 'Report template section updated successfully']);
    }

    public function destroy(Request $request, ReportTemplate $reportTemplate)
    {
        $nextSection = ReportTemplate::where('order', $reportTemplate['id'])->first();
        if ($nextSection) {
            $nextSection->update(['order' => $reportTemplate['order']]);
        }

        $reportTemplate->delete();
        return response()->json(['message' => 'Report template section deleted successfully']);
    }
}
