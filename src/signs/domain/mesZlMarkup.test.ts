import {
  linkMesZlReferences,
  mesZlSearchUrl,
  mesZlToMarkup,
  wrapCuneiform,
} from 'signs/domain/mesZlMarkup'

const link = (label: string, number: string): string =>
  `<a class="MesZl__reference" href="${mesZlSearchUrl(number)}">${label}</a>`

describe('linkMesZlReferences', () => {
  test.each([
    ['siehe n94.', `siehe ${link('n94', '94')}.`],
    ['Siehe auch n293 dingir', `Siehe auch ${link('n293', '293')} dingir`],
    ['usw. siehe zu n115', `usw. siehe zu ${link('n115', '115')}`],
    ['Variante zu n121 BAR', `Variante zu ${link('n121', '121')} BAR`],
    [
      'sowie Kap. II n10, 293 und 579.',
      `sowie Kap. II ${link('n10', '10')}, ${link('293', '293')} und ${link('579', '579')}.`,
    ],
    ['wechselt mit n596 𒌓', `wechselt mit ${link('n596', '596')} 𒌓`],
    [
      'Lww. dul₄ und tul₆ aus n876 und 829 erschlossen',
      `Lww. dul₄ und tul₆ aus ${link('n876', '876')} und ${link('829', '829')} erschlossen`,
    ],
    ['(n134 (NAM)', `(${link('n134', '134')} (NAM)`],
    ['das Zeichen n206 = SUR₁₀', `das Zeichen ${link('n206', '206')} = SUR₁₀`],
  ])('links %s', (text, expected) => {
    expect(linkMesZlReferences(text)).toEqual(expected)
  })

  test.each([
    'Rosengarten n348 und 349.',
    'Fales + Postgate, SAA 11 n80 Rs. 8’',
    'Cavigneaux, NABU 1989 n52, M. P. Streck',
    'Gelb n227a. HethZL n328.',
    'SpTU II n51 I 24',
    'UET 6/II n408 12',
    'Supplément n12',
    'ZA 88 263). n3) S^a^-Vokab.',
    'MSL 9 174 32.34',
    'siehe zu Gelb n227a',
  ])('leaves %s alone', (text) => {
    expect(linkMesZlReferences(text)).toEqual(text)
  })
})

describe('wrapCuneiform', () => {
  test('wraps runs of signs, including private-use signs and spaces between signs', () => {
    expect(wrapCuneiform('𒊺 𒆕 (𒀀) = še-dù-a; 􀀳')).toEqual(
      '<span class="MesZl__cuneiform">𒊺 𒆕</span> (<span class="MesZl__cuneiform">𒀀</span>) = še-dù-a; <span class="MesZl__cuneiform">􀀳</span>',
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
      head: '579  <span class="MesZl__cuneiform">𒊺</span>  **— ŠE — ŠL 367**',
      paragraphs: [
        'Fossey p736. Rosengarten n440.',
        `<span class="MesZl__cuneiform">𒊺𒆰</span> siehe ${link('n117', '117')} \\[sic\\].`,
      ],
    })
  })

  test('can leave references unlinked', () => {
    expect(
      mesZlToMarkup(text, { linkReferences: false }).paragraphs[1],
    ).toContain('siehe n117')
  })
})
