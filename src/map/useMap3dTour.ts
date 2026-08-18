import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import prefersReducedMotion from 'common/utils/prefersReducedMotion'
import { fitMapToBoundingBox } from './mapCamera'
import { type TourInput, type TourStep, buildTourSteps } from './map3dTour'

export interface Map3dTour {
  readonly steps: readonly TourStep[]
  readonly isRunning: boolean
  readonly index: number
  readonly canStart: boolean
  readonly start: () => void
  readonly next: () => void
  readonly previous: () => void
  readonly exit: () => void
}

const TOUR_DURATION_MS = 2200
const TOUR_PADDING = 64

function applyStep(
  map: MapLibreMap,
  step: TourStep,
  isReducedMotion: boolean,
): void {
  fitMapToBoundingBox(map, step.bounds, {
    padding: TOUR_PADDING,
    maxZoom: step.maxZoom,
    pitch: step.pitch,
    duration: isReducedMotion ? 0 : TOUR_DURATION_MS,
  })
}

/**
 * A camera sequence and nothing else. It never changes selection, overlays,
 * terrain or the visualization mode, it creates no second map, and its progress
 * is deliberately absent from the URL — a shared link should restore a view,
 * not restart someone else's presentation.
 */
export default function useMap3dTour(
  mapRef: MutableRefObject<MapLibreMap | null>,
  input: TourInput,
): Map3dTour {
  const [index, setIndex] = useState<number | null>(null)
  const steps = useMemo(() => buildTourSteps(input), [input])
  const isRunning = index !== null

  const goTo = useCallback(
    (nextIndex: number) => {
      const step = steps[nextIndex]
      const map = mapRef.current
      if (!step || map === null) return

      setIndex(nextIndex)
      applyStep(map, step, prefersReducedMotion())
    },
    [mapRef, steps],
  )

  const exit = useCallback(() => setIndex(null), [])

  useEffect(() => {
    if (!isRunning) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') exit()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isRunning, exit])

  // A deliberate drag or wheel means the reader has taken the camera back.
  useEffect(() => {
    const map = mapRef.current
    if (!isRunning || map === null) return

    const cancel = (): void => exit()
    map.on('dragstart', cancel)
    map.on('wheel', cancel)

    return () => {
      map.off('dragstart', cancel)
      map.off('wheel', cancel)
    }
  }, [mapRef, isRunning, exit])

  useEffect(() => {
    if (steps.length === 0) setIndex(null)
  }, [steps])

  return {
    steps,
    isRunning,
    index: index ?? 0,
    canStart: steps.length > 0,
    start: useCallback(() => goTo(0), [goTo]),
    next: useCallback(
      () => goTo(Math.min((index ?? 0) + 1, steps.length - 1)),
      [goTo, index, steps.length],
    ),
    previous: useCallback(
      () => goTo(Math.max((index ?? 0) - 1, 0)),
      [goTo, index],
    ),
    exit,
  }
}
