import { EntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import {
  EntityTypeOption,
  entityTypeOptions,
} from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import React, { forwardRef, useContext } from 'react'
import { Button, ButtonGroup, Form } from 'react-bootstrap'
import Select from 'react-select'

interface SpanEditorProps {
  entitySpan: EntityAnnotationSpan
  setActiveSpanId: React.Dispatch<React.SetStateAction<string | null>>
}

const SpanEditor = forwardRef<Select<EntityTypeOption>, SpanEditorProps>(
  function SpanEditor({ entitySpan, setActiveSpanId }, ref): JSX.Element {
    const [selectedType, setSelectedType] =
      React.useState<EntityTypeOption | null>({
        label: entitySpan.type,
        value: entitySpan.type,
      })
    const [, dispatch] = useContext(AnnotationContext)

    return (
      <div
        onMouseUp={(event) => event.stopPropagation()}
        className={'text-annotation__span-editor'}
      >
        <Form>
          <Form.Group>
            <Select
              ref={ref}
              aria-label={'edit-named-entity'}
              options={entityTypeOptions}
              value={selectedType}
              onChange={(option) => {
                setSelectedType(option as EntityTypeOption)
              }}
            />
          </Form.Group>
          <Form.Group>
            <ButtonGroup size={'sm'}>
              <Button
                variant={'danger'}
                aria-label="delete-name-annotation"
                onClick={() => dispatch({ type: 'delete', entity: entitySpan })}
              >
                Delete
              </Button>
              <Button
                variant={'primary'}
                aria-label="update-name-annotation"
                onClick={() => {
                  if (selectedType) {
                    dispatch({
                      type: 'edit',
                      entity: {
                        id: entitySpan.id,
                        span: entitySpan.span,
                        type: selectedType.value,
                      },
                    })
                    setActiveSpanId(null)
                  }
                }}
              >
                Apply
              </Button>
            </ButtonGroup>
          </Form.Group>
        </Form>
      </div>
    )
  },
)

export default SpanEditor
