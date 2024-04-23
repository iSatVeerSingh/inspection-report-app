<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Job;
use App\Models\JobCategory;
use App\Models\User;
use DateTime;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;

class JobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $servicem8Url = env('SERVICEM8_BASEURL');
        $username = env('SERVICEM8_EMAIL');
        $password = env('SERVICEM8_PASSWORD');

        $jobCategories = [
            'Post-Slab Inspection' => ['POST-SLAB', 'After the concrete slab has been poured.'],
            'Handover Inspection' => ['HANDOVER', 'Approaching completion.'],
            'Maintenance Inspection' => ['MAINTENANCE & WARRANTY', 'Maintenance/Warranty stage, after settlement.'],
            'Pre-Plaster Inspection' => ['PRE-PLASTER', 'Approaching lock-up stage.'],
            'Waterproofing Inspection' => ['WATERPROOFING', 'Approaching fixing stage.'],
            'Fixing Inspection' => ['FIXING', 'Approaching fixing stage.'],
            'Lock-up Inspection' => ['LOCK-UP', 'Approaching lock-up stage.'],
            'Reinspection' => ['REINSPECTION', 'Reinspection'],
            'Frame Inspection' => ['FRAME', 'Approaching frame stage.'],
            'Point In Time Inspection' => ['POINT IN TIME', 'A point in time not necessarily aligning with a building contract stage.'],
            'Pre-Slab Inspection' => ['PRE-SLAB', 'Prior to the concrete slab pour.']
        ];

        // Categories for jobs
        $response = Http::withBasicAuth($username, $password)
            ->get($servicem8Url . "/category.json?%24filter=active%20eq%20'1'");

        if ($response->status() !== 200) {
            dump($response->json());
            return;
        }

        $categories = $response->json();

        if (!$categories) {
            dump('Couldn\'t get the categories from servicem8 api');
            return;
        }

        foreach ($categories as $category) {
            $jobCategory = new JobCategory([
                'id' => $category['uuid'],
                'name' => $category['name'],
                'type' => $jobCategories[$category['name']][0],
                'stage_of_works' => $jobCategories[$category['name']][1]
            ]);

            $jobCategory->save();
        }

        // Get Customer or company contacts
        $companies = Http::withBasicAuth($username, $password)
            ->get($servicem8Url . "/companycontact.json?%24filter=active%20eq%20'1'")
            ->json();


        // Get All Jobs of work order
        $jobsResponse = Http::withBasicAuth($username, $password)
            ->get($servicem8Url . "/job.json?%24filter=status%20eq%20'Work Order'")
            ->json();

        $allJobs = array_filter($jobsResponse, function ($job) {
            return $job['active'] === 1;
        });

        foreach ($allJobs as $serviceJob) {
            $job = new Job();
            $job['id'] = $serviceJob['uuid'];
            $job['job_number'] = $serviceJob['generated_job_id'];
            if ($serviceJob['category_uuid'] !== "") {
                $jobCategory = JobCategory::find($serviceJob['category_uuid']);
                $job['category_id'] = $jobCategory['id'];
            }
            $job['site_address'] = $serviceJob['job_address'];
            $job['status'] = "Not Started";
            $job['description'] = $serviceJob['job_description'];

            $companyUuid = $serviceJob['company_uuid'];
            if (!Customer::where('id', $companyUuid)->exists()) {

                $contacts = array_filter($companies, function ($company) use ($companyUuid) {
                    return $company['company_uuid'] === $companyUuid;
                });

                $customerData = new Customer();
                $customerData['id'] = $companyUuid;

                foreach ($contacts as $contact) {
                    if (str_contains(strtolower($contact['type']), "report")) {
                        $customerData['name_on_report'] = trim($contact['first'] . " " . $contact['last']);
                    }

                    if (preg_match("/b[iy]l[lie]ing/", strtolower($contact['type'])) > 0) {
                        $customerData['name'] = trim($contact['first'] . " " . $contact['last']);
                        $customerData['email'] = strtolower($contact['email']);
                        $customerData['phone'] = $contact['mobile'];
                    }

                    // if (str_contains(strtolower($contact['type']), "billing")) {
                    //     $customerData['name'] = trim($contact['first'] . " " . $contact['last']);
                    //     $customerData['email'] = strtolower($contact['email']);
                    //     $customerData['phone'] = $contact['mobile'];
                    // }

                    if (preg_match("/b[uo]ild[eaiou]r/", strtolower($contact['type'])) > 0) {
                        $customerData['builder'] = trim($contact['first'] . " " . $contact['last']);
                        $customerData['builder_email'] = strtolower($contact['email']);
                        $customerData['builder_phone'] = $contact['mobile'];
                    }

                    if (preg_match("/s[uo]p[eaiou]r[uo]v[iy]s[eaiou]r/", strtolower($contact['type'])) > 0) {
                        $customerData['supervisor'] = trim($contact['first'] . " " . $contact['last']);
                        $customerData['supervisor_email'] = strtolower($contact['email']);
                        $customerData['supervisor_phone'] = $contact['mobile'];
                    }

                    // if (str_contains(strtolower($contact['type']), "builder")) {
                    //     $customerData['builder'] = trim($contact['first'] . " " . $contact['last']);
                    //     $customerData['builderEmail'] = strtolower($contact['email']);
                    //     $customerData['builderPhone'] = $contact['mobile'];
                    // }

                    // if (str_contains(strtolower($contact['type']), "supervisor")) {
                    //     $customerData['supervisor'] = trim($contact['first'] . " " . $contact['last']);
                    //     $customerData['supervisorEmail'] = strtolower($contact['email']);
                    //     $customerData['supervisorPhone'] = $contact['mobile'];
                    // }
                }

                $customerData['billing_address'] = $serviceJob['billing_address'];

                $customerData->save();

                $job['customer_id'] = $customerData['id'];
            } else {
                $customerData = Customer::find($companyUuid);
                $job['customer_id'] = $customerData['id'];
            }

            $acitvityResponse = Http::withBasicAuth($username, $password)
                ->get($servicem8Url . "/jobactivity.json?%24filter=job_uuid%20eq%20'" . $serviceJob['uuid'] . "'")
                ->json();

            $activities = [];
            foreach ($acitvityResponse as $activity) {
                if ($activity['active'] === 1 && $activity['activity_was_scheduled'] === 1) {
                    array_push($activities, $activity);
                    break;
                }
            };

            if (count($activities) !== 0) {
                $inspector = User::find($activities[0]['staff_uuid']);
                if ($inspector) {
                    $job['inspector_id'] = $inspector['id'];
                }
                $job['starts_at'] = new DateTime($activities[0]["start_date"]);
            }

            $job->save();
        }
    }
}
