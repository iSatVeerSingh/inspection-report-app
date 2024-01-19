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
use App\Utils\ReportPdf;
use Codedge\Fpdf\Fpdf\Fpdf;
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
    $pdf = new ReportPdf('P', 'pt');
    $pdf->MakePdf();
    // $tagvs = array('p' => array(0 => array('h' => 0, 'n' => 0), 1 => array('h' => 0, 'n' => 0)));
    $tagvs = [
        'p' => [
            0 => ['h' => 0, 'n' => 0],
            1 => ['h' => 0, 'n' => 0]
        ]
    ];
    $pdf->setHtmlVSpace($tagvs);
    $pdf->setAutoPageBreak(true);

    $inspectionItems = InspectionItem::where("job_id", "b6b33735-f2f5-4606-b7ed-1e95cf121cab")->get();
    foreach ($inspectionItems as $i => $item) {

        $libItem = LibraryItem::find($item['library_item_id']);
        $openingParagraphs = json_decode($libItem['openingParagraph']);
        $closingParagraphs = json_decode($libItem['closingParagraph']);
        $images = $item['images'];

        $openingParaHtml = "";
        foreach ($openingParagraphs as $paragraph) {
            $paraText = "";
            $spans = $paragraph->text;
            foreach ($spans as $span) {
                $spanText = $span->text;
                if ($span->bold) {
                    $spanText = '<b>' . $spanText . '</b>';
                }
                if ($span->italics) {
                    $spanText = '<i>' . $spanText . '</i>';
                }
                $paraText = $paraText . $spanText;
            }
            $openingParaHtml = $openingParaHtml . '<p>' . $paraText . '</p>';
        }

        $row = "";
        $imgTableTemp = '';
        foreach ($images as $key => $img) {
            $imgEle = '<td><img src="' . $img . '" style="display: block; width: 200pt; height: 200pt;"></td>';
            $row = $row . $imgEle;

            if ($key % 2 !== 0) {
                $imgTableTemp = $imgTableTemp . '<tr>' . $row . '</tr>';
                $row = "";
            }

            if ($key % 2 === 0 && $key === count($images) - 1) {
                $imgTableTemp = $imgTableTemp . '<tr>' . $row . '</tr>';
            }
        }

        $imgTable = '<table><tbody>' . $imgTableTemp . '</tbody></table>';

        $embeddedImgEle = "";
        if ($libItem['embeddedImage']) {
            $embeddedImgEle = '<img src="' . $libItem['embeddedImage'] . '" style="display: block; width: 200pt; height: 200pt;">';
        }

        $closingParaHtml = "";
        foreach ($closingParagraphs as $paragraph) {
            $paraText = "";
            $spans = $paragraph->text;
            foreach ($spans as $span) {
                $spanText = $span->text;
                if ($span->bold) {
                    $spanText = '<b>' . $spanText . '</b>';
                }
                if ($span->italics) {
                    $spanText = '<i>' . $spanText . '</i>';
                }
                $paraText = $paraText . $spanText;
            }
            $closingParaHtml = $closingParaHtml . '<p>' . $paraText . '</p>';
        }
        $itemText = $openingParaHtml . $imgTable  . $embeddedImgEle  .  $closingParaHtml;

        $table = '<table style="width: 495pt; border: 1pt solid black;">
    <tbody>
    <tr style="vertical-align: top;">
    <td style="width: 30pt;">' . $i + 1 . '</td>
    <td style="width: 470pt; padding-top: 0; padding-bottom: 0;">'
            . $itemText .
            '</td>
    </tr>
    </tbody>
    </table>';

        if ($i !== 0) {
            $pdf->AddPage();
        }
        $pdf->writeHTML($table, false, false, false, false);
    }
    $pdf->Output();
});
