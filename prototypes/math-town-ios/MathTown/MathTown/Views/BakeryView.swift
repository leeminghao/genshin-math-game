import SwiftUI

struct BakeryView: View {
    @ObservedObject var viewModel: GameViewModel
    @State private var shakeStoryCard = false
    @State private var shakeTargetCard = false
    
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 16) {
                LevelBadgeView(viewModel: viewModel)
                
                StoryCardView(viewModel: viewModel, shake: $shakeStoryCard)
                
                DifficultySelectorView(viewModel: viewModel)
                
                RecipeBoardView(viewModel: viewModel, shake: $shakeTargetCard)
                
                HintBarView(viewModel: viewModel)
                
                ActionAreaView(viewModel: viewModel)
                
                MathTipView(viewModel: viewModel)
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 24)
        }
        .onChange(of: viewModel.modalType) { newValue in
            if newValue == .failure {
                withAnimation(.default) {
                    shakeStoryCard = true
                    shakeTargetCard = true
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    shakeStoryCard = false
                    shakeTargetCard = false
                }
            }
        }
    }
}

struct LevelBadgeView: View {
    @ObservedObject var viewModel: GameViewModel
    
    var body: some View {
        Text("第 \(viewModel.currentLevel.id) 关：\(viewModel.currentLevel.title)")
            .font(.system(size: 16, weight: .bold))
            .foregroundColor(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 6)
            .background(Color(hex: "FFB7C5"))
            .cornerRadius(20)
            .shadow(color: Color(hex: "FF8FAB"), radius: 0, x: 0, y: 4)
            .scaleEffect(1.0)
    }
}

struct StoryCardView: View {
    @ObservedObject var viewModel: GameViewModel
    @Binding var shake: Bool
    
    var body: some View {
        VStack(spacing: 12) {
            Text(viewModel.currentVariant.story)
                .font(.system(size: 17))
                .foregroundColor(Color(hex: "8B4513"))
                .multilineTextAlignment(.center)
                .lineSpacing(4)
            
            HStack(spacing: 8) {
                let target = viewModel.currentVariant.effectiveTarget
                let count = min(target, 12)
                ForEach(0..<count, id: \.self) { index in
                    Text(viewModel.targetIcon())
                        .font(.system(size: 28))
                        .transition(.scale)
                        .animation(.spring(response: 0.4, dampingFraction: 0.6).delay(Double(index) * 0.05), value: viewModel.currentLevel.id)
                }
                if target > 12 {
                    Text("+\(target - 12)")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(Color(hex: "8B4513"))
                }
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .cornerRadius(24)
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(Color(hex: "FFE699"), lineWidth: 3)
        )
        .shadow(color: Color.black.opacity(0.08), radius: 12, x: 0, y: 8)
        .offset(x: shake ? -8 : 0)
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(shake ? Color.red : Color.clear, lineWidth: 3)
        )
    }
}

struct DifficultySelectorView: View {
    @ObservedObject var viewModel: GameViewModel
    
    var body: some View {
        HStack(spacing: 10) {
            ForEach(Difficulty.allCases) { difficulty in
                DifficultyButton(
                    difficulty: difficulty,
                    isSelected: viewModel.state.currentDifficulty == difficulty
                ) {
                    viewModel.setDifficulty(difficulty)
                }
            }
        }
    }
}

struct DifficultyButton: View {
    let difficulty: Difficulty
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(difficulty.displayName)
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(isSelected ? .white : Color.gray)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color(hex: "A0E7E5") : Color.white)
                .cornerRadius(20)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(isSelected ? Color(hex: "5ED4D0") : Color(hex: "DDDDDD"), lineWidth: 3)
                )
        }
        .scaleEffect(isSelected ? 1.05 : 1.0)
    }
}

struct RecipeBoardView: View {
    @ObservedObject var viewModel: GameViewModel
    @Binding var shake: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            RecipeCard(
                title: "📖 原配方",
                borderColor: Color(hex: "A0E7E5"),
                titleColor: Color(hex: "5ED4D0"),
                ingredients: viewModel.currentVariant.ingredients,
                amounts: viewModel.currentVariant.ingredients.map { $0.baseAmount },
                isOriginal: true
            )
            
            RecipeCard(
                title: "🎯 目标配方",
                borderColor: Color(hex: "FFB7C5"),
                titleColor: Color(hex: "FF8FAB"),
                ingredients: viewModel.currentVariant.ingredients,
                amounts: viewModel.state.currentAmounts,
                isOriginal: false,
                onChange: { index, delta in
                    viewModel.changeAmount(at: index, delta: delta)
                },
                expectedAmounts: viewModel.currentVariant.ingredients.map { Int(Double($0.baseAmount) * viewModel.effectiveFactor) }
            )
            .offset(x: shake ? -8 : 0)
            .overlay(
                RoundedRectangle(cornerRadius: 24)
                    .stroke(shake ? Color.red : Color.clear, lineWidth: 3)
            )
        }
    }
}

struct RecipeCard: View {
    let title: String
    let borderColor: Color
    let titleColor: Color
    let ingredients: [Ingredient]
    let amounts: [Int]
    let isOriginal: Bool
    var onChange: ((Int, Int)) -> Void = { _ in }
    var expectedAmounts: [Int] = []
    
    var body: some View {
        VStack(spacing: 8) {
            Text(title)
                .font(.system(size: 17, weight: .bold))
                .foregroundColor(titleColor)
            
            ForEach(Array(ingredients.enumerated()), id: \.element.id) { index, ingredient in
                IngredientRow(
                    ingredient: ingredient,
                    amount: amounts[index],
                    isOriginal: isOriginal,
                    isCorrect: isOriginal ? false : amounts[index] == expectedAmounts[index],
                    isWrong: isOriginal ? false : amounts[index] != ingredient.baseAmount && amounts[index] != expectedAmounts[index],
                    onIncrease: { onChange((index, 1)) },
                    onDecrease: { onChange((index, -1)) }
                )
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.white)
        .cornerRadius(24)
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(borderColor, lineWidth: 3)
        )
        .shadow(color: Color.black.opacity(0.08), radius: 12, x: 0, y: 8)
    }
}

struct HintBarView: View {
    @ObservedObject var viewModel: GameViewModel
    
    var hintText: String {
        let variant = viewModel.currentVariant
        let factor = viewModel.effectiveFactor
        let correctCount = viewModel.state.currentAmounts.enumerated().filter { index, amount in
            let expected = Int(Double(variant.ingredients[index].baseAmount) * factor)
            return amount == expected
        }.count
        
        if let constraint = variant.constraint {
            return "💡 \(constraint)"
        } else if correctCount == 0 {
            return "提示：\(variant.effectiveTarget) 是 \(viewModel.currentLevel.baseServings) 的 \(viewModel.formatFactor(factor)) 倍"
        } else if correctCount < variant.ingredients.count {
            return "已经有 \(correctCount) 种材料调对了，再看看其他的！"
        } else {
            return "✨ 所有材料都对了！快点击开始吧！"
        }
    }
    
    var allCorrect: Bool {
        let variant = viewModel.currentVariant
        let factor = viewModel.effectiveFactor
        return viewModel.state.currentAmounts.enumerated().allSatisfy { index, amount in
            amount == Int(Double(variant.ingredients[index].baseAmount) * factor)
        }
    }
    
    var body: some View {
        Text(hintText)
            .font(.system(size: 15))
            .foregroundColor(allCorrect ? Color(hex: "8B4513") : Color.gray)
            .multilineTextAlignment(.center)
            .padding(14)
            .frame(maxWidth: .infinity, minHeight: 52)
            .background(allCorrect ? Color(hex: "B4F8C8") : Color.white)
            .cornerRadius(16)
            .shadow(color: Color.black.opacity(0.08), radius: 8, x: 0, y: 4)
    }
}

struct ActionAreaView: View {
    @ObservedObject var viewModel: GameViewModel
    
    var body: some View {
        VStack(spacing: 12) {
            Button(action: {
                viewModel.checkAnswer()
            }) {
                Text(viewModel.actionButtonTitle())
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(Color(hex: "8B4513"))
                    .padding(.horizontal, 40)
                    .padding(.vertical, 14)
                    .background(
                        LinearGradient(
                            colors: [Color(hex: "FFE699"), Color(hex: "FFD93D")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .cornerRadius(28)
                    .shadow(color: Color(hex: "E6C200"), radius: 0, x: 0, y: 6)
            }
            
            HStack(spacing: 10) {
                ForEach(0..<viewModel.levels.count, id: \.self) { index in
                    Circle()
                        .fill(
                            index == viewModel.state.currentLevel ? Color(hex: "FFB7C5") :
                            (index < viewModel.state.currentLevel ? Color(hex: "B4F8C8") : Color(hex: "DDDDDD"))
                        )
                        .frame(width: 12, height: 12)
                        .scaleEffect(index == viewModel.state.currentLevel ? 1.3 : 1.0)
                }
            }
        }
    }
}

struct MathTipView: View {
    @ObservedObject var viewModel: GameViewModel
    
    var body: some View {
        HStack(spacing: 8) {
            Text("💡")
            Text("数学小贴士：")
                .fontWeight(.bold)
            + Text(viewModel.currentLevel.mathTip)
        }
        .font(.system(size: 14))
        .foregroundColor(Color(hex: "555555"))
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(hex: "F0F8FF"))
        .cornerRadius(12)
        .overlay(
            Rectangle()
                .fill(Color(hex: "5ED4D0"))
                .frame(width: 4)
                .cornerRadius(2),
            alignment: .leading
        )
    }
}
