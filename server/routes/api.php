<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\InspectionNoteController;
use App\Http\Controllers\JobCategoryController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\LibraryItemCategoryController;
use App\Http\Controllers\LibraryItemController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureUserIsOwner;
use App\Http\Middleware\EnsureUserIsOwnerOrAdmin;
use App\Models\Customer;
use App\Models\InspectionItem;
use App\Models\Job;
use App\Models\JobCategory;
use App\Models\LibraryItem;
use App\Models\LibraryItemCategory;
use App\Models\Report;
use App\Models\User;
use Dotenv\Util\Regex;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Ramsey\Uuid\Uuid;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('/users', UserController::class)->except(['show'])
        ->middleware(EnsureUserIsOwner::class);

    Route::apiResource('/job-categories', JobCategoryController::class)
        ->except(['show'])
        ->middleware(EnsureUserIsOwnerOrAdmin::class);

    Route::apiResource('/inspection-notes', InspectionNoteController::class)
        ->except(['show'])
        ->middleware(EnsureUserIsOwnerOrAdmin::class);

    Route::apiResource('/library-item-categories', LibraryItemCategoryController::class)
        ->except(['show'])
        ->middleware(EnsureUserIsOwnerOrAdmin::class);

    Route::apiResource('/library-items', LibraryItemController::class)
        ->except(['show'])
        ->middleware(EnsureUserIsOwnerOrAdmin::class);

    Route::apiResource('/recommendations', RecommendationController::class)
        ->except(['show'])
        ->middleware(EnsureUserIsOwnerOrAdmin::class);

    Route::apiResource('/jobs', JobController::class)->only(['index', 'show']);

    Route::get('/install-inspection-notes', [InspectionNoteController::class, 'install']);

    Route::get('/install-job-categories', [JobCategoryController::class, 'install']);

    Route::get('/install-item-categories', [LibraryItemCategoryController::class, 'install']);

    Route::get('/install-items', [LibraryItemController::class, 'install']);

    Route::get('/install-recommendations', [RecommendationController::class, 'install']);




    Route::get('/install-jobs', [JobController::class, 'install']);
});

Route::get('/demo', function () {
    $job = Job::where('uuid', '0d5ca989-9518-4380-b64a-1e5ac5cfbccb')->first();
    $job['active'] = true;
    $job->save();
    return $job;
    // return date('Y-m-d h:i A');


    // $servicem8Url = env('SERVICEM8_BASEURL');
    // $username = env('SERVICEM8_EMAIL');
    // $password = env('SERVICEM8_PASSWORD');

    // $jobsResponse = Http::withBasicAuth($username, $password)
    //     ->get($servicem8Url . "/job.json?%24filter=edit_date%20gt%20'2024-01-03 00:00:00'")
    //     ->json();

    // $allJobs = array_filter($jobsResponse, function ($job) {
    //     return $job['status'] === "Work Order";
    // });


    // // check if job exists
    // $existingJobs = [];
    // foreach ($allJobs as $key => $serviceJob) {
    //     if (Job::where("uuid", $serviceJob['uuid'])->exists()) {
    //         // check if job is deleted in servicem8 or not
    //         if ($serviceJob['active'] === 0) {
    //             // if job is deleted
    //             $job = Job::where("uuid", $serviceJob['uuid'])->first();
    //             $job->update(['active'] === false);
    //             array_push($existingJobs, [
    //                 'deleted' => $job,
    //                 'service' => $serviceJob
    //             ]);
    //         } else {
    //             $acitvityResponse = Http::withBasicAuth($username, $password)
    //                 ->get($servicem8Url . "/jobactivity.json?%24filter=job_uuid%20eq%20'" . $serviceJob['uuid'] . "'")
    //                 ->json();

    //             $activities = [];
    //             foreach ($acitvityResponse as $key => $activity) {
    //                 if ($activity['active'] === 1 && $activity['activity_was_scheduled'] === 1) {
    //                     array_push($activities, $activity);
    //                     break;
    //                 }
    //             };

    //             if (count($activities) !== 0) {
    //                 $inspector = User::where('uuid', $activities[0]['staff_uuid'])->first();
    //                 $job = Job::where("uuid", $serviceJob['uuid'])->first();

    //                 if ($job['inspector_id'] !== $inspector['id']) {
    //                     $job['inspector_id'] = $inspector['id'];
    //                 }
    //                 $job['startsAt'] = new DateTime($activities[0]["start_date"]);
    //                 $job->save();
    //             }
    //         }
    //     } elseif ($serviceJob['active'] === 1) {
    //         $job = new Job();
    //         $job['uuid'] = $serviceJob['uuid'];
    //         $job['jobNumber'] = $serviceJob['generated_job_id'];
    //         if ($serviceJob['category_uuid'] !== "") {
    //             $jobCategory = JobCategory::where('uuid', $serviceJob['category_uuid'])->first();
    //             $job['category_id'] = $jobCategory['id'];
    //         }
    //         $job['siteAddress'] = $serviceJob['job_address'];
    //         $job['status'] = $serviceJob['status'];
    //         $job['description'] = $serviceJob['job_description'];

    //         if (!Customer::where('uuid', $serviceJob['company_uuid'])->exists()) {

    //             // Get Customer or company contacts
    //             $contacts = Http::withBasicAuth($username, $password)
    //                 ->get($servicem8Url . "/companycontact.json?%24filter=company_uuid%20eq%20'" . $serviceJob['company_uuid'] . "'")
    //                 ->json();

    //             $customerData = new Customer();

    //             foreach ($contacts as $key => $contact) {
    //                 if (str_contains(strtolower($contact['type']), "report")) {
    //                     $customerData['nameOnReport'] = trim($contact['first'] . " " . $contact['last']);
    //                 }

    //                 if (str_contains(strtolower($contact['type']), "billing")) {
    //                     $customerData['name'] = trim($contact['first'] . " " . $contact['last']);
    //                     $customerData['email'] = strtolower($contact['email']);
    //                     $customerData['phone'] = $contact['mobile'];
    //                 }

    //                 if (str_contains(strtolower($contact['type']), "builder")) {
    //                     $customerData['builder'] = trim($contact['first'] . " " . $contact['last']);
    //                     $customerData['builderEmail'] = strtolower($contact['email']);
    //                     $customerData['builderPhone'] = $contact['mobile'];
    //                 }

    //                 if (str_contains(strtolower($contact['type']), "supervisor")) {
    //                     $customerData['supervisor'] = trim($contact['first'] . " " . $contact['last']);
    //                     $customerData['supervisorEmail'] = strtolower($contact['email']);
    //                     $customerData['supervisorPhone'] = $contact['mobile'];
    //                 }
    //             }

    //             $customerData['uuid'] = $serviceJob['company_uuid'];
    //             $customerData['billingAddress'] = $serviceJob['billing_address'];

    //             $customerData->save();

    //             $job['customer_id'] = $customerData['id'];
    //         } else {
    //             $customerData = Customer::where('uuid', $serviceJob['company_uuid'])->first();
    //             $job['customer_id'] = $customerData['id'];
    //         }

    //         $acitvityResponse = Http::withBasicAuth($username, $password)
    //             ->get($servicem8Url . "/jobactivity.json?%24filter=job_uuid%20eq%20'" . $serviceJob['uuid'] . "'")
    //             ->json();

    //         $activities = [];
    //         foreach ($acitvityResponse as $key => $activity) {
    //             if ($activity['active'] === 1 && $activity['activity_was_scheduled'] === 1) {
    //                 array_push($activities, $activity);
    //                 break;
    //             }
    //         };

    //         if (count($activities) !== 0) {
    //             $inspector = User::where('uuid', $activities[0]['staff_uuid'])->first();
    //             if ($inspector) {
    //                 $job['inspector_id'] = $inspector['id'];
    //             }
    //             $job['startsAt'] = new DateTime($activities[0]["start_date"]);
    //         }

    //         $job->save();

    //         array_push($existingJobs, [
    //             'non-existing' => $serviceJob
    //         ]);
    //     }
    // }

    // return $existingJobs;
});
