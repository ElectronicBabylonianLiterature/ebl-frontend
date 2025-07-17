const EntityTypes = {
  LOCATION: { type: 'LOCATION', label: 'LOC' },
  PERSON: { type: 'PERSON', label: 'PERSON' },
} as const
export type EntityType = keyof typeof EntityTypes
