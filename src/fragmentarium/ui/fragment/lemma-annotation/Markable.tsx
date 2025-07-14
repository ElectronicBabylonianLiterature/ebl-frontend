import React, { PropsWithChildren, useContext } from 'react'
import { AnyWord } from 'transliteration/domain/token'
import './TextAnnotation.sass'
import classNames from 'classnames'
import _ from 'lodash'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import SpanAnnotator from 'fragmentarium/ui/fragment/lemma-annotation/SpanAnnotator'
import AnnotationContext, {
  Entity,
} from 'fragmentarium/ui/fragment/lemma-annotation/TextAnnotationContext'

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

export function clearSelection(): void {
  if (window.getSelection) {
    if (window.getSelection()?.empty) {
      window.getSelection()?.empty()
    } else if (window.getSelection()?.removeAllRanges) {
      window.getSelection()?.removeAllRanges()
    }
  }
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

function nextTokenInSelection(
  id: string,
  words: readonly string[],
  selection: readonly string[]
): boolean {
  const nextToken = _.nth(words, _.indexOf(words, id) + 1)
  return !!nextToken && selection.includes(nextToken)
}

function isSpanEnd(
  token: AnyWord,
  selection: readonly string[],
  words: readonly string[]
): boolean {
  return (
    !!token.id &&
    (token.id === _.last(words) ||
      !nextTokenInSelection(token.id, words, selection))
  )
}

function mergeSelections(
  selection: readonly string[],
  newSelection: readonly string[]
): readonly string[] {
  return _.isEmpty(_.intersection(selection, newSelection))
    ? _.union(selection, newSelection)
    : _.difference(selection, newSelection)
}

function getEntity(
  entities: readonly Entity[],
  id?: string | null
): Entity | null {
  if (id) {
    for (const entity of entities) {
      if (entity.span.includes(id)) {
        return entity
      }
    }
  }
  return null
}

export default function Markable({
  token,
  words,
  selection,
  setSelection,
  children,
}: PropsWithChildren<{
  token: AnyWord
  words: readonly string[]
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
}>): JSX.Element {
  const [entities] = useContext(AnnotationContext)
  const entity = getEntity(entities, token.id)

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
        <SpanAnnotator selection={selection} />
      </Popover.Content>
    </Popover>
  )

  return (
    <OverlayTrigger
      trigger={['click']}
      overlay={popover}
      placement={'top'}
      show={!!token.id && _.head(selection) === token.id}
    >
      <span
        className={classNames(markableClass, {
          selected: isSelected(token, selection),
          'entity-span': entity,
          'span-end': entity
            ? !!token.id && token.id === _.last(entity.span)
            : isSpanEnd(token, selection, words),
        })}
        data-id={token.id}
        data-entity-type={entity ? entity.type : ''}
        data-entity-id={entity ? entity.id : ''}
        onMouseUp={handleSelection}
      >
        {children}
      </span>
    </OverlayTrigger>
  )
}
