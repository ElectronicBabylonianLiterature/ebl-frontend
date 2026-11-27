import {
  groupLogogramsByWord,
  isLogogramCrossReference,
  isSameAkkadian,
  parseSchrammLogogram,
  splitWordId,
} from 'signs/domain/schrammLogogram'
import { Logogram } from 'signs/domain/Sign'

const logogram = (
  logogramText: string,
  wordId: string[],
  schrammLogogramme: string,
): Logogram => ({
  logogram: logogramText,
  atf: logogramText,
  wordId,
  schrammLogogramme,
  unicode: '',
})

describe('parseSchrammLogogram', () => {
  test.each([
    [
      'NIGA; *marû* (gemästet, fett); ME 169²! CD 199a ZL 374',
      {
        akkadian: 'marû',
        uncertain: false,
        meaning: 'gemästet, fett',
        references: 'ME 169²! CD 199a ZL 374',
      },
    ],
    [
      '<sup>giš</sup>ŠE.U₃.SUH₅; *terinnu* (Zapfen (eines Nadelbaums)); ME 169² CD 404b',
      {
        akkadian: 'terinnu',
        uncertain: false,
        meaning: 'Zapfen (eines Nadelbaums)',
        references: 'ME 169² CD 404b',
      },
    ],
    [
      'ŠE.BI.DA; *ḫīṭu* (?) (Fehler); ME 169 CD 118a',
      {
        akkadian: 'ḫīṭu',
        uncertain: true,
        meaning: 'Fehler',
        references: 'ME 169 CD 118a',
      },
    ],
    [
      'ŠE.GUR; *kur₃ šeʾum (usw.)* ((x) kurru Getreide); cf. ZL 374',
      {
        akkadian: 'kur₃ šeʾum (usw.)',
        uncertain: false,
        meaning: '(x) kurru Getreide',
        references: 'cf. ZL 374',
      },
    ],
    [
      'ŠE; *šemû* (hören); ZL 375 (Lit.)',
      {
        akkadian: 'šemû',
        uncertain: false,
        meaning: 'hören',
        references: 'ZL 375 (Lit.)',
      },
    ],
    [
      'ŠE; *šeʾu*; ZL 367',
      {
        akkadian: 'šeʾu',
        uncertain: false,
        meaning: '',
        references: 'ZL 367',
      },
    ],
    [
      'ŠE; *šeʾu* (Gerste',
      {
        akkadian: 'šeʾu',
        uncertain: false,
        meaning: 'Gerste',
        references: '',
      },
    ],
  ])('parses %s', (schramm, expected) => {
    expect(parseSchrammLogogram(schramm)).toEqual(expected)
  })

  test.each(['NIGU → NIGA', '', 'ŠE; no akkadian'])(
    'returns null for %p',
    (schramm) => {
      expect(parseSchrammLogogram(schramm)).toBeNull()
    },
  )
})

test('isLogogramCrossReference', () => {
  expect(isLogogramCrossReference(logogram('U₂₀ → ŠE', [], 'U₂₀ → ŠE'))).toBe(
    true,
  )
  expect(
    isLogogramCrossReference(logogram('ŠE', ["še'u I"], 'ŠE; *šeʾu*')),
  ).toBe(false)
})

test('groupLogogramsByWord groups by first word in dictionary order', () => {
  const groups = groupLogogramsByWord([
    logogram('ŠE.GA', ['šemû I'], 'ŠE.GA; *šemû* (hören); ME 169'),
    logogram('ŠE', ['magāru I'], 'ŠE; *magāru* (günstig sein); CD 188b'),
    logogram('ŠE', ['šemû I'], 'ŠE; *šemû* (hören); ZL 375'),
    logogram('ŠE', ['šemû I'], 'ŠE; *šemû* (hören); ZL 375'),
    logogram('ŠE.GUR', ['kurru I', "še'u I"], 'ŠE.GUR; *kur₃ šeʾum* (x); ZL'),
    logogram('U₂₀ → ŠE', [], 'U₂₀ → ŠE'),
  ])
  expect(groups.map((group) => group.wordId)).toEqual([
    'kurru I',
    'magāru I',
    'šemû I',
  ])
  expect(groups[0].otherWordIds).toEqual(["še'u I"])
  expect(groups[2].lemma).toEqual('šemû')
  expect(groups[2].spellings.map((spelling) => spelling.logogram)).toEqual([
    'ŠE.GA',
    'ŠE',
  ])
})

test('splitWordId', () => {
  expect(splitWordId('šunû II')).toEqual({ lemma: 'šunû', homonym: 'II' })
  expect(splitWordId('Adaru')).toEqual({ lemma: 'Adaru', homonym: '' })
})

test('isSameAkkadian ignores diacritics, aleph and case', () => {
  expect(isSameAkkadian("še'u", 'šeʾu')).toBe(true)
  expect(isSameAkkadian('Adaru', 'addaru')).toBe(false)
  expect(isSameAkkadian('hīṭu', 'ḫīṭu')).toBe(true)
})
