import Foundation

enum Difficulty: String, CaseIterable, Identifiable {
    case easy = "easy"
    case standard = "standard"
    case hard = "hard"
    
    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .easy: return "⭐ 简单"
        case .standard: return "⭐⭐ 标准"
        case .hard: return "⭐⭐⭐ 挑战"
        }
    }
    
    var starCount: Int {
        switch self {
        case .easy: return 1
        case .standard: return 2
        case .hard: return 3
        }
    }
}

struct Ingredient: Identifiable, Equatable {
    let id = UUID()
    let name: String
    let unit: String
    let baseAmount: Int
    let icon: String
}

struct LevelVariant: Identifiable, Equatable {
    let id = UUID()
    let story: String
    let ingredients: [Ingredient]
    let constraint: String?
    let effectiveTarget: Int
}

struct Level: Identifiable, Equatable {
    let id: Int
    let title: String
    let baseServings: Int
    let targetServings: Int
    let factor: Double
    let buildingId: String
    let mathTip: String
    let variants: [Difficulty: LevelVariant]
    
    func variant(for difficulty: Difficulty) -> LevelVariant {
        variants[difficulty] ?? variants[.standard]!
    }
}

struct Building: Identifiable, Equatable {
    let id: String
    let name: String
    let icon: String
    let level: Int
    let description: String
}

struct GameState {
    var currentLevel: Int = 0
    var currentDifficulty: Difficulty = .standard
    var currentAmounts: [Int] = []
    var completedLevels: Set<Int> = []
    var unlockedBuildings: Set<String> = ["bakery"]
}
