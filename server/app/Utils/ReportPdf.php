<?php

namespace App\Utils;

use Illuminate\Support\Facades\Storage;
use TCPDF;

class ReportPdf extends TCPDF
{
  public function GetImageFromBase64(string $base64)
  {
    $img = explode(",", $base64)[1];
    return '@' . base64_decode($img);
  }

  protected function TitlePage()
  {
    $template = Storage::json('report-template.json');

    $topImage = $this->GetImageFromBase64($template['images']['topImage']);
    // Draw top image
    $this->Image($topImage, 0, 0, 595, 0, "PNG");;

    // Draw bottom image
    $bottomImage = $this->GetImageFromBase64($template['images']['bottomImage']);
    $this->Image($bottomImage, 0, 617, 595, 0, "PNG");

    // Draw middle logo image
    $logoImage = $this->GetImageFromBase64($template['images']['logoImage']);
    $this->Image($logoImage, 172, 125, 250, 0, 'PNG');

    // Draw Title
    $this->SetTextColor(0, 32, 96);
    $this->SetY(450);
    $this->SetX(400);
    $this->SetFontSize(33);
    $this->Cell(125, 0, 'FRAME', 0, 1, "R", false, "");
    $this->SetY(490);
    $this->SetX(400);
    $this->Cell(125, 0, 'INSPECTION REPORT', 0, 1, "R", false, "");
    $this->SetY(530);
    $this->SetX(400);
    $this->Cell(125, 0, '& DEFECTS LIST', 0, 1, "R", false, "");
    $this->SetTextColor(64, 64, 64);
    $this->SetFontSize(18);
    $this->SetY(560);
    $this->SetX(400);
    $this->Cell(125, 0, 'SatVeer Singh Jaipur 394848', 0, 1, "R", false, "");

    $this->SetFont('Times', '', 11);
    $this->SetTextColor(0, 32, 96);
    $this->SetY(755);
    $this->SetX(375);
    $this->Cell(125, 0, 'Call us on: (03) 9434 1120', 0, 1, "", false, "");
    $this->SetY(767);
    $this->SetX(375);
    $this->SetFont('Times', 'U', 11);
    $this->Cell(125, 0, 'admin@correctinspections.com.au', 0, 1, "", false, "mailto:admin@correctinspections.com.au");
    $this->SetY(778);
    $this->SetX(375);
    $this->SetFont('Times', 'U', 11);
    $this->Cell(125, 0, 'www.correctinspections.com.au', 0, 1, "", false, "https://www.correctinspections.com.au");
    $this->SetY(789);
    $this->SetX(375);
    $this->SetFont('Times', '', 11);
    $this->Cell(125, 0, 'Postal Address: P.O. Box 22', 0, 1, "", false, "");
    $this->SetY(801);
    $this->SetX(375);
    $this->Cell(125, 0, 'Greensborough VIC 3088', 0, 1, "", false, "");
  }

  public function SetHeading(string $heading)
  {
    $this->setFont('', 'B', 13);
    $this->setTextColor(255, 255, 255);
    $this->SetFillColor(0, 32, 96);
    $this->SetFillColor(0, 32, 96);
    $this->Cell(0, 25, $heading, 0, 1, "", true);
    $this->Ln(5);
    $this->setFont('', '', 11);
    $this->setTextColor(0, 0, 0);
  }

  public function MiniDetails(string $property, string $value)
  {
    $this->SetTextColor(0, 0, 0);
    $this->setFontSize(11);
    $this->writeHTML('<table style="padding-left: 5pt;">
    <tr>
      <td style="width: 130pt; font-weight: bold;">' . $property .  ':</td>
      <td style="font-weight: normal;">' . $value . '</td>
    </tr>
  </table>', false, false, true, false);
  }

  public function InspectionNotes()
  {
    $this->SetHeading('Inspection Notes');
    $this->setTextColor(0, 0, 0);
    $this->setFont('', '', 11);
    $noteStr = '<span>At the time of this inspection, we note the following;</span>
    <ol>
      <li>The owner was onsite during this inspection.</li>
      <li>This inspection is a requested point-in-time inspection.</li>
      <li>There are window and door frames that had not yet been installed.</li>
      <li>The balconies had not yet been waterproofed.</li>
      <li>Waterproofing and joinery installation work had not been completed at the time of inspection.</li>
      <li>Painting & render works have not been completed at the time of inspection.</li>
    </ol>';
    $this->writeHTML($noteStr);
    $this->Ln(10);
  }

  public function MakePdf()
  {
    // disable header and footer
    $this->setMargins(50, 50, 50);
    $this->setPrintHeader(false);
    $this->setPrintFooter(false);
    $this->setAutoPageBreak(false);
    $this->setFont('Times', "", 11);
    $this->AddPage();
    $this->TitlePage();
    $this->AddPage();
    $this->SetHeading('Client & Property Details');
    $this->MiniDetails("Client Name(s)", "SatVeer Singh");
    $this->MiniDetails("Subject Property", "68 Ryelands Drive Narre Warren VIC 3805");
    $this->Ln(10);
    $this->SetHeading('Inspection & Report Details');
    $this->MiniDetails("Inspection Date", "Thursday 16th November 2023");
    $this->MiniDetails("Inspection Time", "10:30 AM");
    $this->MiniDetails("Stage of Works", "Point-in-Time Inspection");
    $this->MiniDetails("Date of this Report", "Thursday 16th November 2023");
    $this->Ln(10);
    $this->InspectionNotes();
    $this->SetHeading('Report Purpose');
    $purpos = "The purpose of this inspection and report is to check on the progress of works and quality of workmanship at the specified construction stage and to identify defects or faults in the new construction that do not reach an acceptable standard of quality, or have not been built in a proper workmanlike manner in relation to the Building Act & Regulations, the National Construction Code's Building Code of Australia (BCA), any relevant Australian Standard, any manufacturers installation instruction or the acceptable standards & tolerances as set down by the Victorian Building Authority (VBA). The results of this inspection are in the Schedule of Building Defects table section.";
    $this->Write(12, $purpos, "", false, "L", true);
    $this->Ln(10);
    $this->SetHeading('General');
    $general = "This report is the result of a visual inspection only and is intended to provide a reasonable confirmation of the progress and quality of the works to date and to note items that may need attention by the builder to ensure satisfactory quality of workmanship. This report is not to be read as an instruction to the builder. Should the reader of this report have any questions in relation to the items set out within it, please do not hesitate to contact our office.";
    $this->Write(12, $general, "", false, "L", true);
    $this->Ln(10);
    $this->AddPage();
    $this->SetHeading("Schedule of Building Defects");
    $text = "The following is a list of newly identified defects that exist in the finishes and the quality of those finishes, for which rectification can reasonably be expected to be the responsibility of the builder.";
    $this->Write(12, $text, "", false, "L", true);
    $this->Ln(10);


    $this->writeHTML('  <h1 style="background-color: #002060; color: white; padding-top: 10pt; padding-bottom: 10pt;">
    This is heading now
  </h1>', true, false, true, false);
  }
}
