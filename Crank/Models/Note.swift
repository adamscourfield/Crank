import Foundation
import SwiftData

@Model
final class Note {
    var title: String
    var body: String
    var createdAt: Date
    var updatedAt: Date
    var isPinned: Bool

    @Relationship(deleteRule: .cascade, inverse: \ChecklistItem.note)
    var checklistItems: [ChecklistItem] = []

    @Relationship(deleteRule: .cascade, inverse: \NoteImage.note)
    var images: [NoteImage] = []

    init(title: String = "", body: String = "", isPinned: Bool = false) {
        self.title = title
        self.body = body
        self.createdAt = .now
        self.updatedAt = .now
        self.isPinned = isPinned
    }

    var isEmpty: Bool {
        title.isEmpty && body.isEmpty && checklistItems.isEmpty && images.isEmpty
    }
}
