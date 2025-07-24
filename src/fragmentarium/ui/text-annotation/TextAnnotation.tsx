import React, { useMemo, useState } from 'react'
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
import Markable from 'fragmentarium/ui/text-annotation/Markable'
import AnnotationContext, {
  useAnnotationContext,
} from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import { clearSelection } from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import { EntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import { Button } from 'react-bootstrap'

function isIdToken(token: Token): token is AnyWord {
  return isLoneDeterminative(token) || isAnyWord(token)
}

function DisplayAnnotationLine({
  line,
  columns,
  words,
  selection,
  setSelection,
  hoveredSpanId,
  setHoveredSpanId,
  activeSpanId,
  setActiveSpanId,
}: LineProps & {
  words: readonly string[]
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
  hoveredSpanId: string | null
  setHoveredSpanId: React.Dispatch<React.SetStateAction<string | null>>
  activeSpanId: string | null
  setActiveSpanId: React.Dispatch<React.SetStateAction<string | null>>
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
        hoveredSpanId={hoveredSpanId}
        setHoveredSpanId={setHoveredSpanId}
        activeSpanId={activeSpanId}
        setActiveSpanId={setActiveSpanId}
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
  selection,
  setSelection,
  hoveredSpanId,
  setHoveredSpanId,
  activeSpanId,
  setActiveSpanId,
}: LineProps & {
  lineIndex: number
  words: readonly string[]
  notes: Notes
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
  hoveredSpanId: string | null
  setHoveredSpanId: React.Dispatch<React.SetStateAction<string | null>>
  activeSpanId: string | null
  setActiveSpanId: React.Dispatch<React.SetStateAction<string | null>>
}): JSX.Element {
  const lineNumber = lineIndex + 1

  if (line.type === 'TextLine') {
    return (
      <>
        <tr id={createLineId(lineNumber)}>
          <DisplayAnnotationLine
            line={line}
            columns={columns}
            labels={labels}
            activeLine={activeLine}
            selection={selection}
            setSelection={setSelection}
            words={words}
            hoveredSpanId={hoveredSpanId}
            setHoveredSpanId={setHoveredSpanId}
            activeSpanId={activeSpanId}
            setActiveSpanId={setActiveSpanId}
          />
        </tr>
      </>
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
    </tr>
  )
}

function SpanAnnotationDisplay({
  text,
  words,
}: {
  text: Text
  words: readonly string[]
}): JSX.Element {
  const [selection, setSelection] = useState<readonly string[]>([])
  const [hoveredSpanId, setHoveredSpanId] = React.useState<string | null>(null)
  const [activeSpanId, setActiveSpanId] = React.useState<string | null>(null)

  return (
    <div
      onMouseUp={() => {
        setSelection([])
        clearSelection()
      }}
    >
      <div className="text-annotation__text-wrapper">
        <table className="Transliteration__lines">
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
                          hoveredSpanId={hoveredSpanId}
                          setHoveredSpanId={setHoveredSpanId}
                          activeSpanId={activeSpanId}
                          setActiveSpanId={setActiveSpanId}
                        />,
                      ]
                  return [rows, getCurrentLabels(labels, line)]
                },
                [[], defaultLabels]
              )[0]
            }
          </tbody>
        </table>
        <div className="text-annotation__button-wrapper">
          <Button variant="primary">Save</Button>
        </div>
      </div>
    </div>
  )
}

function TextAnnotationView({
  fragment,
  annotations,
}: {
  fragment: Fragment
  annotations: readonly EntityAnnotationSpan[]
}): JSX.Element {
  const words: readonly string[] = useMemo(() => {
    return fragment.text.lines
      .filter((line) => isTextLine(line))
      .flatMap((line) =>
        line.content
          .filter((token) => isIdToken(token))
          .map((token) => (token as AnyWord).id || '')
      )
  }, [fragment.text])

  const annotationContext = useAnnotationContext(words, annotations)

  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Library'),
        new FragmentCrumb(fragment.number),
        new TextCrumb('Annotation'),
      ]}
      title={`Annotate ${fragment.number}`}
    >
      <AnnotationContext.Provider value={annotationContext}>
        <SpanAnnotationDisplay text={fragment.text} words={words} />
      </AnnotationContext.Provider>
    </AppContent>
  )
}

export default withData<
  unknown,
  { number: string; fragmentService: FragmentService },
  { fragment: Fragment; annotations: readonly EntityAnnotationSpan[] }
>(
  ({ data }) => (
    <TextAnnotationView
      fragment={data.fragment}
      annotations={data.annotations}
    />
  ),
  (props) =>
    props.fragmentService.find(props.number).then((fragment) =>
      props.fragmentService
        .fetchNamedEntityAnnotations(props.number)
        .then((annotations) => ({
          fragment,
          annotations,
        }))
    )
)
