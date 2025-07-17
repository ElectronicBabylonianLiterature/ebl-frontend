export const EntityTypes = {
  LOCATION: { type: 'LOCATION', label: 'LOC' },
  PERSON: { type: 'PERSON', label: 'PERSON' },
} as const
export type EntityType = keyof typeof EntityTypes
export interface Entity {
  type: EntityType
  label: string
}

export const entities: Entity[] = Object.values(EntityTypes)

export interface EntityAnnotationSpan {
  id: string
  type: EntityType
  span: readonly string[]
  tier: number
}
