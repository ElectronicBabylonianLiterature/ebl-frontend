import React, { useContext, useMemo, useState } from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { defaultLabels, Labels } from 'transliteration/domain/labels'
import { Notes } from 'transliteration/domain/text'
import { isIdToken, isTextLine } from 'transliteration/domain/type-guards'
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
import { AnyWord } from 'transliteration/domain/token'
import { hideLine } from 'fragmentarium/ui/fragment/linguistic-annotation/TokenAnnotation'
import './TextAnnotation.sass'
import './NamedEntities.sass'
import Markable from 'fragmentarium/ui/text-annotation/Markable'
import AnnotationContext, {
  useAnnotationContext,
} from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import { clearSelection } from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import {
  ApiEntityAnnotationSpan,
  EntityAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/EntityType'
import { Button, Form, Spinner } from 'react-bootstrap'
import _ from 'lodash'

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
): readonly ApiEntityAnnotationSpan[] {
  return entities.map((entity) => _.omit(entity, 'tier', 'name'))
}

function SpanAnnotationDisplay({
  fragment,
  initialAnnotations,
  setInitialAnnotations,
  fragmentService,
}: {
  fragment: Fragment
  initialAnnotations: readonly ApiEntityAnnotationSpan[]
  setInitialAnnotations: React.Dispatch<
    React.SetStateAction<readonly ApiEntityAnnotationSpan[]>
  >
  fragmentService: FragmentService
}): JSX.Element {
  const [selection, setSelection] = useState<readonly string[]>([])
  const [activeSpanId, setActiveSpanId] = React.useState<string | null>(null)
  const [{ entities }] = useContext(AnnotationContext)
  const isDirty = !_.isEqual(initialAnnotations, omitTiers(entities))
  const [isSaving, setIsSaving] = useState(false)

  const text = fragment.text

  const saveAnnotations = () => {
    const updatedAnnotations = omitTiers(entities)
    setIsSaving(true)
    fragmentService
      .updateNamedEntityAnnotations(fragment.number, updatedAnnotations)
      .then(() => {
        setIsSaving(false)
        setInitialAnnotations(updatedAnnotations)
      })
  }
  const resetSelections = () => {
    setSelection([])
    clearSelection()
  }

  return (
    <div onMouseUp={resetSelections}>
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
        <Form className="text-annotation__button-wrapper">
          <Button
            disabled={!isDirty || isSaving}
            variant="primary"
            onClick={saveAnnotations}
            aria-label="save-annotations"
          >
            {isSaving ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <>Save</>
            )}
          </Button>
        </Form>
      </div>
    </div>
  )
}

function TextAnnotationView({
  fragment,
  annotations,
  fragmentService,
}: {
  fragment: Fragment
  annotations: readonly ApiEntityAnnotationSpan[]
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
  const [initialAnnotations, setInitialAnnotations] = useState<
    readonly ApiEntityAnnotationSpan[]
  >(annotations)
  const annotationContext = useAnnotationContext(words, initialAnnotations)

  return (
    <AnnotationContext.Provider value={annotationContext}>
      <SpanAnnotationDisplay
        fragment={fragment}
        initialAnnotations={initialAnnotations}
        setInitialAnnotations={setInitialAnnotations}
        fragmentService={fragmentService}
      />
    </AnnotationContext.Provider>
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
      annotations={data.annotations}
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
