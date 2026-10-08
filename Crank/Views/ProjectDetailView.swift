import SwiftUI
import SwiftData
import UIKit

struct ProjectDetailView: View {
    @Bindable var project: Project
    @Environment(\.modelContext) private var modelContext
    @State private var noteToEdit: Note?

    var body: some View {
        List {
            if project.activeNotes.isEmpty {
                ContentUnavailableView(
                    "Nothing Active",
                    systemImage: "checkmark.circle",
                    description: Text("Tap + to add a note.")
                )
                .listRowSeparator(.hidden)
            } else {
                ForEach(project.activeNotes) { note in
                    NoteRowView(note: note, onToggle: { toggleComplete(note) })
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
                            .tint(Color.coral)
                        }
                }
            }
        }
        .navigationTitle(project.name.isEmpty ? "Untitled Project" : project.name)
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItemGroup(placement: .topBarTrailing) {
                NavigationLink {
                    ArchiveView(project: project)
                } label: {
                    Label("Archive", systemImage: "archivebox")
                }
                Button(action: createNote) {
                    Label("New Note", systemImage: "plus")
                }
            }
        }
        .sheet(item: $noteToEdit, onDismiss: pruneEmptyNotes) { note in
            NoteDetailView(note: note)
        }
    }

    private func toggleComplete(_ note: Note) {
        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
            note.toggleComplete()
        }
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    private func createNote() {
        let note = Note()
        note.project = project
        modelContext.insert(note)
        project.notes.append(note)
        noteToEdit = note
    }

    private func pruneEmptyNotes() {
        for note in project.notes where note.isEmpty && !note.isArchived {
            modelContext.delete(note)
        }
    }
}
