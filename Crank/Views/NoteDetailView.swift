import SwiftUI
import SwiftData
import PhotosUI

struct NoteDetailView: View {
    @Bindable var note: Note
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var selectedPhotoItems: [PhotosPickerItem] = []
    @State private var fullScreenImage: NoteImage?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Title", text: $note.title)
                        .font(.title3.bold())
                    TextField("Note", text: $note.body, axis: .vertical)
                        .lineLimit(5...20)
                }

                Section("Checklist") {
                    ChecklistSectionView(note: note)
                }

                Section("Images") {
                    imageGrid
                    PhotosPicker(selection: $selectedPhotoItems, matching: .images) {
                        Label("Add Photos", systemImage: "photo.on.rectangle.angled")
                    }
                }
            }
            .navigationTitle("Edit Note")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        note.updatedAt = .now
                        dismiss()
                    }
                }
            }
            .onChange(of: selectedPhotoItems) { _, newItems in
                Task { await addImages(from: newItems) }
            }
            .fullScreenCover(item: $fullScreenImage) { image in
                ImageViewerView(noteImage: image)
            }
        }
    }

    private var imageGrid: some View {
        let columns = [GridItem(.adaptive(minimum: 80, maximum: 100), spacing: 8)]
        return LazyVGrid(columns: columns, spacing: 8) {
            ForEach(note.images.sorted(by: { $0.sortOrder < $1.sortOrder })) { image in
                if let uiImage = UIImage(data: image.data) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 80, height: 80)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .onTapGesture { fullScreenImage = image }
                        .overlay(alignment: .topTrailing) {
                            Button {
                                deleteImage(image)
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundStyle(.white, .black.opacity(0.6))
                            }
                            .padding(4)
                        }
                }
            }
        }
        .padding(.vertical, 4)
    }

    private func addImages(from items: [PhotosPickerItem]) async {
        var nextOrder = (note.images.map(\.sortOrder).max() ?? -1) + 1
        for item in items {
            if let data = try? await item.loadTransferable(type: Data.self) {
                let image = NoteImage(data: data, sortOrder: nextOrder)
                image.note = note
                modelContext.insert(image)
                note.images.append(image)
                nextOrder += 1
            }
        }
        selectedPhotoItems = []
    }

    private func deleteImage(_ image: NoteImage) {
        note.images.removeAll { $0.persistentModelID == image.persistentModelID }
        modelContext.delete(image)
    }
}
