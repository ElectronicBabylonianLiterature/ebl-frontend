import AnnotationContext, {
  Entity,
} from 'fragmentarium/ui/fragment/lemma-annotation/TextAnnotationContext'
import _ from 'lodash'
import React, { useContext } from 'react'
import Select from 'react-select'

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
}: {
  selection: readonly string[]
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
          }
        }}
      />
    </div>
  )
}
