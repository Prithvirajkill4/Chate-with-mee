#pragma once
#include <string>
#include <memory>

namespace SecureConnect {

    class AudioManager {
    public:
        AudioManager();
        ~AudioManager();

        // Prevent copying for system thread architecture integrity
        AudioManager(const AudioManager&) = delete;
        AudioManager& operator=(const AudioManager&) = delete;

        // Core Low-Latency Native Audio Controls
        bool initializeAudioHardware();
        void startOutgoingRingSound();
        void stopAllRingtones();
        
        // WebRTC Native Pipeline Connection
        void establishVoiceSession(const std::string& callRoomId, const std::string& localUserId);
        void toggleMicrophoneMute(bool muteState);
        void terminateVoiceSession();

    private:
        bool m_isAudioHardwareReady;
        bool m_isMuted;
        unsigned int m_sampleRate; // Standardized to 48000Hz for high fidelity voice
    };
}
