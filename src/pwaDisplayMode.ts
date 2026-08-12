/** Marks installed / standalone display so CSS can clear gesture / home bars. */
export function syncPwaStandaloneClass() {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  const standalone =
    nav.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches

  document.documentElement.classList.toggle('pwa-standalone', standalone)
}

export function initPwaStandaloneDetection() {
  syncPwaStandaloneClass()

  const displayModes = [
    '(display-mode: standalone)',
    '(display-mode: fullscreen)',
    '(display-mode: minimal-ui)',
  ] as const

  for (const query of displayModes) {
    window
      .matchMedia(query)
      .addEventListener('change', syncPwaStandaloneClass)
  }
}
