import Foundation
import SwiftData

@Model
final class Project {
    var name: String
    var createdAt: Date

    @Relationship(deleteRule: .cascade, inverse: \Note.project)
    var notes: [Note] = []

    init(name: String = "") {
        self.name = name
        self.createdAt = .now
    }

    var activeNotes: [Note] {
        notes
            .filter { !$0.isArchived }
            .sorted { lhs, rhs in
                if lhs.isPinned != rhs.isPinned { return lhs.isPinned }
                return lhs.createdAt > rhs.createdAt
            }
    }

    var archivedNotes: [Note] {
        notes
            .filter(\.isArchived)
            .sorted { ($0.completedAt ?? $0.createdAt) > ($1.completedAt ?? $1.createdAt) }
    }
}
