import {
  entities,
  EntityType,
} from 'fragmentarium/ui/text-annotation/EntityType'
import {
  getUsedEntityTypes,
  getUsedRealiaIds,
  TaggedAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  buildRealiaAnnotations,
  buildTagAnnotations,
} from 'fragmentarium/ui/text-annotation/spanAnnotatorActions'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import RealiaInfoContext from 'fragmentarium/ui/text-annotation/RealiaInfoContext'
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
  const { register } = useContext(RealiaInfoContext)
  const usedEntityTypes = getUsedEntityTypes(annotations, selection)
  const usedRealiaIds = getUsedRealiaIds(annotations, selection)
  const availableTypeOptions = entityTypeOptions.filter(
    (option) => !usedEntityTypes.includes(option.value),
  )

  const applyAnnotations = (added: readonly TaggedAnnotationSpan[]) => {
    if (added.length === 0) {
      return
    }
    added.forEach((annotation) => dispatch({ type: 'add', annotation }))
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
            placeholder={'Select tag'}
            options={availableTypeOptions}
            value={selectedType}
            onChange={(option) => {
              const selectedOption = option as EntityTypeOption | null
              setSelectedType(selectedOption)
              applyAnnotations(
                buildTagAnnotations(annotations, selection, selectedOption),
              )
            }}
          />
        </Form.Group>
        <Form.Group className={'text-annotation__realia-group'}>
          <RealiaSelect
            ariaLabel={'annotate-realia'}
            value={null}
            excludedRealiaIds={usedRealiaIds}
            onChange={(option: RealiaOption | null) => {
              register(option?.entry)
              applyAnnotations(
                buildRealiaAnnotations(annotations, selection, option),
              )
            }}
          />
        </Form.Group>
      </Form>
    </div>
  )
})

export default SpanAnnotator
