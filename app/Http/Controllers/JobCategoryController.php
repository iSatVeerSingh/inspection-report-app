<?php

namespace App\Http\Controllers;

use App\Models\JobCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;

class JobCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = JobCategory::query();

        if ($request->has('nameonly')) {
            $categories->select('id', 'name');
        }

        return $categories->orderBy('updated_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|max:255|unique:job_categories,name',
            'type' => 'required|max:255|unique:job_categories,type',
            'stage_of_works' => 'required|max:255'
        ]);

        $servicem8Url = env('SERVICEM8_BASEURL');
        $username = env('SERVICEM8_EMAIL');
        $password = env('SERVICEM8_PASSWORD');

        $response = Http::withBasicAuth($username, $password)->post($servicem8Url . "/category.json", [
            'name' => $validated['name'],
        ]);

        $resStatus = $response->status();
        if ($resStatus !== 200) {
            return response()->json(['message' => "Invalid request"], Response::HTTP_BAD_REQUEST);
        }

        $serviceUUID = $response->header('x-record-uuid');

        $jobCategory = new JobCategory($validated);
        $jobCategory['id'] = $serviceUUID;
        $jobCategory->save();

        return response()->json(['message' => 'Job category created successfully'], Response::HTTP_CREATED);
    }

    public function update(Request $request, JobCategory $jobCategory)
    {
        $oldName = $jobCategory['name'];

        $validated = $request->validate([
            'name' => 'sometimes|required|max:255|unique:job_categories,name',
            'type' => 'sometimes|required|max:255|unique:job_categories,type',
            'stage_of_works' => 'sometimes|max:255'
        ]);

        $jobCategory->update($validated);

        $servicem8Url = env('SERVICEM8_BASEURL');
        $username = env('SERVICEM8_EMAIL');
        $password = env('SERVICEM8_PASSWORD');

        if ($oldName !== $jobCategory['name']) {
            $response = Http::withBasicAuth($username, $password)->post($servicem8Url . "/category/" . $jobCategory['id'] . '.json', [
                'name' => $jobCategory['name']
            ]);
            $resStatus = $response->status();
            if ($resStatus !== 200) {
                return response()->json(['message' => "Invalid request"], Response::HTTP_BAD_REQUEST);
            }
        }


        return response()->json(['message' => 'Job category updated successfully']);
    }

    public function destroy(Request $request, JobCategory $jobCategory)
    {
        $servicem8Url = env('SERVICEM8_BASEURL');
        $username = env('SERVICEM8_EMAIL');
        $password = env('SERVICEM8_PASSWORD');

        $response = Http::withBasicAuth($username, $password)->delete($servicem8Url . "/category/" . $jobCategory['id'] . '.json');

        $resStatus = $response->status();
        if ($resStatus !== 200) {
            return response()->json(['message' => "Invalid request"], Response::HTTP_BAD_REQUEST);
        }

        $jobCategory->delete();
        return response()->json(['message' => 'Job category deleted successfully']);
    }
}
