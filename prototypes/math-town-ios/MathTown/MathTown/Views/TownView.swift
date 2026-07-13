import SwiftUI

struct TownView: View {
    @ObservedObject var viewModel: GameViewModel
    
    let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]
    
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(viewModel.buildings) { building in
                        BuildingCard(
                            building: building,
                            isUnlocked: viewModel.state.unlockedBuildings.contains(building.id)
                        ) {
                            if viewModel.state.unlockedBuildings.contains(building.id) {
                                viewModel.soundManager.playUnlock()
                                viewModel.switchTab(.bakery)
                            } else {
                                viewModel.soundManager.playWrong()
                            }
                        }
                    }
                }
                
                TownStatsView(viewModel: viewModel)
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 24)
        }
    }
}

struct BuildingCard: View {
    let building: Building
    let isUnlocked: Bool
    let action: () -> Void
    
    @State private var isBouncing = false
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 10) {
                ZStack(alignment: .topTrailing) {
                    Text(building.icon)
                        .font(.system(size: 52))
                        .offset(y: isBouncing ? -8 : 0)
                    
                    if !isUnlocked {
                        Text("🔒")
                            .font(.system(size: 16))
                            .offset(x: 8, y: -4)
                    }
                }
                
                Text(building.name)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(Color(hex: "8B4513"))
                
                Text(isUnlocked ? "✅ 已解锁" : "完成第 \(building.level + 1) 关解锁")
                    .font(.system(size: 12))
                    .foregroundColor(isUnlocked ? Color(hex: "7EE8A0") : .gray)
                
                Text(building.description)
                    .font(.system(size: 11))
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .padding(16)
            .frame(maxWidth: .infinity, minHeight: 160)
            .background(isUnlocked ? Color.white : Color(hex: "F5F5F5"))
            .cornerRadius(24)
            .overlay(
                RoundedRectangle(cornerRadius: 24)
                    .stroke(isUnlocked ? Color(hex: "B4F8C8") : Color(hex: "EEEEEE"), lineWidth: 3)
            )
            .shadow(color: Color.black.opacity(0.08), radius: 12, x: 0, y: 8)
            .opacity(isUnlocked ? 1.0 : 0.7)
        }
        .buttonStyle(PlainButtonStyle())
        .onAppear {
            if isUnlocked {
                withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
                    isBouncing = true
                }
            }
        }
        .onChange(of: isUnlocked) { newValue in
            if newValue {
                withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
                    isBouncing = true
                }
            } else {
                isBouncing = false
            }
        }
    }
}

struct TownStatsView: View {
    @ObservedObject var viewModel: GameViewModel
    
    var body: some View {
        VStack(spacing: 10) {
            Text("🏆 小镇成就")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(Color(hex: "8B4513"))
            
            Text("已完成 \(viewModel.state.completedLevels.count) 个任务，解锁 \(viewModel.state.unlockedBuildings.count)/\(viewModel.buildings.count) 个建筑")
                .font(.system(size: 15))
                .foregroundColor(Color(hex: "4A4A4A"))
        }
        .padding(18)
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.08), radius: 10, x: 0, y: 6)
    }
}
