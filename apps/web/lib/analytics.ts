declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

export function trackEvent(
  event: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params)
  }
}

export function setUserProperties(props: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.gtag && process.env.NEXT_PUBLIC_GA_ID) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, { user_properties: props })
  }
}
