import SwiftUI

struct ModalOverlay: View {
    @ObservedObject var viewModel: GameViewModel
    let type: ModalType
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.5)
                .ignoresSafeArea()
                .onTapGesture {
                    if type == .failure {
                        viewModel.closeModal()
                    }
                }
            
            if type == .success {
                SuccessModal(viewModel: viewModel)
            } else {
                FailureModal(viewModel: viewModel)
            }
        }
    }
}

struct SuccessModal: View {
    @ObservedObject var viewModel: GameViewModel
    @State private var scale: CGFloat = 0.7
    @State private var rotation: Double = -20
    @State private var starScale: CGFloat = 0
    
    var body: some View {
        VStack(spacing: 14) {
            Text(viewModel.successIcon())
                .font(.system(size: 72))
                .scaleEffect(scale)
                .rotationEffect(.degrees(rotation))
            
            Text(viewModel.successTitle())
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(Color(hex: "8B4513"))
            
            HStack(spacing: 4) {
                ForEach(0..<viewModel.state.currentDifficulty.starCount, id: \.self) { _ in
                    Text("⭐")
                        .font(.system(size: 28))
                        .scaleEffect(starScale)
                }
            }
            
            Text(viewModel.successMessage())
                .font(.system(size: 16))
                .foregroundColor(Color.gray)
                .multilineTextAlignment(.center)
                .lineSpacing(4)
            
            if let building = viewModel.newlyUnlockedBuilding {
                Text("🎉 解锁新建筑：\(building.name)！")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(Color(hex: "4CAF50"))
                    .padding(12)
                    .frame(maxWidth: .infinity)
                    .background(Color(hex: "F0FFF4"))
                    .cornerRadius(14)
            }
            
            HStack(spacing: 10) {
                Button(action: { viewModel.goToTown() }) {
                    Text("🏘️ 看小镇")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(Color(hex: "A0E7E5"))
                        .cornerRadius(24)
                        .shadow(color: Color(hex: "5ED4D0"), radius: 0, x: 0, y: 4)
                }
                
                Button(action: { viewModel.nextLevel() }) {
                    Text(viewModel.state.currentLevel < viewModel.levels.count - 1 ? "下一关 →" : "🔄 再玩一次")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(Color(hex: "8B4513"))
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(Color(hex: "B4F8C8"))
                        .cornerRadius(24)
                        .shadow(color: Color(hex: "7EE8A0"), radius: 0, x: 0, y: 4)
                }
            }
        }
        .padding(24)
        .frame(maxWidth: 320)
        .background(Color.white)
        .cornerRadius(28)
        .shadow(color: Color.black.opacity(0.2), radius: 20, x: 0, y: 10)
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                scale = 1.0
                rotation = 0
            }
            withAnimation(.spring(response: 0.6, dampingFraction: 0.5).delay(0.2)) {
                starScale = 1.0
            }
        }
    }
}

struct FailureModal: View {
    @ObservedObject var viewModel: GameViewModel
    
    var body: some View {
        VStack(spacing: 14) {
            Text("🍰")
                .font(.system(size: 64))
            
            Text(viewModel.failureTitle())
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(Color(hex: "8B4513"))
            
            Text("比例要一致哦！目标份数是原配方的 \(viewModel.formatFactor(viewModel.effectiveFactor)) 倍。")
                .font(.system(size: 15))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
            
            VStack(alignment: .leading, spacing: 6) {
                ForEach(viewModel.modalErrors, id: \.self) { error in
                    Text("• \(error)")
                        .font(.system(size: 14))
                        .foregroundColor(Color(hex: "555555"))
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(hex: "FFF8E7"))
            .cornerRadius(16)
            
            Button(action: { viewModel.closeModal() }) {
                Text("再试一次")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background(Color(hex: "FFB7C5"))
                    .cornerRadius(24)
                    .shadow(color: Color(hex: "FF8FAB"), radius: 0, x: 0, y: 4)
            }
        }
        .padding(24)
        .frame(maxWidth: 320)
        .background(Color.white)
        .cornerRadius(28)
        .shadow(color: Color.black.opacity(0.2), radius: 20, x: 0, y: 10)
    }
}
