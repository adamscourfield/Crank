import SwiftUI
import LocalAuthentication

struct LockScreenView: View {
    let onUnlock: () -> Void

    private enum Phase {
        case ident
        case lock
    }

    private let wordmark = Array("CRANK")

    @State private var phase: Phase = .ident
    @State private var lettersVisible: [Bool] = Array(repeating: false, count: 5)
    @State private var underlineWidth: CGFloat = 0
    @State private var identOpacity: Double = 1

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

            if phase == .ident {
                identView
                    .opacity(identOpacity)
            } else {
                lockView
            }
        }
        .onAppear { runIdent() }
    }

    private var identView: some View {
        VStack(spacing: 20) {
            HStack(spacing: 2) {
                ForEach(Array(wordmark.enumerated()), id: \.offset) { index, letter in
                    Text(String(letter))
                        .font(.system(size: 40, weight: .bold, design: .rounded))
                        .tracking(6)
                        .foregroundStyle(.primary)
                        .opacity(lettersVisible[index] ? 1 : 0)
                        .offset(y: lettersVisible[index] ? 0 : 14)
                        .animation(.easeOut(duration: 0.4), value: lettersVisible[index])
                }
            }
            Rectangle()
                .fill(Color.coral)
                .frame(width: underlineWidth, height: 2)
        }
    }

    private var lockView: some View {
        ZStack {
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
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .tracking(7)
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

                    Button("Replay Intro", action: replayIntro)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                        .padding(.top, 10)
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

    private func runIdent() {
        for index in lettersVisible.indices {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.05 + Double(index) * 0.1) {
                lettersVisible[index] = true
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) {
            withAnimation(.easeOut(duration: 0.5)) {
                underlineWidth = 150
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.7) {
            withAnimation(.easeOut(duration: 0.5)) {
                identOpacity = 0
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.2) {
            phase = .lock
        }
    }

    private func replayIntro() {
        wordmarkOpacity = 0
        wordmarkScale = 0.85
        isAuthenticating = false
        authFailed = false
        biometryUnavailable = false
        statusText = "Face ID to unlock"
        lettersVisible = Array(repeating: false, count: 5)
        underlineWidth = 0
        identOpacity = 1
        phase = .ident
        runIdent()
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
