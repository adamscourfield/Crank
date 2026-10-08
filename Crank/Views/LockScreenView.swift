import SwiftUI
import LocalAuthentication

struct LockScreenView: View {
    let onUnlock: () -> Void

    @State private var wordmarkOpacity: Double = 0
    @State private var wordmarkScale: CGFloat = 0.85
    @State private var ringScale: CGFloat = 0.9
    @State private var ringOpacity: Double = 0.5
    @State private var isAuthenticating = false
    @State private var authFailed = false
    @State private var biometryUnavailable = false
    @State private var statusText = "Face ID to unlock"

    var body: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()

            Circle()
                .stroke(Color.coral.opacity(0.5), lineWidth: 1.5)
                .frame(width: 220, height: 220)
                .scaleEffect(ringScale)
                .opacity(ringOpacity)

            Circle()
                .stroke(Color.coral.opacity(0.3), lineWidth: 1)
                .frame(width: 220, height: 220)
                .scaleEffect(ringScale * 1.15)
                .opacity(ringOpacity * 0.6)

            VStack(spacing: 28) {
                Text("CRANK")
                    .font(.system(size: 36, weight: .black, design: .rounded))
                    .tracking(12)
                    .foregroundStyle(.primary)
                    .opacity(wordmarkOpacity)
                    .scaleEffect(wordmarkScale)

                VStack(spacing: 14) {
                    Group {
                        if isAuthenticating {
                            ProgressView()
                                .tint(Color.coral)
                        } else {
                            Image(systemName: "faceid")
                                .font(.system(size: 30, weight: .medium))
                                .foregroundStyle(authFailed ? Color.coral : Color.secondary)
                        }
                    }
                    .frame(height: 36)

                    Text(statusText)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .tracking(1)

                    if authFailed || biometryUnavailable {
                        Button(biometryUnavailable ? "Continue" : "Try Again") {
                            if biometryUnavailable {
                                onUnlock()
                            } else {
                                authenticate()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.coral)
                        .padding(.top, 4)
                    }
                }
                .opacity(wordmarkOpacity)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.7)) {
                wordmarkOpacity = 1
                wordmarkScale = 1
            }
            withAnimation(.easeInOut(duration: 1.8).repeatForever(autoreverses: true)) {
                ringScale = 1.08
                ringOpacity = 0.15
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                authenticate()
            }
        }
    }

    private func authenticate() {
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            biometryUnavailable = true
            statusText = "Face ID isn't set up on this device"
            return
        }

        isAuthenticating = true
        authFailed = false
        biometryUnavailable = false
        statusText = "Scanning..."

        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "Unlock your notes") { success, _ in
            DispatchQueue.main.async {
                isAuthenticating = false
                if success {
                    statusText = "Welcome back"
                    onUnlock()
                } else {
                    authFailed = true
                    statusText = "Face ID failed"
                }
            }
        }
    }
}
