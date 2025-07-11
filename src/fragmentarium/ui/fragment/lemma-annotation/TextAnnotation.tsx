import React, {
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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
import classNames from 'classnames'

const markableClass = 'text-annotation__markable'

function clearSelection(): void {
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

function isIdToken(token: Token): token is AnyWord {
  return isLoneDeterminative(token) || isAnyWord(token)
}

function expandSelection(
  start: string,
  end: string,
  words: readonly string[]
): readonly string[] {
  const selection: string[] = []
  let inSelection = false

  for (const wordId of words) {
    if ([start, end].includes(wordId)) {
      selection.push(wordId)
      if (start === end) {
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

function Markable({
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
  return (
    <span
      className={classNames(markableClass, {
        'text-annotation__selected': token.id && selection.includes(token.id),
      })}
      data-id={token.id}
      onMouseUp={(event) => {
        setSelection(getSelectedTokens(words))
        event.stopPropagation()
      }}
    >
      {children}
    </span>
  )
}

function DisplayAnnotationLine({
  line,
  columns,
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
  }: TokenActionWrapperProps): JSX.Element {
    return isIdToken(token) ? (
      <Markable
        token={token}
        words={words}
        selection={selection}
        setSelection={setSelection}
      >
        {children}
      </Markable>
    ) : (
      <>{children}</>
    )
  }

  return (
    <>
      <TransliterationTd
        type={textLine.type}
        className={'text-annotation__line-number'}
      >
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
  const textRef = useRef<HTMLTableElement>(null)
  const [selection, setSelection] = useState<readonly string[]>([])
  const [isAltPressed, setIsAltPressed] = useState(false)

  const words: readonly string[] = useMemo(() => {
    return text.lines
      .filter((line) => isTextLine(line))
      .flatMap((line) =>
        line.content
          .filter((token) => isIdToken(token))
          .map((token) => (token as AnyWord).id || '')
      )
  }, [text])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        setIsAltPressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) {
        setIsAltPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <div
      className={'text-annotation__text-wrapper'}
      onMouseUp={() => {
        setSelection([])
        clearSelection()
      }}
    >
      <table
        className={classNames(
          'Transliteration__lines',
          'text-annotation__table',
          {
            'alt-pressed': isAltPressed,
          }
        )}
        ref={textRef}
      >
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
