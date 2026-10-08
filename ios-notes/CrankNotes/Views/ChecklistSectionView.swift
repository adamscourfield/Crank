import SwiftUI
import SwiftData

struct ChecklistSectionView: View {
    @Bindable var note: Note
    @Environment(\.modelContext) private var modelContext
    @State private var newItemText = ""

    private var sortedItems: [ChecklistItem] {
        note.checklistItems.sorted { $0.sortOrder < $1.sortOrder }
    }

    var body: some View {
        ForEach(sortedItems) { item in
            ChecklistRow(item: item)
        }
        .onDelete(perform: deleteItems)

        HStack {
            Image(systemName: "plus.circle.fill")
                .foregroundStyle(.secondary)
            TextField("Add checklist item", text: $newItemText)
                .onSubmit(addItem)
            if !newItemText.isEmpty {
                Button("Add", action: addItem)
                    .font(.caption)
            }
        }
    }

    private func addItem() {
        let trimmed = newItemText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        let nextOrder = (note.checklistItems.map(\.sortOrder).max() ?? -1) + 1
        let item = ChecklistItem(text: trimmed, sortOrder: nextOrder)
        item.note = note
        modelContext.insert(item)
        note.checklistItems.append(item)
        newItemText = ""
    }

    private func deleteItems(at offsets: IndexSet) {
        let items = sortedItems
        for index in offsets {
            let item = items[index]
            note.checklistItems.removeAll { $0.persistentModelID == item.persistentModelID }
            modelContext.delete(item)
        }
    }
}

private struct ChecklistRow: View {
    @Bindable var item: ChecklistItem

    var body: some View {
        HStack {
            Button {
                item.isDone.toggle()
            } label: {
                Image(systemName: item.isDone ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(item.isDone ? .green : .secondary)
            }
            .buttonStyle(.plain)

            TextField("Item", text: $item.text)
                .strikethrough(item.isDone)
                .foregroundStyle(item.isDone ? .secondary : .primary)
        }
    }
}
