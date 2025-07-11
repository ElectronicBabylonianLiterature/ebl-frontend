import React, { PropsWithChildren, useMemo, useState } from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentCrumb from 'fragmentarium/ui/FragmentCrumb'
import withData from 'http/withData'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { defaultLabels, Labels } from 'transliteration/domain/labels'
import { Notes, Text } from 'transliteration/domain/text'
import {
  isAnyWord,
  isLoneDeterminative,
  isTextLine,
} from 'transliteration/domain/type-guards'
import DisplayControlLine from 'transliteration/ui/DisplayControlLine'
import { LineProps } from 'transliteration/ui/LineProps'
import { createLineId } from 'transliteration/ui/note-links'
import {
  defaultLineComponents,
  getCurrentLabels,
} from 'transliteration/ui/TransliterationLines'
import { TextLine } from 'transliteration/domain/text-line'
import { LineNumber } from 'transliteration/ui/line-number'
import { LineColumns } from 'transliteration/ui/line-tokens'
import TransliterationTd from 'transliteration/ui/TransliterationTd'
import { TokenActionWrapperProps } from 'transliteration/ui/LineAccumulator'
import { Token, AnyWord } from 'transliteration/domain/token'
import { hideLine } from 'fragmentarium/ui/fragment/linguistic-annotation/TokenAnnotation'
import './TextAnnotation.sass'

interface TokenData {
  id: string | null
  index: number
  lineIndex: number
}

function clearSelection(): void {
  if (window.getSelection) {
    if (window.getSelection()?.empty) {
      window.getSelection()?.empty()
    } else if (window.getSelection()?.removeAllRanges) {
      window.getSelection()?.removeAllRanges()
    }
  }
}

function parseIntData(data: string | null): number {
  if (data === null) {
    throw new Error('Missing data')
  }
  return parseInt(data)
}

function getTokenData(node: Node | null): TokenData | null {
  const tokenNode = node?.parentElement?.closest('.markable')
  return tokenNode
    ? {
        id: tokenNode.getAttribute('data-id'),
        index: parseIntData(tokenNode.getAttribute('data-token-index')),
        lineIndex: parseIntData(tokenNode.getAttribute('data-line-index')),
      }
    : null
}

function getSelectedTokens(words: readonly string[]): readonly string[] {
  const selection = document.getSelection()
  if (selection) {
    const start = getTokenData(selection.anchorNode)
    const end = getTokenData(selection.focusNode)

    if (start && end) {
      clearSelection()
      return expandSelection(start, end, words)
    }
  }
  return []
}

function isIdToken(token: Token): token is AnyWord {
  return isLoneDeterminative(token) || isAnyWord(token)
}

function expandSelection(
  start: TokenData,
  end: TokenData,
  words: readonly string[]
): readonly string[] {
  const selection: string[] = []
  let inSelection = false

  for (const wordId of words) {
    if ([start.id, end.id].includes(wordId)) {
      selection.push(wordId)
      if (start.id === end.id) {
        break
      }
      inSelection = !inSelection
      continue
    }
    if (inSelection) {
      selection.push(wordId)
    }
  }
  return selection
}

function DisplayAnnotationLine({
  line,
  columns,
  lineIndex,
  words,
  selection,
  setSelection,
}: LineProps & {
  words: readonly string[]
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
}): JSX.Element {
  const textLine = line as TextLine

  function TokenTrigger({
    children,
    token,
    tokenIndex,
  }: TokenActionWrapperProps): JSX.Element {
    return isIdToken(token) ? (
      <span
        className={'markable'}
        data-id={token.id}
        data-token-index={tokenIndex}
        data-line-index={lineIndex}
        onMouseUp={() => setSelection(getSelectedTokens(text))}
        style={{
          border: '1px solid blue',
          background:
            token.id && selection.includes(token.id) ? 'orange' : 'transparent',
        }}
      >
        {children}
      </span>
    ) : (
      <>{children}</>
    )
  }

  return (
    <>
      <TransliterationTd type={textLine.type}>
        <LineNumber line={textLine} />
      </TransliterationTd>
      <LineColumns
        columns={textLine.columns}
        maxColumns={columns}
        TokenActionWrapper={TokenTrigger}
      />
    </>
  )
}

function DisplayRow({
  line,
  lineIndex,
  columns,
  labels,
  activeLine,
  words,
  children,
  selection,
  setSelection,
}: PropsWithChildren<
  LineProps & {
    lineIndex: number
    words: readonly string[]
    notes: Notes
    selection: readonly string[]
    setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
  }
>): JSX.Element {
  const lineNumber = lineIndex + 1

  if (line.type === 'TextLine') {
    return (
      <tr id={createLineId(lineNumber)}>
        <DisplayAnnotationLine
          line={line}
          lineIndex={lineIndex}
          columns={columns}
          labels={labels}
          activeLine={activeLine}
          selection={selection}
          setSelection={setSelection}
          words={words}
        />
        {children}
      </tr>
    )
  }
  const LineComponent =
    defaultLineComponents.get(line.type) || DisplayControlLine

  return (
    <tr id={createLineId(lineNumber)}>
      <LineComponent
        line={line}
        lineIndex={lineIndex}
        columns={columns}
        labels={labels}
        activeLine={activeLine}
      />
      {children}
    </tr>
  )
}

function DisplayText({ text }: { text: Text }): JSX.Element {
  const [selection, setSelection] = useState<readonly string[]>([])
  const words: readonly string[] = useMemo(() => {
    return text.lines
      .filter((line) => isTextLine(line))
      .flatMap((line) =>
        line.content
          .filter((token) => isIdToken(token))
          .map((token) => (token as AnyWord).id || '')
      )
  }, [text])

  return (
    <div className="lemmatizer__text-wrapper">
      <table className="Transliteration__lines">
        <tbody>
          {
            text.lines.reduce<[JSX.Element[], Labels]>(
              (
                [elements, labels]: [JSX.Element[], Labels],
                line: AbstractLine,
                index: number
              ) => {
                const rows = hideLine(line)
                  ? elements
                  : [
                      ...elements,
                      <DisplayRow
                        key={index}
                        line={line}
                        lineIndex={index}
                        columns={text.numberOfColumns}
                        labels={labels}
                        notes={text.notes}
                        words={words}
                        selection={selection}
                        setSelection={setSelection}
                      />,
                    ]
                return [rows, getCurrentLabels(labels, line)]
              },
              [[], defaultLabels]
            )[0]
          }
        </tbody>
      </table>
    </div>
  )
}

function TextAnnotationView({ fragment }: { fragment: Fragment }): JSX.Element {
  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Library'),
        new FragmentCrumb(fragment.number),
        new TextCrumb('Annotation'),
      ]}
      title={`Annotate ${fragment.number}`}
    >
      <DisplayText text={fragment.text} />
    </AppContent>
  )
}

export default withData<
  unknown,
  { number: string; fragmentService: FragmentService },
  Fragment
>(
  ({ data }) => <TextAnnotationView fragment={data} />,
  (props) => props.fragmentService.find(props.number)
)
