#pragma once
#include <string>
#include <functional>
#include <memory>
#include <vector>

namespace SecureConnect {

    struct Message {
        std::string sender;
        std::string text;
        long long timestamp;
        bool isCallLog;
    };

    class NetworkManager {
    public:
        NetworkManager();
        ~NetworkManager();

        // Non-copyable for memory safety (Pro-level architectural guard)
        NetworkManager(const NetworkManager&) = delete;
        NetworkManager& operator=(const NetworkManager&) = delete;

        // Core Authentication System
        void registerUser(const std::string& userId, const std::string& password, 
                          std::function<void(bool success, const std::string& error)> callback);
                          
        void loginUser(const std::string& userId, const std::string& password, 
                       std::function<void(bool success, const std::string& error)> callback);

        // Strict Searching & Chat Creation
        void verifyAndStartChat(const std::string& currentUserId, const std::string& targetUserId, 
                                std::function<void(bool exists, bool isBlocked)> callback);

        // Real-time Two-Way Chat Sync
        void sendMessage(const std::string& roomId, const std::string& senderId, const std::string& text, bool isCallLog = false);
        void listenForMessages(const std::string& roomId, std::function<void(const Message& msg)> onNewMessage);

        // Strict Block System
        void toggleBlockUser(const std::string& currentUserId, const std::string& targetUserId, bool blockState);

    private:
        std::string m_currentRoomId;
        // Qt Network components or standard socket descriptors can be safely attached here
    };
}
