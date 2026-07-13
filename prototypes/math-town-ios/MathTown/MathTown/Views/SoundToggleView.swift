import SwiftUI

struct SoundToggleView: View {
    @ObservedObject var viewModel: GameViewModel
    
    var body: some View {
        Button(action: {
            viewModel.soundManager.isEnabled.toggle()
        }) {
            Text(viewModel.soundManager.isEnabled ? "🔊" : "🔇")
                .font(.system(size: 22))
                .frame(width: 44, height: 44)
                .background(Color.white)
                .clipShape(Circle())
                .overlay(
                    Circle()
                        .stroke(Color(hex: "FFE699"), lineWidth: 3)
                )
                .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 4)
        }
    }
}
