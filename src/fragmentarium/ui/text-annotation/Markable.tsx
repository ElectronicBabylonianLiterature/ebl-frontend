/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { PropsWithChildren, useContext, useRef } from 'react'
import { AnyWord } from 'transliteration/domain/token'
import './TextAnnotation.sass'
import classNames from 'classnames'
import _ from 'lodash'
import { Overlay, OverlayTrigger, Popover } from 'react-bootstrap'
import SpanAnnotator, {
  EntityTypeOption,
  clearSelection,
} from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import { EntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import Select from 'react-select'
import SpanEditor from 'fragmentarium/ui/text-annotation/SpanEditor'

const markableClass = 'markable'

function sortSelection(
  selection: readonly string[],
  words: readonly string[]
): readonly string[] {
  return _.sortBy(selection, (id) => words.indexOf(id))
}

function expandSelection(
  start: string,
  end: string,
  words: readonly string[]
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
  tokenId?: string | null
): boolean {
  return !!tokenId && !!activeSpan && activeSpan.span.includes(tokenId)
}

function mergeSelections(
  selection: readonly string[],
  newSelection: readonly string[]
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
  const isActiveSpan = entitySpan.id === activeSpanId

  return (
    <span
      onMouseUp={() => {
        setActiveSpanId(entitySpan.id)
      }}
      data-span-id={entitySpan.id}
      className={classNames(
        'span-indicator',
        `tier-depth--${entitySpan.tier}`,
        `named-entity__${entitySpan.type}`,
        {
          highlight: entitySpan.id === activeSpanId,
          initial: isInitial,
          final: tokenId === _.last(entitySpan.span),
        }
      )}
    />
  )
}

export default function Markable({
  token,
  words,
  selection,
  setSelection,
  activeSpanId,
  setActiveSpanId,
  children,
}: PropsWithChildren<{
  token: AnyWord
  words: readonly string[]
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
  activeSpanId: string | null
  setActiveSpanId: React.Dispatch<React.SetStateAction<string | null>>
}>): JSX.Element {
  const [{ entities }] = useContext(AnnotationContext)
  const selectRef = useRef<Select<EntityTypeOption> | null>(null)
  const target = useRef(null)
  const activeSpan =
    _.find(entities, (entity) => entity.id === activeSpanId) || null
  const showEditorOverlay = !!activeSpan && _.head(activeSpan.span) === token.id
  const showAnnotatorOverlay = !!token.id && _.head(selection) === token.id

  function handleSelection(event: React.MouseEvent) {
    const newSelection = getSelectedTokens(words)
    setActiveSpanId(null)

    setSelection(
      sortSelection(
        event.altKey ? mergeSelections(selection, newSelection) : newSelection,
        words
      )
    )

    event.stopPropagation()
  }

  const popover = (
    <Popover id={_.uniqueId('SpanAnnotationPopOver-')}>
      <Popover.Title>{`Annotate ${selection.length} tokens`}</Popover.Title>
      <Popover.Content>
        <SpanAnnotator
          ref={selectRef}
          selection={selection}
          setSelection={setSelection}
        />
      </Popover.Content>
    </Popover>
  )
  const editorOverlay = (
    <Overlay
      target={() => target.current}
      show={showEditorOverlay}
      placement={'top'}
      rootClose
      onHide={() => setActiveSpanId(null)}
    >
      <Popover id={_.uniqueId('SpanAnnotationPopOver-')}>
        {activeSpan && (
          <>
            <Popover.Title>{`Edit ${activeSpan.type} Annotation`}</Popover.Title>
            <Popover.Content>
              <SpanEditor
                ref={selectRef}
                entitySpan={activeSpan}
                setActiveSpanId={setActiveSpanId}
              />
            </Popover.Content>
          </>
        )}
      </Popover>
    </Overlay>
  )

  return (
    <span
      ref={target}
      className={classNames(markableClass, {
        selected:
          isSelected(token, selection) || hasActiveSpan(activeSpan, token.id),
        'span-end': token.id === _.last(selection),
      })}
      data-id={token.id}
    >
      <OverlayTrigger
        trigger={['click']}
        overlay={popover}
        placement={'top'}
        show={showAnnotatorOverlay}
        onEntered={() => selectRef.current?.focus()}
      >
        <span onMouseUp={handleSelection}>{children}</span>
      </OverlayTrigger>
      {editorOverlay}

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
