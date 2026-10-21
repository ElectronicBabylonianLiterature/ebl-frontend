import {
  SumerianWordDto,
  SumerianWordSummaryDto,
} from 'sumerian-dictionary/infrastructure/sumerianWordDto'

const link = { id: 'o0029228', citationForm: 'gub' }

export const minimalWordDto: SumerianWordDto = {
  _id: 'sux-006390',
  citationForm: '{ĝeš}sar',
  lemma: ['{ĝeš}sar'],
  homonym: '',
  guideWord: '',
  pos: '',
  attingerPos: 'N',
  language: 'SUMERIAN',
  uncertain: false,
  stems: [],
  determinatives: ['ĝeš'],
  caseFrame: [],
  emesal: [],
  attingerSenses: [{ meaning: 'jardin', lang: 'fr', entryId: 'att-1' }],
  epsd2Senses: [],
  attingerForms: [
    { spelling: 'sar', nonStandard: true, attestations: 'ELA 12' },
  ],
  epsd2Forms: [],
  signs: [
    {
      reading: 'sar',
      name: 'SAR',
      utf8: '𒊬',
      ambiguous: false,
      sources: [{ source: 'attinger', spelling: 'sar' }],
    },
  ],
  renderings: [
    {
      spelling: 'sar',
      source: 'attinger',
      kind: 'key',
      cuneiform: ['𒊬'],
      complete: true,
    },
  ],
  head: null,
  compounds: [],
  nameCompounds: [],
  crossReferences: [
    {
      relation: 'see',
      target: 'gub',
      method: 'exact',
      targets: [link],
      nameTargets: [],
    },
  ],
  aliases: [
    {
      form: 'ĝešsar',
      relation: 'equals',
      entryId: 'att-2',
      method: 'exact',
      source: 'attinger',
    },
  ],
  akkadianEquivalents: [{ wordId: 'kirû I', source: 'borger' }],
  citations: [{ work: 'ELA' }],
  attestation: {},
  sources: {},
  match: {
    tier: 'attinger-only',
    method: 'none',
    spelling: '',
    candidateCount: 0,
    curated: false,
  },
}

export const fullWordDto: SumerianWordDto = {
  ...minimalWordDto,
  atf: '{ŋeš}sar',
  truncated: true,
  head: { ...link, homonym: 'I', guideWord: 'stand' },
  signs: [
    {
      ...minimalWordDto.signs[0],
      signList: 'ogsl',
      characterList: 'ogsl',
      knownWrongCharacter: true,
      determinative: true,
      unresolved: true,
      formOf: ['NU₁₁'],
    },
  ],
  renderings: [
    {
      ...minimalWordDto.renderings[0],
      unrendered: [{ token: 'n', reason: 'noCharacter' }],
      printed: '˹sar˺',
      signLists: ['ebl'],
      knownWrongCharacters: ['𒊬'],
    },
  ],
  crossReferences: [
    {
      ...minimalWordDto.crossReferences[0],
      targets: [{ ...link, homonym: '', guideWord: 'stand' }],
      ambiguous: true,
    },
  ],
  aliases: [
    { ...minimalWordDto.aliases[0], meanings: ['orchard'], uncertain: true },
  ],
  akkadianEquivalents: [
    { wordId: 'kirû I', source: 'borger', indexNumbers: 'L118' },
  ],
  citations: [
    { work: 'ELA', passage: '12', etcsl: '1.8.2.3', compositionId: 'c-1' },
  ],
  attestation: { count: 12, periods: ['Ur III'] },
  sources: {
    attinger: {
      entryId: 'att-1',
      node: 'n1',
      letter: 'S',
      depth: 0,
      partOfSpeech: 'N',
      headword: {
        text: 'ĝeš-sar',
        display: '{ĝeš}sar',
        marks: [[0, 3, 'sup']],
      },
    },
    epsd2: { oid: 'o1', headword: 'kiri[garden]N', builds: ['package'] },
  },
  match: {
    ...minimalWordDto.match,
    curatedOid: 'o1',
    curatedStatus: 'accepted',
    oidStatus: 'held',
    review: ['homonym'],
  },
}

export const summaryDto: SumerianWordSummaryDto = {
  _id: 'o0033341',
  citationForm: 'lugal',
  homonym: '',
  guideWord: 'king',
  pos: 'N',
  attingerPos: 'N',
  language: 'SUMERIAN',
  cuneiform: '𒈗',
  frenchSenses: ['roi'],
  englishSenses: ['king'],
  hasAttinger: true,
  hasEpsd2: true,
  epsd2FormCount: 12,
  akkadianCount: 1,
  citationCount: 3,
  compoundCount: 4,
  crossReferenceCount: 0,
  hasEmesal: false,
  attestationCount: 900,
}
