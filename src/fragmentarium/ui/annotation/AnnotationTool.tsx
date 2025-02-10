import React, { Component, FunctionComponent } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
// import { TextLineColumn } from 'transliteration/domain/columns'
import { TextLine } from 'transliteration/domain/text-line'
import DisplayControlLine from 'transliteration/ui/DisplayControlLine'
import DisplayTranslationLine from 'transliteration/ui/DisplayTranslationLine'
import { DisplayDollarAndAtLine } from 'transliteration/ui/dollar-and-at-lines'
import { Anchor, LineNumber } from 'transliteration/ui/line-number'
import { LineProps } from 'transliteration/ui/LineProps'
import { DisplayParallelLine } from 'transliteration/ui/parallel-line'
import DisplayRulingDollarLine from 'transliteration/ui/rulings'
import { createId } from 'transliteration/ui/text-line'
import TransliterationTd from 'transliteration/ui/TransliterationTd'
import { Button } from 'react-bootstrap'
import DisplayToken from 'transliteration/ui/DisplayToken'
// import { LineAccumulator } from 'transliteration/ui/LineAccumulator'
// import { Token } from 'transliteration/domain/token'

type Props = {
  fragment: Fragment
}

type State = any

// function lineAccForAnnotation({
//   columns,
// }: {
//   columns: readonly TextLineColumn[]
// }): LineAccumulator {
//   return columns.reduce((acc: LineAccumulator, column) => {
//     acc.addColumn(column.span)
//     column.content.reduce(
//       (acc: LineAccumulator, token: Token, index: number) => {
//         acc.addColumnToken(token, index)
//         return acc
//       },
//       acc
//     )
//     return acc
//   }, new LineAccumulator())
// }

// function AnnotationLine({
//   columns,
//   maxColumns,
// }: {
//   columns: readonly TextLineColumn[]
//   maxColumns: number
// }): JSX.Element {
//   const lineAccumulator = lineAccForAnnotation({
//     columns,
//   })

//   return <>{lineAccumulator.getColumns(maxColumns)}</>
// }

function DisplayAnnotationLine({
  line,
  columns,
  labels,
}: LineProps): JSX.Element {
  const textLine = line as TextLine
  const id = createId(labels, textLine)

  return (
    <>
      <TransliterationTd type={textLine.type}>
        <Anchor className="Transliteration__anchor" id={id}>
          <LineNumber line={textLine} />
        </Anchor>
      </TransliterationTd>
      <>
        {/* <AnnotationLine columns={textLine.columns} maxColumns={columns} /> */}
        {textLine.content.map((token, index) => {
          return (
            <React.Fragment key={index}>
              {token.lemmatizable ? (
                <Button variant={'outline-secondary'}>
                  <DisplayToken token={token} />
                </Button>
              ) : (
                <DisplayToken token={token} />
              )}
            </React.Fragment>
          )
        })}
      </>
    </>
  )
}

const lineComponents: ReadonlyMap<
  string,
  FunctionComponent<LineProps>
> = new Map([
  ['TextLine', DisplayAnnotationLine],
  ['RulingDollarLine', DisplayRulingDollarLine],
  ['LooseDollarLine', DisplayDollarAndAtLine],
  ['ImageDollarLine', DisplayDollarAndAtLine],
  ['SealDollarLine', DisplayDollarAndAtLine],
  ['StateDollarLine', DisplayDollarAndAtLine],
  ['SealAtLine', DisplayDollarAndAtLine],
  ['ColumnAtLine', DisplayDollarAndAtLine],
  ['HeadingAtLine', DisplayDollarAndAtLine],
  ['DiscourseAtLine', DisplayDollarAndAtLine],
  ['SurfaceAtLine', DisplayDollarAndAtLine],
  ['ObjectAtLine', DisplayDollarAndAtLine],
  ['DivisionAtLine', DisplayDollarAndAtLine],
  ['CompositeAtLine', DisplayDollarAndAtLine],
  ['TranslationLine', DisplayTranslationLine],
  ['ParallelFragment', DisplayParallelLine],
  ['ParallelText', DisplayParallelLine],
  ['ParallelComposition', DisplayParallelLine],
])

class AnnotationTool extends Component<Props, State> {
  render(): JSX.Element {
    return (
      <table className="Transliteration__lines">
        <tbody>
          {this.props.fragment.text.lines.map((line, lineIndex) => {
            const LineComponent =
              lineComponents.get(line.type) || DisplayControlLine
            return (
              <tr key={lineIndex}>
                <LineComponent
                  line={line}
                  columns={this.props.fragment.text.numberOfColumns}
                />
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
}

export default AnnotationTool
