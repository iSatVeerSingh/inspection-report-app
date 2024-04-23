<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Models\Job;
use App\Models\JobCategory;
use App\Models\User;
use DateTime;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SyncJobs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-jobs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync jobs data from servicem8 api';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $servicem8Url = env('SERVICEM8_BASEURL');
        $username = env('SERVICEM8_EMAIL');
        $password = env('SERVICEM8_PASSWORD');

        $time = new DateTime("-11 minutes");
        $lastUpdated = $time->format('Y-m-d H:i:00');

        // Get all jobs which are updated after the specific time

        $response = Http::withBasicAuth($username, $password)
            ->get($servicem8Url . "/job.json?%24filter=edit_date%20gt%20'" . $lastUpdated . "'");

        if ($response->status() !== 200) {
            return;
        }

        $totalJobs = $response->json();


        $allJobs = array_filter($totalJobs, function ($job) {
            return $job['status'] === "Work Order" || $job['status'] === "Completed";
        });

        foreach ($allJobs as $serviceJob) {
            // check if job exists in database
            $job = Job::find($serviceJob['uuid']);
            if ($job) {
                if ($job['status'] === "Completed") {
                    continue;
                }
                // check if servicem8 job is deleted or not
                if ($serviceJob['active'] === 0) {
                    $job->delete();
                } else {
                    // if service m8 job is not deleted
                    // get all activities for the job
                    $acitvityResponse = Http::withBasicAuth($username, $password)
                        ->get($servicem8Url . "/jobactivity.json?%24filter=job_uuid%20eq%20'" . $serviceJob['uuid'] . "'");
                    if ($acitvityResponse->status() !== 200) {
                        continue;
                    }

                    $allAcitvities = $acitvityResponse->json();

                    // filter scheduled activity
                    $activities = [];
                    foreach ($allAcitvities as $activity) {
                        if ($activity['active'] === 1 && $activity['activity_was_scheduled'] === 1) {
                            array_push($activities, $activity);
                            break;
                        }
                    };

                    // if activity was scheduled update in the database

                    if (count($activities) !== 0) {
                        $inspector = User::find($activities[0]['staff_uuid']);
                        if ($inspector) {
                            $job['inspector_id'] = $inspector['id'];
                        }

                        $job['starts_at'] = new DateTime($activities[0]["start_date"]);
                    }
                    if ($serviceJob['status'] === "Completed") {
                        $job['status'] = "Completed";
                        $job['completed_at'] = new DateTime($serviceJob['completion_date']);
                    }
                    $job->save();
                }
            } elseif ($serviceJob['active'] === 1) {

                $job = new Job();
                $job['id'] = $serviceJob['uuid'];
                $job['job_number'] = $serviceJob['generated_job_id'];
                if ($serviceJob['category_uuid'] !== "") {
                    $jobCategory = JobCategory::where('id', $serviceJob['category_uuid'])->first();
                    $job['category_id'] = $jobCategory['id'];
                }
                $job['site_address'] = $serviceJob['job_address'];
                $job['status'] = "Not Started";
                $job['description'] = $serviceJob['job_description'];

                if (!Customer::where('id', $serviceJob['company_uuid'])->exists()) {

                    // Get Customer or company contacts
                    $contactsResponse = Http::withBasicAuth($username, $password)
                        ->get($servicem8Url . "/companycontact.json?%24filter=company_uuid%20eq%20'" . $serviceJob['company_uuid'] . "'");

                    if ($contactsResponse->status() !== 200) {
                        continue;
                    }

                    $contacts = $contactsResponse->json();

                    $customerData = new Customer();
                    $customerData['id'] = $serviceJob['company_uuid'];

                    foreach ($contacts as $contact) {
                        if (str_contains(strtolower($contact['type']), "report")) {
                            $customerData['name_on_report'] = trim($contact['first'] . " " . $contact['last']);
                        }

                        if (preg_match("/b[iy]l[lie]ing/", strtolower($contact['type'])) > 0) {
                            $customerData['name'] = trim($contact['first'] . " " . $contact['last']);
                            $customerData['email'] = strtolower($contact['email']);
                            $customerData['phone'] = $contact['mobile'];
                        }

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
                    }

                    $customerData['billing_address'] = $serviceJob['billing_address'];

                    $customerData->save();

                    $job['customer_id'] = $customerData['id'];
                } else {
                    $customerData = Customer::find($serviceJob['company_uuid']);
                    $job['customer_id'] = $customerData['id'];
                }

                $acitvityResponse = Http::withBasicAuth($username, $password)
                    ->get($servicem8Url . "/jobactivity.json?%24filter=job_uuid%20eq%20'" . $serviceJob['uuid'] . "'");

                if ($acitvityResponse->status() !== 200) {
                    continue;
                }

                $allAcitvities = $acitvityResponse->json();

                $activities = [];
                foreach ($allAcitvities as $activity) {
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
}
