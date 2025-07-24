import { EntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import {
  EntityTypeOption,
  entityTypeOptions,
} from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import React, { forwardRef, useContext } from 'react'
import { Button, Form } from 'react-bootstrap'
import Select from 'react-select'

interface SpanEditorProps {
  entitySpan: EntityAnnotationSpan
}

const SpanEditor = forwardRef<Select<EntityTypeOption>, SpanEditorProps>(
  function SpanEditor({ entitySpan }, ref): JSX.Element {
    const [
      selectedType,
      setSelectedType,
    ] = React.useState<EntityTypeOption | null>({
      label: entitySpan.type,
      value: entitySpan.type,
    })
    const [, dispatch] = useContext(AnnotationContext)

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
                    ...entitySpan,
                    type: option.value,
                  }
                  dispatch({ type: 'edit', entity })
                }
              }}
            />
          </Form.Group>
          <Form.Group>
            <Button
              variant={'danger'}
              onClick={() => dispatch({ type: 'delete', entity: entitySpan })}
            >
              <i className="fas fa-trash" />
            </Button>
          </Form.Group>
        </Form>
      </div>
    )
  }
)

export default SpanEditor
