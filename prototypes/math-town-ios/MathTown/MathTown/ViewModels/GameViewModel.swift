import Foundation
import SwiftUI
import Combine

class GameViewModel: ObservableObject {
    @Published var state = GameState()
    @Published var selectedTab: AppTab = .bakery
    @Published var showModal = false
    @Published var modalType: ModalType? = nil
    @Published var modalErrors: [String] = []
    @Published var newlyUnlockedBuilding: Building? = nil
    
    let soundManager = SoundManager()
    
    let buildings: [Building] = [
        Building(id: "bakery", name: "幸福面包店", icon: "🧁", level: 0, description: "用比例做出美味蛋糕"),
        Building(id: "garden", name: "彩虹花园", icon: "🌻", level: 1, description: "用比例调配植物营养液"),
        Building(id: "music", name: "音乐广场", icon: "🎵", level: 2, description: "用比例调整节拍速度"),
        Building(id: "potion", name: "魔法药水屋", icon: "🧪", level: 3, description: "用比例配制神秘药水")
    ]
    
    let levels: [Level] = [
        Level(
            id: 1,
            title: "蛋糕要加倍",
            baseServings: 2,
            targetServings: 4,
            factor: 2.0,
            buildingId: "bakery",
            mathTip: "比例就像放大镜，所有材料要一起变大或一起变小，蛋糕味道才不会变。",
            variants: [
                .easy: LevelVariant(
                    story: "奶奶的原配方是 2 人份。今天来了 4 位小朋友，需要把材料都变成几倍？",
                    ingredients: [
                        Ingredient(name: "面粉", unit: "杯", baseAmount: 2, icon: "🌾"),
                        Ingredient(name: "鸡蛋", unit: "个", baseAmount: 2, icon: "🥚")
                    ],
                    constraint: nil,
                    effectiveTarget: 4
                ),
                .standard: LevelVariant(
                    story: "奶奶的原配方是 2 人份。今天来了 4 位小朋友，每种材料要放多少？",
                    ingredients: [
                        Ingredient(name: "面粉", unit: "杯", baseAmount: 2, icon: "🌾"),
                        Ingredient(name: "鸡蛋", unit: "个", baseAmount: 2, icon: "🥚"),
                        Ingredient(name: "牛奶", unit: "杯", baseAmount: 1, icon: "🥛"),
                        Ingredient(name: "糖", unit: "勺", baseAmount: 3, icon: "🍬")
                    ],
                    constraint: nil,
                    effectiveTarget: 4
                ),
                .hard: LevelVariant(
                    story: "奶奶的原配方是 2 人份。今天来了 4 位小朋友，而且奶奶想做多 1 份备用。一共要放多少？",
                    ingredients: [
                        Ingredient(name: "面粉", unit: "杯", baseAmount: 2, icon: "🌾"),
                        Ingredient(name: "鸡蛋", unit: "个", baseAmount: 2, icon: "🥚"),
                        Ingredient(name: "牛奶", unit: "杯", baseAmount: 1, icon: "🥛"),
                        Ingredient(name: "糖", unit: "勺", baseAmount: 3, icon: "🍬"),
                        Ingredient(name: "黄油", unit: "块", baseAmount: 2, icon: "🧈")
                    ],
                    constraint: "提示：要准备 5 人份哦！",
                    effectiveTarget: 5
                )
            ]
        ),
        Level(
            id: 2,
            title: "花园营养液",
            baseServings: 3,
            targetServings: 6,
            factor: 2.0,
            buildingId: "garden",
            mathTip: "先算目标份数是原配方的几倍，再用这个倍数乘每种材料。",
            variants: [
                .easy: LevelVariant(
                    story: "花园营养液原配方是 3 盆花的量。现在要浇 6 盆花，材料怎么调整？",
                    ingredients: [
                        Ingredient(name: "水", unit: "杯", baseAmount: 3, icon: "💧"),
                        Ingredient(name: "肥料", unit: "勺", baseAmount: 1, icon: "🌿")
                    ],
                    constraint: nil,
                    effectiveTarget: 6
                ),
                .standard: LevelVariant(
                    story: "花园营养液原配方是 3 盆花的量。现在要浇 6 盆花，材料怎么调整？",
                    ingredients: [
                        Ingredient(name: "水", unit: "杯", baseAmount: 3, icon: "💧"),
                        Ingredient(name: "肥料", unit: "勺", baseAmount: 2, icon: "🌿"),
                        Ingredient(name: "营养粉", unit: "勺", baseAmount: 1, icon: "✨"),
                        Ingredient(name: "阳光精华", unit: "滴", baseAmount: 4, icon: "☀️")
                    ],
                    constraint: nil,
                    effectiveTarget: 6
                ),
                .hard: LevelVariant(
                    story: "花园营养液原配方是 3 盆花的量。现在要浇 9 盆花，材料怎么调整？",
                    ingredients: [
                        Ingredient(name: "水", unit: "杯", baseAmount: 3, icon: "💧"),
                        Ingredient(name: "肥料", unit: "勺", baseAmount: 2, icon: "🌿"),
                        Ingredient(name: "营养粉", unit: "勺", baseAmount: 1, icon: "✨"),
                        Ingredient(name: "阳光精华", unit: "滴", baseAmount: 4, icon: "☀️")
                    ],
                    constraint: "提示：这次要放大 3 倍哦！",
                    effectiveTarget: 9
                )
            ]
        ),
        Level(
            id: 3,
            title: "音乐节拍",
            baseServings: 4,
            targetServings: 2,
            factor: 0.5,
            buildingId: "music",
            mathTip: "比例可以放大，也可以缩小。缩小的时候，所有材料要一起变小。",
            variants: [
                .easy: LevelVariant(
                    story: "一段音乐原长 4 拍。现在要做成 2 拍的简短版，各乐器响几次？",
                    ingredients: [
                        Ingredient(name: "鼓声", unit: "次", baseAmount: 4, icon: "🥁"),
                        Ingredient(name: "铃声", unit: "次", baseAmount: 2, icon: "🛎️")
                    ],
                    constraint: nil,
                    effectiveTarget: 2
                ),
                .standard: LevelVariant(
                    story: "一段音乐原长 4 拍。现在要做成 2 拍的简短版，各乐器响几次？",
                    ingredients: [
                        Ingredient(name: "鼓声", unit: "次", baseAmount: 4, icon: "🥁"),
                        Ingredient(name: "铃声", unit: "次", baseAmount: 2, icon: "🛎️"),
                        Ingredient(name: "拍手", unit: "次", baseAmount: 6, icon: "👏"),
                        Ingredient(name: "哨声", unit: "次", baseAmount: 2, icon: "📢")
                    ],
                    constraint: nil,
                    effectiveTarget: 2
                ),
                .hard: LevelVariant(
                    story: "一段音乐原长 4 拍。现在要做成 1 拍的超短版，各乐器响几次？",
                    ingredients: [
                        Ingredient(name: "鼓声", unit: "次", baseAmount: 4, icon: "🥁"),
                        Ingredient(name: "铃声", unit: "次", baseAmount: 2, icon: "🛎️"),
                        Ingredient(name: "拍手", unit: "次", baseAmount: 6, icon: "👏"),
                        Ingredient(name: "哨声", unit: "次", baseAmount: 2, icon: "📢")
                    ],
                    constraint: "提示：这次要缩小到 1/4 哦！",
                    effectiveTarget: 1
                )
            ]
        ),
        Level(
            id: 4,
            title: "魔法药水",
            baseServings: 2,
            targetServings: 8,
            factor: 4.0,
            buildingId: "potion",
            mathTip: "材料越多，越要仔细检查每一种是不是都乘了同一个数。",
            variants: [
                .easy: LevelVariant(
                    story: "魔法药水原配方是 2 瓶的量。现在要配 8 瓶，材料怎么变？",
                    ingredients: [
                        Ingredient(name: "星尘", unit: "勺", baseAmount: 2, icon: "⭐"),
                        Ingredient(name: "月光露", unit: "滴", baseAmount: 4, icon: "🌙")
                    ],
                    constraint: nil,
                    effectiveTarget: 8
                ),
                .standard: LevelVariant(
                    story: "魔法药水原配方是 2 瓶的量。现在要配 8 瓶，材料怎么变？",
                    ingredients: [
                        Ingredient(name: "星尘", unit: "勺", baseAmount: 1, icon: "⭐"),
                        Ingredient(name: "月光露", unit: "滴", baseAmount: 2, icon: "🌙"),
                        Ingredient(name: "彩虹粉", unit: "勺", baseAmount: 2, icon: "🌈"),
                        Ingredient(name: "龙鳞", unit: "片", baseAmount: 2, icon: "🐉"),
                        Ingredient(name: "凤凰泪", unit: "滴", baseAmount: 3, icon: "🔥")
                    ],
                    constraint: nil,
                    effectiveTarget: 8
                ),
                .hard: LevelVariant(
                    story: "魔法药水原配方是 2 瓶的量。现在要配 10 瓶，材料怎么变？",
                    ingredients: [
                        Ingredient(name: "星尘", unit: "勺", baseAmount: 1, icon: "⭐"),
                        Ingredient(name: "月光露", unit: "滴", baseAmount: 2, icon: "🌙"),
                        Ingredient(name: "彩虹粉", unit: "勺", baseAmount: 2, icon: "🌈"),
                        Ingredient(name: "龙鳞", unit: "片", baseAmount: 2, icon: "🐉"),
                        Ingredient(name: "凤凰泪", unit: "滴", baseAmount: 3, icon: "🔥")
                    ],
                    constraint: "提示：10 ÷ 2 = 5 倍哦！",
                    effectiveTarget: 10
                )
            ]
        )
    ]
    
    var currentLevel: Level { levels[state.currentLevel] }
    var currentVariant: LevelVariant { currentLevel.variant(for: state.currentDifficulty) }
    var effectiveFactor: Double { Double(currentVariant.effectiveTarget) / Double(currentLevel.baseServings) }
    
    init() {
        loadLevel(0)
    }
    
    func loadLevel(_ index: Int) {
        guard index >= 0 && index < levels.count else { return }
        state.currentLevel = index
        state.currentAmounts = currentVariant.ingredients.map { $0.baseAmount }
    }
    
    func setDifficulty(_ difficulty: Difficulty) {
        soundManager.playClick()
        state.currentDifficulty = difficulty
        loadLevel(state.currentLevel)
    }
    
    func switchTab(_ tab: AppTab) {
        soundManager.playClick()
        selectedTab = tab
    }
    
    func changeAmount(at index: Int, delta: Int) {
        soundManager.playClick()
        let newValue = state.currentAmounts[index] + delta
        guard newValue >= 0 && newValue <= 50 else {
            soundManager.playWrong()
            return
        }
        state.currentAmounts[index] = newValue
        checkIngredient(at: index)
    }
    
    private func checkIngredient(at index: Int) {
        let expected = Int(Double(currentVariant.ingredients[index].baseAmount) * effectiveFactor)
        if state.currentAmounts[index] == expected {
            soundManager.playCorrect()
        }
    }
    
    func checkAnswer() {
        var errors: [String] = []
        var allCorrect = true
        
        for (index, ingredient) in currentVariant.ingredients.enumerated() {
            let expected = Int(Double(ingredient.baseAmount) * effectiveFactor)
            if state.currentAmounts[index] != expected {
                allCorrect = false
                let diff = state.currentAmounts[index] - expected
                if diff > 0 {
                    errors.append("\(ingredient.name) 太多了，应该减少 \(diff) \(ingredient.unit)")
                } else {
                    errors.append("\(ingredient.name) 太少了，应该增加 \(abs(diff)) \(ingredient.unit)")
                }
            }
        }
        
        if allCorrect {
            soundManager.playSuccess()
            handleSuccess()
        } else {
            soundManager.playWrong()
            modalErrors = errors
            modalType = .failure
            showModal = true
        }
    }
    
    private func handleSuccess() {
        state.completedLevels.insert(state.currentLevel)
        
        let building = buildings.first { $0.level == state.currentLevel }
        newlyUnlockedBuilding = building
        if let building = building {
            state.unlockedBuildings.insert(building.id)
        }
        
        modalType = .success
        showModal = true
    }
    
    func nextLevel() {
        soundManager.playClick()
        showModal = false
        if state.currentLevel < levels.count - 1 {
            soundManager.playLevelUp()
            loadLevel(state.currentLevel + 1)
        }
    }
    
    func restartGame() {
        soundManager.playClick()
        showModal = false
        state = GameState()
        state.currentDifficulty = .standard
        loadLevel(0)
    }
    
    func goToTown() {
        soundManager.playClick()
        showModal = false
        selectedTab = .town
    }
    
    func closeModal() {
        soundManager.playClick()
        showModal = false
    }
    
    func targetIcon() -> String {
        switch currentLevel.id {
        case 2: return "🌻"
        case 3: return "🎵"
        case 4: return "🔮"
        default: return "👧"
        }
    }
    
    func actionButtonTitle() -> String {
        switch currentLevel.id {
        case 3: return "🎵 开始演奏"
        case 4: return "🔮 开始配制"
        default: return "🔥 开始烘焙"
        }
    }
    
    func successTitle() -> String {
        switch currentLevel.id {
        case 3: return "演奏成功！"
        case 4: return "药水配好了！"
        default: return "蛋糕烤好啦！"
        }
    }
    
    func successIcon() -> String {
        switch currentLevel.id {
        case 3: return "🎵"
        case 4: return "🔮"
        default: return "🎂"
        }
    }
    
    func failureTitle() -> String {
        switch currentLevel.id {
        case 3: return "节奏不太对"
        case 4: return "药水比例不对"
        default: return "再想想看"
        }
    }
    
    func successMessage() -> String {
        let target = currentVariant.effectiveTarget
        let base = currentLevel.baseServings
        let factor = effectiveFactor
        
        if currentLevel.id == 3 {
            return "\(target) ÷ \(base) = \(formatFactor(factor))，所有乐器都乘以/除以了 \(formatFactor(factor))！"
        } else if currentLevel.id == 4 {
            return "\(target) ÷ \(base) = \(formatFactor(factor))，药水比例完美！"
        } else {
            return "\(target) ÷ \(base) = \(formatFactor(factor))，所以每种材料都乘以/除以了 \(formatFactor(factor))！"
        }
    }
    
    func formatFactor(_ factor: Double) -> String {
        if factor == floor(factor) {
            return String(format: "%.0f", factor)
        } else {
            return String(format: "%.2f", factor)
        }
    }
}

enum AppTab {
    case bakery
    case town
}

enum ModalType {
    case success
    case failure
}
