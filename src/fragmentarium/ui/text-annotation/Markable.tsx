import React, { PropsWithChildren, useContext, useRef, memo } from 'react'
import { AnyWord } from 'transliteration/domain/token'
import './TextAnnotation.sass'
import classNames from 'classnames'
import _ from 'lodash'
import { Overlay, Popover } from 'react-bootstrap'
import SpanAnnotator, {
  EntityTypeOption,
  clearSelection,
} from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import { EntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import { SelectInstance } from 'react-select'
import SpanEditor from 'fragmentarium/ui/text-annotation/SpanEditor'

const markableClass = 'markable'

function sortSelection(
  selection: readonly string[],
  words: readonly string[],
): readonly string[] {
  return _.sortBy(selection, (id) => words.indexOf(id))
}

function expandSelection(
  start: string,
  end: string,
  words: readonly string[],
): readonly string[] {
  const positions = [words.indexOf(start), words.indexOf(end)]
  const [startIndex, endIndex] = _.sortBy(positions)

  return words.slice(startIndex, endIndex + 1)
}

function getTokenId(node: Node | null): string | null {
  const tokenNode = node?.parentElement?.closest(`.${markableClass}`)
  return tokenNode ? tokenNode.getAttribute('data-id') : null
}

function getSelectedTokens(words: readonly string[]): readonly string[] {
  const selection = document.getSelection()
  if (selection) {
    const start = getTokenId(selection.anchorNode)
    const end = getTokenId(selection.focusNode)

    if (start && end) {
      clearSelection()
      return expandSelection(start, end, words)
    }
  }
  return []
}

function isSelected(token: AnyWord, selection: readonly string[]): boolean {
  return !!token.id && selection.includes(token.id)
}

function hasActiveSpan(
  activeSpan: EntityAnnotationSpan | null,
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

function SpanIndicator({
  tokenId,
  entitySpan,
  activeSpanId,
  setActiveSpanId,
}: {
  tokenId?: string
  entitySpan: EntityAnnotationSpan
  activeSpanId: string | null
  setActiveSpanId: React.Dispatch<React.SetStateAction<string | null>>
}): JSX.Element {
  const isInitial = tokenId === _.first(entitySpan.span)

  return (
    <span
      title={entitySpan.name}
      onMouseUp={() => {
        setActiveSpanId(entitySpan.id)
      }}
      data-span-id={entitySpan.id}
      data-testid={`${tokenId}__${entitySpan.id}`}
      className={classNames(
        'span-indicator',
        `tier-depth--${entitySpan.tier}`,
        `named-entity__${entitySpan.type}`,
        {
          highlight: entitySpan.id === activeSpanId,
          initial: isInitial,
          final: tokenId === _.last(entitySpan.span),
        },
      )}
    />
  )
}

const InlineEditor = memo(function InlineEditor({
  target,
  show,
  onHide,
  onEntered,
  id,
  title,
  children,
}: {
  target: HTMLElement | null
  show: boolean
  onHide: () => void
  onEntered: () => void
  id: string
  title: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <Overlay
      target={target}
      show={show && !!target}
      placement={'top'}
      rootClose
      onHide={onHide}
      onEntered={onEntered}
    >
      <Popover id={id} className={'text-annotation__editor-popover'}>
        <Popover.Header>{title}</Popover.Header>
        <Popover.Body>{children}</Popover.Body>
      </Popover>
    </Overlay>
  )
})

export default function Markable({
  token,
  selection,
  setSelection,
  activeSpanId,
  setActiveSpanId,
  children,
}: PropsWithChildren<{
  token: AnyWord
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
  activeSpanId: string | null
  setActiveSpanId: React.Dispatch<React.SetStateAction<string | null>>
}>): JSX.Element {
  const annotationContextValue = useContext(AnnotationContext)
  const [{ entities, words }] = annotationContextValue
  const selectRef = useRef<SelectInstance<EntityTypeOption> | null>(null)
  const [target, setTarget] = React.useState<HTMLSpanElement | null>(null)
  const activeSpan =
    _.find(entities, (entity) => entity.id === activeSpanId) || null
  const hasWords = words.length > 0
  const showEditorOverlay =
    hasWords && !!activeSpan && _.head(activeSpan.span) === token.id
  const showAnnotatorOverlay =
    hasWords && !!token.id && _.head(selection) === token.id

  function handleSelection(event: React.MouseEvent) {
    const newSelection = getSelectedTokens(words)
    setActiveSpanId(null)

    setSelection(
      sortSelection(
        event.altKey ? mergeSelections(selection, newSelection) : newSelection,
        words,
      ),
    )

    event.stopPropagation()
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
      title={`Edit ${activeSpan.name}`}
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
      {entities.map((entity, index) => {
        return token.id && entity.span.includes(token.id) ? (
          <SpanIndicator
            key={index}
            tokenId={token.id}
            entitySpan={entity}
            activeSpanId={activeSpanId}
            setActiveSpanId={setActiveSpanId}
          />
        ) : (
          <React.Fragment key={index} />
        )
      })}
    </span>
  )
}
