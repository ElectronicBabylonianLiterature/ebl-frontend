import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { isLineDirty } from 'corpus/ui/edit-lite/editLiteReducer'
import { EditLiteState, LineState } from 'corpus/ui/edit-lite/editLiteState'
import LineEditContainer from 'corpus/ui/edit-lite/LineEditContainer'
import { findInitialIndex } from 'corpus/ui/edit-lite/lineIndex'
import LinePager, { normalizePageSize } from 'corpus/ui/edit-lite/LinePager'
import 'corpus/ui/edit-lite/edit-lite.sass'
import 'corpus/ui/edit-lite/PagedLines.sass'

interface Props {
  readonly state: EditLiteState
  readonly initialLine?: number
  readonly initialPageSize?: number
}

type Reveal = 'nothing' | 'pageTop' | 'line' | 'focusedLine'

interface Position {
  readonly anchor: number
  readonly target: number | null
  readonly reveal: Reveal
}

interface PagedLineProps {
  readonly line: LineOutline
  readonly lineState: LineState | undefined
  readonly headingId: string
  readonly isTarget: boolean
}

const primes = /[′’ʾ]/g
const trailingDot = /\.$/

function clampIndex(index: number, lineCount: number): number {
  return _.clamp(Math.trunc(index) || 0, 0, Math.max(lineCount - 1, 0))
}

function createInitialPosition(
  initialLine: number | undefined,
  lineCount: number,
): Position {
  const target = findInitialIndex(initialLine, lineCount)
  return {
    anchor: target ?? clampIndex(initialLine ?? 0, lineCount),
    target,
    reveal: target === null ? 'nothing' : 'line',
  }
}

function normalizeLineNumber(lineNumber: string): string {
  return lineNumber
    .trim()
    .replace(trailingDot, '')
    .replace(primes, "'")
    .toLowerCase()
}

export function findLineIndex(
  lines: readonly LineOutline[],
  lineNumber: string,
): number {
  const wantedLineNumber = normalizeLineNumber(lineNumber)
  return lines.findIndex(
    (line) => normalizeLineNumber(line.number) === wantedLineNumber,
  )
}

function isSettled(lineState: LineState | undefined): boolean {
  return lineState !== undefined && lineState.status !== 'loading'
}

function revealElement(element: HTMLElement | null, reveal: Reveal): void {
  if (element === null) {
    return
  }
  const isPageTopVisible =
    reveal === 'pageTop' && element.getBoundingClientRect().top >= 0
  if (!isPageTopVisible) {
    element.scrollIntoView?.({ block: 'start', behavior: 'instant' })
  }
  if (reveal === 'focusedLine') {
    element.focus({ preventScroll: true })
  }
}

const PagedLine = React.memo(function PagedLine({
  line,
  lineState,
  headingId,
  isTarget,
}: PagedLineProps): JSX.Element {
  return (
    <li
      className={classNames('edit-lite-page__line', {
        'edit-lite-page__line--target': isTarget,
      })}
      aria-current={isTarget ? 'location' : undefined}
    >
      <h3 id={headingId} className="edit-lite-page__heading" tabIndex={-1}>
        Line {line.number}
        {isLineDirty(lineState) && (
          <span className="edit-lite-badge edit-lite-badge--edited">
            edited
          </span>
        )}
      </h3>
      <LineEditContainer index={line.index} lineState={lineState} />
    </li>
  )
})

export default function PagedLines({
  state,
  initialLine,
  initialPageSize,
}: Props): JSX.Element {
  const id = useId()
  const { actions } = useEditLiteContext()
  const lines = state.outline.lines
  const rootRef = useRef<HTMLDivElement>(null)
  const revealedPositionRef = useRef<Position | null>(null)
  const [pageSize, setPageSize] = useState<number>(() =>
    normalizePageSize(initialPageSize),
  )
  const [position, setPosition] = useState<Position>(() =>
    createInitialPosition(initialLine, lines.length),
  )
  const anchor = clampIndex(position.anchor, lines.length)
  const pageStart = anchor - (anchor % pageSize)
  const pageLines = lines.slice(pageStart, pageStart + pageSize)
  const isPageSettled = pageLines.every((line) =>
    isSettled(state.lines[line.index]),
  )
  const anchorHeadingId = `${id}-line-${anchor}`

  useLayoutEffect(() => {
    actions.ensureLines(pageStart, pageSize)
  }, [actions, pageStart, pageSize])

  useEffect(() => {
    const { reveal } = position
    const isDue =
      reveal === 'pageTop' || (reveal !== 'nothing' && isPageSettled)
    if (isDue && revealedPositionRef.current !== position) {
      revealedPositionRef.current = position
      revealElement(
        reveal === 'pageTop'
          ? rootRef.current
          : document.getElementById(anchorHeadingId),
        reveal,
      )
    }
  }, [position, isPageSettled, anchorHeadingId])

  const changePageStart = useCallback((nextPageStart: number): void => {
    setPosition({ anchor: nextPageStart, target: null, reveal: 'pageTop' })
  }, [])
  const changePageSize = useCallback((nextPageSize: number): void => {
    setPageSize(nextPageSize)
    setPosition((current) => ({
      ...current,
      reveal: current.anchor % nextPageSize === 0 ? 'pageTop' : 'line',
    }))
  }, [])
  const goToLine = useCallback(
    (lineNumber: string): boolean => {
      const index = findLineIndex(lines, lineNumber)
      if (index >= 0) {
        setPosition({ anchor: index, target: index, reveal: 'focusedLine' })
      }
      return index >= 0
    },
    [lines],
  )

  return (
    <div
      ref={rootRef}
      className="edit-lite-paged"
      data-testid="edit-lite-paged"
    >
      <LinePager
        pageStart={pageStart}
        pageSize={pageSize}
        lineCount={lines.length}
        onPageStartChange={changePageStart}
        onPageSizeChange={changePageSize}
        onGoToLine={goToLine}
      />
      {pageLines.length > 0 && (
        <ol className="edit-lite-page" aria-label="Lines on this page">
          {pageLines.map((line) => (
            <PagedLine
              key={line.index}
              line={line}
              lineState={state.lines[line.index]}
              headingId={`${id}-line-${line.index}`}
              isTarget={line.index === position.target}
            />
          ))}
        </ol>
      )}
    </div>
  )
}
