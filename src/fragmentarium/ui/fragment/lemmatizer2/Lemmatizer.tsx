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
import classNames from 'classnames'
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap'
import { Token } from 'transliteration/domain/token'
import FragmentService from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import WordService from 'dictionary/application/WordService'
import Lemma from 'transliteration/domain/Lemma'
import Select, { ValueType } from 'react-select'
import Bluebird from 'bluebird'
import _ from 'lodash'

type Props = {
  text: Text
  fragmentService: FragmentService
  wordService: WordService
  lemmas: readonly Lemma[]
  collapseImageColumn: (boolean) => void
}
type LemmaOption = {
  label: string
  value: string
}
type State = {
  activeToken: Token | null
  lemmaOptions: LemmaOption[]
  selected: ValueType<LemmaOption, true>
  updates: Map<Token, ValueType<LemmaOption, true>>
}

export default class Lemmatizer2 extends React.Component<Props, State> {
  private text: Text
  private fragmentService: FragmentService
  private wordService: WordService
  private lineComponents: LineComponentMap
  private lemmas: readonly Lemma[]

  constructor(props: {
    text: Text
    fragmentService: FragmentService
    wordService: WordService
    collapseImageColumn: (boolean) => void
    lemmas: readonly Lemma[]
  }) {
    super(props)
    props.collapseImageColumn(true)
    this.text = props.text
    this.fragmentService = props.fragmentService
    this.wordService = props.wordService
    this.lineComponents = new Map([
      ...Array.from(defaultLineComponents),
      ['TextLine', this.DisplayAnnotationLine],
    ])
    this.lemmas = props.lemmas
    this.state = {
      activeToken: null,
      lemmaOptions: [],
      selected: [],
      updates: new Map(),
    }
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
          TokenActionWrapper={this.TokenTrigger}
        />
      </>
    )
  }

  setActiveToken = (token: Token | null): void => {
    this.setState({
      activeToken: token,
      selected: (token?.uniqueLemma || []).map((lemma) => ({
        label: lemma,
        value: lemma,
      })),
    })
  }

  toggleActiveToken = (token: Token): void => {
    if (this.state.activeToken === token) {
      this.setActiveToken(null)
      this.setState({ lemmaOptions: [], selected: [] })
    } else {
      this.setActiveToken(token)
    }
  }

  loadOptions = async (userInput: string): Bluebird<LemmaOption[]> => {
    const words = await this.wordService.searchLemma(userInput)
    return words.map((word) => ({ label: word._id, value: word._id }))
  }

  handleInputChange = (userInput: string): void => {
    this.loadOptions(userInput).then((lemmaOptions) =>
      this.setState({ lemmaOptions })
    )
  }

  handleChange = (selected: ValueType<LemmaOption, true>): void => {
    const updates = this.state.activeToken
      ? new Map(this.state.updates).set(this.state.activeToken, selected)
      : this.state.updates
    this.setState({ selected, updates })
  }

  isEdited = (token: Token): boolean =>
    !_.isEqual(
      token.uniqueLemma,
      this.state.updates.has(token)
        ? (this.state.updates.get(token) || []).map((option) => option.value)
        : token.uniqueLemma
    )

  TokenTrigger = ({
    children,
    token,
  }: TokenActionWrapperProps): JSX.Element => {
    return (
      <span
        className={classNames('lemmatizer__token-wrapper', {
          editable: token.lemmatizable,
          selected: token === this.state.activeToken,
        })}
        onClick={() => {
          if (token.lemmatizable) {
            this.toggleActiveToken(token)
          }
        }}
      >
        {children}
        {this.isEdited(token) ? '*' : ''}
      </span>
    )
  }

  resetToken = (token?: Token | null): void => {
    if (token) {
      const updates = new Map(this.state.updates)
      updates.delete(token)
      this.setState({ updates })
    }
  }

  setValue = (token?: Token | null): ValueType<LemmaOption, true> => {
    if (!token) {
      return []
    } else if (this.state.updates.has(token)) {
      return this.state.updates.get(token)
    } else {
      return token.uniqueLemma?.map((lemma) => ({
        value: lemma,
        label: lemma,
      }))
    }
  }

  selectNextToken = (): void => {
    const lemmatizableTokens = this.text.lines
      .flatMap((line) => line.content)
      .filter((token) => token.lemmatizable)

    let isNextToken = false

    if (_.last(lemmatizableTokens) === this.state.activeToken) {
      this.setActiveToken(lemmatizableTokens[0])
    }

    for (const token of lemmatizableTokens) {
      if (isNextToken) {
        this.setActiveToken(token)
        break
      }
      isNextToken = token === this.state.activeToken
    }
  }

  Editor = (): JSX.Element => {
    const activeToken = this.state.activeToken
    const title = activeToken
      ? `Edit ${activeToken.cleanValue}`
      : 'No Token Selected'

    return (
      <div className="modal show lemmatizer__editor">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title as={'h6'}>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(event) => {
                event.preventDefault()
                this.selectNextToken()
              }}
            >
              <Row>
                <Col className={'lemmatizer__editor__col'}>
                  <Select
                    isDisabled={!activeToken}
                    isClearable={false}
                    aria-label="edit-token-lemmas"
                    isMulti={true}
                    isSearchable={true}
                    onInputChange={this.handleInputChange}
                    onChange={this.handleChange}
                    options={this.state.lemmaOptions}
                    placeholder={'Add lemmas...'}
                    value={this.setValue(activeToken)}
                  />
                </Col>
                <Col xs={1} className={'lemmatizer__editor__col'}>
                  <Button
                    variant="secondary"
                    onClick={() => this.resetToken(activeToken)}
                  >
                    <i className={'fas fa-rotate-left'}></i>
                  </Button>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary">Close</Button>
            <Button variant="primary">Save changes</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </div>
    )
  }

  render(): React.ReactNode {
    return (
      <Container fluid className="lemmatizer__anno-tool">
        <Row>
          <Col>
            <table className="Transliteration__lines">
              <tbody>
                <DisplayText
                  text={this.text}
                  lineComponents={this.lineComponents}
                />
              </tbody>
            </table>
          </Col>
          <Col>
            <this.Editor />
          </Col>
        </Row>
      </Container>
    )
  }
}

export const LoadLemmatizer = withData<
  Omit<Props, 'lemmas'>,
  {
    wordService: WordService
  },
  readonly Lemma[]
>(
  ({ data: lemmas, ...props }) => <Lemmatizer2 lemmas={lemmas} {...props} />,
  (props) => {
    const tokens: string[] = props.text.lines
      .flatMap((line) => line.content)
      .flatMap((token) => token.uniqueLemma || [])

    return props.wordService
      .findAll(tokens)
      .then((words) => words.map((word) => new Lemma(word)))
  }
)
