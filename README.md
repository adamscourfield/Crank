# CRANK

A personal, local-only notes app for iPhone: notes with titles, free text,
checklists, and photo attachments — locked behind Face ID, styled
monochrome with coral accents. No accounts, no sync, no third party,
nobody else's eyes on it but yours.

This repo contains Swift source files only, not an `.xcodeproj`. Xcode's
own "New Project" wizard generates a more reliable project file than a
hand-written one, so you'll create the project shell in Xcode and drop
these files in. Takes about 5 minutes.

## Requirements

- A Mac with Xcode 15 or later (free from the Mac App Store)
- An iPhone with Face ID, running iOS 17 or later
- A free Apple ID (no paid developer account needed) — see signing note below

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
   what makes buttons, the Face ID progress ring, and pins all pick up the
   coral tint automatically.

5. **Enable Face ID.** Select the `Crank` target → Info tab → add a row:
   - Key: `Privacy - Face ID Usage Description` (`NSFaceIDUsageDescription`)
   - Value: `Crank uses Face ID to keep your notes private.`

   **This step is required** — the app will crash on launch without it
   the moment it tries to use Face ID.

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
  instead of locking you out entirely.
- **Notes list** with search, pin-to-top, swipe-to-delete, and swipe-to-pin.
- **Note editor**: title, free-text body, a checklist section (add, check
  off, swipe to delete items), and a photo grid.
- **Photos**: pick any number from your library via the system picker
  (no extra permission prompt needed — `PhotosPicker` runs
  out-of-process). Tap a thumbnail to view full-screen; tap the X to
  remove it.
- Empty notes (no title, body, checklist, or photos) are discarded
  automatically when you leave the editor.
- **Design**: monochrome throughout (system backgrounds/text, which
  already adapt to light/dark), with a single coral accent color for
  anything interactive or "on" — pins, the checked state of a checklist
  item, buttons, the Face ID progress ring.

## What it deliberately doesn't do

- No iCloud sync — notes live only on this one phone.
- No sharing, collaboration, or export — single-user by design.
- No camera capture (only picking existing photos), to avoid needing an
  extra `NSCameraUsageDescription` entry — easy to add later if wanted.
- Face ID is only checked once at launch, not every time the app returns
  to the foreground — straightforward to extend if you want it stricter.

## File layout

```
Crank/
  CrankApp.swift             — app entry point, Face ID gate, SwiftData container
  Theme/
    Color+Crank.swift         — the one accent color token (Color.coral)
  Models/
    Note.swift                 — note entity (title, body, timestamps, pin)
    ChecklistItem.swift         — one checklist row, belongs to a Note
    NoteImage.swift              — one attached photo, belongs to a Note
  Views/
    LockScreenView.swift        — animated Face ID entry screen
    NoteListView.swift           — the list screen
    NoteRowView.swift             — one row in the list
    NoteDetailView.swift           — the note editor
    ChecklistSectionView.swift      — checklist UI inside the editor
    ImageViewerView.swift            — full-screen photo viewer
  Resources/
    AccentColor.colorset/             — the coral accent, light + dark variants
```
