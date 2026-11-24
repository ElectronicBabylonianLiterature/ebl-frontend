import React, { useEffect, useId, useMemo, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import { toLineOutline } from 'corpus/application/edit-lite/legacySnapshot'
import { createLine } from 'corpus/domain/line'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import { findLemmatizationDraftLine } from 'corpus/ui/edit-lite/lineAnnotations'
import LineEditContainer from 'corpus/ui/edit-lite/LineEditContainer'
import LineFlowContext, {
  isFocusWithin,
  LineFlow,
} from 'corpus/ui/edit-lite/LineFlowContext'
import LineMoveControls from 'corpus/ui/edit-lite/LineMoveControls'
import {
  countLines,
  findLineActivity,
  findLineState,
  isLineLoaded,
} from 'corpus/ui/edit-lite/lineStates'
import {
  findKeyTarget,
  revealOption,
} from 'corpus/ui/edit-lite/splitNavigation'
import SplitOption from 'corpus/ui/edit-lite/SplitOption'
import useSplitSelection from 'corpus/ui/edit-lite/useSplitSelection'
import 'corpus/ui/edit-lite/SplitLines.sass'

export { revealOption } from 'corpus/ui/edit-lite/splitNavigation'

interface Props {
  readonly state: EditLiteState
  readonly initialLine?: number
}

interface AddLineProps {
  readonly disabled: boolean
  readonly onAdd: () => void
}

const emptyLine = createLine({})

function AddLineButton({ disabled, onAdd }: AddLineProps): JSX.Element | null {
  const { canWrite } = useEditLiteContext()
  return canWrite ? (
    <Button
      size="sm"
      variant="outline-primary"
      className="edit-lite-split__add"
      disabled={disabled}
      onClick={onAdd}
    >
      Add line
    </Button>
  ) : null
}

function SplitView({ state, initialLine }: Props): JSX.Element {
  const id = useId()
  const { actions } = useEditLiteContext()
  const lines = state.outline.lines
  const newLineDraft = state.newLine?.draft
  const hasNewLine = state.newLine !== null
  const lastIndex = countLines(state) - 1
  const listRef = useRef<HTMLUListElement>(null)
  const editorRef = useRef<HTMLElement>(null)
  const {
    index: selectedIndex,
    editorKey,
    arrivalView,
    select,
    selectNewLine,
    followMove,
    followDelete,
    advance,
    settleArrival,
  } = useSplitSelection(state, initialLine)
  const lemmatizationDraftLine = findLemmatizationDraftLine(
    state,
    selectedIndex,
  )
  const lineFlow = useMemo<LineFlow>(
    () => ({
      arrivalView,
      lemmatizationDraftLine,
      settleArrival,
      advance,
      holdFocus: (): void => editorRef.current?.focus(),
      isFocusHeld: (): boolean => isFocusWithin(editorRef.current),
    }),
    [arrivalView, lemmatizationDraftLine, settleArrival, advance],
  )
  const isNewSelected = hasNewLine && selectedIndex === lines.length
  const lineState = findLineState(state, selectedIndex)
  const activity = findLineActivity(state)
  const newLine = useMemo<LineOutline>(
    () => toLineOutline(newLineDraft ?? emptyLine, lines.length),
    [newLineDraft, lines.length],
  )

  useEffect(() => {
    const firstNeighbour = Math.max(selectedIndex - 1, 0)
    const lastNeighbour = Math.min(selectedIndex + 1, lastIndex)
    actions.ensureLines(firstNeighbour, lastNeighbour - firstNeighbour + 1)
  }, [actions, selectedIndex, lastIndex, state.layoutVersion])

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
  const addLine = (): void => {
    actions.addLine()
    selectNewLine()
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
        {hasNewLine && (
          <SplitOption
            key="new"
            id={`${id}-option-${newLine.index}`}
            line={newLine}
            lineState={findLineState(state, newLine.index)}
            isSelected={isNewSelected}
            isNew
            onSelect={select}
          />
        )}
      </ul>
      <section
        ref={editorRef}
        className="edit-lite-split__editor"
        aria-labelledby={`${id}-heading`}
        tabIndex={-1}
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
            {isNewSelected ? 'New line' : `Line ${lines[selectedIndex].number}`}
          </h3>
          <span className="edit-lite-split__position">
            {selectedIndex + 1} of {lastIndex + 1}
          </span>
          {!isNewSelected && (
            <LineMoveControls
              lines={lines}
              index={selectedIndex}
              isLoaded={isLineLoaded(lineState)}
              activity={activity}
              onMoved={followMove}
            />
          )}
          <AddLineButton disabled={hasNewLine} onAdd={addLine} />
        </div>
        <LineFlowContext.Provider value={lineFlow}>
          <LineEditContainer
            key={editorKey}
            index={selectedIndex}
            lineState={lineState}
            isNew={isNewSelected}
            activity={activity}
            onDeleted={followDelete}
          />
        </LineFlowContext.Provider>
      </section>
    </div>
  )
}

function EmptyLines(): JSX.Element {
  const { actions } = useEditLiteContext()
  return (
    <div className="edit-lite-split__empty">
      <p>This chapter has no lines.</p>
      <AddLineButton disabled={false} onAdd={actions.addLine} />
    </div>
  )
}

export default function SplitLines({ state, initialLine }: Props): JSX.Element {
  return countLines(state) === 0 ? (
    <EmptyLines />
  ) : (
    <SplitView state={state} initialLine={initialLine} />
  )
}
