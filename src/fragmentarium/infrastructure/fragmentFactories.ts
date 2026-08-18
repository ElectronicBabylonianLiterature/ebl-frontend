import {
  Fragment,
  FragmentInfo,
  FragmentInfoDto,
  Script,
  ScriptDto,
} from 'fragmentarium/domain/fragment'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import Folio from 'fragmentarium/domain/Folio'
import { Acquisition } from 'fragmentarium/domain/Acquisition'
import { Museums, MuseumKey } from 'fragmentarium/domain/museum'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { Genres } from 'fragmentarium/domain/Genres'
import {
  LineToVecRanking,
  LineToVecRankingDto,
  LineToVecScore,
  LineToVecScoreDto,
} from 'fragmentarium/domain/lineToVecRanking'
import createReference from 'bibliography/application/createReference'
import { createTransliteration } from 'transliteration/application/dtos'
import { Joins } from 'fragmentarium/domain/join'
import FragmentDto from 'fragmentarium/domain/FragmentDtos'
import {
  Period,
  PeriodModifiers,
  periodFromAbbreviation,
  Periods,
} from 'common/utils/period'
import { createResearchProject } from 'research-projects/researchProject'
import { MesopotamianDate } from 'chronology/domain/Date'
import { createArchaeology } from 'fragmentarium/domain/archaeologyDtos'
import { Colophon } from 'fragmentarium/domain/Colophon'

function createPeriod(periodName: string): Period {
  const canonicalPeriod = Periods[periodName]
  if (canonicalPeriod) {
    return canonicalPeriod
  }

  try {
    const abbreviatedPeriod = periodFromAbbreviation(periodName)
    return Periods[abbreviatedPeriod.name] ?? Periods.Uncertain
  } catch {
    return Periods.Uncertain
  }
}

export function createScript(dto: ScriptDto): Script {
  const period =
    dto && typeof dto.period === 'string'
      ? createPeriod(dto.period)
      : Periods.Uncertain
  const periodModifier =
    PeriodModifiers[
      dto && typeof dto.periodModifier === 'string'
        ? dto.periodModifier
        : 'None'
    ] ?? PeriodModifiers.None
  return {
    uncertain: dto?.uncertain ?? false,
    period,
    periodModifier,
  }
}

export function createLineToVecScore(dto: LineToVecScoreDto): LineToVecScore {
  return { ...dto, script: createScript(dto.script) }
}

export function createLineToVecRanking(
  dto: LineToVecRankingDto,
): LineToVecRanking {
  return {
    score: dto.score.map(createLineToVecScore),
    scoreWeighted: dto.scoreWeighted.map(createLineToVecScore),
  }
}

export function createJoins(joins): Joins {
  const safeJoins = joins ?? []
  return safeJoins.map((group) =>
    (group ?? []).map((join) => ({
      ...join,
      museumNumber: museumNumberToString(join.museumNumber),
    })),
  )
}

export function createFragment(dto: FragmentDto): Fragment {
  const museumKey: MuseumKey = dto.museum
  return Fragment.create({
    ...dto,
    number: museumNumberToString(dto.museumNumber),
    accession: dto.accession ? museumNumberToString(dto.accession) : '',
    acquisition: dto.acquisition
      ? new Acquisition(
          dto.acquisition.supplier,
          dto.acquisition.date,
          dto.acquisition.description,
        )
      : null,
    museum: Museums[museumKey],
    joins: createJoins(dto.joins ?? []),
    measures: {
      length: dto.length.value || null,
      width: dto.width.value || null,
      thickness: dto.thickness.value || null,
      lengthNote: dto.length.note || null,
      widthNote: dto.width.note || null,
      thicknessNote: dto.thickness.note || null,
    },
    folios: (dto.folios ?? []).map((folioDto) => new Folio(folioDto)),
    record: (dto.record ?? []).map((recordDto) => new RecordEntry(recordDto)),
    text: createTransliteration(dto.text),
    references: (dto.references ?? []).map(createReference),
    uncuratedReferences: dto.uncuratedReferences ?? null,
    cdliImages: dto.cdliImages,
    traditionalReferences: dto.traditionalReferences,
    genres: Genres.fromJson(dto.genres ?? []),
    script: createScript(dto.script),
    projects: (dto.projects ?? []).map(createResearchProject),
    dossiers: dto.dossiers ?? [],
    date: dto.date ? MesopotamianDate.fromJson(dto.date) : undefined,
    datesInText: dto.datesInText
      ? dto.datesInText.map((date) => MesopotamianDate.fromJson(date))
      : [],
    archaeology: dto.archaeology
      ? createArchaeology(dto.archaeology)
      : undefined,
    colophon: dto.colophon ? Colophon.fromJson(dto.colophon) : undefined,
  })
}

export function createFragmentInfo(dto: FragmentInfoDto): FragmentInfo {
  return {
    ...dto,
    script: createScript(dto.script),
    accession: dto.accession ? museumNumberToString(dto.accession) : '',
  }
}

export function createFragmentPath(
  number: string,
  ...subResources: string[]
): string {
  return ['/fragments', encodeURIComponent(number), ...subResources].join('/')
}
