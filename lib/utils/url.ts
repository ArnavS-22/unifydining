/**
 * Gets the base URL for the application without relying on any environment variables
 */
export function getBaseUrl(): string {
  // Client-side: Use the browser's URL
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // Server-side: We'll use a relative URL approach
  // This will make the API calls relative to wherever the app is hosted
  return ""
}
