import {
  linkMesZlReferences,
  mesZlParagraphsMarkup,
  mesZlSearchUrl,
  mesZlToMarkup,
  wrapCuneiform,
} from 'signs/domain/mesZlMarkup'

const link = (label: string, number: string): string =>
  `<a class="MesZl__reference" href="${mesZlSearchUrl(number)}">${label}</a>`
const tab = '<span class="MesZl__tab"></span>'
const cuneiform = (signs: string): string =>
  `<span class="MesZl__cuneiform">${signs}</span>`

describe('linkMesZlReferences', () => {
  test.each([
    ['siehe n94.', `siehe ${link('n94', '94')}.`],
    ['Siehe auch n293 dingir', `Siehe auch ${link('n293', '293')} dingir`],
    ['Variante zu n121 BAR', `Variante zu ${link('n121', '121')} BAR`],
    [
      'sowie Kap. II n10, 293 und 579.',
      `sowie Kap. II ${link('n10', '10')}, ${link('293', '293')} und ${link('579', '579')}.`,
    ],
    [
      'aus n876 und 829 erschlossen',
      `aus ${link('n876', '876')} und ${link('829', '829')} erschlossen`,
    ],
    ['(n134 (NAM)', `(${link('n134', '134')} (NAM)`],
    ['(n12)', `(${link('n12', '12')})`],
    ['AN n5', `AN ${link('n5', '5')}`],
    ['(BAD, n113)', `(BAD, ${link('n113', '113')})`],
    ['vgl. n1 und 2 Zeichen', `vgl. ${link('n1', '1')} und 2 Zeichen`],
    ['n12-14', `${link('n12', '12')}-${link('14', '14')}`],
    ['siehe n12–14.', `siehe ${link('n12', '12')}–${link('14', '14')}.`],
    [
      'horizontal \\[n115\\] bezeugt',
      `horizontal \\[${link('n115', '115')}\\] bezeugt`,
    ],
    ['“n5”', `“${link('n5', '5')}”`],
    ['n5;n6', `${link('n5', '5')};${link('n6', '6')}`],
    ['n5; n6', `${link('n5', '5')}; ${link('n6', '6')}`],
    ['siehe n05', `siehe ${link('n05', '5')}`],
    [
      'Zu oben n882 und 741 PÉŠ.',
      `Zu oben ${link('n882', '882')} und ${link('741', '741')} PÉŠ.`,
    ],
  ])('links %s', (text, expected) => {
    expect(linkMesZlReferences(text)).toEqual(expected)
  })

  test.each([
    'Rosengarten n348 und 349.',
    'Fales + Postgate, SAA 11 n80 Rs. 8’',
    'Gelb n227a. HethZL n328.',
    'SpTU II n51 I 24',
    'Supplément n12',
    'ZA 88 263). n3) S^a^-Vokab.',
    'n3) S^a^-Vokab.',
    'MSL 9 174 32.34',
    'Wiseman u.a., LTTN n232A 27f.',
    'Borger, WO 5 170 zu BAK n557.',
    'aBZL n037 “dara”',
  ])('leaves %s alone', (text) => {
    expect(linkMesZlReferences(text)).toEqual(text)
  })
})

describe('wrapCuneiform', () => {
  test('wraps runs of signs, including private-use signs and spaces between signs', () => {
    expect(wrapCuneiform('𒊺 𒆕 (𒀀) = še-dù-a; 􀀳')).toEqual(
      `${cuneiform('𒊺 𒆕')} (${cuneiform('𒀀')}) = še-dù-a; ${cuneiform('􀀳')}`,
    )
  })

  test('does not join signs across line breaks', () => {
    expect(wrapCuneiform('𒊺\n\n𒀀')).toEqual(
      `${cuneiform('𒊺')}\n\n${cuneiform('𒀀')}`,
    )
  })

  test('leaves Latin text alone', () => {
    expect(wrapCuneiform('ŠE-GAG')).toEqual('ŠE-GAG')
  })
})

describe('mesZlToMarkup', () => {
  const text = [
    '579\t𒊺\t**— ŠE — ŠL 367**',
    '---',
    'Fossey p736. Rosengarten n440.',
    '',
    '𒊺𒆰 siehe n117 [sic].',
  ].join('\n')

  test('splits head and paragraphs, drops separators and blank lines', () => {
    expect(mesZlToMarkup(text)).toEqual({
      head: `579${tab}${cuneiform('𒊺')}${tab}**— ŠE — ŠL 367**`,
      paragraphs: [
        'Fossey p736. Rosengarten n440.',
        `${cuneiform('𒊺𒆰')} siehe ${link('n117', '117')} \\[sic\\].`,
      ],
    })
  })

  test('can leave references unlinked', () => {
    expect(
      mesZlToMarkup(text, { linkReferences: false }).paragraphs[1],
    ).toContain('siehe n117')
  })

  test.each([
    ['\t\tindented 𒀀', `${tab}${tab}indented ${cuneiform('𒀀')}`],
    ['    four spaces', `${tab}four spaces`],
    ['  two spaces', '&nbsp;&nbsp;two spaces'],
    ['1. Zeile', '1\\. Zeile'],
    ['2) Zeile', '2\\) Zeile'],
    ['- Strich', '\\- Strich'],
    ['* Stern', '\\* Stern'],
    ['# Raute', '\\# Raute'],
    ['> Pfeil', '&gt; Pfeil'],
    ['+ Plus', '\\+ Plus'],
    ['***', '\\***'],
    ['**fett** bleibt', '**fett** bleibt'],
  ])('keeps the line %p from becoming a Markdown block', (line, expected) => {
    expect(mesZlToMarkup(`head\n${line}`).paragraphs).toEqual([expected])
  })
})

describe('literal angle brackets and ampersands', () => {
  test.each([
    [
      'schrift *me*₅*-lè-*<<IGI>>*-ṣa* (auch',
      'schrift *me*₅*-lè-*&lt;&lt;IGI&gt;&gt;*-ṣa* (auch',
    ],
    ['offenbar <>-de-e-ma- zu lesen', 'offenbar &lt;&gt;-de-e-ma- zu lesen'],
    ['wohl ^uru^BÀD-<AN> o.ä.', 'wohl ^uru^BÀD-&lt;AN&gt; o.ä.'],
    ['AHw 116b bāʾu (< ba₇, = Hälfte)', 'AHw 116b bāʾu (&lt; ba₇, = Hälfte)'],
    ['p20f., Nab. & Belsh. 99f.', 'p20f., Nab. &amp; Belsh. 99f.'],
    ['Die <u>vier Windrichtungen</u>', 'Die <u>vier Windrichtungen</u>'],
    [
      '<span style="color: #00610F;">Siehe Kap. II 2. Anhang.</span>',
      '<span style="color: #00610F;">Siehe Kap. II 2. Anhang.</span>',
    ],
    [
      '<span>DIŠ</span><br/><span>DIŠ</span>',
      '<span>DIŠ</span><br/><span>DIŠ</span>',
    ],
  ])('escapes %p as text, keeping real HTML', (line, expected) => {
    expect(mesZlToMarkup(`head\n${line}`).paragraphs).toEqual([expected])
  })
})

describe('mesZlParagraphsMarkup', () => {
  test('keeps the paragraphs in one block', () => {
    expect(mesZlParagraphsMarkup(['a', 'b'])).toEqual(
      '<div class="MesZl__body">\n\na\n\nb\n\n</div>',
    )
  })
})
