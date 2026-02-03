import React, { createRef } from 'react'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import { LineNumber } from 'transliteration/ui/line-number'
import { LineColumns } from 'transliteration/ui/line-tokens'
import { TokenActionWrapperProps } from 'transliteration/ui/LineAccumulator'
import { LineProps } from 'transliteration/ui/LineProps'
import { defaultLineComponents } from 'transliteration/ui/TransliterationLines'
import TransliterationTd from 'transliteration/ui/TransliterationTd'
import './Lemmatizer.sass'
import { Col, Container, Row } from 'react-bootstrap'
import WordService from 'dictionary/application/WordService'
import StateManager, { ValueType } from 'react-select'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import _ from 'lodash'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import { Fragment } from 'fragmentarium/domain/fragment'
import Bluebird from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import TokenAnnotation from 'fragmentarium/ui/fragment/linguistic-annotation/TokenAnnotation'
import LemmaEditorModal from 'fragmentarium/ui/fragment/lemma-annotation/LemmaEditorModal'

type TextSetter = React.Dispatch<React.SetStateAction<Text>>
type LineLemmaUpdate = {
  [indexInLine: number]: string[]
}
export type LineLemmaAnnotations = {
  [lineIndex: number]: LineLemmaUpdate
}
export type LemmaSuggestions = ReadonlyMap<string, LemmaOption[]>

export type LemmaAnnotatorProps = {
  text: Text
  museumNumber: string
  wordService: WordService
  fragmentService: FragmentService
  editableTokens: EditableToken[]
  setText: TextSetter
  updateAnnotation: (annotations: LineLemmaAnnotations) => Bluebird<Fragment>
}

export default class LemmaAnnotation extends TokenAnnotation {
  private museumNumber: string
  private wordService: WordService
  private fragmentService: FragmentService
  private setText: TextSetter
  private editorRef = createRef<StateManager<LemmaOption, true>>()
  private updateAnnotation: (
    annotations: LineLemmaAnnotations
  ) => Bluebird<Fragment>

  constructor(props: LemmaAnnotatorProps) {
    super(props)

    this.museumNumber = props.museumNumber
    this.wordService = props.wordService
    this.fragmentService = props.fragmentService
    this.setText = props.setText
    this.updateAnnotation = props.updateAnnotation
    this.lineComponents = new Map([
      ...Array.from(defaultLineComponents),
      ['TextLine', this.DisplayAnnotationLine],
    ])

    const firstToken = this.tokens[0] || null
    this.state = {
      activeToken: firstToken?.select() || null,
      activeLine: firstToken?.lineIndex || null,
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

  handleChange = (selected: ValueType<LemmaOption, true>): void => {
    this.state.activeToken?.updateLemmas((selected || []) as LemmaOption[])
    this.setActiveToken(this.state.activeToken)
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
  applyToPendingInstances = (): void => {
    this.state.activeToken?.confirmSuggestion()
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

  setActiveToken = (token: EditableToken | null): void => {
    this.state.activeToken?.unselect()
    this.setState({
      activeToken: token?.select() || null,
      activeLine: token?.lineIndex || null,
    })
    this.editorRef.current?.focus()
  }

  resetActiveToken = (): void => {
    this.state.activeToken?.updateLemmas(null)
    this.setActiveToken(this.state.activeToken)
  }

  autofillLemmas(): void {
    this.setState({ process: 'loadingLemmas' })
    this.fragmentService
      .collectLemmaSuggestions(this.museumNumber)
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
      .then(() => this.editorRef.current?.focus())
  }

  aggregateAnnotations(): LineLemmaAnnotations {
    const annotations: LineLemmaAnnotations = {}

    this.tokens.forEach((token) => {
      const { lineIndex, indexInLine, newLemmas } = token

      if (token.isDirty && token.isConfirmed) {
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
    this.updateAnnotation(annotations)
      .then((fragment) => this.setText(fragment.text))
      .then(() => this.setState({ process: null }))
  }
  selectionHandlers = {
    selectNextToken: this.selectNextToken,
    selectPreviousToken: this.selectPreviousToken,
    onMouseEnter: this.selectSimilarTokens,
    onMouseLeave: this.unselectSimilarTokens,
  }
  editHandlers = {
    handleChange: this.handleChange,
    autofillLemmas: (): void => this.autofillLemmas(),
    saveUpdates: this.saveUpdates,
    onResetCurrent: this.resetActiveToken,
    onMultiApply: this.applyToPendingInstances,
    onMultiReset: this.undoPendingInstances,
    onCreateProperNoun: (): void => {
      // Placeholder for PN creation
    },
  }

  render(): React.ReactNode {
    const token = this.state.activeToken
    const title = token
      ? `${lineNumberToString(
          (this.text.allLines[token.lineIndex] as TextLine).lineNumber
        )}: ${token.token.cleanValue}`
      : 'Select a Token'

    return (
      <Container fluid className="lemmatizer__anno-tool">
        <Row>
          <Col>
            <LemmaEditorModal
              token={token}
              title={
                _.isEmpty(this.tokens) ? 'No Lemmatizable Tokens Found' : title
              }
              wordService={this.wordService}
              process={this.state.process}
              isDirty={this.isDirty()}
              {...this.editHandlers}
              {...this.selectionHandlers}
            />
          </Col>
          <Col className={'lemmatizer__text-col'}>
            <this.RenderText />
          </Col>
        </Row>
      </Container>
    )
  }
}
