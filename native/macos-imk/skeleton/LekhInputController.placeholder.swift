// Scaffold-only placeholder for the future Lekh macOS InputMethodKit controller.
// This file is not a production input method and is not wired into npm verification.

import Foundation

public let lekhXpcServiceName = "com.lekh.keyboard.EngineXPC"
public let lekhHotPathTimeoutMilliseconds = 50

public enum LekhXpcStatus {
  case available
  case unavailable
  case timedOut
}

public struct LekhInputDecision {
  public let handled: Bool
  public let shouldSetMarkedText: Bool
  public let committedText: String?
  public let shouldCancel: Bool
  public let shouldPassThrough: Bool
}

public struct LekhXpcRequestEnvelope {
  public let type: String
  public let sessionId: String
  public let timeoutMilliseconds: Int
}

public final class LekhInputControllerPlaceholder {
  public init() {}

  public func handleFeasibilityKey(_ key: String, xpcStatus: LekhXpcStatus) -> LekhInputDecision {
    guard xpcStatus == .available else {
      return LekhInputDecision(handled: false, shouldSetMarkedText: false, committedText: nil, shouldCancel: false, shouldPassThrough: true)
    }

    if key == "k" || key == "K" {
      return LekhInputDecision(handled: true, shouldSetMarkedText: true, committedText: nil, shouldCancel: false, shouldPassThrough: false)
    }

    if key == "\r" {
      return LekhInputDecision(handled: true, shouldSetMarkedText: false, committedText: "क", shouldCancel: false, shouldPassThrough: false)
    }

    if key == "\u{1b}" {
      return LekhInputDecision(handled: true, shouldSetMarkedText: false, committedText: nil, shouldCancel: true, shouldPassThrough: false)
    }

    return LekhInputDecision(handled: false, shouldSetMarkedText: false, committedText: nil, shouldCancel: false, shouldPassThrough: true)
  }

  public func makeProcessKeyStrokeRequest(sessionId: String) -> LekhXpcRequestEnvelope {
    LekhXpcRequestEnvelope(
      type: "session.processKeyStroke",
      sessionId: sessionId,
      timeoutMilliseconds: lekhHotPathTimeoutMilliseconds
    )
  }
}
