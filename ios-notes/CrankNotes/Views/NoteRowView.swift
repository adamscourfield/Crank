import SwiftUI

struct NoteRowView: View {
    @Bindable var note: Note

    private var checklistSummary: String? {
        guard !note.checklistItems.isEmpty else { return nil }
        let done = note.checklistItems.filter(\.isDone).count
        return "\(done)/\(note.checklistItems.count) checked"
    }

    private var thumbnail: UIImage? {
        guard let first = note.images.sorted(by: { $0.sortOrder < $1.sortOrder }).first else { return nil }
        return UIImage(data: first.data)
    }

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            if let thumbnail {
                Image(uiImage: thumbnail)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 48, height: 48)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 4) {
                    if note.isPinned {
                        Image(systemName: "pin.fill")
                            .font(.caption2)
                            .foregroundStyle(.orange)
                    }
                    Text(note.title.isEmpty ? "Untitled" : note.title)
                        .font(.headline)
                        .lineLimit(1)
                }
                if !note.body.isEmpty {
                    Text(note.body)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                HStack(spacing: 8) {
                    Text(note.updatedAt.formatted(date: .abbreviated, time: .shortened))
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                    if let checklistSummary {
                        Text("· \(checklistSummary)")
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }
}
