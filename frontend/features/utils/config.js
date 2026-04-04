export const NAVIGATION_TIMEOUT_MS = 30_000
export const CUCUMBER_STEP_TIMEOUT_MS = 60_000

export function appBaseUrl() {
  // Override APP_BASE_URL to change host/port when running parallel jobs.
  return process.env.APP_BASE_URL ?? 'http://127.0.0.1:4173'
}

export function isHeadless() {
  return process.env.PW_HEADLESS !== 'false'
}
