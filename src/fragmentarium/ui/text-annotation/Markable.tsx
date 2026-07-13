import React, { PropsWithChildren, useContext, useRef } from 'react'
import { AnyWord } from 'transliteration/domain/token'
import './TextAnnotation.sass'
import classNames from 'classnames'
import _ from 'lodash'
import SpanAnnotator, {
  EntityTypeOption,
  clearSelection,
} from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import { AnnotationSpan } from 'fragmentarium/ui/text-annotation/annotationSpan'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import RealiaInfoContext from 'fragmentarium/ui/text-annotation/RealiaInfoContext'
import { getSpanLabel } from 'fragmentarium/ui/text-annotation/realiaInfo'
import { SelectInstance } from 'react-select'
import SpanEditor from 'fragmentarium/ui/text-annotation/SpanEditor'
import SpanIndicator from 'fragmentarium/ui/text-annotation/SpanIndicator'
import InlineEditor from 'fragmentarium/ui/text-annotation/InlineEditor'
import { getSelectedTokens } from 'fragmentarium/ui/text-annotation/selectionUtils'

const markableClass = 'markable'

function SpanIndicators<Span extends AnnotationSpan>({
  spans,
  tokenId,
  activeSpanId,
  setActiveSpanId,
}: {
  spans: readonly Span[]
  tokenId?: string | null
  activeSpanId: string | null
  setActiveSpanId: React.Dispatch<React.SetStateAction<string | null>>
}): JSX.Element {
  return (
    <>
      {spans
        .filter((span) => !!tokenId && span.span.includes(tokenId))
        .map((span) => (
          <SpanIndicator
            key={span.id}
            tokenId={tokenId ?? undefined}
            entitySpan={span}
            activeSpanId={activeSpanId}
            setActiveSpanId={setActiveSpanId}
          />
        ))}
    </>
  )
}

function sortSelection(
  selection: readonly string[],
  words: readonly string[],
): readonly string[] {
  return _.sortBy(selection, (id) => words.indexOf(id))
}

function isSelected(token: AnyWord, selection: readonly string[]): boolean {
  return !!token.id && selection.includes(token.id)
}

function hasActiveSpan(
  activeSpan: AnnotationSpan | null,
  tokenId?: string | null,
): boolean {
  return !!tokenId && !!activeSpan && activeSpan.span.includes(tokenId)
}

function mergeSelections(
  selection: readonly string[],
  newSelection: readonly string[],
): readonly string[] {
  return _.isEmpty(_.intersection(selection, newSelection))
    ? _.union(selection, newSelection)
    : _.difference(selection, newSelection)
}

export default function Markable({
  token,
  selection,
  setSelection,
  activeSpanId,
  setActiveSpanId,
  selectionStartTokenIdRef,
  children,
}: PropsWithChildren<{
  token: AnyWord
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
  activeSpanId: string | null
  setActiveSpanId: React.Dispatch<React.SetStateAction<string | null>>
  selectionStartTokenIdRef?: React.MutableRefObject<string | null>
}>): JSX.Element {
  const annotationContextValue = useContext(AnnotationContext)
  const [{ namedEntities, realia, words }] = annotationContextValue
  const { lookup: realiaLookup } = useContext(RealiaInfoContext)
  const selectRef = useRef<SelectInstance<EntityTypeOption> | null>(null)
  const [target, setTarget] = React.useState<HTMLSpanElement | null>(null)
  const activeSpan: AnnotationSpan | null =
    _.find(namedEntities, ({ id }) => id === activeSpanId) ||
    _.find(realia, ({ id }) => id === activeSpanId) ||
    null
  const hasWords = words.length > 0
  const showEditorOverlay =
    hasWords && !!activeSpan && _.head(activeSpan.span) === token.id
  const showAnnotatorOverlay =
    hasWords && !!token.id && _.head(selection) === token.id

  function handleSelection(event: React.MouseEvent) {
    const altPressed = event.altKey
    setActiveSpanId(null)
    const startedOnDifferentToken =
      !!selectionStartTokenIdRef?.current &&
      selectionStartTokenIdRef.current !== token.id

    const applySelection = (newSelection: readonly string[]) => {
      if (altPressed) {
        setSelection((currentSelection) =>
          sortSelection(mergeSelections(currentSelection, newSelection), words),
        )
      } else {
        setSelection(sortSelection(newSelection, words))
      }

      clearSelection()
    }

    const immediateSelection = getSelectedTokens(words)
    const shouldHandleLocally =
      immediateSelection.length > 1 ||
      (!startedOnDifferentToken && immediateSelection.length === 1)

    if (shouldHandleLocally) {
      applySelection(immediateSelection)
      if (selectionStartTokenIdRef) {
        selectionStartTokenIdRef.current = null
      }
      event.stopPropagation()
    }
  }

  const annotator = (
    <InlineEditor
      target={target}
      id={_.uniqueId('SpanAnnotationPopOver-')}
      title={
        `Annotate ${selection.length} Word` + (selection.length > 1 ? 's' : '')
      }
      show={showAnnotatorOverlay}
      onHide={() => setSelection([])}
      onEntered={() => selectRef.current?.focus()}
    >
      <SpanAnnotator
        ref={selectRef}
        selection={selection}
        setSelection={setSelection}
      />
    </InlineEditor>
  )
  const editor = activeSpan && (
    <InlineEditor
      target={target}
      id={_.uniqueId('SpanEditorPopOver-')}
      title={`Edit ${getSpanLabel(realiaLookup, activeSpan)}`}
      show={showEditorOverlay}
      onHide={() => setActiveSpanId(null)}
      onEntered={() => selectRef.current?.focus()}
    >
      <SpanEditor
        ref={selectRef}
        entitySpan={activeSpan}
        setActiveSpanId={setActiveSpanId}
      />
    </InlineEditor>
  )

  return (
    <span
      ref={setTarget}
      onMouseDown={() => {
        if (selectionStartTokenIdRef) {
          selectionStartTokenIdRef.current = token.id ?? null
        }
      }}
      className={classNames(markableClass, {
        selected:
          isSelected(token, selection) || hasActiveSpan(activeSpan, token.id),
        'span-end': token.id === _.last(selection),
      })}
      data-id={token.id}
      role={'button'}
    >
      {annotator}
      {editor}
      <span onMouseUp={handleSelection}>{children}</span>
      <SpanIndicators
        spans={namedEntities}
        tokenId={token.id}
        activeSpanId={activeSpanId}
        setActiveSpanId={setActiveSpanId}
      />
      <SpanIndicators
        spans={realia}
        tokenId={token.id}
        activeSpanId={activeSpanId}
        setActiveSpanId={setActiveSpanId}
      />
    </span>
  )
}
