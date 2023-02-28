import {
  Syllable,
  getSyllables,
  SyllableStructure,
} from 'akkadian/application/phonetics/syllables'

const testData: [string, Syllable[]][] = [
  [
    'ana',
    [
      {
        transcription: 'a',
        ipa: "a'",
        index: 0,
        isStressed: true,
        isClosed: false,
        structure: SyllableStructure.V,
        vowelLength: 0,
        weight: 0,
      },
      {
        transcription: 'na',
        ipa: 'na',
        index: 1,
        isStressed: false,
        isClosed: false,
        structure: SyllableStructure.CV,
        vowelLength: 0,
        weight: 0,
      },
    ],
  ],
  [
    'iprus',
    [
      {
        transcription: 'ip',
        ipa: "i'p",
        index: 0,
        isStressed: true,
        isClosed: true,
        structure: SyllableStructure.VC,
        vowelLength: 0,
        weight: 1,
      },
      {
        transcription: 'rus',
        ipa: 'rus',
        index: 1,
        isStressed: false,
        isClosed: true,
        structure: SyllableStructure.CVC,
        vowelLength: 0,
        weight: 1,
      },
    ],
  ],
  [
    'iprus',
    [
      {
        transcription: 'ip',
        ipa: "i'p",
        index: 0,
        isStressed: true,
        isClosed: true,
        structure: SyllableStructure.VC,
        vowelLength: 0,
        weight: 1,
      },
      {
        transcription: 'rus',
        ipa: 'rus',
        index: 1,
        isStressed: false,
        isClosed: true,
        structure: SyllableStructure.CVC,
        vowelLength: 0,
        weight: 1,
      },
    ],
  ],
  [
    'iparras',
    [
      {
        transcription: 'i',
        ipa: 'i',
        index: 0,
        isStressed: false,
        isClosed: false,
        structure: SyllableStructure.V,
        vowelLength: 0,
        weight: 0,
      },
      {
        transcription: 'par',
        ipa: "pa'r",
        index: 1,
        isStressed: true,
        isClosed: true,
        structure: SyllableStructure.CVC,
        vowelLength: 0,
        weight: 1,
      },
      {
        transcription: 'ras',
        ipa: 'ras',
        index: 2,
        isStressed: false,
        isClosed: true,
        structure: SyllableStructure.CVC,
        vowelLength: 0,
        weight: 1,
      },
    ],
  ],
  [
    "purrusā'u",
    [
      {
        transcription: 'pur',
        ipa: 'pur',
        index: 0,
        isStressed: false,
        isClosed: true,
        structure: SyllableStructure.CVC,
        vowelLength: 0,
        weight: 1,
      },
      {
        transcription: 'ru',
        ipa: 'ru',
        index: 1,
        isStressed: false,
        isClosed: false,
        structure: SyllableStructure.CV,
        vowelLength: 0,
        weight: 0,
      },
      {
        transcription: 'sā',
        ipa: "sa:'",
        index: 2,
        isStressed: true,
        isClosed: false,
        structure: SyllableStructure.CV,
        vowelLength: 1,
        weight: 1,
      },
      {
        transcription: "'u",
        ipa: 'ʔu',
        index: 3,
        isStressed: false,
        isClosed: false,
        structure: SyllableStructure.CV,
        vowelLength: 0,
        weight: 0,
      },
    ],
  ],
  [
    'purrusāu',
    [
      {
        transcription: 'pur',
        ipa: 'pur',
        index: 0,
        isStressed: false,
        isClosed: true,
        structure: SyllableStructure.CVC,
        vowelLength: 0,
        weight: 1,
      },
      {
        transcription: 'ru',
        ipa: 'ru',
        index: 1,
        isStressed: false,
        isClosed: false,
        structure: SyllableStructure.CV,
        vowelLength: 0,
        weight: 0,
      },
      {
        transcription: 'sā',
        ipa: "sa:'",
        index: 2,
        isStressed: true,
        isClosed: false,
        structure: SyllableStructure.CV,
        vowelLength: 1,
        weight: 1,
      },
      {
        transcription: 'u',
        ipa: 'u',
        index: 3,
        isStressed: false,
        isClosed: false,
        structure: SyllableStructure.V,
        vowelLength: 0,
        weight: 0,
      },
    ],
  ],
]

test.each(testData)(
  'Get syllables: complete data',
  (transcription, expected) => {
    expect(getSyllables(transcription)).toEqual(expected)
  }
)

it('Get syllables: Throw error when invalid transcription', () => {
  function syllabizeInvalidTranscription(): void {
    getSyllables('annna')
  }
  expect(syllabizeInvalidTranscription).toThrowError(
    'Transcription "annna" cannot be syllabized (likely invalid).'
  )
})
