import _ from 'lodash'
import {
  toLineAlignmentDto,
  toLineLemmatizationDto,
} from 'corpus/application/chapterDtoSerialization'
import { AlignmentToken, LineAlignment } from 'corpus/domain/alignment'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'

function keepAcceptedAlignmentToken(token: AlignmentToken): AlignmentToken {
  return token.suggested
    ? { ...token, alignment: null, variant: null, suggested: false }
    : token
}

function keepAcceptedLemma(token: LemmatizationToken): LemmatizationToken {
  return token.suggested ? token.setUniqueLemma([]) : token
}

export function keepAcceptedAlignment(alignment: LineAlignment): LineAlignment {
  return alignment.map((variant) =>
    variant.map((manuscript) => ({
      ...manuscript,
      alignment: manuscript.alignment.map(keepAcceptedAlignmentToken),
    })),
  )
}

export function keepAcceptedLemmatization(
  lemmatization: readonly LineLemmatization[],
): LineLemmatization[] {
  return lemmatization.map(([reconstruction, manuscripts]) => [
    reconstruction.map(keepAcceptedLemma),
    manuscripts.map((manuscript) => manuscript.map(keepAcceptedLemma)),
  ])
}

export function toAcceptedAlignmentDto(
  alignment: LineAlignment,
): ReturnType<typeof toLineAlignmentDto> {
  return toLineAlignmentDto(keepAcceptedAlignment(alignment))
}

export function toAcceptedLemmatizationDto(
  lemmatization: readonly LineLemmatization[],
): ReturnType<typeof toLineLemmatizationDto> {
  return toLineLemmatizationDto(keepAcceptedLemmatization(lemmatization))
}

export function storesSameAlignment(
  first: LineAlignment,
  second: LineAlignment,
): boolean {
  return _.isEqual(
    toAcceptedAlignmentDto(first),
    toAcceptedAlignmentDto(second),
  )
}

export function storesSameLemmatization(
  first: readonly LineLemmatization[],
  second: readonly LineLemmatization[],
): boolean {
  return _.isEqual(
    toAcceptedLemmatizationDto(first),
    toAcceptedLemmatizationDto(second),
  )
}
