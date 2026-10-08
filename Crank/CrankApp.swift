import SwiftUI
import SwiftData

@main
struct CrankApp: App {
    @State private var isUnlocked = false

    var sharedModelContainer: ModelContainer = {
        let schema = Schema([Note.self, ChecklistItem.self, NoteImage.self])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            Group {
                if isUnlocked {
                    NoteListView()
                        .transition(.opacity.combined(with: .scale(scale: 1.02)))
                } else {
                    LockScreenView {
                        withAnimation(.easeOut(duration: 0.35)) {
                            isUnlocked = true
                        }
                    }
                    .transition(.opacity)
                }
            }
        }
        .modelContainer(sharedModelContainer)
    }
}
