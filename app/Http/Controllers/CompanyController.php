<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    public function index()
    {
        return Company::first();
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'sometimes',
            'logo' => 'sometimes',
            'email' => 'sometimes',
            'phone' => 'sometimes',
            'website' => 'sometimes',
            'address_line1' => 'sometimes',
            'address_line2' => 'sometimes',
            'city' => 'sometimes',
            'country' => 'sometimes',
            'reports_email' => 'sometimes',
            'sender_email' => 'sometimes',
            'manager_email' => 'sometimes',
        ]);


        if (array_key_exists('logo', $validated)) {
            if (Storage::exists('titlelogo.jpg')) {
                Storage::delete('titlelogo.jpg');
            }

            if (Storage::exists('mainlogo.jpg')) {
                Storage::delete('mainlogo.jpg');
            }


            $base64 = explode(',', $validated['logo'])[1];
            $imgData = base64_decode($base64);
            Storage::put('titlelogo.jpg', $imgData);
            $imgsource = imagecreatefromstring($imgData);
            $originalWidth = imagesx($imgsource);
            $originalHeight = imagesy($imgsource);

            $newHeight = 100;
            $scaleSize = $newHeight / $originalHeight;
            $newWidth = $originalWidth * $scaleSize;
            $newImageSource = imagecreatetruecolor($newWidth, $newHeight);
            imagecopyresampled($newImageSource, $imgsource, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);
            ob_start();
            imagejpeg($newImageSource);
            $newimageData = ob_get_clean();
            Storage::put('mainlogo.jpg', $newimageData);
            $resizedDataUri = 'data:image/jpeg;base64,' . base64_encode($newimageData);
            imagedestroy($imgsource);
            imagedestroy($newImageSource);

            $validated['logo'] = $resizedDataUri;
        }


        $company = Company::first();
        $company->update($validated);

        return response()->json(['message' => 'Company data updated successfully']);
    }
}
