import React, { PropsWithChildren } from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentCrumb from 'fragmentarium/ui/FragmentCrumb'
import withData from 'http/withData'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { defaultLabels, Labels } from 'transliteration/domain/labels'
import { Notes, Text } from 'transliteration/domain/text'
import { isTranslationLine } from 'transliteration/domain/type-guards'
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

function getToken(node: Node | null): void {
  const tokenNode = node?.parentElement?.closest('.markable')
  console.log(tokenNode)
}

function getSelectedTokens(): void {
  const selection = document.getSelection()
  if (selection) {
    console.log(selection)
    const start = getToken(selection.anchorNode)
    const end = getToken(selection.focusNode)

    console.log('start:', start)
    console.log('end:', end)
  }
}

function DisplayAnnotationLine({ line, columns }: LineProps): JSX.Element {
  const textLine = line as TextLine

  function TokenTrigger({
    children,
    token,
  }: TokenActionWrapperProps): JSX.Element {
    return (
      <span
        className={'markable'}
        data-id={token.cleanValue}
        onMouseUp={getSelectedTokens}
        style={{ border: '1px solid blue' }}
      >
        {children}
      </span>
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
  children,
}: PropsWithChildren<
  LineProps & {
    lineIndex: number
    notes: Notes
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
                const rows = isTranslationLine(line)
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
