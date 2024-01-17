<?php

namespace Database\Seeders;

use App\Models\InspectionNote;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class NoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $allNotes = Storage::json('librarynotes.json');

        foreach ($allNotes as $key => $note) {
            $libNote = new InspectionNote([
                'text' => $note,
            ]);
            $libNote->save();
        }
    }
}
