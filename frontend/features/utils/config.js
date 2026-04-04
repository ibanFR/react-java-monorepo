export function appBaseUrl() {
  // Override APP_BASE_URL to change host/port when running parallel jobs.
  return process.env.APP_BASE_URL ?? 'http://127.0.0.1:4173'
}

export function isHeadless() {
  return process.env.PW_HEADLESS !== 'false'
}
