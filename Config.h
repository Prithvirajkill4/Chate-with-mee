#pragma once
#include <string>

namespace SecureConnect {
    // Firebase Database Configuration
    const std::string FIREBASE_URL = "https://privateconnect-37f5b-default-rtdb.asia-southeast1.firebasedatabase.app/";
    const std::string API_KEY = "AIzaSyB2o5DXG0r249JfueFAL7ybXiDspUdW0Ns";

    // Application States
    enum class AppState {
        LoggedOut,
        Dashboard,
        InChat,
        InAudioCall
    };
}
