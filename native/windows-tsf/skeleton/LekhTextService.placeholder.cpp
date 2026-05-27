// Scaffold-only placeholder for the future Lekh Windows TSF text service.
// This file is not a production IME and is not wired into npm verification.

#ifdef _WIN32
#include <windows.h>
#include <msctf.h>
#endif

namespace lekh {

constexpr wchar_t kDummyCandidate[] = L"\u0915";

enum class DaemonStatus {
  Available,
  Unavailable
};

struct KeyHandlingDecision {
  bool handled;
  bool shouldCommitDummy;
  bool shouldPassThrough;
};

KeyHandlingDecision handleFeasibilityKey(wchar_t key, DaemonStatus daemonStatus) {
  if (daemonStatus == DaemonStatus::Unavailable) {
    return {false, false, true};
  }
  if (key == L'k' || key == L'K') {
    return {true, true, false};
  }
  return {false, false, true};
}

} // namespace lekh
