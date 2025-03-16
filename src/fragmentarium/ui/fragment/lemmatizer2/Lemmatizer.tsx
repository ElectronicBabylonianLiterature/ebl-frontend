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
import { Button, Col, Container, Modal, Row } from 'react-bootstrap'
import { Token } from 'transliteration/domain/token'
import FragmentService from 'fragmentarium/application/FragmentService'
import withData from 'http/withData'
import WordService from 'dictionary/application/WordService'
import Lemma from 'transliteration/domain/Lemma'

type Props = {
  text: Text
  fragmentService: FragmentService
  lemmas: readonly Lemma[]
  collapseImageColumn: (boolean) => void
}
type State = {
  activeToken: Token | null
}

export default class Lemmatizer2 extends React.Component<Props, State> {
  private text: Text
  private fragmentService: FragmentService
  private lineComponents: LineComponentMap
  private lemmas: readonly Lemma[]

  constructor(props: {
    text: Text
    fragmentService: FragmentService
    collapseImageColumn: (boolean) => void
    lemmas: readonly Lemma[]
  }) {
    super(props)
    props.collapseImageColumn(true)
    this.text = props.text
    this.fragmentService = props.fragmentService
    this.lineComponents = new Map([
      ...Array.from(defaultLineComponents),
      ['TextLine', this.DisplayAnnotationLine],
    ])
    this.lemmas = props.lemmas
    this.state = { activeToken: null }
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
    this.setState({ activeToken: token })
  }

  toggleActiveToken = (token: Token): void => {
    if (this.state.activeToken === token) {
      this.setActiveToken(null)
    } else {
      this.setActiveToken(token)
    }
  }

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
      </span>
    )
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
          <Modal.Body></Modal.Body>
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
