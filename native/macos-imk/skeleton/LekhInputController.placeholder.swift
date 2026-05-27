// Scaffold-only placeholder for the future Lekh macOS InputMethodKit controller.
// This file is not a production input method and is not wired into npm verification.

import Foundation

public enum LekhXpcStatus {
  case available
  case unavailable
}

public struct LekhInputDecision {
  public let handled: Bool
  public let committedText: String?
  public let shouldPassThrough: Bool
}

public final class LekhInputControllerPlaceholder {
  public init() {}

  public func handleFeasibilityKey(_ key: String, xpcStatus: LekhXpcStatus) -> LekhInputDecision {
    guard xpcStatus == .available else {
      return LekhInputDecision(handled: false, committedText: nil, shouldPassThrough: true)
    }

    if key == "k" || key == "K" {
      return LekhInputDecision(handled: true, committedText: "क", shouldPassThrough: false)
    }

    return LekhInputDecision(handled: false, committedText: nil, shouldPassThrough: true)
  }
}
