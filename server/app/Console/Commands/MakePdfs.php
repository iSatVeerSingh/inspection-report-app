<?php

namespace App\Console\Commands;

use App\Models\InspectionItem;
use App\Models\LibraryItem;
use Codedge\Fpdf\Fpdf\Fpdf;
use Illuminate\Console\Command;

class MakePdfs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:make-pdf';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $insitem = InspectionItem::where("job_id", "05fa40c1-b676-499c-8e89-206317b61e7b")->first();
        $libItem = LibraryItem::find($insitem['library_item_id']);
        $closingParagraphs = json_decode($libItem['closingParagraph']);
        
        foreach($closingParagraphs as $para) {
            dump($para->text);
        }
    }
}
