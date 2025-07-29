import React, { useContext, useMemo, useState } from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentCrumb from 'fragmentarium/ui/FragmentCrumb'
import withData from 'http/withData'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { defaultLabels, Labels } from 'transliteration/domain/labels'
import { Notes } from 'transliteration/domain/text'
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
import {
  ApiEntityAnnotationSpan,
  EntityAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/EntityType'
import { Button, Form } from 'react-bootstrap'
import _ from 'lodash'

function isIdToken(token: Token): token is AnyWord {
  return isLoneDeterminative(token) || isAnyWord(token)
}

function DisplayAnnotationLine({
  line,
  columns,
  selection,
  setSelection,
  activeSpanId,
  setActiveSpanId,
}: LineProps & {
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
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
        selection={selection}
        setSelection={setSelection}
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
  selection,
  setSelection,
  activeSpanId,
  setActiveSpanId,
}: LineProps & {
  lineIndex: number
  notes: Notes
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
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

function omitTiers(
  entities: readonly EntityAnnotationSpan[]
): readonly Omit<EntityAnnotationSpan, 'tier'>[] {
  return entities.map((entity) => _.omit(entity, 'tier'))
}

function SpanAnnotationDisplay({
  fragment,
  initialAnnotations,
  fragmentService,
}: {
  fragment: Fragment
  initialAnnotations: readonly ApiEntityAnnotationSpan[]
  fragmentService: FragmentService
}): JSX.Element {
  const [selection, setSelection] = useState<readonly string[]>([])
  const [activeSpanId, setActiveSpanId] = React.useState<string | null>(null)
  const [{ entities }] = useContext(AnnotationContext)
  const isDirty = !_.isEqual(initialAnnotations, omitTiers(entities))

  const text = fragment.text

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
                          selection={selection}
                          setSelection={setSelection}
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
        <Form
          className="text-annotation__button-wrapper"
          onSubmit={() =>
            fragmentService.updateNamedEntityAnnotations(
              fragment.number,
              omitTiers(entities)
            )
          }
        >
          <Button disabled={!isDirty} variant="primary" type="submit">
            Save
          </Button>
        </Form>
      </div>
    </div>
  )
}

function TextAnnotationView({
  fragment,
  initialAnnotations,
  fragmentService,
}: {
  fragment: Fragment
  initialAnnotations: readonly ApiEntityAnnotationSpan[]
  fragmentService: FragmentService
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

  const annotationContext = useAnnotationContext(words, initialAnnotations)

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
        <SpanAnnotationDisplay
          fragment={fragment}
          initialAnnotations={initialAnnotations}
          fragmentService={fragmentService}
        />
      </AnnotationContext.Provider>
    </AppContent>
  )
}

export default withData<
  { fragmentService: FragmentService },
  { number: string; fragmentService: FragmentService },
  { fragment: Fragment; annotations: readonly ApiEntityAnnotationSpan[] }
>(
  ({ data, fragmentService }) => (
    <TextAnnotationView
      fragment={data.fragment}
      initialAnnotations={data.annotations}
      fragmentService={fragmentService}
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
