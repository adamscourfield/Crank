import SwiftUI

extension Color {
    /// The app's single accent color against an otherwise monochrome palette.
    /// Backed by Resources/AccentColor.colorset so it also drives the system
    /// tint (buttons, toggles, Face ID progress ring) automatically.
    static let coral = Color("AccentColor")
}
