import {
  chapterAtfHeader,
  editChapterId,
  legacyLines,
  legacyOutline,
  setUpEditProvenances,
  snapshotDto,
} from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import { ChapterAtfSnapshotDto } from 'corpus/application/edit-lite/chapterAtfSnapshot'
import { createLegacySnapshot } from 'corpus/application/edit-lite/legacySnapshot'
import { EditStatus } from 'corpus/domain/line'

setUpEditProvenances()

function withAtf(...rows: readonly string[]): ChapterAtfSnapshotDto {
  return { ...snapshotDto, atf: rows.join('\n') }
}

describe('createLegacySnapshot', () => {
  it('builds the outline and the lines from the ATF and the manuscripts', () => {
    expect(createLegacySnapshot(editChapterId, snapshotDto)).toEqual({
      outline: legacyOutline,
      lines: legacyLines,
      diagnostics: [],
    })
  })

  it('fills what the ATF does not carry with neutral values', () => {
    const { lines } = createLegacySnapshot(editChapterId, snapshotDto)
    const variants = lines.flatMap((line) => line.variants)

    expect(lines.map((line) => line.status)).toEqual([
      EditStatus.CLEAN,
      EditStatus.CLEAN,
    ])
    expect(lines.some((line) => line.isSecondLineOfParallelism)).toBe(false)
    expect(lines.some((line) => line.isBeginningOfSection)).toBe(false)
    expect(variants.map((variant) => variant.intertext)).toEqual(['', '', ''])
    expect(
      variants.flatMap((variant) =>
        variant.manuscripts.map(
          (manuscriptLine) => manuscriptLine.omittedWords,
        ),
      ),
    ).toEqual([[], [], [], []])
  })

  it('numbers the outline lines by their position', () => {
    const { outline } = createLegacySnapshot(
      editChapterId,
      withAtf('5. kur', '', '7. ra', '', "8'. an"),
    )

    expect(outline.lines.map(({ index, number }) => [index, number])).toEqual([
      [0, '5'],
      [1, '7'],
      [2, "8'"],
    ])
  })

  it('spells the enclosures of a reconstruction like the edit API', () => {
    const { lines, outline } = createLegacySnapshot(
      editChapterId,
      withAtf(
        '40. %n [ ... ] mūšiš lū nēhet',
        '#note: a [ gap ] in the note',
        '// cf. L I.2 SB "I" 38',
      ),
    )
    const reconstruction =
      '%n [...] mūšiš lū nēhet\n#note: a [ gap ] in the note\n// cf. L I.2 SB "I" 38'

    expect(lines[0].variants[0].reconstruction).toBe(reconstruction)
    expect(outline.lines[0].variants[0].reconstruction).toBe(reconstruction)
  })

  it('returns an empty chapter for a header-only ATF', () => {
    const snapshot = createLegacySnapshot(
      editChapterId,
      withAtf(chapterAtfHeader),
    )

    expect(snapshot.lines).toEqual([])
    expect(snapshot.outline.lines).toEqual([])
    expect(snapshot.outline.manuscripts).toEqual(legacyOutline.manuscripts)
    expect(snapshot.diagnostics).toEqual([])
  })
})

describe('createLegacySnapshot diagnostics', () => {
  it('gives unknown sigla the manuscript id 0 and reports each once', () => {
    const snapshot = createLegacySnapshot(
      editChapterId,
      withAtf(
        '1. kur',
        'NinNA1a o 1. kur',
        'UrkHel9 o 1. kur',
        '',
        '2. ra',
        'UrkHel9 o 2. ra',
        'SipNB2 o 2. ra',
      ),
    )

    expect(
      snapshot.outline.lines.map((line) => line.variants[0].manuscriptIds),
    ).toEqual([
      [1, 0],
      [0, 0],
    ])
    expect(
      snapshot.lines.map((line) =>
        line.variants[0].manuscripts.map(
          (manuscriptLine) => manuscriptLine.manuscriptId,
        ),
      ),
    ).toEqual([
      [1, 0],
      [0, 0],
    ])
    expect(snapshot.diagnostics).toEqual([
      'Unknown siglum "UrkHel9" in 2 manuscript row(s), first in line 1.',
      'Unknown siglum "SipNB2" in 1 manuscript row(s), first in line 2.',
    ])
  })

  it('reports manuscripts that share a siglum and uses the first', () => {
    const snapshot = createLegacySnapshot(editChapterId, {
      atf: ['1. kur', 'NinNA1a o 1. kur'].join('\n'),
      manuscripts: [
        ...snapshotDto.manuscripts,
        { ...snapshotDto.manuscripts[0], id: 7 },
      ],
    })

    expect(
      snapshot.outline.manuscripts.map(({ id, siglum }) => [id, siglum]),
    ).toEqual([
      [1, 'NinNA1a'],
      [33, 'BabaNBSch1'],
      [7, 'NinNA1a'],
    ])
    expect(snapshot.outline.lines[0].variants[0].manuscriptIds).toEqual([1])
    expect(snapshot.diagnostics).toEqual([
      'Siglum "NinNA1a" is shared by manuscripts 1 and 7; rows are assigned to manuscript 1.',
    ])
  })

  it('passes the parser diagnostics on before its own', () => {
    const snapshot = createLegacySnapshot(
      editChapterId,
      withAtf('1. kur', 'not a manuscript row', 'UrkHel9 o 1. kur'),
    )

    expect(snapshot.diagnostics).toEqual([
      'Line 1: unrecognised row "not a manuscript row"',
      'Unknown siglum "UrkHel9" in 1 manuscript row(s), first in line 1.',
    ])
  })

  it('derives a siglum without abbreviations for unknown names', () => {
    const snapshot = createLegacySnapshot(editChapterId, {
      atf: '',
      manuscripts: [
        {
          id: 2,
          siglumDisambiguator: 'x',
          museumNumber: { prefix: 'BM', number: '1', suffix: '' },
          accession: '',
          period: 'None',
          provenance: 'A place nobody loaded',
          type: 'Library',
        },
      ],
    })

    expect(snapshot.outline.manuscripts).toEqual([
      { id: 2, siglum: 'x', museumNumber: 'BM.1', accession: '' },
    ])
  })
})
