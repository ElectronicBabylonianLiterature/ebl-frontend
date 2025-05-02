import { lineNumberFactory } from 'test-support/linenumber-factory'
import TranslationLine from 'transliteration/domain/translation-line'

export const englishTranslationLine = new TranslationLine({
  language: 'en',
  extent: null,
  parts: [
    {
      text: 'English translation',
      type: 'StringPart',
    },
  ],
  content: [],
})

export const englishTranslationLineWithExtent = new TranslationLine({
  language: 'en',
  extent: { number: lineNumberFactory.build({ number: 3 }), labels: [] },
  parts: [
    {
      text: 'English translation over two lines',
      type: 'StringPart',
    },
  ],
  content: [],
})

export const arabicTranslationLine = new TranslationLine({
  language: 'ar',
  extent: null,
  parts: [
    {
      text: 'Arabic translation',
      type: 'StringPart',
    },
  ],
  content: [],
})
