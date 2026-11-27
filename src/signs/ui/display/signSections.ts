import Sign from 'signs/domain/Sign'
import { EntryNavSection } from 'common/ui/entry-page/entryNavSections'
import {
  MesZlKap2State,
  hasMesZlKap2Content,
} from 'signs/ui/display/useMesZlKap2'

export const signTopId = 'sign-top'

export const signSectionIds = {
  meszl: 'sign-meszl',
  logograms: 'sign-logograms',
  palaeography: 'sign-palaeography',
  composites: 'sign-composites',
  fossey: 'sign-fossey',
} as const

export type SignSectionId = (typeof signSectionIds)[keyof typeof signSectionIds]

export const signSectionLabels: Readonly<Record<SignSectionId, string>> = {
  [signSectionIds.meszl]: 'Mesopotamisches Zeichenlexikon',
  [signSectionIds.logograms]: 'Logograms',
  [signSectionIds.palaeography]: 'Palaeography',
  [signSectionIds.composites]: 'Composite signs',
  [signSectionIds.fossey]: 'Fossey',
}

export interface SignNavSection extends EntryNavSection {
  readonly id: SignSectionId
}

function isPresent(
  id: SignSectionId,
  sign: Sign,
  kap2: MesZlKap2State,
): boolean {
  switch (id) {
    case signSectionIds.meszl:
      return Boolean(sign.mesZl) || hasMesZlKap2Content(kap2)
    case signSectionIds.logograms:
      return sign.logograms.length > 0
    case signSectionIds.fossey:
      return sign.fossey.length > 0
    default:
      return true
  }
}

export function buildSignSections(
  sign: Sign,
  kap2: MesZlKap2State,
): readonly SignNavSection[] {
  return Object.values(signSectionIds)
    .filter((id) => isPresent(id, sign, kap2))
    .map((id) => ({
      id,
      label: signSectionLabels[id],
      subsections: [],
      collapsible: id !== signSectionIds.meszl,
    }))
}
