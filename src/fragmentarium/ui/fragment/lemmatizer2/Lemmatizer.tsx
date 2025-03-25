import React, { createRef } from 'react'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import { LineNumber } from 'transliteration/ui/line-number'
import { LineColumns } from 'transliteration/ui/line-tokens'
import { TokenActionWrapperProps } from 'transliteration/ui/LineAccumulator'
import { LineProps } from 'transliteration/ui/LineProps'
import {
  defaultLineComponents,
  getCurrentLabels,
  LineComponentMap,
} from 'transliteration/ui/TransliterationLines'
import TransliterationTd from 'transliteration/ui/TransliterationTd'
import './Lemmatizer.sass'
import {
  Button,
  ButtonGroup,
  Col,
  Container,
  Dropdown,
  Form,
  Modal,
  Row,
} from 'react-bootstrap'
import { Token } from 'transliteration/domain/token'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import Lemma from 'transliteration/domain/Lemma'
import { ValueType } from 'react-select'
import StateManager from 'react-select'
import EditableToken from 'fragmentarium/ui/fragment/lemmatizer2/EditableToken'
import _ from 'lodash'
import { defaultLabels, Labels } from 'transliteration/domain/labels'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import DisplayControlLine from 'transliteration/ui/DisplayControlLine'
import { createLineId, NoteLinks } from 'transliteration/ui/note-links'
import LemmaSelect from 'fragmentarium/ui/fragment/lemmatizer2/LemmatizerForm'
import Word from 'dictionary/domain/Word'
import withData from 'http/withData'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'

type Props = {
  text: Text
  fragmentService: FragmentService
  wordService: WordService
  initialWords: readonly Word[]
  collapseImageColumn: (boolean) => void
}

type State = {
  activeToken: EditableToken | null
  activeLine: number | null
  lemmaOptions: LemmaOption[]
  updates: Map<Token, ValueType<LemmaOption, true>>
  pending: boolean
  updateBuffer: Token[]
}

const createEditableTokens = (
  text: Text,
  words: readonly Word[]
): EditableToken[] => {
  const tokens: EditableToken[] = []
  let indexInText = 0
  text.lines.forEach((line, lineIndex) => {
    line.content.forEach((token, indexInLine) => {
      if (token.lemmatizable) {
        const lemmas = token.uniqueLemma.map((lemma) => {
          const word = _.find(words, (word) => word._id === lemma) as Word
          return new LemmaOption(word)
        })
        tokens.push(
          new EditableToken(token, indexInText, indexInLine, lineIndex, lemmas)
        )
        indexInText++
      }
    })
  })
  return tokens
}

export default class Lemmatizer2 extends React.Component<Props, State> {
  private text: Text
  private fragmentService: FragmentService
  private wordService: WordService
  private lineComponents: LineComponentMap
  private lemmas: readonly Lemma[]
  private editorRef = createRef<StateManager<LemmaOption, true>>()
  private tokens: EditableToken[]
  private tokenMap: ReadonlyMap<Token, EditableToken>

  constructor(props: {
    text: Text
    fragmentService: FragmentService
    wordService: WordService
    collapseImageColumn: (boolean) => void
    lemmas: readonly Lemma[]
    initialWords: readonly Word[]
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
    this.tokens = createEditableTokens(this.text, props.initialWords)
    this.tokenMap = new Map(this.tokens.map((token) => [token.token, token]))
    const tokens = [...this.tokenMap.values()]

    const firstToken = tokens[0] || null
    this.state = {
      activeToken: firstToken.select(),
      activeLine: firstToken.lineIndex,
      lemmaOptions: [],
      updates: new Map(),
      pending: false,
      updateBuffer: [],
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

  setActiveToken = (token: EditableToken | null): void => {
    this.state.activeToken?.unselect()
    this.setState({
      activeToken: token?.select() || null,
      activeLine: token?.lineIndex || null,
    })
    this.editorRef.current?.focus()
  }

  toggleActiveToken = (token: EditableToken): void => {
    if (this.state.activeToken === token) {
      this.setActiveToken(null)
      this.setState({ lemmaOptions: [] })
    } else {
      this.setActiveToken(token)
    }
  }

  handleChange = (selected: ValueType<LemmaOption, true>): void => {
    this.state.activeToken?.updateLemmas((selected || []) as LemmaOption[])
    this.setActiveToken(this.state.activeToken)
  }

  getEditableToken(token: Token): EditableToken | undefined {
    return this.tokenMap.get(token)
  }

  TokenTrigger = ({
    children,
    token,
  }: TokenActionWrapperProps): JSX.Element => {
    const editableToken = this.getEditableToken(token)
    return editableToken ? (
      <editableToken.Display
        onClick={() => this.toggleActiveToken(editableToken)}
      >
        {children}
      </editableToken.Display>
    ) : (
      <>{children}</>
    )
  }

  selectTokenAtIndex = (index: number): void => {
    this.setActiveToken(_.nth(this.tokens, index % this.tokens.length) || null)
  }

  selectNextToken = (): void => {
    if (this.state.activeToken !== null) {
      this.selectTokenAtIndex(
        Math.min(this.state.activeToken.indexInText + 1, this.tokens.length - 1)
      )
    }
  }

  applyToPendingInstances = (): void => {
    const pendingTokens = this.tokens.filter((token) => token.isPending)
    pendingTokens.forEach((token) =>
      token.updateLemmas(this.state.activeToken?.lemmas || [])
    )
    this.unselectSimilarTokens()
  }

  undoPendingInstances = (): void => {
    this.tokens.forEach((token) => {
      if (token.isPending) {
        token.updateLemmas(null)
      }
    })
    this.unselectSimilarTokens()
  }

  resetActiveToken = (): void => {
    this.state.activeToken?.updateLemmas(null)
    this.setActiveToken(this.state.activeToken)
  }

  selectSimilarTokens = (): void => {
    this.tokens.forEach(
      (token) =>
        (token.isPending =
          this.state.activeToken?.cleanValue === token.cleanValue)
    )
    this.setState({ pending: true })
  }

  unselectSimilarTokens = (): void => {
    this.tokens.forEach((token) => (token.isPending = false))
    this.setState({ pending: false })
  }

  isDirty = (): boolean => {
    return _.some(this.tokens, (token) => token.isDirty)
  }

  ActionButton = (): JSX.Element => {
    const isDirty =
      this.state.activeToken !== null && this.state.activeToken.isDirty
    return (
      <Dropdown as={ButtonGroup}>
        <Button
          variant="secondary"
          onClick={this.resetActiveToken}
          disabled={!isDirty}
        >
          <i className={'fas fa-rotate-left'}></i>
        </Button>

        <Dropdown.Toggle
          split
          variant="secondary"
          id="dropdown-split-basic"
          disabled={!isDirty}
        >
          <i className={'fas fa-caret-down'}></i>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item
            onMouseEnter={this.selectSimilarTokens}
            onMouseLeave={this.unselectSimilarTokens}
            onClick={this.applyToPendingInstances}
          >
            Apply to All
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item
            onMouseEnter={this.selectSimilarTokens}
            onMouseLeave={this.unselectSimilarTokens}
            onClick={this.undoPendingInstances}
          >
            Undo All
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  Editor = (): JSX.Element => {
    const activeToken = this.state.activeToken
    const title = activeToken
      ? `Edit ${activeToken.token.cleanValue}`
      : 'Select a Token'

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
              <Form.Group as={Row} className={'lemmatizer__editor__row'}>
                {this.state.activeToken && (
                  <>
                    <Col className={'lemmatizer__editor__col'}>
                      <LemmaSelect
                        key={JSON.stringify(this.state.activeToken)}
                        token={this.state.activeToken}
                        wordService={this.wordService}
                        onChange={this.handleChange}
                      />
                    </Col>
                    <Col xs={2} className={'lemmatizer__editor__col'}>
                      <this.ActionButton />
                    </Col>
                  </>
                )}
              </Form.Group>
              <Form.Group as={Row}>
                <Col>
                  {/* <Button variant="outline-primary">
                    <i className={'fas fa-wand-magic-sparkles'}></i>&nbsp;
                    Auto-Lemmatize
                  </Button> */}
                </Col>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" disabled={!this.isDirty()}>
              Save changes
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </div>
    )
  }

  render(): React.ReactNode {
    return (
      <Container fluid className="lemmatizer__anno-tool">
        <Row>
          <Col className={'lemmatizer__text-col'}>
            <table className="Transliteration__lines">
              <tbody>
                {
                  this.text.lines.reduce<[JSX.Element[], Labels]>(
                    (
                      [elements, labels]: [JSX.Element[], Labels],
                      line: AbstractLine,
                      index: number
                    ) => {
                      const currentLabels = getCurrentLabels(labels, line)
                      const LineComponent =
                        this.lineComponents.get(line.type) || DisplayControlLine
                      const lineNumber = index + 1
                      return [
                        [
                          ...elements,
                          <tr id={createLineId(lineNumber)} key={index}>
                            <LineComponent
                              line={line}
                              lineIndex={index}
                              columns={this.text.numberOfColumns}
                              labels={labels}
                            />
                            <td>
                              <NoteLinks
                                notes={this.text.notes}
                                lineNumber={lineNumber}
                              />
                            </td>
                          </tr>,
                        ],
                        currentLabels,
                      ]
                    },
                    [[], defaultLabels]
                  )[0]
                }
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
  Omit<Props, 'lemmas' | 'initialWords'>,
  {
    wordService: WordService
  },
  readonly Word[]
>(
  ({ data, ...props }) => <Lemmatizer2 {...props} initialWords={data} />,
  (props) => {
    const tokens: Set<string> = new Set(
      props.text.lines
        .flatMap((line) => line.content)
        .flatMap((token) => token.uniqueLemma || [])
    )

    return props.wordService.findAll([...tokens])
  }
)
