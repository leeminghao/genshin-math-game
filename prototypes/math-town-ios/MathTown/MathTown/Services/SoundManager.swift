import Foundation
import AVFoundation

class SoundManager: ObservableObject {
    @Published var isEnabled = true
    
    private var audioEngine: AVAudioEngine?
    private var playerNodes: [AVAudioPlayerNode] = []
    
    init() {
        setupAudioEngine()
    }
    
    private func setupAudioEngine() {
        audioEngine = AVAudioEngine()
        do {
            try audioEngine?.start()
        } catch {
            print("Audio engine failed to start: \(error)")
        }
    }
    
    private func playTone(frequency: Double, duration: Double, type: ToneType = .sine, volume: Float = 0.3) {
        guard isEnabled, let engine = audioEngine else { return }
        
        let player = AVAudioPlayerNode()
        let format = engine.mainMixerNode.outputFormat(forBus: 0)
        engine.attach(player)
        engine.connect(player, to: engine.mainMixerNode, format: format)
        playerNodes.append(player)
        
        let sampleRate = format.sampleRate
        let totalSamples = AVAudioFrameCount(sampleRate * duration)
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: totalSamples) else { return }
        buffer.frameLength = totalSamples
        
        let data = buffer.floatChannelData?[0]
        for i in 0..<Int(totalSamples) {
            let time = Double(i) / sampleRate
            let value = type.value(at: time, frequency: frequency) * Double(volume)
            let envelope = exp(-time * 5.0)
            data?[i] = Float(value * envelope)
        }
        
        player.scheduleBuffer(buffer, at: nil, options: .completionHandler) { [weak self] in
            DispatchQueue.main.async {
                self?.playerNodes.removeAll { $0 == player }
                engine.detach(player)
            }
        }
        player.play()
    }
    
    func playClick() {
        playTone(frequency: 800, duration: 0.08, type: .sine, volume: 0.2)
    }
    
    func playCorrect() {
        playTone(frequency: 880, duration: 0.1, type: .sine, volume: 0.25)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.08) { [weak self] in
            self?.playTone(frequency: 1175, duration: 0.15, type: .sine, volume: 0.25)
        }
    }
    
    func playWrong() {
        playTone(frequency: 200, duration: 0.25, type: .triangle, volume: 0.3)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.12) { [weak self] in
            self?.playTone(frequency: 150, duration: 0.3, type: .triangle, volume: 0.3)
        }
    }
    
    func playSuccess() {
        let notes = [523.0, 659.0, 784.0, 1047.0]
        for (index, freq) in notes.enumerated() {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(index) * 0.12) { [weak self] in
                self?.playTone(frequency: freq, duration: 0.2, type: .sine, volume: 0.25)
            }
        }
    }
    
    func playLevelUp() {
        playTone(frequency: 523, duration: 0.15, type: .sine, volume: 0.25)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self] in
            self?.playTone(frequency: 659, duration: 0.15, type: .sine, volume: 0.25)
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
            self?.playTone(frequency: 784, duration: 0.3, type: .sine, volume: 0.3)
        }
    }
    
    func playUnlock() {
        let notes = [392.0, 523.0, 659.0, 784.0, 1047.0]
        for (index, freq) in notes.enumerated() {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(index) * 0.1) { [weak self] in
                self?.playTone(frequency: freq, duration: 0.15, type: .triangle, volume: 0.2)
            }
        }
    }
}

enum ToneType {
    case sine
    case triangle
    
    func value(at time: Double, frequency: Double) -> Double {
        switch self {
        case .sine:
            return sin(2.0 * .pi * frequency * time)
        case .triangle:
            let period = 1.0 / frequency
            let t = time.truncatingRemainder(dividingBy: period)
            let normalized = t / period
            if normalized < 0.25 {
                return 4.0 * normalized
            } else if normalized < 0.75 {
                return 2.0 - 4.0 * normalized
            } else {
                return -4.0 + 4.0 * normalized
            }
        }
    }
}
