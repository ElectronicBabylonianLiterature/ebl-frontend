import { ChapterEditTextService } from 'corpus/application/edit-lite/createChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { ChapterId } from 'transliteration/domain/chapter-id'

export const editChapterId: ChapterId = {
  textId: { genre: 'L', category: 1, index: 2 },
  stage: 'Standard Babylonian',
  name: 'I',
}

export const apiOutline: ChapterOutline = {
  textId: editChapterId.textId,
  classification: 'Ancient',
  stage: 'Standard Babylonian',
  version: '',
  name: 'I',
  order: 1,
  uncertainFragments: ['K.1'],
  manuscripts: [
    { id: 1, siglum: 'NinNA1a', museumNumber: 'K.5419.C', accession: '' },
    { id: 33, siglum: 'BabaNBSch1', museumNumber: '', accession: 'A.33' },
  ],
  lines: [
    {
      index: 0,
      number: '1',
      isSecondLineOfParallelism: false,
      isBeginningOfSection: false,
      translation: '#tr.en: When on high',
      variants: [{ reconstruction: '%n enūma | eliš', manuscriptIds: [1, 33] }],
    },
    {
      index: 1,
      number: '2',
      isSecondLineOfParallelism: false,
      isBeginningOfSection: false,
      translation: '#tr.en: Nor below\n#tr.ar: translation of the variant',
      variants: [
        {
          reconstruction:
            '%n šapliš\n#note: a variant note\n// cf. L I.9 SB "II" 35-36\n// (LB 3272 Vs. 7)',
          manuscriptIds: [1, 33],
        },
        { reconstruction: '%n šapliš | ammatu', manuscriptIds: [] },
      ],
    },
  ],
  revision: 'revision-1',
}

export function createTextServiceMock(): jest.Mocked<ChapterEditTextService> {
  return {
    findChapterOutline: jest.fn(),
    findChapterLines: jest.fn(),
    findLineSuggestions: jest.fn(),
    searchDictionaryLemma: jest.fn(),
    createDictionaryProperNoun: jest.fn(),
    countWordInstances: jest.fn(),
    updateEditedLines: jest.fn(),
    updateChapterOutline: jest.fn(),
  }
}
