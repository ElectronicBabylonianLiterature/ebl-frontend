import React, { PropsWithChildren, useContext, useRef } from 'react'
import { AnyWord } from 'transliteration/domain/token'
import './TextAnnotation.sass'
import classNames from 'classnames'
import _ from 'lodash'
import { OverlayTrigger, Popover } from 'react-bootstrap'
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
  const showPopover = isActiveSpan && isInitial
  const selectRef = useRef<Select<EntityTypeOption> | null>(null)

  const handleToggle = React.useCallback(
    (nextShown: boolean) => {
      setActiveSpanId(nextShown ? entitySpan.id : null)
    },
    [entitySpan.id, setActiveSpanId]
  )

  const popover = (
    <Popover id={_.uniqueId('SpanAnnotationPopOver-')}>
      <Popover.Title>{`Edit ${entitySpan.type} Annotation`}</Popover.Title>
      <Popover.Content>
        <SpanEditor
          ref={selectRef}
          entitySpan={entitySpan}
          setActiveSpanId={setActiveSpanId}
        />
      </Popover.Content>
    </Popover>
  )
  const indicator = (
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

  return (
    <OverlayTrigger
      rootClose
      onToggle={handleToggle}
      trigger={['click']}
      overlay={popover}
      placement={'top'}
      show={showPopover}
      onEntered={() => selectRef.current?.focus()}
    >
      {indicator}
    </OverlayTrigger>
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

  return (
    <span
      className={classNames(markableClass, {
        selected: isSelected(token, selection),
        'span-end': token.id === _.last(selection),
      })}
      data-id={token.id}
    >
      <OverlayTrigger
        trigger={['click']}
        overlay={popover}
        placement={'top'}
        show={!!token.id && _.head(selection) === token.id}
        onEntered={() => selectRef.current?.focus()}
      >
        <span onMouseUp={handleSelection}>{children}</span>
      </OverlayTrigger>
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
