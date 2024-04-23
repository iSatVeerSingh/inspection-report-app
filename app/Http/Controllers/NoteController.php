<?php

namespace App\Http\Controllers;

use App\Http\Resources\InspectorNoteResource;
use App\Http\Resources\NoteCollection;
use App\Mail\SuggestNote;
use App\Models\Company;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $notes = Note::query();

        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');
            $notes->where('text', 'like', '%' . $keyword . '%');
        }

        return new NoteCollection($notes->orderBy('updated_at', 'desc')->simplePaginate());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required',
        ]);

        $existingNote = Note::withTrashed()->where('text', $validated['text'])->first();
        if ($existingNote) {
            if ($existingNote->trashed()) {
                $existingNote->forceDelete();
            } else {
                return response()->json(['message' => "Note already exists"], Response::HTTP_BAD_REQUEST);
            }
        }

        $note = new Note($validated);
        $note->save();
        return response()->json(['message' => 'Note created successfully'], Response::HTTP_CREATED);
    }

    public function update(Request $request, Note $note)
    {
        $validated = $request->validate([
            'text' => 'required',
        ]);

        $existingNote = Note::withTrashed()->where('text', $validated['text'])->first();
        if ($existingNote) {
            if ($existingNote->trashed()) {
                $existingNote->forceDelete();
            } else {
                return response()->json(['message' => "Note already exists"], Response::HTTP_BAD_REQUEST);
            }
        }

        $note->update($validated);
        return response()->json(['message' => 'Note updated successfully']);
    }

    public function destroy(Request $request, Note $note)
    {
        $note->delete();
        return response()->json(["message" => "Note deleted successfully"]);
    }

    public function install(Request $request)
    {
        $notes = Note::all();
        $noteCollection = InspectorNoteResource::collection($notes);
        $content = $noteCollection->toJson();
        $contentLength = strlen($content);
        return response($content, 200, ['Content-Length' => $contentLength, "Content-Type" => "application/json,UTF-8"]);
    }

    public function suggestNote(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required',
        ]);

        $user = Auth::user();

        $company = Company::first();

        $email = "";

        if ($company['manager_email']) {
            $email = $company['manager_email'];
        } else {
            $email = $company['email'];
        }

        $sentMail = Mail::to($email)->send(new SuggestNote($validated['text'], $user['first'] . " " . $user['last']));

        if (!$sentMail) {
            return response()->json(['message' =>  "Couldn't send suggestion. Something went wrong"], Response::HTTP_BAD_REQUEST);
        }

        return response()->json(['message' => 'Suggestion sent successfully']);
    }
}
