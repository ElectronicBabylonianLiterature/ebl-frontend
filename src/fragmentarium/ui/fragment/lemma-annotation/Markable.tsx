import React, { PropsWithChildren, useContext } from 'react'
import { AnyWord } from 'transliteration/domain/token'
import './TextAnnotation.sass'
import classNames from 'classnames'
import _ from 'lodash'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import SpanAnnotator, {
  clearSelection,
} from 'fragmentarium/ui/fragment/lemma-annotation/SpanAnnotator'
import { EntityAnnotationSpan } from 'fragmentarium/ui/fragment/lemma-annotation/EntityType'
import AnnotationContext from 'fragmentarium/ui/fragment/lemma-annotation/TextAnnotationContext'

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
  hoveredSpanId,
  setHoveredSpanId,
}: {
  tokenId?: string
  entitySpan: EntityAnnotationSpan
  hoveredSpanId: string | null
  setHoveredSpanId: React.Dispatch<React.SetStateAction<string | null>>
}): JSX.Element {
  const isInitial = tokenId === _.first(entitySpan.span)
  return (
    <span
      onMouseEnter={() => setHoveredSpanId(entitySpan.id)}
      onMouseLeave={() => setHoveredSpanId(null)}
      onMouseUp={() => {
        console.log(`clicked on ${entitySpan.id}`)
      }}
      data-span-id={entitySpan.id}
      className={classNames(
        'span-indicator',
        `tier-depth--${entitySpan.tier}`,
        `named-entity__${entitySpan.type}`,
        {
          hovered: hoveredSpanId === entitySpan.id,
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
  hoveredSpanId,
  setHoveredSpanId,
  children,
}: PropsWithChildren<{
  token: AnyWord
  words: readonly string[]
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
  hoveredSpanId: string | null
  setHoveredSpanId: React.Dispatch<React.SetStateAction<string | null>>
}>): JSX.Element {
  const [{ entities }] = useContext(AnnotationContext)

  function handleSelection(event: React.MouseEvent) {
    const newSelection = getSelectedTokens(words)

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
        <SpanAnnotator selection={selection} setSelection={setSelection} />
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
      >
        <span onMouseUp={handleSelection}>{children}</span>
      </OverlayTrigger>
      {entities.map((entity, index) => {
        return token.id && entity.span.includes(token.id) ? (
          <SpanIndicator
            key={index}
            tokenId={token.id}
            entitySpan={entity}
            hoveredSpanId={hoveredSpanId}
            setHoveredSpanId={setHoveredSpanId}
          />
        ) : (
          <React.Fragment key={index} />
        )
      })}
    </span>
  )
}
