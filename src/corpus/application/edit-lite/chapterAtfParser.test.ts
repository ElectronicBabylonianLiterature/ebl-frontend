import {
  ParsedChapterAtf,
  parseChapterAtf,
} from 'corpus/application/edit-lite/chapterAtfParser'
import {
  chapterAtf,
  chapterAtfHeader,
} from 'corpus/application/edit-lite/chapterEditSource.testSupport'

const parsedChapterAtf: ParsedChapterAtf = {
  lines: [
    {
      number: '1',
      translation: '#tr.en: When on high',
      variants: [
        {
          number: '1',
          translation: '#tr.en: When on high',
          reconstruction: '%n enūma | eliš',
          manuscripts: [
            {
              siglum: 'NinNA1a',
              labels: ['o'],
              number: '1',
              atf: 'e#-nu-ma# [e]-liš#',
            },
            {
              siglum: 'BabaNBSch1',
              labels: ['o'],
              number: '6′',
              atf: '[x x x] e-li-[iš]\n$ beginning of excerpt\n#note: collated',
            },
          ],
        },
      ],
    },
    {
      number: '2',
      translation: '#tr.en: Nor below\n#tr.ar: translation of the variant',
      variants: [
        {
          number: '2',
          translation: '#tr.en: Nor below',
          reconstruction:
            '%n šapliš\n#note: a variant note\n// cf. L I.9 SB "II" 35-36\n// (LB 3272 Vs. 7)',
          manuscripts: [
            {
              siglum: 'NinNA1a',
              labels: ['o', 'i'],
              number: 'a+2-3b',
              atf: 'šap-liš',
            },
            { siglum: 'BabaNBSch1', labels: [], number: '4a', atf: '' },
          ],
        },
        {
          number: '2',
          translation: '#tr.ar: translation of the variant',
          reconstruction: '%n šapliš | ammatu',
          manuscripts: [],
        },
      ],
    },
  ],
  diagnostics: [],
}

function join(...rows: readonly string[]): string {
  return rows.join('\n')
}

describe('parseChapterAtf', () => {
  it('parses lines, variants, manuscripts and paratext', () => {
    expect(parseChapterAtf(chapterAtf)).toEqual(parsedChapterAtf)
  })

  it('accepts Windows line endings and repeated blank rows', () => {
    const atf = chapterAtf.replace(/\n\n/g, '\n \n\n').replace(/\n/g, '\r\n')

    expect(parseChapterAtf(atf)).toEqual(parsedChapterAtf)
  })

  it.each([[''], ['\n\n\n'], [chapterAtfHeader]])(
    'returns nothing for %j',
    (atf) => {
      expect(parseChapterAtf(atf)).toEqual({ lines: [], diagnostics: [] })
    },
  )

  it('keeps blocks with the same number apart when they are not adjacent', () => {
    const parsed = parseChapterAtf(join('1. kur', '', '2. ra', '', '1. an'))

    expect(parsed.lines.map((line) => line.number)).toEqual(['1', '2', '1'])
    expect(parsed.lines.map((line) => line.variants.length)).toEqual([1, 1, 1])
    expect(parsed.diagnostics).toEqual([])
  })

  it('leaves the translation empty when no block has one', () => {
    const parsed = parseChapterAtf(join('1. kur', '', '1. ra', '', '2.'))

    expect(parsed.lines).toEqual([
      {
        number: '1',
        translation: '',
        variants: [
          {
            number: '1',
            translation: '',
            reconstruction: 'kur',
            manuscripts: [],
          },
          {
            number: '1',
            translation: '',
            reconstruction: 'ra',
            manuscripts: [],
          },
        ],
      },
      {
        number: '2',
        translation: '',
        variants: [
          { number: '2', translation: '', reconstruction: '', manuscripts: [] },
        ],
      },
    ])
  })

  it('keeps every translation row of a block', () => {
    const parsed = parseChapterAtf(
      join('#tr.en: first', '#tr.de: zweite', '1. kur'),
    )

    expect(parsed.lines[0].translation).toBe('#tr.en: first\n#tr.de: zweite')
    expect(parsed.diagnostics).toEqual([])
  })
})

describe('parseChapterAtf diagnostics', () => {
  it('reports rows before the reconstruction and keeps the block', () => {
    const parsed = parseChapterAtf(
      join('NinNA1a o 1. kur', '$ single ruling', '1. kur', 'NinNA1a o 1. ra'),
    )

    expect(parsed.lines).toHaveLength(1)
    expect(parsed.lines[0].variants[0].manuscripts).toEqual([
      { siglum: 'NinNA1a', labels: ['o'], number: '1', atf: 'ra' },
    ])
    expect(parsed.diagnostics).toEqual([
      'Line 1: unrecognised row "NinNA1a o 1. kur"',
      'Line 1: unrecognised row "$ single ruling"',
    ])
  })

  it('reports rows that fit nothing inside a variant', () => {
    const parsed = parseChapterAtf(
      join(
        '1. kur',
        '$ single ruling',
        '#tr.en: late translation',
        'NinNA1a o 1. ra',
        '// cf. L I.9 SB "II" 35',
        'NinNA1a without a number',
        '#note: kept with the manuscript',
      ),
    )

    expect(parsed.lines[0].variants[0]).toEqual({
      number: '1',
      translation: '',
      reconstruction: 'kur',
      manuscripts: [
        {
          siglum: 'NinNA1a',
          labels: ['o'],
          number: '1',
          atf: 'ra\n#note: kept with the manuscript',
        },
      ],
    })
    expect(parsed.diagnostics).toEqual([
      'Line 1: unrecognised row "$ single ruling"',
      'Line 1: unrecognised row "#tr.en: late translation"',
      'Line 1: unrecognised row "// cf. L I.9 SB "II" 35"',
      'Line 1: unrecognised row "NinNA1a without a number"',
    ])
  })

  it('reports every row of a block without reconstruction', () => {
    const parsed = parseChapterAtf(
      join(
        chapterAtfHeader,
        '',
        '#tr.en: orphan translation',
        'not a line',
        '',
        '1. kur',
      ),
    )

    expect(parsed.lines.map((line) => line.number)).toEqual(['1'])
    expect(parsed.diagnostics).toEqual([
      'Block 2: unrecognised row "#tr.en: orphan translation"',
      'Block 2: unrecognised row "not a line"',
    ])
  })

  it('skips header rows wherever they occur', () => {
    const parsed = parseChapterAtf(
      join('#atf: use unicode', '1. kur', '#project: eblo', '&X1 = L I.2'),
    )

    expect(parsed).toEqual({
      lines: [
        {
          number: '1',
          translation: '',
          variants: [
            {
              number: '1',
              translation: '',
              reconstruction: 'kur',
              manuscripts: [],
            },
          ],
        },
      ],
      diagnostics: [],
    })
  })

  it.each([
    ['\u0000￿\n\n\t\n. .\n1.\n1.\n$'],
    ['1. kur\n'.repeat(3)],
    ['𒀭 𒂗 𒆤\n\n#tr\n#tr.en\n//\n#note:\n@obverse'],
    ['\r\r\n\r1. kur\rNinNA1a 1. ra'],
  ])('never throws on unexpected input %j', (atf) => {
    const parsed = parseChapterAtf(atf)

    expect(Array.isArray(parsed.lines)).toBe(true)
    expect(parsed.diagnostics.every((entry) => typeof entry === 'string')).toBe(
      true,
    )
  })
})
