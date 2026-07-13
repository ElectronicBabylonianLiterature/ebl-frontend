import {
  AnnotationSpan,
  ApiAnnotationSpan,
  EntityAnnotationSpan,
  isRealiaAnnotationSpan,
  RealiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  EntityTypeOption,
  entityTypeOptions,
} from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import RealiaSelect, {
  RealiaOption,
} from 'fragmentarium/ui/text-annotation/RealiaSelect'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import RealiaInfoContext from 'fragmentarium/ui/text-annotation/RealiaInfoContext'
import { getRealiaLabel } from 'fragmentarium/ui/text-annotation/realiaInfo'
import React, { forwardRef, useContext } from 'react'
import { Button, ButtonGroup, Form } from 'react-bootstrap'
import Select, { SelectInstance } from 'react-select'

interface SpanEditorProps {
  entitySpan: AnnotationSpan
  setActiveSpanId: React.Dispatch<React.SetStateAction<string | null>>
}

interface LayerEditorProps {
  onApply: (annotation: ApiAnnotationSpan) => void
  onDelete: () => void
}

function SpanEditorForm({
  control,
  onApply,
  onDelete,
}: LayerEditorProps & { control: JSX.Element; onApply: () => void }) {
  return (
    <div
      onMouseUp={(event) => event.stopPropagation()}
      className={'text-annotation__span-editor'}
    >
      <Form>
        <Form.Group>{control}</Form.Group>
        <Form.Group>
          <ButtonGroup size={'sm'}>
            <Button
              variant={'danger'}
              aria-label="delete-name-annotation"
              onClick={onDelete}
            >
              Delete
            </Button>
            <Button
              variant={'primary'}
              aria-label="update-name-annotation"
              onClick={onApply}
            >
              Apply
            </Button>
          </ButtonGroup>
        </Form.Group>
      </Form>
    </div>
  )
}

const EntitySpanEditor = forwardRef<
  SelectInstance<EntityTypeOption>,
  LayerEditorProps & { entitySpan: EntityAnnotationSpan }
>(function EntitySpanEditor({ entitySpan, onApply, onDelete }, ref) {
  const [selectedType, setSelectedType] = React.useState<EntityTypeOption>({
    label: entitySpan.type,
    value: entitySpan.type,
  })

  return (
    <SpanEditorForm
      onDelete={onDelete}
      onApply={() =>
        onApply({
          id: entitySpan.id,
          span: entitySpan.span,
          type: selectedType.value,
        })
      }
      control={
        <Select
          ref={ref}
          aria-label={'edit-named-entity'}
          placeholder={'Select tag'}
          options={entityTypeOptions}
          value={selectedType}
          onChange={(option) => setSelectedType(option as EntityTypeOption)}
        />
      }
    />
  )
})

function RealiaSpanEditor({
  entitySpan,
  onApply,
  onDelete,
}: LayerEditorProps & { entitySpan: RealiaAnnotationSpan }): JSX.Element {
  const { lookup, register } = useContext(RealiaInfoContext)
  const [selectedRealia, setSelectedRealia] =
    React.useState<RealiaOption | null>({
      label: getRealiaLabel(lookup, entitySpan.realiaId),
      value: entitySpan.realiaId,
    })

  return (
    <SpanEditorForm
      onDelete={onDelete}
      onApply={() => {
        if (selectedRealia) {
          register(selectedRealia.entry)
          onApply({
            id: entitySpan.id,
            span: entitySpan.span,
            realiaId: selectedRealia.value,
          })
        }
      }}
      control={
        <RealiaSelect
          ariaLabel={'edit-realia'}
          value={selectedRealia}
          onChange={setSelectedRealia}
        />
      }
    />
  )
}

const SpanEditor = forwardRef<
  SelectInstance<EntityTypeOption>,
  SpanEditorProps
>(function SpanEditor({ entitySpan, setActiveSpanId }, ref): JSX.Element {
  const [, dispatch] = useContext(AnnotationContext)

  const onApply = (annotation: ApiAnnotationSpan) => {
    dispatch({ type: 'edit', annotation })
    setActiveSpanId(null)
  }
  const onDelete = () => dispatch({ type: 'delete', annotation: entitySpan })

  return isRealiaAnnotationSpan(entitySpan) ? (
    <RealiaSpanEditor
      entitySpan={entitySpan}
      onApply={onApply}
      onDelete={onDelete}
    />
  ) : (
    <EntitySpanEditor
      ref={ref}
      entitySpan={entitySpan}
      onApply={onApply}
      onDelete={onDelete}
    />
  )
})

export default SpanEditor
