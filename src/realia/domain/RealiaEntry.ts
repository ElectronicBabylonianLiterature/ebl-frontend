import Reference from 'bibliography/domain/Reference'

export type RealiaType =
  | 'BUILDING_NAME'
  | 'CELESTIAL_NAME'
  | 'DIVINE_NAME'
  | 'ETHNOS_NAME'
  | 'FIELD_NAME'
  | 'GEOGRAPHICAL_NAME'
  | 'MONTH_NAME'
  | 'OBJECT_NAME'
  | 'PERSONAL_NAME'
  | 'ROYAL_NAME'
  | 'WATERCOURSE_NAME'
  | 'YEAR_NAME'

export const REALIA_TYPE_LABELS: Record<RealiaType, string> = {
  BUILDING_NAME: 'Building Name',
  CELESTIAL_NAME: 'Celestial Name',
  DIVINE_NAME: 'Divine Name',
  ETHNOS_NAME: 'Ethnos Name',
  FIELD_NAME: 'Field Name',
  GEOGRAPHICAL_NAME: 'Geographical Name',
  MONTH_NAME: 'Month Name',
  OBJECT_NAME: 'Object Name',
  PERSONAL_NAME: 'Personal Name',
  ROYAL_NAME: 'Royal Name',
  WATERCOURSE_NAME: 'Watercourse Name',
  YEAR_NAME: 'Year Name',
}

export function getRealiaTypeLabels(
  types: readonly RealiaType[],
): readonly string[] {
  return types.map((type) => REALIA_TYPE_LABELS[type])
}

export interface AfoRegisterEntry {
  readonly mainWord: string
  readonly note: string
  readonly AfO: string
  readonly reference: string
  readonly crossReference: string
}

export interface ReallexikonEntry {
  readonly id: string
  readonly title: string
  readonly content: string
  readonly reference: Reference | null
}

export interface RealiaEntry {
  readonly id: string
  readonly relatedTerms: readonly string[]
  readonly type: readonly RealiaType[]
  readonly wikidataId: readonly string[]
  readonly afoRegister: readonly AfoRegisterEntry[]
  readonly reallexikon: readonly ReallexikonEntry[]
  readonly references: readonly Reference[]
}
