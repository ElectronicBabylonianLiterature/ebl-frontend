import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import classNames from 'classnames'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import { isLineDirty } from 'corpus/ui/edit-lite/editLiteReducer'
import { EditLiteState, LineState } from 'corpus/ui/edit-lite/editLiteState'
import LineEditContainer from 'corpus/ui/edit-lite/LineEditContainer'
import { findInitialIndex } from 'corpus/ui/edit-lite/lineIndex'
import LineSummaryRow from 'corpus/ui/edit-lite/LineSummaryRow'
import 'corpus/ui/edit-lite/AccordionLines.sass'

interface Props {
  readonly state: EditLiteState
  readonly initialLine?: number
}

interface RowProps {
  readonly line: LineOutline
  readonly lineState: LineState | undefined
  readonly isOpen: boolean
  readonly onToggle: (index: number) => void
}

function toggleIndex(
  openIndices: ReadonlySet<number>,
  index: number,
): ReadonlySet<number> {
  const toggledIndices = new Set(openIndices)
  if (!toggledIndices.delete(index)) {
    toggledIndices.add(index)
  }
  return toggledIndices
}

const AccordionRow = React.memo(function AccordionRow({
  line,
  lineState,
  isOpen,
  onToggle,
}: RowProps): JSX.Element {
  const panelId = useId()

  return (
    <li
      className={classNames('edit-lite-accordion__row', {
        'edit-lite-accordion__row--open': isOpen,
      })}
    >
      <button
        type="button"
        className="edit-lite-accordion__header"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={(): void => onToggle(line.index)}
      >
        <span className="edit-lite-accordion__chevron" aria-hidden="true" />
        <LineSummaryRow line={line} isDirty={isLineDirty(lineState)} />
      </button>
      <div id={panelId} className="edit-lite-accordion__panel" hidden={!isOpen}>
        {isOpen && (
          <LineEditContainer index={line.index} lineState={lineState} />
        )}
      </div>
    </li>
  )
})

export default function AccordionLines({
  state,
  initialLine,
}: Props): JSX.Element {
  const lines = state.outline.lines
  const listRef = useRef<HTMLOListElement>(null)
  const [initialIndex] = useState<number | null>(() =>
    findInitialIndex(initialLine, lines.length),
  )
  const [openIndices, setOpenIndices] = useState<ReadonlySet<number>>(
    () => new Set(initialIndex === null ? [] : [initialIndex]),
  )
  const toggle = useCallback((index: number): void => {
    setOpenIndices((currentIndices) => toggleIndex(currentIndices, index))
  }, [])

  useEffect(() => {
    if (initialIndex !== null) {
      listRef.current?.children
        .item(initialIndex)
        ?.scrollIntoView?.({ block: 'start', behavior: 'instant' })
    }
  }, [initialIndex])

  return lines.length === 0 ? (
    <p className="edit-lite-accordion__empty">This chapter has no lines.</p>
  ) : (
    <ol ref={listRef} className="edit-lite-accordion" aria-label="Lines">
      {lines.map((line) => (
        <AccordionRow
          key={line.index}
          line={line}
          lineState={state.lines[line.index]}
          isOpen={openIndices.has(line.index)}
          onToggle={toggle}
        />
      ))}
    </ol>
  )
}
