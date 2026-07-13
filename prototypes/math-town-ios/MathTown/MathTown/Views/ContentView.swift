import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = GameViewModel()
    
    var body: some View {
        ZStack {
            Color(hex: "FFF8E7")
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                HeaderView(viewModel: viewModel)
                    .padding(.top, 8)
                
                TabSelectorView(viewModel: viewModel)
                    .padding(.vertical, 12)
                
                Group {
                    switch viewModel.selectedTab {
                    case .bakery:
                        BakeryView(viewModel: viewModel)
                    case .town:
                        TownView(viewModel: viewModel)
                    }
                }
                .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .move(edge: .leading)))
            }
            
            if viewModel.showModal, let modalType = viewModel.modalType {
                ModalOverlay(viewModel: viewModel, type: modalType)
                    .transition(.opacity)
            }
            
            SoundToggleView(viewModel: viewModel)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                .padding(.top, 12)
                .padding(.trailing, 16)
        }
        .animation(.easeInOut(duration: 0.3), value: viewModel.selectedTab)
        .animation(.easeInOut(duration: 0.3), value: viewModel.showModal)
    }
}

struct HeaderView: View {
    @ObservedObject var viewModel: GameViewModel
    
    var body: some View {
        VStack(spacing: 4) {
            Text("🌈 数学小镇日常")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(Color(hex: "8B4513"))
            
            Text("用数学帮小镇居民解决问题，建设你的小镇")
                .font(.system(size: 14))
                .foregroundColor(.gray)
        }
    }
}

struct TabSelectorView: View {
    @ObservedObject var viewModel: GameViewModel
    
    var body: some View {
        HStack(spacing: 12) {
            TabButton(
                title: "🧁 烘焙店",
                isSelected: viewModel.selectedTab == .bakery
            ) {
                viewModel.switchTab(.bakery)
            }
            
            TabButton(
                title: "🏘️ 我的小镇",
                isSelected: viewModel.selectedTab == .town
            ) {
                viewModel.switchTab(.town)
            }
        }
    }
}

struct TabButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(Color(hex: "8B4513"))
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(isSelected ? Color(hex: "FFE699") : Color.white)
                .cornerRadius(24)
                .overlay(
                    RoundedRectangle(cornerRadius: 24)
                        .stroke(isSelected ? Color(hex: "E6C200") : Color.clear, lineWidth: 3)
                )
                .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 4)
        }
        .offset(y: isSelected ? -2 : 0)
    }
}
