import SwiftUI
import SwiftData

struct HomeView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Project.createdAt, order: .reverse)
    private var projects: [Project]
    @Query(filter: #Predicate<Note> { $0.isPinned && !$0.isArchived }, sort: \Note.createdAt, order: .reverse)
    private var pinnedNotes: [Note]

    @State private var showingNewProjectAlert = false
    @State private var newProjectName = ""

    var body: some View {
        NavigationStack {
            List {
                if !pinnedNotes.isEmpty {
                    Section("Pinned") {
                        ForEach(pinnedNotes) { note in
                            NavigationLink(value: note) {
                                PinnedNoteRow(note: note)
                            }
                        }
                    }
                }

                Section("Projects") {
                    ForEach(projects) { project in
                        NavigationLink(value: project) {
                            ProjectRowView(project: project)
                        }
                    }
                    .onDelete(perform: deleteProjects)
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("CRANK")
            .navigationDestination(for: Project.self) { project in
                ProjectDetailView(project: project)
            }
            .navigationDestination(for: Note.self) { note in
                NoteDetailView(note: note)
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingNewProjectAlert = true
                    } label: {
                        Label("New Project", systemImage: "plus")
                    }
                }
            }
            .overlay {
                if projects.isEmpty && pinnedNotes.isEmpty {
                    ContentUnavailableView(
                        "No Projects Yet",
                        systemImage: "folder",
                        description: Text("Tap + to create your first project.")
                    )
                }
            }
            .alert("New Project", isPresented: $showingNewProjectAlert) {
                TextField("Project name", text: $newProjectName)
                Button("Cancel", role: .cancel) { newProjectName = "" }
                Button("Create", action: createProject)
            }
        }
    }

    private func createProject() {
        let trimmed = newProjectName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        let project = Project(name: trimmed)
        modelContext.insert(project)
        newProjectName = ""
    }

    private func deleteProjects(at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(projects[index])
        }
    }
}
