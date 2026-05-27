// Scaffold-only placeholder for the future Lekh Windows TSF text service.
// This file is not a production IME and is not wired into npm verification.

#ifdef _WIN32
#include <windows.h>
#include <msctf.h>
#endif

namespace lekh {

constexpr wchar_t kDummyCandidate[] = L"\u0915";
constexpr wchar_t kPerUserPipeName[] = L"\\\\.\\pipe\\LekhKeyboard-${USER-SID}";
constexpr unsigned int kHotPathTimeoutMs = 50;

enum class DaemonStatus {
  Available,
  Unavailable
};

struct KeyHandlingDecision {
  bool handled;
  bool shouldStartComposition;
  bool shouldCommitDummy;
  bool shouldCancel;
  bool shouldPassThrough;
};

KeyHandlingDecision handleFeasibilityKey(wchar_t key, DaemonStatus daemonStatus) {
  if (daemonStatus == DaemonStatus::Unavailable) {
    return {false, false, false, false, true};
  }
  if (key == L'k' || key == L'K') {
    return {true, true, false, false, false};
  }
  if (key == L'\r') {
    return {true, false, true, false, false};
  }
  if (key == 0x1b) {
    return {true, false, false, true, false};
  }
  return {false, false, false, false, true};
}

struct IpcRequestEnvelope {
  const wchar_t* type;
  const wchar_t* sessionId;
  unsigned int timeoutMs;
};

IpcRequestEnvelope makeProcessKeyStrokeRequest(const wchar_t* sessionId) {
  return {L"session.processKeyStroke", sessionId, kHotPathTimeoutMs};
}

} // namespace lekh
