<?php

namespace App\Utils;

use App\Models\Company;
use App\Models\Report;
use App\Models\ReportItem;
use App\Models\ReportTemplate;
use DateTime;
use Illuminate\Support\Facades\Storage;
use TCPDF;

class ReportPdf extends TCPDF
{
  public mixed $logo;
  public string $job_type;
  public string $job_number;

  public function GetImageFromBase64(string $base64)
  {
    $img = explode(",", $base64)[1];
    return '@' . base64_decode($img);
  }

  public function Header()
  {
    $this->setFont('Times', "", 11);
    // $this->Image($this->logo, 5, 5, 50, 0, "JPG");
    $this->Image("@" . $this->logo, 5, 5, 50, 0, "JPG");
    $this->Text(575, 10, $this->getAliasNumPage());
  }

  public function Footer()
  {
    $this->setFont('', "", 9);
    $this->setTextColor(0, 32, 96);
    $this->Text(50, -20, $this->job_number . " - " . $this->job_type . " - Inspection Report", 0, false);
  }

  public function SetHeading(string $heading)
  {
    $this->Bookmark($heading, 0, 0, "", "B", [0, 32, 96]);
    $this->setFont('', 'B', 13);
    $this->setTextColor(255, 255, 255);
    $this->SetFillColor(0, 32, 96);
    $this->SetFillColor(0, 32, 96);
    $this->Cell(0, 25, $heading, 0, 1, "", true);
    $this->Ln(5);
    $this->setFont('', '', 11);
    $this->setTextColor(0, 0, 0);
  }

  public function AddReportItems(mixed $reportItems)
  {
    usort($reportItems, function ($a, $b) {
      return $b->totalHeight - $a->totalHeight;
    });

    $maxContentHeight = 750;

    $final = [];

    for ($i = 0; $i < count($reportItems); $i++) {
      $itemA = $reportItems[$i];

      $isAExist = array_search($itemA['id'], array_column($final, 'id'));
      if ($isAExist) {
        continue;
      }

      $itemA['pageBreak'] = true;
      array_push($final, $itemA);

      if (count($itemA['images']) > 8) {
        continue;
      }

      if ($itemA['totalHeight'] > 600 && $itemA['totalHeight'] <= 770) {
        continue;
      }

      if ($i === count($reportItems) - 1) {
        break;
      }

      $remainingSpace = 750;
      if ($maxContentHeight >= $itemA['totalHeight']) {
        $remainingSpace = $maxContentHeight - $itemA['totalHeight'];
      } else {
        $remainingSpace = 2 * $maxContentHeight - $itemA['totalHeight'];
      }

      $secondItem = null;
      $diff = $remainingSpace;

      for ($j = $i + 1; $j < count($reportItems); $j++) {
        $itemB = $reportItems[$j];

        $isBExist = array_search($itemB['id'], array_column($final, 'id'));
        if ($isBExist) {
          continue;
        }

        if ($itemB['totalHeight'] < $remainingSpace && $remainingSpace - $itemB['totalHeight'] < $diff) {
          $secondItem = $itemB;
          $diff = $remainingSpace - $itemB['totalHeight'];
        }
      }

      if ($secondItem) {
        $secondItem['pageBreak'] = false;
        array_push($final, $secondItem);
      }
    }

    $lastItem = array_pop($final);
    $lastItem['pageBreak'] = false;
    array_unshift($final, $lastItem);

    foreach ($final as $index => $inspectionItem) {
      $itemContent = "";
      $name = '<p style="font-weight: bold;">' . $inspectionItem['name'] . "</p>";

      $itemContent = $itemContent . $name;

      $openingParagraph = "";
      $closingParagraph = "";

      $embeddedImages = "";
      if (!$inspectionItem['item_id']) {
        $openingParagraph = '<p>' . $inspectionItem['opening_paragraph'] . '</p>';
        $closingParagraph = '<p>' . $inspectionItem['closing_paragraph'] . '</p>';
        if ($inspectionItem['embedded_image']) {
          $embeddedImages = '<table><tbody><tr><td><img src="' . $inspectionItem['embedded_image'] . '" style="height: 200pt;"></td></tr></tbody></table>';
        }
      } else {
        $openingParagraph = $inspectionItem['item']['opening_paragraph'];
        $closingParagraph = $inspectionItem['item']['closing_paragraph'];

        if ($inspectionItem['item']['embedded_images']) {
          $embImages = $inspectionItem['item']['embedded_images'];
          $embCols = '';
          $embRows = '';
          foreach ($embImages as $key => $embimg) {
            $embElement = '<td style="text-align: center;"><img src="' . $embimg . '" style="height: 200pt;"></td>';
            $embCols = $embCols . $embElement;

            if ($key % 2 !== 0) {
              $embRows = $embRows . '<tr>' . $embCols . '</tr>';
              $embCols = '';
            }

            if ($key % 2 === 0 && $key === count($embImages) - 1) {
              $embRows = $embRows . '<tr>' . $embCols . '</tr>';
            }
          }

          $embeddedImages = '<table><tbody>' . $embRows . '</tbody></table>';
        }
      }

      $itemContent = $itemContent . $openingParagraph;



      if ($inspectionItem['note'] && $inspectionItem['note'] !== "") {
        $noteText = '<p>Note:</p>' . '<p>' . $inspectionItem['note'] . '</p>';
        $itemContent = $itemContent . $noteText;
      }

      $images = $inspectionItem['images'];
      $imgcols = '';
      $imgRows = '';
      foreach ($images as $i => $imgStr) {
        $imgElement = "";
        if ($i % 2 === 0 && $i === count($images) - 1) {
          $imgElement = '<td colspan="2" style="text-align: center;"><img src="' . $imgStr . '" style="width: 200pt; height: 200pt;"></td>';
        } else {
          $imgElement = '<td><img src="' . $imgStr . '" style="display: block; width: 200pt; height: 200pt;"></td>';
        }
        $imgcols = $imgcols . $imgElement;

        if ($i % 2 !== 0) {
          $imgRows = $imgRows . '<tr>' . $imgcols . '</tr>';
          $imgcols = '';
        }

        if ($i % 2 === 0 && $i === count($images) - 1) {
          $imgRows = $imgRows . '<tr>' . $imgcols . '</tr>';
        }
      }

      $imgTable = '<table><tbody>' . $imgRows . '</tbody></table>';
      $itemContent = $itemContent . $imgTable;

      $itemContent = $itemContent . $closingParagraph;

      if ($embeddedImages !== "") {
        $itemContent = $itemContent . $embeddedImages;
      }

      $serial = '<td style="width: 25pt; border-top: 1pt solid #002060;">' . $index + 1 . "</td>";
      $column = '<td style="width: 475pt; border-top: 1pt solid #002060;">' . $itemContent . "</td>";

      $row = '<tr style="vertical-align: top;">' . $serial . $column . "</tr>";
      $table = '<table style="width: 495pt; border: 1pt solid #002060;"><tbody>' . $row . "</tbody></table>";

      if ($inspectionItem['pageBreak']) {
        $this->AddPage();
      }
      $this->writeHTML($table, false, false, true, false);
    }
  }

  public function MakePdf(Report $report)
  {
    set_time_limit(300);

    $job = $report->job;

    // $template = Storage::json('templateimages.json');
    $company = Company::first();

    // $this->logo = $this->GetImageFromBase64($company['logo']);
    $this->logo = Storage::get('mainlogo.jpg');

    $this->job_type = $job->category['type'];
    $this->job_number = $job['job_number'];

    // set meta data and setting

    $this->setAuthor($job->inspector['first'] . " " . $job->inspector['last']);
    $this->setCreator('Correct Inspections');
    $this->setTitle($job['job_number'] . " - " . $job->category['type'] . " - Inspection Report");
    $this->setMargins(50, 50, 50);
    $this->setPrintFooter(false);
    // $this->setPrintHeader(false);
    $this->setAutoPageBreak(false);
    $this->setFont('Times', "", 11);

    $tagvs = [
      'p' => [
        0 => ['h' => 0, 'n' => 0],
        1 => ['h' => 0, 'n' => 0]
      ],
      'ol' => [
        0 => ['h' => 0, 'n' => 0.3],
        1 => ['h' => 0, 'n' => 0.3]
      ],

    ];
    $this->setHtmlVSpace($tagvs);

    // add title page
    $this->AddPage();
    $topImage = Storage::get('topimage.png');
    $this->Image("@" . $topImage, 0, 0, 595, 0, "PNG");

    $titleLogoImage = Storage::get('titlelogo.jpg');
    $this->Image("@" . $titleLogoImage, 172, 125, 250, 0, 'JPG');

    $this->SetTextColor(0, 32, 96);
    $this->SetY(450);
    $this->SetX(400);
    $this->SetFontSize(33);
    $this->Cell(125, 0, $job->category['type'], 0, 1, "R", false, "");
    $this->SetY(490);
    $this->SetX(400);
    $this->Cell(125, 0, 'INSPECTION REPORT', 0, 1, "R", false, "");
    $this->SetY(530);
    $this->SetX(400);
    $this->Cell(125, 0, '& DEFECTS LIST', 0, 1, "R", false, "");
    $this->SetTextColor(64, 64, 64);
    $this->SetFontSize(18);
    $this->SetY(565);
    $this->SetX(400);
    $this->Cell(125, 0, $job['site_address'], 0, 1, "R", false, "");

    $bottomImage = Storage::get('bottomimage.png');
    $this->Image("@" . $bottomImage, 0, 617, 595, 0, "PNG");

    $this->SetFont('Times', '', 11);
    $this->SetTextColor(0, 32, 96);
    $this->SetY(755);
    $this->SetX(375);
    $this->Cell(125, 0, 'Call us on: ' . $company['phone'], 0, 1, "", false, "");
    $this->SetY(767);
    $this->SetX(375);
    $this->SetFont('Times', 'U', 11);
    $this->Cell(125, 0, $company['email'], 0, 1, "", false, "mailto:" . $company['email']);
    $this->SetY(778);
    $this->SetX(375);
    $this->SetFont('Times', 'U', 11);
    $this->Cell(125, 0, $company['website'], 0, 1, "", false, "https://" . $company['website']);
    $this->SetY(789);
    $this->SetX(375);
    $this->SetFont('Times', '', 11);
    $this->Cell(125, 0, 'Postal Address: ' . $company['address_line1'], 0, 1, "", false, "");
    $this->SetY(801);
    $this->SetX(375);
    $this->Cell(125, 0, $company['address_line2'], 0, 1, "", false, "");


    $titleSection = ReportTemplate::where('heading', 'Title Page')->first();
    if (!$titleSection) {
      return;
    }

    $prevSection = $titleSection;

    $reportItems = ReportItem::where('report_id', $report['id'])->get();

    if ($report['is_revised'] && $report['original_report_id']) {
      $originalReportItems = ReportItem::where('report_id', $report['original_report_id'])
        ->where('is_revised', false)->get();
      $reportItems = $reportItems->merge($originalReportItems);
    }

    $reportItems = $reportItems->map(function (ReportItem $reportItem) {
      if (!$reportItem['item_id']) {
        $reportItem['totalHeight'] = $reportItem['height'];
        return $reportItem;
      }

      $libItem = $reportItem->item;

      if ($reportItem['previous_report_item_id']) {
        $prevItem = $reportItem->previousItem;
        $allImages = [];
        array_push($allImages, ...$reportItem['images'], ...$prevItem['images']);
        $reportItem['images'] = $allImages;
      }

      $totalHeight = $reportItem['height'] + $libItem['height'];

      if ($reportItem['height'] + $libItem['height'] > 750 && count($reportItem['images']) > 6) {
        $totalHeight = $reportItem['height'] + $libItem['height'] + 200;
      } elseif ($reportItem['height'] + $libItem['height'] > 750 && $libItem['embedded_images'] !== null) {
        $totalHeight = $reportItem['height'] + $libItem['height'] + 200;
      }

      $reportItem['item'] = $libItem;
      $reportItem['totalHeight'] = $totalHeight;

      return $reportItem;
    });

    $previousItems = [];
    $newItems = [];

    foreach ($reportItems as $insItem) {
      if ($insItem['previous_report_item_id']) {
        array_push($previousItems, $insItem);
      } else {
        array_push($newItems, $insItem);
      }
    }

    while (true) {
      $section = ReportTemplate::where('order', $prevSection['id'])->first();
      if (!$section) {
        break;
      }

      $prevSection = $section;

      if (str_contains($section['heading'], 'Incomplete Items') && count($previousItems) === 0) {
        continue;
      }

      if ($section['page_break']) {
        $this->AddPage();
        $this->setPrintFooter(true);
        $this->setAutoPageBreak(true, 25);
        $this->setCellHeightRatio(1.2);
      }

      $sectionBody = "";
      if ($section['is_template']) {
        $sectionBody = $section['body'];
        if (str_contains($section['heading'], 'General')) {
          $sectionBody = $sectionBody . '<p><b>' . $job->inspector['first'] . " " . $job->inspector['last'] . '</b></p>';
          $inspectorPhone = $job->inspector['phone'];
          if ($inspectorPhone) {
            $sectionBody = $sectionBody .  '<p><b>' . $inspectorPhone . '</b></p>';
          }
        }
      } else {
        if (str_contains($section['heading'], 'Client & Property')) {
          $sectionBody = $section['body'];
          $sectionBody = str_replace(['{{CLIENT_NAME}}', '{{SITE_ADDRESS}}'], [$job->customer['name_on_report'], $job['site_address']], $sectionBody);
        } elseif (str_contains($section['heading'], 'Inspection & Report Details')) {
          $sectionBody = $section['body'];
          $sectionBody = str_replace(
            ['{{INSPECTION_DATE}}', '{{INSPECTION_TIME}}', '{{STAGE_OF_WORKS}}', '{{REPORT_DATE}}'],
            [$job['starts_at']->format('l jS F Y'), $job['starts_at']->format('h:i A'), $job->category['stage_of_works'], (new DateTime())->format('l jS F Y')],
            $sectionBody
          );
        } elseif (str_contains($section['heading'], 'Inspection Notes')) {
          $sectionBody = "";
          if (is_array($report['notes']) && count($report['notes']) !== 0) {
            $notesList = "";

            foreach ($report['notes'] as $note) {
              $notesList = $notesList . "<li>" . $note . "</li>";
            }

            $sectionBody = $sectionBody . '<span>At the time of this inspection, we note the following;</span><ol>' . $notesList . '</ol>';
          } else {
            $sectionBody = "<p>N/A</p>";
          }
        } elseif (str_contains($section['heading'], 'Summary')) {
          $previousCount = count($previousItems);
          $newCount = count($newItems);
          $recommendation = $report['recommendation'];

          $sectionBody = '<p>' . $newCount . ' new items added in this report</p>';
          if ($previousCount !== 0) {
            $sectionBody = '<p>' . $previousCount . ' items added from previous report.</p>' . $sectionBody;
          }

          $sectionBody = $sectionBody . '<p>Total ' . $previousCount + $newCount . ' items added in this report.</p>';
          if ($recommendation) {
            $sectionBody = $sectionBody . '<p>Recommendation by inspector: ' . $recommendation . '</p>';
          }
        }
      }

      $this->SetHeading($section['heading']);
      $this->writeHTML($sectionBody, false, false, true);
      $this->Ln(10);

      if (count($previousItems) !== 0 && str_contains($section['heading'], 'Incomplete Items')) {
        $this->AddReportItems($previousItems);
      }

      if (str_contains($section['heading'], 'Building Defects')) {
        $this->AddReportItems($newItems);
      }
    }

    $this->addTOCPage();
    $this->setFont('', 'B', 13);
    $this->setTextColor(255, 255, 255);
    $this->SetFillColor(0, 32, 96);
    $this->SetFillColor(0, 32, 96);
    $this->Cell(0, 25, 'Table Of Contents', 0, 1, "", true);
    $this->Ln(5);
    $this->setFont('', '', 11);
    $this->setTextColor(0, 0, 0);

    $bookmark_templates = [];

    $bookmark_templates[0] = '<table><tbody><tr><td width="475pt">#TOC_DESCRIPTION#</td><td>#TOC_PAGE_NUMBER#</td></tr></tbody></table>';

    $this->setFont('', '', 11);
    $this->addHTMLTOC(2, 'TOC', $bookmark_templates);
    $this->endTOCPage();
  }
}
