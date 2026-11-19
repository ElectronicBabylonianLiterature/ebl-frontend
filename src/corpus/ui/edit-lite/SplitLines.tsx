import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { isLineDirty } from 'corpus/ui/edit-lite/editLiteReducer'
import { EditLiteState, LineState } from 'corpus/ui/edit-lite/editLiteState'
import LineEditContainer from 'corpus/ui/edit-lite/LineEditContainer'
import { findInitialIndex } from 'corpus/ui/edit-lite/lineIndex'
import LineSummaryRow from 'corpus/ui/edit-lite/LineSummaryRow'
import 'corpus/ui/edit-lite/SplitLines.sass'

interface Props {
  readonly state: EditLiteState
  readonly initialLine?: number
}

interface OptionProps {
  readonly id: string
  readonly line: LineOutline
  readonly lineState: LineState | undefined
  readonly isSelected: boolean
  readonly onSelect: (index: number) => void
}

const pageStep = 10

type KeyTarget = (index: number, lastIndex: number) => number

const keyTargets: ReadonlyMap<string, KeyTarget> = new Map<string, KeyTarget>([
  ['ArrowUp', (index) => index - 1],
  ['ArrowDown', (index) => index + 1],
  ['PageUp', (index) => index - pageStep],
  ['PageDown', (index) => index + pageStep],
  ['Home', () => 0],
  ['End', (_index, lastIndex) => lastIndex],
])

function findKeyTarget(
  key: string,
  index: number,
  lastIndex: number,
): number | null {
  return keyTargets.get(key)?.(index, lastIndex) ?? null
}

export function revealOption(list: HTMLElement | null, index: number): void {
  const option = list?.children.item(index)
  if (list && option) {
    const visibleTop = list.getBoundingClientRect().top + list.clientTop
    const visibleBottom = visibleTop + list.clientHeight
    const { top, bottom } = option.getBoundingClientRect()
    list.scrollTop +=
      Math.min(top - visibleTop, 0) + Math.max(bottom - visibleBottom, 0)
  }
}

const SplitOption = React.memo(function SplitOption({
  id,
  line,
  lineState,
  isSelected,
  onSelect,
}: OptionProps): JSX.Element {
  return (
    <li
      id={id}
      className={classNames('edit-lite-split__option', {
        'edit-lite-split__option--selected': isSelected,
      })}
      role="option"
      aria-selected={isSelected}
      onClick={(): void => onSelect(line.index)}
    >
      <LineSummaryRow line={line} isDirty={isLineDirty(lineState)} />
    </li>
  )
})

function SplitView({ state, initialLine }: Props): JSX.Element {
  const id = useId()
  const { actions } = useEditLiteContext()
  const lines = state.outline.lines
  const lastIndex = lines.length - 1
  const listRef = useRef<HTMLUListElement>(null)
  const [requestedIndex, setRequestedIndex] = useState<number>(
    () => findInitialIndex(initialLine, lines.length) ?? 0,
  )
  const selectedIndex = Math.min(requestedIndex, lastIndex)
  const select = useCallback(
    (index: number): void => setRequestedIndex(_.clamp(index, 0, lastIndex)),
    [lastIndex],
  )

  useEffect(() => {
    const firstNeighbour = Math.max(selectedIndex - 1, 0)
    const lastNeighbour = Math.min(selectedIndex + 1, lastIndex)
    actions.ensureLines(firstNeighbour, lastNeighbour - firstNeighbour + 1)
  }, [actions, selectedIndex, lastIndex])

  useEffect(() => {
    revealOption(listRef.current, selectedIndex)
  }, [selectedIndex])

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLUListElement>,
  ): void => {
    const target = findKeyTarget(event.key, selectedIndex, lastIndex)
    if (target !== null) {
      event.preventDefault()
      select(target)
    }
  }

  return (
    <div className="edit-lite-split">
      <ul
        ref={listRef}
        className="edit-lite-split__list"
        role="listbox"
        aria-label="Lines"
        aria-activedescendant={`${id}-option-${selectedIndex}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {lines.map((line) => (
          <SplitOption
            key={line.index}
            id={`${id}-option-${line.index}`}
            line={line}
            lineState={state.lines[line.index]}
            isSelected={line.index === selectedIndex}
            onSelect={select}
          />
        ))}
      </ul>
      <section
        className="edit-lite-split__editor"
        aria-labelledby={`${id}-heading`}
      >
        <div className="edit-lite-split__toolbar">
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={selectedIndex <= 0}
            onClick={(): void => select(selectedIndex - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={selectedIndex >= lastIndex}
            onClick={(): void => select(selectedIndex + 1)}
          >
            Next
          </Button>
          <h3 id={`${id}-heading`} className="edit-lite-split__heading">
            Line {lines[selectedIndex].number}
          </h3>
          <span className="edit-lite-split__position">
            {selectedIndex + 1} of {lines.length}
          </span>
        </div>
        <LineEditContainer
          key={selectedIndex}
          index={selectedIndex}
          lineState={state.lines[selectedIndex]}
        />
      </section>
    </div>
  )
}

export default function SplitLines({ state, initialLine }: Props): JSX.Element {
  return state.outline.lines.length === 0 ? (
    <p className="edit-lite-split__empty">This chapter has no lines.</p>
  ) : (
    <SplitView state={state} initialLine={initialLine} />
  )
}
