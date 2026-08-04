import { EntityType } from 'fragmentarium/ui/text-annotation/EntityType'
import { RealiaEntry } from 'realia/domain/RealiaEntry'

const REALIA_TYPE_TO_ENTITY_TYPE: { readonly [type: string]: EntityType } = {
  'Personal names': 'PERSONAL_NAME',
  'Divine names': 'DIVINE_NAME',
  'Geographical names': 'GEOGRAPHICAL_NAME',
  Objects: 'OBJECT_NAME',
  Peoples: 'ETHNOS_NAME',
}

export function getMappedEntityType(
  realiaTypes: readonly string[],
): EntityType | null {
  for (const realiaType of realiaTypes) {
    const entityType = REALIA_TYPE_TO_ENTITY_TYPE[realiaType]
    if (entityType) {
      return entityType
    }
  }
  return null
}

export function getEntryEntityType(entry: RealiaEntry): EntityType | null {
  return getMappedEntityType(entry.type)
}
