import Foundation
import SwiftData

@Model
final class ChecklistItem {
    var text: String
    var isDone: Bool
    var sortOrder: Int
    var note: Note?

    init(text: String = "", isDone: Bool = false, sortOrder: Int = 0) {
        self.text = text
        self.isDone = isDone
        self.sortOrder = sortOrder
    }
}
