import { castDraft, Draft, produce } from 'immer'
import {
  EditStatus,
  Line,
  LineVariant,
  ManuscriptLine,
} from 'corpus/domain/line'

function editLine(line: Line, recipe: (draft: Draft<Line>) => void): Line {
  return produce(line, (draft) => {
    recipe(draft)
    if (draft.status !== EditStatus.NEW) {
      draft.status = EditStatus.EDITED
    }
  })
}

export function setLineNumber(line: Line, number: string): Line {
  return editLine(line, (draft) => {
    draft.number = number
  })
}

export function setLineTranslation(line: Line, translation: string): Line {
  return editLine(line, (draft) => {
    draft.translation = translation
  })
}

export function setSecondLineOfParallelism(
  line: Line,
  isSecondLineOfParallelism: boolean,
): Line {
  return editLine(line, (draft) => {
    draft.isSecondLineOfParallelism = isSecondLineOfParallelism
  })
}

export function setBeginningOfSection(
  line: Line,
  isBeginningOfSection: boolean,
): Line {
  return editLine(line, (draft) => {
    draft.isBeginningOfSection = isBeginningOfSection
  })
}

export function setLineVariant(
  line: Line,
  variantIndex: number,
  variant: LineVariant,
): Line {
  return editLine(line, (draft) => {
    draft.variants[variantIndex] = castDraft(variant)
  })
}

export function setVariantIntertext(
  variant: LineVariant,
  intertext: string,
): LineVariant {
  return produce(variant, (draft) => {
    draft.intertext = intertext
  })
}

export function setVariantReconstruction(
  variant: LineVariant,
  reconstruction: string,
): LineVariant {
  return produce(variant, (draft) => {
    draft.reconstruction = reconstruction
  })
}

export function setVariantManuscriptLine(
  variant: LineVariant,
  manuscriptIndex: number,
  manuscriptLine: ManuscriptLine,
): LineVariant {
  return produce(variant, (draft) => {
    draft.manuscripts[manuscriptIndex] = castDraft(manuscriptLine)
  })
}

export function setManuscriptId(
  manuscriptLine: ManuscriptLine,
  manuscriptId: number,
): ManuscriptLine {
  return produce(manuscriptLine, (draft) => {
    draft.manuscriptId = manuscriptId
  })
}

export function setManuscriptLabels(
  manuscriptLine: ManuscriptLine,
  labels: readonly string[],
): ManuscriptLine {
  return produce(manuscriptLine, (draft) => {
    draft.labels = castDraft(labels)
  })
}

export function setManuscriptNumber(
  manuscriptLine: ManuscriptLine,
  number: string,
): ManuscriptLine {
  return produce(manuscriptLine, (draft) => {
    draft.number = number
  })
}

export function setManuscriptAtf(
  manuscriptLine: ManuscriptLine,
  atf: string,
): ManuscriptLine {
  return produce(manuscriptLine, (draft) => {
    draft.atf = atf
  })
}

export function parseLabels(text: string): string[] {
  return text.split(/\s+/).filter((label) => label !== '')
}

export function formatLabels(labels: readonly string[]): string {
  return labels.join(' ')
}
