<?php

namespace App\Http\Controllers;

use App\Http\Resources\JobCollection;
use App\Http\Resources\JobResource;
use App\Models\InspectionItem;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $jobNumber = $request->query('jobNumber');
        if ($jobNumber) {
            $job = Job::where('jobNumber', $jobNumber)->first();
            return new JobResource($job);
        }

        return new JobCollection(Job::where('active', true)->get());
    }

    public function show(Request $request, Job $job)
    {
        return new JobResource($job);
    }

    public function install(Request $request)
    {
        $jobs = new JobCollection(Job::where('inspector_id', Auth::id())
            ->where('active', true)
            ->where('status', 'Work Order')
            ->get());
        $contentLength = strlen($jobs->toJson());
        return response($jobs)->header('Content-Length', $contentLength)->header('Content-Type', 'application/json');
    }
}
