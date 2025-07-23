import {
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
  label: EntityType
  value: EntityType
}

export const entityTypeOptions: EntityTypeOption[] = entities.map((entity) => ({
  value: entity.type,
  label: entity.type,
}))

function createId(
  type: EntityType,
  annotationSpans: readonly EntityAnnotationSpan[]
): string {
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
    const [
      selectedType,
      setSelectedType,
    ] = React.useState<EntityTypeOption | null>(null)
    const [{ entities }, dispatch] = useContext(AnnotationContext)

    return (
      <div onMouseUp={(event) => event.stopPropagation()}>
        <Form>
          <Form.Group>
            <Select
              ref={ref}
              options={entityTypeOptions}
              value={selectedType}
              onChange={(option) => {
                setSelectedType(option as EntityTypeOption)
                if (option) {
                  const entity: EntityAnnotationSpan = {
                    id: createId(option.value, entities),
                    type: option.value,
                    span: selection,
                    tier: 1,
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
  }
)

export default SpanAnnotator
