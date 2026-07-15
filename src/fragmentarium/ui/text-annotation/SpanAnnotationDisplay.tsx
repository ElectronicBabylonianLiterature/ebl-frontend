import React, { useContext, useRef, useState } from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { defaultLabels, Labels } from 'transliteration/domain/labels'
import { getCurrentLabels } from 'transliteration/ui/TransliterationLines'
import { hideLine } from 'fragmentarium/ui/fragment/linguistic-annotation/TokenAnnotation'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import { clearSelection } from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import {
  AnnotationSpans,
  omitDerivedSpanFields,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import DisplayRow from 'fragmentarium/ui/text-annotation/AnnotationLines'
import { getSelectedTokens } from 'fragmentarium/ui/text-annotation/selectionUtils'
import { Button, Form, Spinner } from 'react-bootstrap'
import _ from 'lodash'
import './TextAnnotation.sass'
import './NamedEntities.sass'

export default function SpanAnnotationDisplay({
  fragment,
  initialAnnotations,
  setInitialAnnotations,
  fragmentService,
}: {
  fragment: Fragment
  initialAnnotations: AnnotationSpans
  setInitialAnnotations: React.Dispatch<React.SetStateAction<AnnotationSpans>>
  fragmentService: FragmentService
}): JSX.Element {
  const [selection, setSelection] = useState<readonly string[]>([])
  const [activeSpanId, setActiveSpanId] = React.useState<string | null>(null)
  const selectionStartTokenIdRef = useRef<string | null>(null)
  const [spans] = useContext(AnnotationContext)
  const words = spans.words
  const isDirty = !_.isEqual(initialAnnotations, omitDerivedSpanFields(spans))
  const [isSaving, setIsSaving] = useState(false)

  const text = fragment.text

  const saveAnnotations = () => {
    const updatedAnnotations = omitDerivedSpanFields(spans)
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

  const handleMouseUp = () => {
    const applySelection = (allowRetry: boolean) => {
      const browserSelection = document.getSelection()
      if (!browserSelection || browserSelection.isCollapsed) {
        selectionStartTokenIdRef.current = null
        resetSelections()
        return
      }

      const selectedTokens = getSelectedTokens(words)
      const startedOnDifferentToken =
        !!selectionStartTokenIdRef.current &&
        selectedTokens.length === 1 &&
        selectionStartTokenIdRef.current !== selectedTokens[0]

      if (startedOnDifferentToken && allowRetry) {
        window.setTimeout(() => applySelection(false), 0)
        return
      }

      if (selectedTokens.length > 0) {
        setActiveSpanId(null)
        setSelection(selectedTokens)
        selectionStartTokenIdRef.current = null
        clearSelection()
        return
      }

      selectionStartTokenIdRef.current = null
      resetSelections()
    }

    window.setTimeout(() => applySelection(true), 0)
  }

  return (
    <div onMouseUp={handleMouseUp}>
      <div className="text-annotation__text-wrapper">
        <table className="Transliteration__lines">
          <tbody>
            {
              text.lines.reduce<[JSX.Element[], Labels]>(
                (
                  [elements, labels]: [JSX.Element[], Labels],
                  line: AbstractLine,
                  index: number,
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
                          selectionStartTokenIdRef={selectionStartTokenIdRef}
                        />,
                      ]
                  return [rows, getCurrentLabels(labels, line)]
                },
                [[], defaultLabels],
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
