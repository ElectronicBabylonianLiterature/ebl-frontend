import { NamedEntity } from 'fragmentarium/domain/NamedEntity'

export const EntityTypes = {
  LOCATION: { type: 'LOCATION', label: 'LOC' },
  PERSON: { type: 'PERSON', label: 'PERSON' },
  YEAR: { type: 'YEAR', label: 'YEAR' },
} as const
export type EntityType = keyof typeof EntityTypes
export interface Entity {
  type: EntityType
  label: string
}

export const entities: Entity[] = Object.values(EntityTypes)

export interface ApiEntityAnnotationSpan extends NamedEntity {
  span: readonly string[]
}
export interface EntityAnnotationSpan extends ApiEntityAnnotationSpan {
  tier: number
}
