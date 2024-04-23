<?php

namespace App\Http\Controllers;

use App\Http\Resources\FullItemResource;
use App\Http\Resources\InspectorItemCategoryResource;
use App\Http\Resources\InspectorItemResource;
use App\Http\Resources\InspectorNoteResource;
use App\Http\Resources\InspectorRecommendationResource;
use App\Http\Resources\ItemCollection;
use App\Mail\SuggestItem;
use App\Models\Company;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\Note;
use App\Models\Recommendation;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $items = Item::query();

        if ($request->has('category_id')) {
            $items->where('category_id', $request->category_id);
        }
        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');
            $items->where('name', 'like', '%' . $keyword . '%');
        }

        return new ItemCollection($items->orderBy('updated_at', 'desc')->simplePaginate());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => "required",
            'category_id' => 'required|exists:item_categories,id',
            'opening_paragraph' => 'required',
            'closing_paragraph' => 'required',
            'embedded_images' => 'sometimes',
            'summary' => 'required',
            'height' => 'required'
        ]);

        $existingItem = Item::withTrashed()->where('name', $validated['name'])->first();
        if ($existingItem) {
            if ($existingItem->trashed()) {
                $existingItem->forceDelete();
            } else {
                return response()->json(['message' => "Item already exists with this name"], Response::HTTP_BAD_REQUEST);
            }
        }

        $item = new Item($validated);
        $item->save();
        return response()->json(['message' => 'Item created successfully'], Response::HTTP_CREATED);
    }

    public function show(Item $item)
    {
        return new FullItemResource($item);
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'name' => "sometimes",
            'category_id' => 'sometimes|exists:item_categories,id',
            'opening_paragraph' => 'sometimes',
            'closing_paragraph' => 'sometimes',
            'embedded_images' => 'sometimes',
            'summary' => 'sometimes',
            'height' => 'sometimes'
        ]);

        if (array_key_exists('name', $validated)) {
            $existingItem = Item::withTrashed()->where('name', $validated['name'])->first();
            if ($existingItem) {
                if ($existingItem->trashed()) {
                    $existingItem->forceDelete();
                } else {
                    return response()->json(['message' => "Item already exists with this name"], Response::HTTP_BAD_REQUEST);
                }
            }
        }

        $item->update($validated);
        return response()->json(['message' => 'Item updated successfully']);
    }

    public function destroy(Item $item)
    {
        $item->delete();
        return response()->json(['message' => 'Item deleted successfully']);
    }

    public function install()
    {
        $items = Item::all();

        $itemCollection = InspectorItemResource::collection($items);
        $content = $itemCollection->toJson();
        $contentLength = strlen($content);
        return response($content, 200, ['Content-Length' => $contentLength, "Content-Type" => "application/json,UTF-8"]);
    }

    public function syncLibrary(Request $request)
    {
        if (!$request->has('lastSync')) {
            return response()->json(['message' => 'Invalid request'], 400);
        }
        $lastSync = $request->lastSync;
        $date = new DateTime($lastSync);
        $items = Item::withTrashed()->where('updated_at', '>=', $date)->get();
        $libraryItems = InspectorItemResource::collection($items);

        $itemCategories = ItemCategory::withTrashed()->where('updated_at', '>=', $date)->get();
        $categories = InspectorItemCategoryResource::collection($itemCategories);
        $notes = Note::withTrashed()->where('updated_at', '>=', $date)->get();
        $notesCollection = InspectorNoteResource::collection($notes);

        $recommendations = Recommendation::withTrashed()->where('updated_at', '>=', $date)->get();
        return [
            'items' => $libraryItems,
            'categories' => $categories,
            'notes' => $notesCollection,
            'recommendations' => InspectorRecommendationResource::collection($recommendations),
        ];
    }

    public function suggestItem(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required',
            'name' => 'required',
            'opening_paragraph' => 'required',
            'closing_paragraph' => 'required',
            'embedded_image' => 'sometimes'
        ]);

        $user = Auth::user();
        $company = Company::first();

        $email = "";

        if ($company['manager_email']) {
            $email = $company['manager_email'];
        } else {
            $email = $company['email'];
        }

        $sentMail = Mail::to($email)->send(new SuggestItem($validated, $user['first'] . " " . $user['last']));

        if (!$sentMail) {
            return response()->json(['message' => "Couldn't send suggestion. Something went wrong"], Response::HTTP_BAD_REQUEST);
        }

        return response()->json(['message' => 'Suggestion sent successfully']);
    }
}
