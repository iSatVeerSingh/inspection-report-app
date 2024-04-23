<?php

namespace App\Http\Controllers;

use App\Http\Resources\InspectorRecommendationResource;
use App\Http\Resources\RecommendationCollection;
use App\Models\Recommendation;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RecommendationController extends Controller
{
    public function index(Request $request)
    {
        $recommendations = Recommendation::query();

        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');
            $recommendations->where('text', 'like', '%' . $keyword . '%');
        }

        return new RecommendationCollection($recommendations->orderBy('updated_at', 'desc')->simplePaginate());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required',
        ]);

        $existingRecommendation = Recommendation::withTrashed()->where('text', $validated['text'])->first();
        if ($existingRecommendation) {
            if ($existingRecommendation->trashed()) {
                $existingRecommendation->forceDelete();
            } else {
                return response()->json(['message' => "Recommendation already exists"], Response::HTTP_BAD_REQUEST);
            }
        }

        $note = new Recommendation($validated);
        $note->save();
        return response()->json(['message' => 'Recommendation created successfully'], Response::HTTP_CREATED);
    }

    public function update(Request $request, Recommendation $recommendation)
    {
        $validated = $request->validate([
            'text' => 'required',
        ]);

        $existingRecommendation = Recommendation::withTrashed()->where('text', $validated['text'])->first();
        if ($existingRecommendation) {
            if ($existingRecommendation->trashed()) {
                $existingRecommendation->forceDelete();
            } else {
                return response()->json(['message' => "Recommendation already exists"], Response::HTTP_BAD_REQUEST);
            }
        }

        $recommendation->update($validated);
        return response()->json(['message' => 'Recommendation updated successfully']);
    }

    public function destroy(Request $request, Recommendation $recommendation)
    {
        $recommendation->delete();
        return response()->json(["message" => "Recommendation deleted successfully"]);
    }

    public function install(Request $request)
    {
        $recommendations = Recommendation::all();
        $recommendationsCollection = InspectorRecommendationResource::collection($recommendations);
        $content = $recommendationsCollection->toJson();
        $contentLength = strlen($content);
        return response($content, 200, ['Content-Length' => $contentLength, "Content-Type" => "application/json,UTF-8"]);
    }
}
