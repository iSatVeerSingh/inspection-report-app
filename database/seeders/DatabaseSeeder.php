<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\Job;
use App\Models\JobCategory;
use App\Models\Note;
use App\Models\ReportTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
  /**
   * Seed the application's database.
   */
  public function run(): void
  {
    $titlePage = new ReportTemplate([
      'heading' => 'Title Page',
      'is_template' => false
    ]);

    $titlePage->save();

    // Clients and property details
    $clientDetails = new ReportTemplate([
      'heading' => 'Client & Property Details',
      'body' => '<table><tbody><tr><td style="width: 130pt; font-weight: bold;">Client Name(s):</td><td>{{CLIENT_NAME}}</td></tr><tr><td style="width: 130pt; font-weight: bold;">Subject Property:</td><td>{{SITE_ADDRESS}}</td></tr></tbody></table>',
      'order' => $titlePage['id'],
      'page_break' => true,
      'is_template' => false
    ]);

    $clientDetails->save();

    // inspection details
    $inspectionDetails = new ReportTemplate([
      'heading' => 'Inspection & Report Details',
      'body' => '<table><tbody><tr><td style="width: 130pt; font-weight: bold;">Inspection Date:</td><td>{{INSPECTION_DATE}}</td></tr><tr><td style="width: 130pt; font-weight: bold;">Inspection Time:</td><td>{{INSPECTION_TIME}}</td></tr><tr><td style="width: 130pt; font-weight: bold;">Stage of Works:</td><td>{{STAGE_OF_WORKS}}</td></tr><tr><td style="width: 130pt; font-weight: bold;">Date of this Report:</td><td>{{REPORT_DATE}}</td></tr></tbody></table>',
      'order' => $clientDetails['id'],
      'is_template' => false
    ]);

    $inspectionDetails->save();

    $insepctionNotes = new ReportTemplate([
      'heading' => 'Inspection Notes',
      'order' => $inspectionDetails['id'],
      'is_template' => false
    ]);

    $insepctionNotes->save();

    $reportSummary = new ReportTemplate([
      'heading' => 'Report Summary',
      'order' => $insepctionNotes['id'],
      'is_template' => false
    ]);

    $reportSummary->save();

    $purpose = new ReportTemplate([
      'heading' => 'Purpose',
      'body' => '<p><span style="white-space: pre-wrap;">The purpose of this inspection and report is to check on the progress of works and quality of workmanship at the specified construction stage and to identify defects or faults in the new construction that do not reach an acceptable standard of quality, or have not been built in a proper workmanlike manner in relation to the Building Act &amp; Regulations, the National Construction Code Building Code of Australia (BCA), any relevant Australian Standard, any manufacturers installation instruction or the acceptable standards &amp; tolerances as set down by the Victorian Building Authority (VBA). The results of this inspection are in the Schedule of Building Defects table section.</span></p>',
      'order' => $reportSummary['id'],
      'is_template' => true,
    ]);

    $purpose->save();

    $general = new ReportTemplate([
      'heading' => 'General',
      'body' => '<p><span>This report is the result of a visual inspection only and is intended to provide a reasonable confirmation of the progress and quality of the works to date and to note items that may need attention by the builder to ensure satisfactory quality of workmanship. This report is not to be read as an instruction to the builder. Should the reader of this report have any questions in relation to the items set out within it, please do not hesitate to contact our office.</span></p>',
      'order' => $purpose['id'],
      'is_template' => true,
    ]);

    $general->save();

    $previousItems = new ReportTemplate([
      'heading' => 'Incomplete Items from our Previous Report',
      'body' => '<p><span>These are some defects which are still incomplete from previous report</span></p>',
      'order' => $general['id'],
      'page_break' => true,
      'is_template' => true,
    ]);

    $previousItems->save();

    $newItems = new ReportTemplate([
      'heading' => 'Schedule of Newly Identified Building Defects',
      'body' => '<p><span>The following is a list of newly identified defects that exist in the finishes and the quality of those finishes, for which rectification can reasonably be expected to be the responsibility of the builder.</span></p>',
      'order' => $previousItems['id'],
      'page_break' => true,
      'is_template' => true,
    ]);

    $newItems->save();

    $builderResponsibility = new ReportTemplate([
      'heading' => 'Builder’s Responsibility To Rectify',
      'body' => '<p dir="ltr">
                  <b>
                    <strong style="white-space: pre-wrap;">Your Building Contract</strong>
                  </b>
                </p>
                <p dir="ltr">
                  <span style="white-space: pre-wrap;">The building contract you have with your builder is a legally binding contract, which amongst several other things, outlines the specific details of your new home and the amount you will need to pay your builder. Both your building contract and the Domestic Building Contracts Act (Act of Parliament in Victoria) have warranties that your builder must provide you, which in part state; The builder warrants that the work will be carried out in a proper and workmanlike manner and in accordance with the plans and specifications set out in the contract. The builder warrants that the work will be carried out in accordance with, and will comply with, all laws and legal requirements including, without limiting the generality of this warranty, the Building Act and the regulations made under that Act. The builder warrants that the work will be carried out with reasonable care and skill and will be completed by the date (or within the period) specified by the contract. These warranties mean that your builder has a contractual obligation to rectify or otherwise justify all of the identified items that breach any of your plans, specification, the NCC/BCA and all of the Australian Standards referenced within it; and must do so in a proper workmanlike manner with reasonable care and skill.</span>
                </p>
                <p dir="ltr">
                  <b>
                    <strong style="white-space: pre-wrap;">The Building Surveyor’s Role</strong>
                  </b>
                </p>
                <p dir="ltr">
                  <span style="white-space: pre-wrap;">Your builder may try to represent to you that because the building surveyor has approved a stage of works then they do not need to address any additional items identified within this report, however this is not true. The building surveyor only operates under and ensures compliance with the Building Act, not the Domestic Building Contracts Act or your building contract, to which they are not party to. Any such representation would only be from someone that is either ill-informed or attempting to mislead you!</span>
                </p>
                <p dir="ltr">
                  <span style="white-space: pre-wrap;"> While the building surveyor does play a regulatory role in the process of your new homes construction, they are not the final advocate on its quality or its compliance with your building contract or the Domestic Building Contracts Act.</span>
                </p>
                <p dir="ltr">
                  <span style="white-space: pre-wrap;">You should note that on completion of the construction of your home, the building surveyor will issue an Occupancy Permit, however what most people are never made aware of is that Section 46 Effects of Occupancy Permits of the Building Act clearly states that </span>
                  <b>
                    <strong style="white-space: pre-wrap;">An Occupancy permit is not evidence that the building or part of a building to which it applies complies with this Act or the Building Regulations</strong>
                  </b>
                  <span style="white-space: pre-wrap;">. As a result, there is very little protection for you from the surveyor, other than knowing your home complies with the minimum regulatory requirements of the Building Act.</span>
                </p>
                <p dir="ltr">
                  <span style="white-space: pre-wrap;"> Nowhere in the Building Act does it state that a surveyors approval overrides compliance with the Domestic Building Contracts Act, and vice-versa. Therefore, your builder has a regulatory obligation to comply with the Building Act and a contractual obligation to comply with the Domestic Building Contracts Act.</span>
                </p>
                <p dir="ltr">
                  <b>
                    <strong style="white-space: pre-wrap;">Completion &amp; Final Payment</strong>
                  </b>
                </p>
                <p dir="ltr">
                  <span style="white-space: pre-wrap;">For your builder to have reached the completion stage of your home, at which point they are entitled to receive their final payment, they must have completed all of their requirements under the Building Act and provided you with a copy of the Occupancy Permit. They must also have completed your home in a proper and workmanlike manner and in accordance with the plans and specifications; and all work performed by them must also have been carried out with reasonable care and skill.</span>
                </p>
                <p dir="ltr">
                  <span style="white-space: pre-wrap;">It should be noted that until your builder has achieved full compliance with these warranties then the works remain incomplete, and the builder would not be entitled to receive final payment. The outstanding and newly identified items documented in the schedules below must be properly addressed by your builder for  your home to reach completion.</span>
                </p>',
      'order' => $newItems['id'],
      'page_break' => true,
      'is_template' => true,
    ]);

    $builderResponsibility->save();


    $terms = new ReportTemplate([
      'heading' => 'Terms & Conditions for the Provision of this Report',
      'body' => '<ol>
                  <li value="1">
                    <span style="white-space: pre-wrap;">The Report is expressly produced for the sole use of the Client. Legal liability is limited to the Client.</span>
                  </li>
                  <li value="2">
                    <span style="white-space: pre-wrap;">No advice is given regarding the presence, or effect, of termites on the Property. A specialist company should be approached to provide such certification if required.</span>
                  </li>
                  <li value="3">
                    <span style="white-space: pre-wrap;">Any dimensions given are approximate only. Should any dimensions be considered critical or important, they should be accurately measured.</span>
                  </li>
                  <li value="4">
                    <span style="white-space: pre-wrap;">The Client acknowledges, and agrees that any comments contained in the Report relating to matters of an electrical or plumbing nature are based on a visual inspection only carried out by the Inspector on the day of the inspection, and should not in any way be relied upon by the Client as a substitute for obtaining expert professional advice from a licensed electrician or plumber.</span>
                  </li>
                  <li value="5">
                    <span style="white-space: pre-wrap;">Any charge-out rate quoted relates to normal work and is not applicable for work relating to arbitration, mediation, conciliation, expert witness, court appearance, document preparation, or any other legal application.</span>
                  </li>
                  <li value="6">
                    <span style="white-space: pre-wrap;"> The Report comments on only those features that were reasonably visible and reasonably accessible at the time of the inspection, without recourse to viewing platforms, the removal, or moving of building components, or any other materials of any kind or any other unusual methodology.</span>
                  </li>
                  <li value="7">
                    <span style="white-space: pre-wrap;">We have not inspected the structure/frame/foundation/drains etc. that are covered, unexposed or inaccessible, and are therefore unable to report that any such part of the structure is free from defect.</span>
                  </li>
                  <li value="8">
                    <span style="white-space: pre-wrap;">Only those items in the Report that have been commented upon have been inspected. If there is no comment against an item, it has not been inspected. The Inspector gives no undertaking that they will inspect all items present on the day of the inspection.</span>
                  </li>
                  <li value="9">
                    <span style="white-space: pre-wrap;">This report, its layout and contents are the copyright of Correct Inspections. Any person, party or entity, other than the party named as the client on this report hereof that uses or relies upon this report without our expressed written permission is in breach of this copyright.</span>
                  </li>
                  <li value="10">
                    <span style="white-space: pre-wrap;">All advice given by the Inspector and not included in the Report is given in good faith. However, no responsibility is accepted for any losses, either direct or consequential, resulting from the advice.</span>
                  </li>
                  <li value="11">
                    <span style="white-space: pre-wrap;">The Report is confirmation of a visual inspection of the Property carried out by the Inspector on the day of the inspection and only covers those items that could reasonably be detected by such visual inspection at the time of such inspection.</span>
                  </li>
                  <li value="12">
                    <span style="white-space: pre-wrap;">All statutory or implied conditions and warranties are excluded to the extent permitted by law.</span>
                  </li>
                  <li value="13">
                    <span style="white-space: pre-wrap;">To the extent permitted by law, liability under any condition or warranty that cannot legally be excluded, is limited to supplying the Report again, or paying the cost of having the Report supplied again.</span>
                  </li>
                  <li value="14">
                    <span style="white-space: pre-wrap;">If the Report fails to conform in any material respect to the terms and conditions set out herein, then the Inspector is not liable unless the Client notifies the Inspector of the failure within 28 days after the date of delivery of the Report, and the liability of the Inspector is, in any case, limited to the cost of providing this inspection, and the Inspector is not liable for any consequential damage.</span>
                  </li>
                  <li value="15">
                    <span style="white-space: pre-wrap;">The provisions of clause 14 above are subject to the provision of any statutory condition or warranty that cannot legally be excluded.</span>
                  </li>
                  <li value="16">
                    <span style="white-space: pre-wrap;">Payment to the Inspector will be made at the time of inspection or prior to the supply of the report.</span>
                  </li>
                  <li value="17">
                    <span style="white-space: pre-wrap;">The terms and conditions contained herein constitute the entire agreement and understanding between the Client and the Inspector, on everything connected to the subject matter of the Agreement, and supersede any prior agreement or understanding or anything connected with that subject matter.</span>
                  </li>
                  <li value="18">
                    <span style="white-space: pre-wrap;">These are the standard terms and conditions under which we provide our service to you. When we provide you our service, we do so on the basis that these terms and conditions make up the terms of the contract between you and us, and you agree to be bound by these terms and conditions.</span>
                  </li>
                  <li value="19">
                    <span style="white-space: pre-wrap;">This Report is not intended to be used for the purposes of VCAT, or similar civil arenas, and You agree that We reserve the right to decline the invitation to present this report as evidence in any civil matter.</span>
                  </li>
                  <li value="20">
                    <span style="white-space: pre-wrap;">If you do not agree to be bound by these terms and conditions, then you must contact us prior to us providing you our service to advise us that you do not want to make a contract with us, and do not want us to provide our service to you.</span>
                  </li>
                </ol>',
      'order' => $builderResponsibility['id'],
      'page_break' => true,
      'is_template' => true
    ]);

    $terms->save();

    $logoimg = Storage::get('logo.jpg');
    $logo = 'data:image/jpeg;base64,' . base64_encode($logoimg);

    $company = new Company([
      'name' => "Correct Inspections",
      'logo' => $logo,
      'email' => 'admin@correctinspections.com.au',
      'phone' => '(03)94341120',
      'website' => 'www.correctinspections.com.au',
      'address_line1' => 'P.O. Box 22',
      'address_line2' => 'Greensborough VIC 3088',
      'city' => 'Greensborough',
      'country' => 'Australia',
      'reports_email' => 'reports@correctinspections.com.au'
    ]);

    $company->save();
  }
}
