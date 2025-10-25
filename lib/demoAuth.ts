let demoAuth = false

export function setDemoAuth(value: boolean) {
  demoAuth = !!value
}

export function isDemoAuth() {
  return demoAuth
}

export default {
  setDemoAuth,
  isDemoAuth,
}
