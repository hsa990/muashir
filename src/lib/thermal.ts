/** Colour at a point on the thermal gradient, from 0 (teal) to 1 (ember). */
export function thermalAt(share: number) {
  return share < 0.55
    ? `color-mix(in srgb, var(--amber) ${(share / 0.55) * 100}%, var(--teal))`
    : `color-mix(in srgb, var(--ember) ${((share - 0.55) / 0.45) * 100}%, var(--amber))`
}

/** Warms an element and everything inside it. Defaults to the whole page. */
export function setHeat(share: number, element: HTMLElement = document.documentElement) {
  element.style.setProperty('--heat', String(share))
  element.style.setProperty('--heat-colour', thermalAt(share))
}
