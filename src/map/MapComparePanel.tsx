import React from 'react'
import { Button, Form } from 'react-bootstrap'
import type { HistoricalMapOverlay } from './historicalOverlays'
import {
  type ComparisonMode,
  type ComparisonSide,
  type ComparisonState,
  BLEND_KEYBOARD_STEP,
  isComparisonReady,
  sideLabel,
} from './mapComparison'

interface Props {
  readonly overlays: readonly HistoricalMapOverlay[]
  readonly comparison: ComparisonState
  readonly onModeChange: (mode: ComparisonMode) => void
  readonly onSideChange: (
    side: ComparisonSide,
    overlayId: string | null,
  ) => void
  readonly onPositionChange: (position: number) => void
  readonly onToggleSolo: (side: ComparisonSide) => void
}

function SideSelect({
  side,
  comparison,
  overlays,
  onSideChange,
}: Pick<Props, 'comparison' | 'overlays' | 'onSideChange'> & {
  readonly side: ComparisonSide
}): JSX.Element {
  const value =
    (side === 'left' ? comparison.leftOverlayId : comparison.rightOverlayId) ??
    ''

  return (
    <Form.Group controlId={`map-compare-${side}`}>
      <Form.Label>{sideLabel(comparison, side)}</Form.Label>
      <Form.Control
        as="select"
        value={value}
        onChange={(event) =>
          onSideChange(
            side,
            event.target.value === '' ? null : event.target.value,
          )
        }
      >
        <option value="">Base map</option>
        {overlays.map((overlay) => (
          <option key={overlay.id} value={overlay.id}>
            {overlay.shortTitle ?? overlay.title}
          </option>
        ))}
      </Form.Control>
    </Form.Group>
  )
}

export default function MapComparePanel({
  overlays,
  comparison,
  onModeChange,
  onSideChange,
  onPositionChange,
  onToggleSolo,
}: Props): JSX.Element {
  return (
    <div className="map-tool-panel">
      <Form.Group controlId="map-compare-mode">
        <Form.Label>Comparison</Form.Label>
        <Form.Control
          as="select"
          value={comparison.mode}
          onChange={(event) =>
            onModeChange(event.target.value as ComparisonMode)
          }
        >
          <option value="off">Off</option>
          <option value="opacity">Cross-fade</option>
        </Form.Control>
      </Form.Group>
      {comparison.mode === 'off' ? null : (
        <>
          <SideSelect
            side="left"
            comparison={comparison}
            overlays={overlays}
            onSideChange={onSideChange}
          />
          <SideSelect
            side="right"
            comparison={comparison}
            overlays={overlays}
            onSideChange={onSideChange}
          />
          <Form.Group controlId="map-compare-position">
            <Form.Label>Cross-fade between left and right</Form.Label>
            <Form.Control
              type="range"
              min={0}
              max={1}
              step={BLEND_KEYBOARD_STEP}
              value={comparison.blendPosition}
              aria-valuetext={`${Math.round(comparison.blendPosition * 100)}% right`}
              onChange={(event) => onPositionChange(Number(event.target.value))}
            />
          </Form.Group>
          <div className="map-tool-panel__actions">
            <Button
              type="button"
              size="sm"
              variant={
                comparison.soloSide === 'left'
                  ? 'secondary'
                  : 'outline-secondary'
              }
              aria-pressed={comparison.soloSide === 'left'}
              onClick={() => onToggleSolo('left')}
            >
              Solo left
            </Button>
            <Button
              type="button"
              size="sm"
              variant={
                comparison.soloSide === 'right'
                  ? 'secondary'
                  : 'outline-secondary'
              }
              aria-pressed={comparison.soloSide === 'right'}
              onClick={() => onToggleSolo('right')}
            >
              Solo right
            </Button>
          </div>
          {isComparisonReady(comparison) ? null : (
            <p className="map-tool-panel__status" role="status">
              Choose two different layers to compare.
            </p>
          )}
        </>
      )}
    </div>
  )
}
