import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react'
import type { Position } from 'geojson'
import type { SpatialSearchShape } from 'map/spatialSearch'

export interface SpatialSearchDrawingRefs {
  readonly shape: MutableRefObject<SpatialSearchShape | null>
  readonly isDrawing: MutableRefObject<boolean>
  readonly drawStart: MutableRefObject<Position | null>
  readonly isActive: MutableRefObject<boolean>
}

export interface SpatialSearchDrawingStore {
  readonly shape: SpatialSearchShape | null
  readonly isDrawing: boolean
  readonly drawStart: Position | null
  readonly validationMessage: string | null
  readonly refs: SpatialSearchDrawingRefs
  readonly replaceShape: (next: SpatialSearchShape | null) => void
  readonly replaceDrawing: (next: boolean) => void
  readonly replaceDrawStart: (next: Position | null) => void
  readonly setValidationMessage: Dispatch<SetStateAction<string | null>>
}

export default function useSpatialSearchDrawingState(
  isActive: boolean,
): SpatialSearchDrawingStore {
  const [shape, setShape] = useState<SpatialSearchShape | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<Position | null>(null)
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  )
  const shapeRef = useRef(shape)
  const isDrawingRef = useRef(isDrawing)
  const drawStartRef = useRef(drawStart)
  const isActiveRef = useRef(isActive)
  shapeRef.current = shape
  isDrawingRef.current = isDrawing
  drawStartRef.current = drawStart
  isActiveRef.current = isActive
  const refs = useMemo(
    () => ({
      shape: shapeRef,
      isDrawing: isDrawingRef,
      drawStart: drawStartRef,
      isActive: isActiveRef,
    }),
    [],
  )

  const replaceShape = useCallback((next: SpatialSearchShape | null): void => {
    shapeRef.current = next
    setShape(next)
  }, [])
  const replaceDrawing = useCallback((next: boolean): void => {
    isDrawingRef.current = next
    setIsDrawing(next)
  }, [])
  const replaceDrawStart = useCallback((next: Position | null): void => {
    drawStartRef.current = next
    setDrawStart(next)
  }, [])

  return {
    shape,
    isDrawing,
    drawStart,
    validationMessage,
    refs,
    replaceShape,
    replaceDrawing,
    replaceDrawStart,
    setValidationMessage,
  }
}
