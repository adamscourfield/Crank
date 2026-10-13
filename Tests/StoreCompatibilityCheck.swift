import Foundation
import SwiftData
import AVFoundation
import CryptoKit

/// Run only against a disposable copy of an app store, never the phone backup.
@main
struct StoreCompatibilityCheck {
    @MainActor
    static func main() throws {
        let url = URL(fileURLWithPath: CommandLine.arguments[1])
        let schema = Schema([Project.self, Note.self, NoteImage.self, NoteDocument.self])
        let container = try ModelContainer(for: schema, configurations: [ModelConfiguration(schema: schema, url: url)])
        let context = ModelContext(container)
        func digest(_ data: Data) -> String { SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined() }
        func fingerprint(_ context: ModelContext) throws -> String {
            let notes = try context.fetch(FetchDescriptor<Note>()).map { note in
                [note.title, note.body, String(note.isDone), String(note.isArchived), String(note.isPinned), String(note.createdAt.timeIntervalSince1970), note.completedAt.map { String($0.timeIntervalSince1970) } ?? "", note.project?.name ?? "", note.images.map { "\($0.sortOrder):\(digest($0.data))" }.sorted().joined(separator: ","), note.documents.map { "\($0.fileName):\($0.fileExtension):\($0.sortOrder):\(digest($0.data))" }.sorted().joined(separator: ",")].joined(separator: "|")
            }.sorted()
            let projects = try context.fetch(FetchDescriptor<Project>()).map { "\($0.name)|\($0.icon)|\($0.createdAt.timeIntervalSince1970)|\($0.notes.count)" }.sorted()
            return digest(Data((projects + notes).joined(separator: "\n").utf8))
        }
        let original = try fingerprint(context)
        print("Existing store fingerprint: \(original)")
        print("Projects: \(try context.fetchCount(FetchDescriptor<Project>())) · Notes: \(try context.fetchCount(FetchDescriptor<Note>())) · Photos: \(try context.fetchCount(FetchDescriptor<NoteImage>()))")
        let originalDocumentCount = try context.fetchCount(FetchDescriptor<NoteDocument>())
        if CommandLine.arguments.count > 2 {
            let bytes = try Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[2]))
            let project = Project(name: "Audio compatibility test")
            let note = Note(title: "")
            let document = NoteDocument(data: bytes, fileName: "Test recording", fileExtension: "m4a")
            context.insert(project)
            context.insert(note)
            note.project = project
            context.insert(document)
            document.note = note
            try context.save()
            precondition(!note.isEmpty, "Audio-only notes must not be pruned")
            precondition(note.sortedAudio.count == 1 && note.sortedDocuments.isEmpty)
            let verification = ModelContext(container)
            let saved = try verification.fetch(FetchDescriptor<NoteDocument>()).first { $0.fileName == "Test recording" }!
            precondition(saved.data == bytes)
            let duration = try AVAudioPlayer(data: saved.data).duration
            precondition(duration > 0)
            saved.fileName = "Renamed recording"
            try verification.save()
            let renamed = try ModelContext(container).fetch(FetchDescriptor<NoteDocument>()).contains { $0.fileName == "Renamed recording" }
            precondition(renamed)
            note.toggleComplete()
            try context.save()
            precondition(note.isArchived && note.documents.count == 1)
            note.toggleComplete()
            try context.save()
            precondition(!note.isArchived && note.documents.count == 1)
            context.delete(project)
            try context.save()
            let finalContext = ModelContext(container)
            let remaining = try finalContext.fetchCount(FetchDescriptor<NoteDocument>())
            precondition(remaining == originalDocumentCount, "Cascade must remove only the test audio")
            let finalFingerprint = try fingerprint(finalContext)
            precondition(finalFingerprint == original, "Existing notes and attachment bytes must remain unchanged")
            print("PASS: Audio persistence, playable bytes, rename, audio-only retention, archive/restore, cascade deletion; existing data unchanged.")
        }
    }
}
