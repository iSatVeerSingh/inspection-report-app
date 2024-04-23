<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ItemCategoryController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\JobCategoryController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReportItemController;
use App\Http\Controllers\ReportTemplateController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureUserIsOwner;
use App\Http\Middleware\EnsureUserIsOwnerOrAdmin;
use Illuminate\Support\Facades\Route;

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
  Route::apiResource('/users', UserController::class)->only(['index', 'store', 'update', 'destroy'])->middleware(EnsureUserIsOwner::class);

  Route::middleware(EnsureUserIsOwnerOrAdmin::class)->group(function () {
    Route::apiResource('/item-categories', ItemCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('/items', ItemController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::apiResource('/notes', NoteController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('/recommendations', RecommendationController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('/report-templates', ReportTemplateController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('/job-categories', JobCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
  });
  Route::apiResource('/jobs', JobController::class)->only(['index']);

  Route::get('/install-notes', [NoteController::class, 'install']);
  Route::get('/install-items', [ItemController::class, 'install']);
  Route::get('/install-categories', [ItemCategoryController::class, 'install']);
  Route::get('/install-recommendations', [RecommendationController::class, 'install']);

  Route::get('/sync-library', [ItemController::class, 'syncLibrary']);

  Route::get('/previous-report', [ReportController::class, 'previousReportByCustomer']);
  Route::apiResource('/reports', ReportController::class)->only(['index', 'store', 'show']);
  Route::apiResource("/report-items", ReportItemController::class)->only(['index', 'show', 'store', 'update', 'destroy']);
  Route::post('/generate-report', [ReportController::class, 'generateReport']);
  Route::post('/send-email', [ReportController::class, 'emailAlert']);
  Route::get('/companies', [CompanyController::class, 'index']);
  Route::post('/suggest-item', [ItemController::class, 'suggestItem']);
  Route::post('/suggest-note', [NoteController::class, 'suggestNote']);

  Route::put('/companies', [CompanyController::class, 'update'])->middleware(EnsureUserIsOwner::class);
});


Route::get('/pdf-report/{report_id}/{pdfname}', [ReportController::class, 'getReportPdf']);
