<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $allitems = Storage::json('libraryitems.json');

        $allCategories = array_map(function ($item) {
            return $item['category'];
        }, $allitems);

        $uniqueCategories = array_unique($allCategories);

        foreach ($uniqueCategories as $category) {
            $itemCategory = new ItemCategory([
                "name" => trim($category)
            ]);

            $itemCategory->save();
        }

        foreach ($allitems as $item) {
            if (!Item::where('name', $item['name'])->exists()) {
                $category = ItemCategory::where('name', $item['category'])->first();

                $newitem = new Item([
                    'name' => $item['name'],
                    'category_id' => $category['id'],
                    'opening_paragraph' => $item['opening_paragraph'],
                    'closing_paragraph' => $item['closing_paragraph'],
                    'embedded_images' => $item['embedded_images'],
                    'summary' => $item['summary'],
                    'height' => $item['height']
                ]);
                $newitem->save();
            }
        }

        $notes = [
            "The concreter was on site preparing for the slab pour.",
            "The plumber was on site.",
            "The electrician was on site.",
            "The heating & cooling contractor was on site.",
            "The wall sarking had been installed.",
            "The carpenter was on site.",
            "The bricklayer was on site.",
            "The fascia & gutter was being installed.",
            "The roofing contractor was on site.",
            "The lower roof areas had not yet been completed.",
            "There are window and door frames that had not yet been installed.",
            "There was a perimeter walkway scaffold installed, which will require the walls be re-checked for plumb at a future inspection.",
            "There were temporary braces fitted to the walls, which will require the walls be re-checked for plumb at a future inspection.",
            "The wall insulation batts had not yet been installed. Therefore, it is our recommendation that the customer arrange for us to do another inspection (a reinspection) to confirm successful completion of the defects/items documented within this report before plasterboard installation, and to properly check ",
            "The electrical rough in had not been completed.",
            "The plumbing rough in had not been completed.",
            "The heating/cooling rough in had not been completed.",
            "There was a scaffold installed, which will require the brickwork/cladding be properly checked at a future inspection.",
            "The brickwork had not yet been cleaned, which will require it be properly checked at a future inspection.",
            "The painting contractor was on site.",
            "The waterproofing was underway.",
            "The balconies had not yet been waterproofed.",
            "There were several minor defects and paint touch ups visible throughout that have been marked for rectification, which have not been individually documented in this report, as they have already been identified.",
            "The final house clean had not yet been completed.",
            "The owner should mark all minor defects and paint touch ups with the builder/site supervisor to ensure all of these issues are addressed to their satisfaction.",
            "There were several minor plaster defects marked for rectification (pre-paint/patch and sand) that have not been individually documented in this report, as the builder has already identified them, and they will be easy to check at the Handover inspection.",
            "The builder/site supervisor was on site during this inspection.",
            "The plasterboard had been painted, making it impossible to properly check that the plasterboard installation complies with Australian Standards and the manufacturer’s installation instructions.",
            "This reinspection report is confirmation of the status of the items from the previous inspection report, with any items that are either not completed, or not completed in all areas remaining as a defect/issue that needs to be rectified by the builder.",
            "There are walls and/or beams that are being temporarily propped until the future brickwork that support them can be installed.",
            "The frame carpenter was on site completing the frame. There are items they were working on that have not been included in this report, as the works were still underway.",
            "The wet area floor and wall tiling is covering the waterproofing, making it impossible to fully inspect and confirm that there are no defects.",
            "Due to the excessive number of defects at this inspection, and the severity of some of them, we strongly recommend that the owners engage us to do a reinspection to confirm that all items are properly rectified prior to works proceeding any further and covering up defective items.",
        ];

        foreach ($notes as $note) {
            $newNote = new Note([
                "text" => $note
            ]);
            $newNote->save();
        }
    }
}
