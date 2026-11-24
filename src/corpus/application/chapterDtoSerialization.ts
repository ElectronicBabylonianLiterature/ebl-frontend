import _ from 'lodash'
import serializeReference from 'bibliography/application/serializeReference'
import Reference from 'bibliography/domain/Reference'
import { AlignmentToken, LineAlignment } from 'corpus/domain/alignment'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import { Manuscript, OldSiglum } from 'corpus/domain/manuscript'

function toName(record: { name: string }): string {
  return record.name
}

function serializeOldSiglum(oldSiglum: OldSiglum): {
  siglum: string
  reference: Pick<Reference, 'type' | 'pages' | 'notes' | 'linesCited'> & {
    id: string
  }
} {
  return {
    siglum: oldSiglum.siglum,
    reference: serializeReference(oldSiglum.reference),
  }
}

function toManuscriptDto(manuscript: Manuscript) {
  return {
    id: manuscript.id,
    siglumDisambiguator: manuscript.siglumDisambiguator,
    oldSigla: manuscript.oldSigla.map(serializeOldSiglum),
    museumNumber: manuscript.museumNumber,
    accession: manuscript.accession,
    provenance: toName(manuscript.provenance),
    periodModifier: toName(manuscript.periodModifier),
    period: toName(manuscript.period),
    type: toName(manuscript.type),
    notes: manuscript.notes,
    colophon: manuscript.colophon,
    unplacedLines: manuscript.unplacedLines,
    references: manuscript.references.map(serializeReference),
  } as const
}

export function toLineDto(line: Line) {
  return {
    ..._.omit(line, 'status'),
    variants: line.variants.map((variant) => ({
      reconstruction: variant.reconstruction,
      intertext: variant.intertext,
      manuscripts: variant.manuscripts.map((manuscript) => ({
        manuscriptId: manuscript.manuscriptId,
        labels: manuscript.labels,
        number: manuscript.number,
        atf: manuscript.atf,
        omittedWords: manuscript.omittedWords,
      })),
    })),
  } as const
}

function toAlignmentTokenDto(token: AlignmentToken) {
  return token.isAlignable
    ? ({
        value: token.value,
        alignment: token.alignment,
        variant: token.variant?.value ?? '',
        type: token.variant?.type ?? '',
        language: token.variant?.language ?? '',
      } as const)
    : ({
        value: token.value,
      } as const)
}

export function toLineAlignmentDto(line: LineAlignment) {
  return line.map((variant) =>
    variant.map((manuscript) => ({
      alignment: manuscript.alignment.map(toAlignmentTokenDto),
      omittedWords: manuscript.omittedWords,
    })),
  )
}

export function toLineLemmatizationDto(line: readonly LineLemmatization[]) {
  return line.map((variant) => ({
    reconstruction: variant[0].map((token) => token.toDto()),
    manuscripts: variant[1].map((line) => line.map((token) => token.toDto())),
  }))
}

export function toManuscriptsDto(
  manuscripts: readonly Manuscript[],
  uncertainChapters: readonly string[],
): Record<string, unknown> {
  return {
    manuscripts: manuscripts.map(toManuscriptDto),
    uncertainFragments: uncertainChapters,
  } as const
}
