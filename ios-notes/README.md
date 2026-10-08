# CrankNotes

A personal, local-only notes app for iPhone: notes with titles, free text,
checklists, and photo attachments. No accounts, no sync, no third party —
everything is stored on-device with SwiftData.

This folder contains only Swift source files, not an `.xcodeproj`. Xcode's
own "New Project" wizard generates a more reliable project file than a
hand-written one, so you'll create the project shell in Xcode and drop
these files in. Takes about 5 minutes.

## Requirements

- A Mac with Xcode 15 or later installed (free from the Mac App Store)
- An iPhone running iOS 17 or later
- A free Apple ID (no paid developer account needed) — see signing note below

## Setup

1. **Create the project.** Open Xcode → File → New → Project → iOS → App.
   - Product Name: `CrankNotes`
   - Interface: SwiftUI
   - Storage: SwiftData
   - Uncheck "Include Tests" (optional)
   - Save it wherever you like on your Mac (this can be outside the git repo).

2. **Remove the generated defaults.** Xcode's SwiftData template creates
   `Item.swift` and a default `ContentView.swift` — delete both.

3. **Add these files.** In Finder, drag the contents of this folder's
   `CrankNotes/` directory (the `.swift` files and the `Models` / `Views`
   subfolders) into your Xcode project's `CrankNotes` group. When prompted,
   choose "Copy items if needed" and make sure the `CrankNotes` target is
   checked. Delete the template's own `CrankNotesApp.swift` first since
   you're replacing it with the one provided here.

4. **Set the deployment target.** Select the project in the navigator →
   the `CrankNotes` target → General tab → set "Minimum Deployments" to
   iOS 17.0 (required for SwiftData).

5. **Sign the app.** Target → Signing & Capabilities → set your Team to
   your personal Apple ID. With a free Apple ID, Xcode will sign the app
   for 7 days at a time — just re-run from Xcode (or Settings → General →
   VPN & Device Management → trust the certificate) once a week to keep it
   working. If you'd rather not deal with that, a $99/year Apple Developer
   account signs builds for a full year.

6. **Run it on your phone.** Plug your iPhone into your Mac (or use
   wireless debugging), select it as the run destination in Xcode's
   toolbar, and hit Run (⌘R). The first time, your iPhone will ask you to
   trust the developer certificate under Settings → General → VPN & Device
   Management.

That's it — the app launches straight into your notes list.

## What it does

- **Notes list** with search, pin-to-top, swipe-to-delete, and swipe-to-pin.
- **Note editor**: title, free-text body, a checklist section (add, check
  off, reorder-free list, swipe to delete items), and a photo grid.
- **Photos**: pick any number from your library via the system picker
  (no extra permission prompt — `PhotosPicker` runs out-of-process). Tap
  a thumbnail to view full-screen; tap the X to remove it.
- Empty notes (no title, body, checklist, or photos) are discarded
  automatically when you leave the editor, so stray taps on "New Note"
  don't clutter your list.

## What it deliberately doesn't do

- No iCloud sync — notes live only on this one phone (your choice, so a
  restore from backup or a new phone needs you to re-create notes, or you
  can add CloudKit sync later if you change your mind).
- No sharing, collaboration, or export — it's single-user by design.
- No camera capture (only picking existing photos) — kept out to avoid
  needing an `NSCameraUsageDescription` entry; easy to add later if wanted.

## File layout

```
CrankNotes/
  CrankNotesApp.swift       — app entry point, SwiftData model container
  Models/
    Note.swift               — note entity (title, body, timestamps, pin)
    ChecklistItem.swift       — one checklist row, belongs to a Note
    NoteImage.swift           — one attached photo, belongs to a Note
  Views/
    NoteListView.swift        — the list screen
    NoteRowView.swift         — one row in the list
    NoteDetailView.swift       — the note editor
    ChecklistSectionView.swift — checklist UI inside the editor
    ImageViewerView.swift      — full-screen photo viewer
```
