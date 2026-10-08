# CRANK

A personal, local-only project and notes app for iPhone: projects contain
tick-box notes, pinned notes surface on the home screen, and notes can hold
photos and documents (including from Google Drive) — all locked behind
Face ID, styled monochrome with coral accents. No accounts, no sync, no
third party, nobody else's eyes on it but yours.

This repo contains Swift source files only, not an `.xcodeproj`. Xcode's
own "New Project" wizard generates a more reliable project file than a
hand-written one, so you'll create the project shell in Xcode and drop
these files in. Takes about 5 minutes.

## Requirements

- A Mac with Xcode 15 or later (free from the Mac App Store)
- An iPhone with Face ID, running iOS 17 or later
- A free Apple ID (no paid developer account needed) — see signing note below
- Optionally, the Google Drive app installed on the iPhone if you want
  Drive files to show up as an attachment source (see below)

## Setup

1. **Create the project.** Xcode → File → New → Project → iOS → App.
   - Product Name: `Crank`
   - Interface: SwiftUI
   - Storage: SwiftData
   - Uncheck "Include Tests" (optional)
   - Save it wherever you like on your Mac (this can be outside the git repo).

2. **Remove the generated defaults.** Delete the template's `Item.swift`,
   `ContentView.swift`, and its own `CrankApp.swift` — you're replacing all
   three with the ones in this repo.

3. **Add the source files.** In Finder, drag the contents of this repo's
   `Crank/` folder (`CrankApp.swift`, `Models/`, `Views/`, `Theme/`) into
   your Xcode project's `Crank` group. Choose "Copy items if needed" and
   make sure the `Crank` target is checked.

4. **Add the accent color.** Drag `Crank/Resources/AccentColor.colorset`
   into your project's `Assets.xcassets` in Xcode's navigator (it'll
   offer to replace the template's blank `AccentColor` — let it). This is
   what makes buttons, pins, checked notes, and the Face ID progress ring
   all pick up the coral tint automatically.

5. **Add two privacy usage descriptions.** Select the `Crank` target →
   Info tab → add these rows. **Both are required** — the app crashes at
   the moment it tries to use Face ID or the camera without them:
   - Key: `Privacy - Face ID Usage Description` (`NSFaceIDUsageDescription`)
     Value: `Crank uses Face ID to keep your notes private.`
   - Key: `Privacy - Camera Usage Description` (`NSCameraUsageDescription`)
     Value: `Crank uses the camera to attach photos to your notes.`

6. **Set the deployment target.** Target → General → Minimum Deployments
   → iOS 17.0 (required for SwiftData).

7. **Sign the app.** Target → Signing & Capabilities → set your Team to
   your personal Apple ID. A free Apple ID signs builds for 7 days at a
   time — just re-run from Xcode once a week to keep it working. A
   $99/year Apple Developer account signs for a full year instead.

8. **Run it on your phone.** Plug your iPhone into your Mac (or use
   wireless debugging), select it as the run destination, and hit Run
   (⌘R). First launch, your iPhone will ask you to trust the developer
   certificate under Settings → General → VPN & Device Management.

## What it does

- **Face ID entry screen**: animated coral pulse rings behind the CRANK
  wordmark, Face ID triggers automatically on launch. Fails gracefully —
  if Face ID isn't set up on the device (e.g. an older iPhone or a
  Simulator without biometrics configured), it shows a "Continue" button
  instead of locking you out entirely. Checked once at launch, not on
  every return to the foreground — easy to tighten later if you want that.
- **Home screen**: any pinned notes appear first, above your list of
  projects. Each project row shows how many notes in it are still active.
- **Projects**: the top-level container. Create as many as you like; each
  holds its own notes.
- **Notes are the tick-box**: every note has a checkbox. Ticking it marks
  it complete *and* archives it in one step — there's no separate
  "done" vs "archived" state to think about. Each project has an Archive
  screen for anything you've ticked off, with a swipe action to restore a
  note if you ticked it by mistake.
- **Pinning**: any note can be pinned, independent of its project —
  pinned, non-archived notes are what shows up on the home screen.
- Created and completed dates are recorded and shown on the note, but
  purely as information — nothing in the app treats them as a deadline.
- **Photos**: attach from your library (`PhotosPicker`, no extra
  permission prompt) or take one directly in the app with the camera
  button. Thumbnails get a rounded corner, a hairline border, and a soft
  shadow so they read as deliberate, not slapped-on; tap one to view it
  full-screen.
- **Documents**: tap "Add Document" to open the system file browser, which
  lists iCloud Drive, On My iPhone, and — if you have the Google Drive app
  installed — your Drive files too, since Drive registers itself as a
  Files provider. Whatever you pick is copied into the note (same as
  photos), so the note stays self-contained even if the original file
  later moves. Tap a document to preview it with QuickLook.
- Empty notes (no title, body, photos, or documents) are discarded
  automatically when you leave the editor.
- **Design**: monochrome throughout (system backgrounds/text, which
  already adapt to light/dark), with a single coral accent for anything
  interactive or "on" — pins, ticked notes, buttons, the Face ID ring.

## What it deliberately doesn't do

- No iCloud sync — everything lives only on this one phone.
- No sharing, collaboration, or export — single-user by design.
- No live connection to Google Drive — picking a Drive file copies it in
  once; the note won't reflect later edits made to the original in Drive.
- No renaming a project after creation, and no reordering projects —
  straightforward to add if you find you want it.

## File layout

```
Crank/
  CrankApp.swift                 — app entry point, Face ID gate, SwiftData container
  Theme/
    Color+Crank.swift             — the one accent color token (Color.coral)
  Models/
    Project.swift                  — top-level container; holds notes
    Note.swift                      — the tick-box note: title, body, pin, archive state, dates
    NoteImage.swift                  — one attached photo, belongs to a Note
    NoteDocument.swift                 — one attached document, belongs to a Note
  Views/
    LockScreenView.swift            — animated Face ID entry screen
    HomeView.swift                   — pinned notes + project list
    ProjectRowView.swift              — one row on the home screen
    PinnedNoteRow.swift                — one pinned-note row on the home screen
    ProjectDetailView.swift             — active notes inside a project
    ArchiveView.swift                    — completed notes for a project
    NoteRowView.swift                     — one row inside a project (tick box + thumbnail)
    NoteDetailView.swift                   — the note editor
    DocumentRowView.swift                   — one attached-document row
    DocumentPreviewView.swift                — QuickLook wrapper for documents
    CameraCaptureView.swift                   — UIImagePickerController wrapper for the camera
    ImageViewerView.swift                      — full-screen photo viewer
  Resources/
    AccentColor.colorset/                       — the coral accent, light + dark variants
```
