<?php

namespace App\Http\Controllers;

use App\Http\Resources\FullReportItemResource;
use App\Http\Resources\ReportCollection;
use App\Http\Resources\ReportResource;
use App\Mail\ReportCompleted;
use App\Models\Company;
use App\Models\Report;
use App\Models\ReportItem;
use App\Utils\ReportPdf;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $reports = Report::query();
        if ($request->has('category_id')) {
            $category_id = $request->input('category_id');
            $reports->whereHas('job', function ($query) use ($category_id) {
                $query->where('category_id', $category_id);
            });
        }

        if ($request->has('completed_at')) {
            $completedAt = $request->input('completed_at');
            $reports->whereDate('completed_at', $completedAt);
        }

        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');

            $reports->whereHas('customer', function ($query) use ($keyword) {
                $query->where(function ($query) use ($keyword) {
                    $query->where('name_on_report', 'like', "%$keyword%");
                });
            });
        }

        return new ReportCollection($reports->orderBy('updated_at', 'desc')->simplePaginate());
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required',
            'job_id' => 'required',
            'customer_id' => 'required',
            'original_report_id' => 'sometimes',
            'is_revised' => 'sometimes',
            'notes' => 'sometimes',
            'recommendation' => 'sometimes',
        ]);

        $report = new Report($validated);
        $report->save();

        return response()->json(['message' => 'Report created successfully'], 201);
    }

    public function show(Request $request, Report $report)
    {
        return new ReportResource($report);
    }

    public function generateReport(Request $request)
    {
        $data = $request->all();

        $report_id = $data['report_id'];
        $job_id = $data['job_id'];
        $customer_id = $data['customer_id'];
        $notes = $data['notes'];
        $recommendation = $data['recommendation'];

        $report = Report::find($report_id);
        if (!$report) {
            $report = new Report([
                'id' => $report_id,
                'job_id' => $job_id,
                'customer_id' => $customer_id,
                'notes' => $notes,
                'recommendation' => $recommendation
            ]);
            $report->save();
        } else {
            $report->update([
                'notes' => $notes,
                'recommendation' => $recommendation
            ]);
        }

        $pdf = new ReportPdf("P", 'pt');
        $pdf->MakePdf($report);
        $pdfFile = $pdf->Output("", "S");

        Storage::put("reports/" . $report['id'] . ".pdf", $pdfFile);

        $completedAt = new DateTime();

        $report->update(['completed_at' => $completedAt]);
        $report->job->update(['status' => 'Completed', 'completed_at' => $completedAt]);

        return response()->json([
            'message' => "Report generated successfully",
            'report_id' => $report['id'],
            'name' => $report->job->category['type'] . " - Inspection Report - " . $report->customer['name_on_report'],
            'completed_at' => $completedAt
        ]);
    }

    public function previousReportByCustomer(Request $request)
    {
        if (!$request->has('customer_id')) {
            return response()->json(['message' => 'Invalid customer id']);
        }

        $report = Report::where('customer_id', $request->customer_id)->whereNotNull('completed_at')->orderBy('updated_at', 'desc')->first();

        if (!$report) {
            return response()->json(['message' => 'No report found for this customer'], Response::HTTP_NOT_FOUND);
        }

        $reportItems = ReportItem::where('report_id', $report['id'])->get();

        if ($report['is_revised'] && $report['original_report_id']) {
            $originalReportItems = ReportItem::where('report_id', $report['original_report_id'])
                ->where('is_revised', false)->get();
            $reportItems = $reportItems->merge($originalReportItems);
        }

        $reportItemsCollection = FullReportItemResource::collection($reportItems);

        $reportData = [
            "id" => $report['id'],
            "completed_at" => $report['completed_at']->format('Y-m-d h:i A'),
            "customer_id" => $report['customer_id'],
            "category" => $report->job->category['name'],
            "previous_job" => $report->job['job_number'],
            "report_items" => $reportItemsCollection
        ];

        $content = json_encode($reportData);
        $contentLength = strlen($content);
        return response($content, 200, [
            'Content-Length' => $contentLength,
            "Content-Type" => "application/json,UTF-8",
            "Content-Encoding" => "disabled",
        ]);
    }

    public function getReportPdf(string $report_id, string $pdfname)
    {
        $pdfblob = Storage::get("reports/" . $report_id . ".pdf");
        if (!$pdfblob) {
            return response()->json(['message' => "Report not found"], Response::HTTP_BAD_REQUEST);
        }

        return response($pdfblob, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $pdfname . '"',
        ]);
    }

    public function emailAlert(Request $request)
    {
        $validated = $request->validate([
            'report_id' => 'required'
        ]);

        $report = Report::find($validated['report_id']);
        if (!$report) {
            return response()->json(['message' => "Report not found"], Response::HTTP_BAD_REQUEST);
        }

        if (!$report['completed_at']) {
            return response()->json(['message' => "Please first complete the report"], Response::HTTP_BAD_REQUEST);
        }

        $user = Auth::user();
        $company = Company::first();

        $pdfblob = Storage::get("reports/" . $report['id'] . ".pdf");
        if (!$pdfblob) {
            return response()->json(['message' => "Report not found"], Response::HTTP_BAD_REQUEST);
        }

        $email = $company['reports_email'];

        $sentMail = Mail::to($email)->send(new ReportCompleted($pdfblob, $report->job, $user['first'] . " " . $user['last']));
        if (!$sentMail) {
            return response()->json(['message' => "Couldn't send pdf. Something went wrong"], Response::HTTP_BAD_REQUEST);
        }

        return response()->json(['message' => 'An email alert has been sent to admin']);
    }
}
