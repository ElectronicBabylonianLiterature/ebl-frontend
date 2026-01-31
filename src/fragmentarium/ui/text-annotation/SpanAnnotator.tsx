import {
  ApiEntityAnnotationSpan,
  entities,
  EntityAnnotationSpan,
  EntityType,
} from 'fragmentarium/ui/text-annotation/EntityType'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import _ from 'lodash'
import React, { forwardRef, useContext } from 'react'
import { Form } from 'react-bootstrap'
import Select from 'react-select'

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

function createId(annotationSpans: readonly EntityAnnotationSpan[]): string {
  const currentMaxId =
    _.max(annotationSpans.map(({ id }) => parseInt(id.split('-')[1]))) || 0

  return `Entity-${currentMaxId + 1}`
}

interface SpanAnnotatorProps {
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
}
const SpanAnnotator = forwardRef<Select<EntityTypeOption>, SpanAnnotatorProps>(
  function SpanAnnotator({ selection, setSelection }, ref): JSX.Element {
    const [selectedType, setSelectedType] =
      React.useState<EntityTypeOption | null>(null)
    const [{ entities }, dispatch] = useContext(AnnotationContext)

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
                  const entity: ApiEntityAnnotationSpan = {
                    id: createId(entities),
                    type: option.value,
                    span: selection,
                  }
                  dispatch({ type: 'add', entity })
                  clearSelection()
                  setSelection([])
                }
              }}
            />
          </Form.Group>
        </Form>
      </div>
    )
  },
)

export default SpanAnnotator
