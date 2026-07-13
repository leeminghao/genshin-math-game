import SwiftUI

struct IngredientRow: View {
    let ingredient: Ingredient
    let amount: Int
    let isOriginal: Bool
    let isCorrect: Bool
    let isWrong: Bool
    let onIncrease: () -> Void
    let onDecrease: () -> Void
    
    @State private var numberChanged = false
    @State private var iconSpin = false
    
    var body: some View {
        HStack {
            HStack(spacing: 8) {
                Text(ingredient.icon)
                    .font(.system(size: 26))
                    .rotationEffect(.degrees(iconSpin ? 20 : 0))
                    .scaleEffect(iconSpin ? 1.2 : 1.0)
                
                if isOriginal {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(ingredient.name)
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(Color(hex: "8B4513"))
                        
                        Text("\(ingredient.baseAmount) \(ingredient.unit)")
                            .font(.system(size: 12))
                            .foregroundColor(.gray)
                    }
                } else {
                    // 目标配方只显示图标，避免卡片空间不足
                    EmptyView()
                }
            }
            
            Spacer()
            
            if isOriginal {
                Text("\(amount)")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(Color(hex: "8B4513"))
            } else {
                HStack(spacing: 8) {
                    Button(action: onDecrease) {
                        Text("−")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.white)
                            .frame(width: 28, height: 28)
                            .background(Color(hex: "A0E7E5"))
                            .clipShape(Circle())
                            .shadow(color: Color(hex: "5ED4D0"), radius: 0, x: 0, y: 3)
                    }
                    
                    Text("\(amount)")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(Color(hex: "8B4513"))
                        .frame(minWidth: 28)
                        .scaleEffect(numberChanged ? 1.4 : 1.0)
                        .foregroundColor(numberChanged ? Color(hex: "FF8FAB") : Color(hex: "8B4513"))
                    
                    Button(action: onIncrease) {
                        Text("+")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.white)
                            .frame(width: 28, height: 28)
                            .background(Color(hex: "FFB7C5"))
                            .clipShape(Circle())
                            .shadow(color: Color(hex: "FF8FAB"), radius: 0, x: 0, y: 3)
                    }
                }
            }
        }
        .padding(10)
        .background(backgroundColor)
        .cornerRadius(14)
        .scaleEffect(isCorrect ? 1.02 : 1.0)
        .onChange(of: amount) { _ in
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                numberChanged = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                numberChanged = false
            }
        }
        .onChange(of: isCorrect) { newValue in
            if newValue {
                withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                    iconSpin = true
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    iconSpin = false
                }
            }
        }
    }
    
    private var backgroundColor: Color {
        if isCorrect {
            return Color(hex: "B4F8C8")
        } else if isWrong {
            return Color(hex: "FFE4E1")
        } else {
            return Color(hex: "FFF8E7")
        }
    }
}
