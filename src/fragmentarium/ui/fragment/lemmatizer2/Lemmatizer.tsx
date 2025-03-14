import React from 'react'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import { LineNumber } from 'transliteration/ui/line-number'
import { LineColumns } from 'transliteration/ui/line-tokens'
import { TokenActionWrapperProps } from 'transliteration/ui/LineAccumulator'
import { LineProps } from 'transliteration/ui/LineProps'
import {
  defaultLineComponents,
  DisplayText,
  LineComponentMap,
} from 'transliteration/ui/TransliterationLines'
import TransliterationTd from 'transliteration/ui/TransliterationTd'
import './Lemmatizer.sass'

type Props = {
  text: Text
}

function TestWrapper({
  children,
  token,
}: TokenActionWrapperProps): JSX.Element {
  return (
    <span
      className="lemmatizer__token-wrapper"
      onClick={() => console.log('on the token', token)}
    >
      {children}
    </span>
  )
}

export default class Lemmatizer2 extends React.Component<Props> {
  private text: Text
  private lineComponents: LineComponentMap

  constructor(props: { text: Text }) {
    super(props)
    this.text = props.text
    this.lineComponents = new Map([
      ...Array.from(defaultLineComponents),
      ['TextLine', this.DisplayAnnotationLine],
    ])
  }

  DisplayAnnotationLine = ({ line, columns }: LineProps): JSX.Element => {
    const textLine = line as TextLine

    return (
      <>
        <TransliterationTd type={textLine.type}>
          <LineNumber line={textLine} />
        </TransliterationTd>
        <LineColumns
          columns={textLine.columns}
          maxColumns={columns}
          TokenActionWrapper={TestWrapper}
        />
      </>
    )
  }

  render(): React.ReactNode {
    return (
      <table className="Transliteration__lines">
        <tbody>
          <DisplayText text={this.text} lineComponents={this.lineComponents} />
        </tbody>
      </table>
    )
  }
}
