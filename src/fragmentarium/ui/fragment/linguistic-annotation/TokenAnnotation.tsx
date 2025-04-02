import React from 'react'
import { Notes, Text } from 'transliteration/domain/text'
import { LineProps } from 'transliteration/ui/LineProps'
import {
  defaultLineComponents,
  getCurrentLabels,
  LineComponentMap,
} from 'transliteration/ui/TransliterationLines'
import { Token } from 'transliteration/domain/token'
import WordService from 'dictionary/application/WordService'
import { ValueType } from 'react-select'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import _ from 'lodash'
import { Labels } from 'transliteration/domain/labels'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import DisplayControlLine from 'transliteration/ui/DisplayControlLine'
import { createLineId, NoteLinks } from 'transliteration/ui/note-links'
import FragmentService from 'fragmentarium/application/FragmentService'
import { isNoteLine, isParallelLine } from 'transliteration/domain/type-guards'

type TextSetter = React.Dispatch<React.SetStateAction<Text>>

export type TokenAnnotationProps = {
  text: Text
  museumNumber: string
  wordService: WordService
  fragmentService: FragmentService
  editableTokens: EditableToken[]
  setText: TextSetter
}

export const annotationProcesses = {
  loadingLemmas: 'Loading Lemmas...',
  saving: 'Saving...',
}

export type TokenAnnotationState = {
  activeToken: EditableToken | null
  activeLine: number | null
  updates: Map<Token, ValueType<any, true>>
  pendingLines: Set<number>
  process: keyof typeof annotationProcesses | null
}

const MemoizedRowDisplay = React.memo(
  function rowDisplay({
    line,
    lineIndex,
    LineComponent,
    numberOfColumns,
    labels,
    notes,
  }: {
    line: AbstractLine
    lineIndex: number
    hasToken: boolean
    isPending: boolean
    LineComponent: React.FC<LineProps>
    numberOfColumns: number
    labels: Labels
    notes: Notes
  }): JSX.Element {
    const lineNumber = lineIndex + 1
    return (
      <tr id={createLineId(lineNumber)}>
        <LineComponent
          line={line}
          lineIndex={lineIndex}
          columns={numberOfColumns}
          labels={labels}
        />
        <td>
          <NoteLinks notes={notes} lineNumber={lineNumber} />
        </td>
      </tr>
    )
  },
  (prevProps, nextProps) => {
    return (
      !prevProps.hasToken &&
      !nextProps.hasToken &&
      prevProps.isPending === nextProps.isPending
    )
  }
)

const hideLine = (line: AbstractLine): boolean =>
  isNoteLine(line) || isParallelLine(line)

export default abstract class TokenAnnotation extends React.Component<
  TokenAnnotationProps,
  TokenAnnotationState
> {
  protected text: Text
  protected museumNumber: string
  protected wordService: WordService
  protected fragmentService: FragmentService
  protected lineComponents: LineComponentMap
  protected tokens: EditableToken[]
  protected tokenMap: ReadonlyMap<Token, EditableToken>
  protected setText: TextSetter

  constructor(props: {
    text: Text
    museumNumber: string
    setText: TextSetter
    wordService: WordService
    fragmentService: FragmentService
    editableTokens: EditableToken[]
  }) {
    super(props)

    this.museumNumber = props.museumNumber
    this.text = props.text
    this.setText = props.setText
    this.wordService = props.wordService
    this.fragmentService = props.fragmentService
    this.tokens = props.editableTokens
    this.tokenMap = new Map(this.tokens.map((token) => [token.token, token]))
    this.lineComponents = defaultLineComponents

    const firstToken = this.tokens[0] || null
    this.state = {
      activeToken: firstToken?.select() || null,
      activeLine: firstToken?.lineIndex || null,
      updates: new Map(),
      pendingLines: new Set(),
      process: null,
    }
  }

  setActiveToken = (token: EditableToken | null): void => {
    this.state.activeToken?.unselect()
    this.setState({
      activeToken: token?.select() || null,
      activeLine: token?.lineIndex || null,
    })
  }

  toggleActiveToken = (token: EditableToken): void => {
    if (this.state.activeToken === token) {
      this.setActiveToken(null)
    } else {
      this.setActiveToken(token)
    }
  }

  getEditableToken(token: Token): EditableToken | undefined {
    return this.tokenMap.get(token)
  }

  selectTokenAtIndex = (index: number): void => {
    this.setActiveToken(_.nth(this.tokens, index % this.tokens.length) || null)
  }

  selectPreviousToken = (): void => {
    if (this.state.activeToken !== null) {
      this.selectTokenAtIndex(
        Math.max(this.state.activeToken.indexInText - 1, 0)
      )
    }
  }

  selectNextToken = (): void => {
    if (this.state.activeToken !== null) {
      this.selectTokenAtIndex(
        Math.min(this.state.activeToken.indexInText + 1, this.tokens.length - 1)
      )
    }
  }

  selectSimilarTokens = (): void => {
    const pendingLines = new Set<number>()
    this.tokens.forEach((token) => {
      token.isPending = this.state.activeToken?.cleanValue === token.cleanValue
      if (token.isPending) {
        pendingLines.add(token.lineIndex)
      }
    })
    this.setState({ pendingLines })
  }

  unselectSimilarTokens = (): void => {
    this.tokens.forEach((token) => (token.isPending = false))
    this.setState({ pendingLines: new Set<number>() })
  }

  isDirty = (): boolean => {
    return _.some(this.tokens, (token) => token.isDirty)
  }

  reduceLines = (
    [elements, labels]: [JSX.Element[], Labels],
    line: AbstractLine,
    index: number
  ): [JSX.Element[], Labels] => {
    const currentLabels = getCurrentLabels(labels, line)
    const LineComponent =
      this.lineComponents.get(line.type) || DisplayControlLine
    return [
      [
        ...elements,
        hideLine(line) ? (
          <React.Fragment key={index}></React.Fragment>
        ) : (
          <MemoizedRowDisplay
            key={index}
            line={line}
            lineIndex={index}
            hasToken={index === this.state.activeToken?.lineIndex}
            isPending={
              this.state.pendingLines.has(index) || this.isProcessing()
            }
            LineComponent={LineComponent}
            numberOfColumns={this.text.numberOfColumns}
            labels={labels}
            notes={this.text.notes}
          />
        ),
      ],
      currentLabels,
    ]
  }

  isProcessing = (): boolean => this.state.process !== null
}
