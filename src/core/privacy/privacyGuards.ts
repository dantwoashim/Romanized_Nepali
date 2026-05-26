export function canSubmitExplicitFeedback(actionConfirmed: boolean): boolean {
  return actionConfirmed;
}

export function assertNoAutomaticTextTransport(url: string): void {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.startsWith("http://") || lowerUrl.startsWith("https://")) {
    throw new Error("Text-processing network transport is not allowed in current build.");
  }
}
