/**
 * Safely tracks a custom event to Google Analytics (GA4) if loaded on the client side.
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", eventName, params);
    }
  } catch (err) {
    console.warn("Failed to track event with Google Analytics:", err);
  }
};
