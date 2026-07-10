import {
  entities,
  EntityType,
} from 'fragmentarium/ui/text-annotation/EntityType'
import {
  ApiAnnotationSpan,
  createAnnotationSpanId,
  ENTITY_ID_PREFIX,
  REALIA_ID_PREFIX,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import RealiaSelect, {
  RealiaOption,
} from 'fragmentarium/ui/text-annotation/RealiaSelect'
import React, { forwardRef, useContext } from 'react'
import { Form } from 'react-bootstrap'
import Select, { SelectInstance } from 'react-select'

export function clearSelection(): void {
  if (window.getSelection) {
    if (window.getSelection()?.empty) {
      window.getSelection()?.empty()
    } else if (window.getSelection()?.removeAllRanges) {
      window.getSelection()?.removeAllRanges()
    }
  }
}

export interface EntityTypeOption {
  label: string
  value: EntityType
}

export const entityTypeOptions: EntityTypeOption[] = entities.map((entity) => ({
  value: entity.type,
  label: `${entity.label}: ${entity.name}`,
}))

interface SpanAnnotatorProps {
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
}
const SpanAnnotator = forwardRef<
  SelectInstance<EntityTypeOption>,
  SpanAnnotatorProps
>(function SpanAnnotator({ selection, setSelection }, ref): JSX.Element {
  const [selectedType, setSelectedType] =
    React.useState<EntityTypeOption | null>(null)
  const [{ annotations }, dispatch] = useContext(AnnotationContext)

  const addAnnotation = (annotation: ApiAnnotationSpan) => {
    dispatch({ type: 'add', annotation })
    clearSelection()
    setSelection([])
  }

  return (
    <div onMouseUp={(event) => event.stopPropagation()}>
      <Form>
        <Form.Group>
          <Select
            ref={ref}
            aria-label={'annotate-named-entities'}
            options={entityTypeOptions}
            value={selectedType}
            onChange={(option) => {
              setSelectedType(option as EntityTypeOption)
              if (option) {
                addAnnotation({
                  id: createAnnotationSpanId(annotations, ENTITY_ID_PREFIX),
                  type: option.value,
                  span: selection,
                })
              }
            }}
          />
        </Form.Group>
        <Form.Group className={'text-annotation__realia-group'}>
          <RealiaSelect
            ariaLabel={'annotate-realia'}
            value={null}
            onChange={(option: RealiaOption | null) => {
              if (option) {
                addAnnotation({
                  id: createAnnotationSpanId(annotations, REALIA_ID_PREFIX),
                  realiaId: option.value,
                  span: selection,
                })
              }
            }}
          />
        </Form.Group>
      </Form>
    </div>
  )
})

export default SpanAnnotator
