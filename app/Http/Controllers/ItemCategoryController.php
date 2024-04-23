<?php

namespace App\Http\Controllers;

use App\Http\Resources\InspectorItemCategoryResource;
use App\Models\ItemCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ItemCategoryController extends Controller
{
    public function index(Request $request)
    {
        if ($request->has('nameonly') && $request->nameonly === "true") {
            return ItemCategory::select('id', 'name')->get();
        }
        $itemCategories = ItemCategory::withCount(['items as items'])
            ->orderBy('updated_at', 'desc')->get();
        return $itemCategories;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => "required|max:255"
        ]);

        $existingCategory = ItemCategory::withTrashed()->where('name', $validated['name'])->first();
        if ($existingCategory) {
            if ($existingCategory->trashed()) {
                $existingCategory->forceDelete();
            } else {
                return response()->json(['message' => "Item category already exists"], Response::HTTP_BAD_REQUEST);
            }
        }

        $category = new ItemCategory($validated);
        $category->save();
        return response()->json(['message' => 'Item category created successfully'], Response::HTTP_CREATED);
    }

    public function update(Request $request, ItemCategory $itemCategory)
    {
        $validated = $request->validate([
            'name' => "required|max:255"
        ]);

        $existingCategory = ItemCategory::withTrashed()->where('name', $validated['name'])->first();
        if ($existingCategory) {
            if ($existingCategory->trashed()) {
                $existingCategory->forceDelete();
            } else {
                return response()->json(['message' => "Item category already exists"], Response::HTTP_BAD_REQUEST);
            }
        }

        $itemCategory->update($validated);
        return response()->json(['message' => "Item category updated successfully"]);
    }

    public function destroy(ItemCategory $itemCategory)
    {
        $count = $itemCategory->items()->count();
        if ($count !== 0) {
            return response()->json(['message' => "Item category is not empty"], Response::HTTP_BAD_REQUEST);
        }

        $itemCategory->delete();
        return response()->json(['message' => "Item category deleted successfully"]);
    }

    public function install(Request $request)
    {
        $categories = ItemCategory::all();

        $categoriesCollection = InspectorItemCategoryResource::collection($categories);
        $content = $categoriesCollection->toJson();
        $contentLength = strlen($content);
        return response($content, 200, ['Content-Length' => $contentLength, "Content-Type" => "application/json,UTF-8"]);
    }
}
