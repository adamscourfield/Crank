import SwiftUI
import SwiftData

struct NoteListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: [
        SortDescriptor(\Note.isPinned, order: .reverse),
        SortDescriptor(\Note.updatedAt, order: .reverse)
    ])
    private var notes: [Note]

    @State private var searchText = ""
    @State private var noteToEdit: Note?

    private var filteredNotes: [Note] {
        guard !searchText.isEmpty else { return notes }
        return notes.filter {
            $0.title.localizedCaseInsensitiveContains(searchText) ||
            $0.body.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            List {
                ForEach(filteredNotes) { note in
                    NoteRowView(note: note)
                        .contentShape(Rectangle())
                        .onTapGesture { noteToEdit = note }
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) {
                                modelContext.delete(note)
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                            Button {
                                note.isPinned.toggle()
                            } label: {
                                Label(note.isPinned ? "Unpin" : "Pin", systemImage: note.isPinned ? "pin.slash" : "pin")
                            }
                            .tint(.orange)
                        }
                }
            }
            .searchable(text: $searchText, prompt: "Search notes")
            .navigationTitle("Notes")
            .overlay {
                if filteredNotes.isEmpty {
                    ContentUnavailableView(
                        "No Notes",
                        systemImage: "note.text",
                        description: Text(searchText.isEmpty ? "Tap + to create your first note." : "No results for \"\(searchText)\".")
                    )
                }
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        createNote()
                    } label: {
                        Label("New Note", systemImage: "square.and.pencil")
                    }
                }
            }
            .sheet(item: $noteToEdit, onDismiss: pruneEmptyNotes) { note in
                NoteDetailView(note: note)
            }
        }
    }

    private func createNote() {
        let note = Note()
        modelContext.insert(note)
        noteToEdit = note
    }

    private func pruneEmptyNotes() {
        for note in notes where note.isEmpty {
            modelContext.delete(note)
        }
    }
}
