<?php

namespace Database\Seeders;

use App\Models\Recommendation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RecommendationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $recommendations = [
            "No outstanding defects, nothing further to do at this stage.",
            "Several defects identified, owner should meet with builder on site to confirm once completed.",
            "Numerous defects identified, reinspection recommended.",
            "Major defects identified, strongly recommend a reinspection."
        ];

        foreach ($recommendations as $key => $recom) {
            $recommendation = new Recommendation([
                'text' => $recom
            ]);
            $recommendation->save();
        }
    }
}
