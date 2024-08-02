import React, { Component } from 'react'
import { TextLineColumn } from 'transliteration/domain/columns'
import { TextLine } from 'transliteration/domain/text-line'
import { isLeftSide, Protocol } from 'transliteration/domain/token'
import { MarkableToken } from './MarkableToken'
import { Form } from 'react-bootstrap'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import AsyncSelect from 'react-select/async'
import FragmentService from 'fragmentarium/application/FragmentService'
import {
  components,
  MultiValueProps,
  OptionProps,
  SingleValueProps,
} from 'react-select'
import InlineMarkdown from 'common/InlineMarkdown'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import WordService from 'dictionary/application/WordService'

type Props = {
  markable: MarkableToken
  fragmentService: FragmentService
  wordService: WordService
}

const Option = (
  props: OptionProps<LemmaOption, true> | OptionProps<LemmaOption, false>
): JSX.Element => (
  <components.Option {...props}>
    <InlineMarkdown source={props.label} />
  </components.Option>
)

const MultiValueLabel = (props: MultiValueProps<LemmaOption>): JSX.Element => (
  <components.MultiValueLabel {...props}>
    <InlineMarkdown source={props.data.label} />
  </components.MultiValueLabel>
)

const SingleValue = (props: SingleValueProps<LemmaOption>): JSX.Element => (
  <components.SingleValue {...props}>
    <InlineMarkdown source={props.data.label} />
  </components.SingleValue>
)

type State = {
  isComplex: boolean
}

class LemmaEditForm extends Component<Props, State> {
  markable: MarkableToken
  lemmatizable: boolean

  constructor(props: Props) {
    super(props)
    this.markable = props.markable
    this.lemmatizable = this.markable.token.lemmatizable || false
    const isComplex = this.markable.hasLemma && this.markable.lemma.length === 1

    this.state = {
      isComplex: isComplex,
    }
  }

  loadOptions = (
    inputValue: string,
    callback: (lemmas: LemmaOption[]) => void
  ): void => {
    this.props.wordService
      .searchLemma(inputValue)
      .then((words) => words.map((word) => new LemmaOption(word)))
      .then(callback)
  }

  render(): JSX.Element {
    return (
      <AsyncSelect
        aria-label={'lemma-selector'}
        placeholder={this.lemmatizable ? 'a placeholder' : 'ø'}
        isDisabled={!this.lemmatizable}
        cacheOptions
        isClearable
        loadOptions={this.loadOptions}
        // defaultOptions={} // put suggestions here
        components={{ Option, MultiValueLabel, SingleValue }}
      />
    )
  }
}

function createTokenMarkables(
  columns: readonly TextLineColumn[]
): MarkableToken[] {
  let language = 'AKKADIAN'
  let isInGloss = false
  let protocol: Protocol | null = null
  let markable: MarkableToken

  const markables: MarkableToken[] = []

  columns.forEach((column) =>
    column.content.forEach((token, index) => {
      switch (token.type) {
        case 'LanguageShift':
          language = token.language
          break
        case 'CommentaryProtocol':
          protocol = token.value
          break
        case 'DocumentOrientedGloss':
          isInGloss = isLeftSide(token)
          break
        case 'Column':
          throw new Error('Unexpected column token.')
        default:
          markable = new MarkableToken(
            token,
            index,
            isInGloss,
            protocol,
            language
          )
          markables.push(markable)
      }
    })
  )
  return markables
}

function DisplayMarkable({
  markable,
}: {
  markable: MarkableToken
}): JSX.Element {
  return (
    <>
      <span className={'source-token'}>{markable.display()}</span>
    </>
  )
}

export function AnnotationLine({
  line,
  lineIndex,
  fragmentService,
  wordService,
}: {
  line: TextLine
  lineIndex: number
  fragmentService: FragmentService
  wordService: WordService
}): JSX.Element {
  const markables = createTokenMarkables(line.columns)

  const checkbox = (
    <td className={'annotation-line__checkbox-column'}>
      <Form.Check type={'checkbox'} />
    </td>
  )

  return (
    <>
      <tr>
        {checkbox}
        <td>({lineNumberToString(line.lineNumber)})</td>
        <td></td>
      </tr>
      {markables.map((markable, index) => {
        return (
          <tr key={index}>
            {checkbox}
            <td>
              <DisplayMarkable markable={markable} />
            </td>
            <td className={'annotation-line__lemma-column'}>
              <LemmaEditForm
                markable={markable}
                fragmentService={fragmentService}
                wordService={wordService}
              />
            </td>
          </tr>
        )
      })}
    </>
  )
}
