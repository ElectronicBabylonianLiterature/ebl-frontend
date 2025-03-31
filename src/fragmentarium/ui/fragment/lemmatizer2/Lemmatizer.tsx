import React, { createRef, useState } from 'react'
import { Notes, Text } from 'transliteration/domain/text'
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
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap'
import { Token } from 'transliteration/domain/token'
import WordService from 'dictionary/application/WordService'
import { ValueType } from 'react-select'
import StateManager from 'react-select'
import EditableToken from 'fragmentarium/ui/fragment/lemmatizer2/EditableToken'
import _ from 'lodash'
import { defaultLabels, Labels } from 'transliteration/domain/labels'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import DisplayControlLine from 'transliteration/ui/DisplayControlLine'
import { createLineId, NoteLinks } from 'transliteration/ui/note-links'
import LemmaAnnotationForm from 'fragmentarium/ui/fragment/lemmatizer2/LemmaAnnotationForm'
import Word from 'dictionary/domain/Word'
import withData from 'http/withData'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import LemmaActionButton from 'fragmentarium/ui/fragment/lemmatizer2/LemmaAnnotationButton'
import { Fragment } from 'fragmentarium/domain/fragment'
import Bluebird from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import Spinner from 'common/Spinner'

type TextSetter = React.Dispatch<React.SetStateAction<Text>>
type LineLemmaUpdate = {
  [indexInLine: number]: string[]
}
export type LineLemmaAnnotations = {
  [lineIndex: number]: LineLemmaUpdate
}
type LemmaId = string
export type LemmaSuggestions = ReadonlyMap<string, LemmaOption[]>
type LemmaWordMap = ReadonlyMap<LemmaId, Word>

type Props = {
  text: Text
  museumNumber: string
  wordService: WordService
  fragmentService: FragmentService
  editableTokens: EditableToken[]
  setText: TextSetter
  updateLemmaAnnotation: (
    annotations: LineLemmaAnnotations
  ) => Bluebird<Fragment>
}

const processes = {
  loadingLemmas: 'Loading Lemmas...',
  saving: 'Saving...',
}

type State = {
  activeToken: EditableToken | null
  activeLine: number | null
  lemmaOptions: LemmaOption[]
  updates: Map<Token, ValueType<LemmaOption, true>>
  pendingLines: Set<number>
  process: keyof typeof processes | null
}

const createEditableTokens = (
  text: Text,
  words: LemmaWordMap
): EditableToken[] => {
  const tokens: EditableToken[] = []
  let indexInText = 0

  text.lines.forEach((line, lineIndex) => {
    line.content.forEach((token, indexInLine) => {
      if (token.lemmatizable) {
        const lemmas = token.uniqueLemma.map((lemma) => {
          return new LemmaOption(words.get(lemma) as Word)
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

export default class Lemmatizer2 extends React.Component<Props, State> {
  private text: Text
  private museumNumber: string
  private wordService: WordService
  private fragmentService: FragmentService
  private lineComponents: LineComponentMap
  private editorRef = createRef<StateManager<LemmaOption, true>>()
  private tokens: EditableToken[]
  private tokenMap: ReadonlyMap<Token, EditableToken>
  private setText: TextSetter

  constructor(props: {
    text: Text
    museumNumber: string
    setText: TextSetter
    wordService: WordService
    fragmentService: FragmentService
    editableTokens: EditableToken[]
    updateLemmaAnnotation: (LemmaUpdates) => Bluebird<Fragment>
  }) {
    super(props)

    this.museumNumber = props.museumNumber
    this.text = props.text
    this.setText = props.setText
    this.wordService = props.wordService
    this.fragmentService = props.fragmentService
    this.tokens = props.editableTokens
    this.tokenMap = new Map(this.tokens.map((token) => [token.token, token]))

    this.lineComponents = new Map([
      ...Array.from(defaultLineComponents),
      ['TextLine', this.DisplayAnnotationLine],
    ])

    const firstToken = this.tokens[0] || null
    this.state = {
      activeToken: firstToken?.select() || null,
      activeLine: firstToken?.lineIndex || null,
      lemmaOptions: [],
      updates: new Map(),
      pendingLines: new Set(),
      process: null,
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
        <MemoizedRowDisplay
          key={index}
          line={line}
          lineIndex={index}
          hasToken={index === this.state.activeToken?.lineIndex}
          isPending={this.state.pendingLines.has(index) || this.isProcessing()}
          LineComponent={LineComponent}
          numberOfColumns={this.text.numberOfColumns}
          labels={labels}
          notes={this.text.notes}
        />,
      ],
      currentLabels,
    ]
  }

  autofillLemmas(): void {
    this.setState({ process: 'loadingLemmas' })
    this.fragmentService
      .collectLemmaOptions(this.museumNumber)
      .then((suggestions) => {
        this.tokens.forEach((token) => {
          if (suggestions.has(token.cleanValue)) {
            token.updateLemmas(
              suggestions.get(token.cleanValue) as LemmaOption[]
            )
          }
        })
      })
      .then(() => this.setState({ process: null }))
  }

  aggregateAnnotations(): LineLemmaAnnotations {
    const annotations: LineLemmaAnnotations = {}

    this.tokens.forEach((token) => {
      const { lineIndex, indexInLine, newLemmas } = token

      if (token.isDirty) {
        _.setWith(
          annotations,
          [lineIndex, indexInLine],
          newLemmas?.map((option) => option.value) || [],
          Object
        )
      }
    })
    return annotations
  }

  saveUpdates = (): void => {
    this.setState({ process: 'saving' })
    const annotations = this.aggregateAnnotations()
    this.props
      .updateLemmaAnnotation(annotations)
      .then((fragment) => this.setText(fragment.text))
      .then(() => this.setState({ process: null }))
  }

  isProcessing = (): boolean => this.state.process !== null

  Editor = (): JSX.Element => {
    const activeToken = this.state.activeToken
    const title = activeToken
      ? `Edit ${activeToken.token.cleanValue}`
      : 'Select a Token'

    return (
      <div className="modal show lemmatizer__editor">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title as={'h6'}>
              {_.isEmpty(this.tokens) ? 'No Lemmatizable Tokens Found' : title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(event) => {
                event.preventDefault()
                this.selectNextToken()
              }}
            >
              <Form.Group as={Row} className={'lemmatizer__editor__row'}>
                {activeToken && (
                  <>
                    <Col className={'lemmatizer__editor__col'}>
                      <LemmaAnnotationForm
                        key={JSON.stringify(activeToken)}
                        token={activeToken}
                        wordService={this.wordService}
                        onChange={this.handleChange}
                      />
                    </Col>
                    <Col xs={2} className={'lemmatizer__editor__col'}>
                      <LemmaActionButton
                        disabled={!activeToken.isDirty}
                        onResetCurrent={this.resetActiveToken}
                        onMouseEnter={this.selectSimilarTokens}
                        onMouseLeave={this.unselectSimilarTokens}
                        onMultiApply={this.applyToPendingInstances}
                        onMultiReset={this.undoPendingInstances}
                      />
                    </Col>
                  </>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          {activeToken && (
            <Modal.Footer>
              {this.isProcessing() && (
                <Spinner>
                  {processes[this.state.process as keyof typeof processes]}
                </Spinner>
              )}
              <Button
                variant="outline-primary"
                disabled={this.isProcessing() || this.isDirty()}
                onClick={() => this.autofillLemmas()}
              >
                <i className={'fas fa-wand-magic-sparkles'}></i>&nbsp; Autofill
              </Button>
              <Button
                variant="primary"
                disabled={this.isProcessing() || !this.isDirty()}
                onClick={() => this.saveUpdates()}
              >
                Save
              </Button>
            </Modal.Footer>
          )}
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
                    this.reduceLines,
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

const LoadWords = withData<
  Omit<Props, 'editableTokens'>,
  {
    wordService: WordService
  },
  EditableToken[]
>(
  ({ data, ...props }) => <Lemmatizer2 {...props} editableTokens={data} />,
  (props) => {
    const tokens: Set<string> = new Set(
      props.text.lines
        .flatMap((line) => line.content)
        .flatMap((token) => token.uniqueLemma || [])
    )

    return props.wordService
      .findAll([...tokens])
      .then((words) => new Map(words.map((word) => [word._id, word])))
      .then((wordMap) => createEditableTokens(props.text, wordMap))
  },
  {
    watch: (props) => [props.text],
  }
)

export const InitializeLemmatizer = (
  props: Omit<Props, 'editableTokens' | 'setText'>
): JSX.Element => {
  const [text, setText] = useState<Text>(props.text)

  return <LoadWords {...props} text={text} setText={setText} />
}
