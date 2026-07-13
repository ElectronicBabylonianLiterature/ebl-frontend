import {
  AnnotationSpan,
  ApiEntityAnnotationSpan,
  ApiRealiaAnnotationSpan,
  EntityAnnotationSpan,
  getUsedEntityTypes,
  getUsedRealiaIds,
  isRealiaAnnotationSpan,
  NAMED_ENTITY_LAYER,
  RealiaAnnotationSpan,
  REALIA_LAYER,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  EntityTypeOption,
  entityTypeOptions,
  getEntityTypeOption,
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

interface EntityEditorProps {
  onApply: (annotation: ApiEntityAnnotationSpan) => void
  onDelete: () => void
}

interface RealiaEditorProps {
  onApply: (annotation: ApiRealiaAnnotationSpan) => void
  onDelete: () => void
}

function SpanEditorForm({
  control,
  onApply,
  onDelete,
}: {
  control: JSX.Element
  onApply: () => void
  onDelete: () => void
}) {
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
  EntityEditorProps & { entitySpan: EntityAnnotationSpan }
>(function EntitySpanEditor({ entitySpan, onApply, onDelete }, ref) {
  const [spans] = useContext(AnnotationContext)
  const [selectedType, setSelectedType] = React.useState<EntityTypeOption>(
    getEntityTypeOption(entitySpan.type),
  )
  const usedTypes = getUsedEntityTypes(
    spans.namedEntities,
    entitySpan.span,
    entitySpan.id,
  )

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
          options={entityTypeOptions.filter(
            (option) => !usedTypes.includes(option.value),
          )}
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
}: RealiaEditorProps & { entitySpan: RealiaAnnotationSpan }): JSX.Element {
  const { lookup, register } = useContext(RealiaInfoContext)
  const [spans] = useContext(AnnotationContext)
  const [selectedRealia, setSelectedRealia] =
    React.useState<RealiaOption | null>({
      label: getRealiaLabel(lookup, entitySpan.realiaId),
      value: entitySpan.realiaId,
    })
  const usedRealiaIds = getUsedRealiaIds(
    spans.realia,
    entitySpan.span,
    entitySpan.id,
  )

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
          excludedRealiaIds={usedRealiaIds}
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

  return isRealiaAnnotationSpan(entitySpan) ? (
    <RealiaSpanEditor
      entitySpan={entitySpan}
      onApply={(annotation) => {
        dispatch({ type: 'edit', layer: REALIA_LAYER, annotation })
        setActiveSpanId(null)
      }}
      onDelete={() =>
        dispatch({ type: 'delete', layer: REALIA_LAYER, id: entitySpan.id })
      }
    />
  ) : (
    <EntitySpanEditor
      ref={ref}
      entitySpan={entitySpan}
      onApply={(annotation) => {
        dispatch({ type: 'edit', layer: NAMED_ENTITY_LAYER, annotation })
        setActiveSpanId(null)
      }}
      onDelete={() =>
        dispatch({
          type: 'delete',
          layer: NAMED_ENTITY_LAYER,
          id: entitySpan.id,
        })
      }
    />
  )
})

export default SpanEditor
