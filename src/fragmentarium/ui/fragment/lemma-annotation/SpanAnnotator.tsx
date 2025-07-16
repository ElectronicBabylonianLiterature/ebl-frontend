import AnnotationContext, {
  Entity,
} from 'fragmentarium/ui/fragment/lemma-annotation/TextAnnotationContext'
import _ from 'lodash'
import React, { useContext } from 'react'
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

const EntityTypes = ['LOCATION', 'PERSON'] as const
export type EntityType = typeof EntityTypes[number]

interface EntityTypeOption {
  label: EntityType
  value: EntityType
}

const options: EntityTypeOption[] = EntityTypes.map((entity) => ({
  value: entity,
  label: entity,
}))

function createId(type: EntityType, entities: readonly Entity[]): string {
  const currentMaxId =
    _.max(
      entities
        .filter((entity) => entity.type === type)
        .map(({ id }) => parseInt(id.split('-')[1]))
    ) || 0

  return `E-${currentMaxId + 1}`
}

export default function SpanAnnotator({
  selection,
  setSelection,
}: {
  selection: readonly string[]
  setSelection: React.Dispatch<React.SetStateAction<readonly string[]>>
}): JSX.Element {
  const [
    selectedType,
    setSelectedType,
  ] = React.useState<EntityTypeOption | null>(null)
  const [entities, dispatch] = useContext(AnnotationContext)

  return (
    <div onMouseUp={(event) => event.stopPropagation()}>
      <Select
        autoFocus
        options={options}
        value={selectedType}
        onChange={(option) => {
          setSelectedType(option as EntityTypeOption)
          if (option) {
            const entity = {
              id: createId(option.value, entities),
              type: option.value,
              span: selection,
            }
            dispatch({ type: 'add', entity })
            clearSelection()
            setSelection([])
          }
        }}
      />
    </div>
  )
}
