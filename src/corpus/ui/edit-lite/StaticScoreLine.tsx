import React, { useCallback, useEffect, useRef } from 'react'
import { Button } from 'react-bootstrap'
import _ from 'lodash'
import useNearViewport from 'common/hooks/useNearViewport'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { isLineDirty } from 'corpus/ui/edit-lite/editLiteReducer'
import { LineState } from 'corpus/ui/edit-lite/editLiteState'
import LineEditContainer from 'corpus/ui/edit-lite/LineEditContainer'
import { countManuscriptLines } from 'corpus/ui/edit-lite/lineSummary'
import StaticScoreContent, {
  SiglumLookup,
  splitRows,
} from 'corpus/ui/edit-lite/StaticScoreContent'
import 'corpus/ui/edit-lite/edit-lite.sass'
import 'corpus/ui/edit-lite/StaticScoreLine.sass'

interface Props {
  readonly line: LineOutline
  readonly lineState: LineState | undefined
  readonly sigla: SiglumLookup
  readonly isEditing: boolean
  readonly onEdit: (index: number) => void
  readonly onDone: (index: number) => void
  readonly onRetry: () => void
}

export const nearViewportMargin = '600px'
export const scoreChunkSize = 10
export const retryHint = 'Select the line to try again.'
const estimatedRowHeight = 1.3
const estimatedPadding = 0.8

export function estimateScoreLineHeight(line: LineOutline): string {
  const rowCount =
    splitRows(line.translation).length +
    _.sumBy(
      line.variants,
      (variant) => splitRows(variant.reconstruction).length,
    ) +
    countManuscriptLines(line)
  const height = Math.max(rowCount, 1) * estimatedRowHeight + estimatedPadding
  return `${_.round(height, 2)}rem`
}

function hasSelectedText(): boolean {
  return window.getSelection()?.isCollapsed === false
}

export function isLoadFailed(lineState: LineState | undefined): boolean {
  return lineState?.status === 'failed' && lineState.draft === null
}

function describeFailure(lineState: LineState | undefined): string | null {
  if (lineState?.status !== 'failed') {
    return null
  }
  return isLoadFailed(lineState)
    ? `${lineState.error}\n${retryHint}`
    : lineState.error
}

function StaticScoreLine({
  line,
  lineState,
  sigla,
  isEditing,
  onEdit,
  onDone,
  onRetry,
}: Props): JSX.Element {
  const { actions } = useEditLiteContext()
  const { containerRef, isNearViewport } = useNearViewport(nearViewportMargin)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const doneRef = useRef<HTMLButtonElement>(null)
  const wasEditingRef = useRef<boolean>(isEditing)
  const index = line.index
  const draft = lineState?.draft ?? null
  const number = draft?.number ?? line.number
  const isDirty = isLineDirty(lineState)
  const activate = (): void =>
    isLoadFailed(lineState) ? onRetry() : onEdit(index)
  const setRoot = useCallback(
    (element: HTMLDivElement | null): void => {
      rootRef.current = element
      containerRef(element)
    },
    [containerRef],
  )

  useEffect(() => {
    if (isNearViewport && lineState === undefined) {
      actions.ensureLines(index - (index % scoreChunkSize), scoreChunkSize)
    }
  }, [actions, index, isNearViewport, lineState])

  useEffect(() => {
    if (wasEditingRef.current !== isEditing) {
      wasEditingRef.current = isEditing
      const target = isEditing ? doneRef.current : rootRef.current
      target?.focus({ preventScroll: true })
    }
  }, [isEditing])

  if (!isNearViewport) {
    return (
      <div
        ref={setRoot}
        className="edit-lite-score-line edit-lite-score-line--placeholder"
        style={{ minHeight: estimateScoreLineHeight(line) }}
      />
    )
  }
  return isEditing ? (
    <div
      ref={setRoot}
      className="edit-lite-score-line edit-lite-score-line--editing"
      role="group"
      aria-label={`Editing line ${number}`}
    >
      <div className="edit-lite-score-line__toolbar">
        <span className="edit-lite-score-line__number">Line {number}</span>
        {isDirty && (
          <span className="edit-lite-badge edit-lite-badge--edited">
            edited
          </span>
        )}
        <Button
          ref={doneRef}
          size="sm"
          variant="outline-primary"
          onClick={(): void => onDone(index)}
        >
          Done
        </Button>
      </div>
      <LineEditContainer index={index} lineState={lineState} />
    </div>
  ) : (
    <div
      ref={setRoot}
      className="edit-lite-score-line edit-lite-score-line--static"
      role="button"
      tabIndex={0}
      onClick={(): void => {
        if (!hasSelectedText()) {
          activate()
        }
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
        }
        if (event.key === 'Enter') {
          activate()
        }
      }}
      onKeyUp={(event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === ' ') {
          activate()
        }
      }}
    >
      <StaticScoreContent
        line={line}
        draft={draft}
        sigla={sigla}
        isDirty={isDirty}
        error={describeFailure(lineState)}
      />
    </div>
  )
}

export default React.memo(StaticScoreLine)
