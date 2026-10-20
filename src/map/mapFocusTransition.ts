import type { Map as MapLibreMap } from 'maplibre-gl'

type FocusTransition = {
  readonly action: () => void
  readonly waitForPanel: boolean
  readonly clear: () => void
}

const activeFocus = new WeakMap<MapLibreMap, FocusTransition>()

/** Preserve a selection target while its flight or newly opened panel settles. */
export function runMapFocus(
  map: MapLibreMap,
  action: () => void,
  waitForPanel = false,
): void {
  activeFocus.get(map)?.clear()
  action()
  const awaitingPanel =
    waitForPanel &&
    Object.values(map.getPadding()).every((value) => value === 0)
  if (!map.isMoving() && !awaitingPanel) return

  // Reduced-motion focus can finish before the selected inspector mounts.
  // Any subsequent camera navigation cancels that pending layout intention.
  const completionEvent = awaitingPanel ? 'movestart' : 'moveend'
  const transition: FocusTransition = {
    action,
    waitForPanel,
    clear: () => {
      if (activeFocus.get(map) === transition) activeFocus.delete(map)
      map.off(completionEvent, transition.clear)
      map.off('remove', transition.clear)
    },
  }
  activeFocus.set(map, transition)
  map.on(completionEvent, transition.clear)
  map.on('remove', transition.clear)
}

/** Capture before setPadding, whose jumpTo cancels the previous camera action. */
export function captureMapFocus(map: MapLibreMap): (() => void) | undefined {
  const transition = activeFocus.get(map)
  return transition
    ? () => runMapFocus(map, transition.action, transition.waitForPanel)
    : undefined
}
