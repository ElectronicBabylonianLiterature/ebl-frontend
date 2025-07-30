export const EntityTypes = {
  BUILDING_NAME: { type: 'BUILDING_NAME', name: 'Building Name', label: 'BN' },
  CELESTIAL_NAME: {
    type: 'CELESTIAL_NAME',
    name: 'Celestial Name',
    label: 'CN',
  },
  DIVINE_NAME: { type: 'DIVINE_NAME', name: 'Divine Name', label: 'DN' },
  ETHNOS_NAME: { type: 'ETHNOS_NAME', name: 'Ethnos Name', label: 'EN' },
  FIELD_NAME: { type: 'FIELD_NAME', name: 'Field Name', label: 'FN' },
  GEOGRAPHICAL_NAME: {
    type: 'GEOGRAPHICAL_NAME',
    name: 'Geographical Name',
    label: 'GN',
  },
  MONTH_NAME: { type: 'MONTH_NAME', name: 'Month Name', label: 'MN' },
  OBJECT_NAME: { type: 'OBJECT_NAME', name: 'Object Name', label: 'ON' },
  PERSONAL_NAME: { type: 'PERSONAL_NAME', name: 'Personal Name', label: 'PN' },
  ROYAL_NAME: { type: 'ROYAL_NAME', name: 'Royal Name', label: 'RN' },
  WATERCOURSE_NAME: {
    type: 'WATERCOURSE_NAME',
    name: 'Watercourse Name',
    label: 'WN',
  },
  YEAR_NAME: { type: 'YEAR_NAME', name: 'Year Name', label: 'YN' },
} as const
export type EntityType = keyof typeof EntityTypes
export interface Entity {
  type: EntityType
  label: string
  name: string
}

export const entities: Entity[] = Object.values(EntityTypes)

export type NamedEntity = {
  readonly id: string
  readonly type: EntityType
}

export interface ApiEntityAnnotationSpan extends NamedEntity {
  span: readonly string[]
}
export interface EntityAnnotationSpan extends ApiEntityAnnotationSpan {
  tier: number
  name: string
}
