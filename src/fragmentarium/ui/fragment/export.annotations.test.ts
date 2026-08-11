import fs from 'fs'
import path from 'path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import Bluebird from 'bluebird'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import TransliterationLines from 'transliteration/ui/TransliterationLines'
import { createDictionaryWord } from 'test-support/glossary'
import { annotatedFragment } from 'test-support/named-entity-fixtures'

jest.mock('dictionary/application/WordService')

const annotationMarkup: [string, string][] = [
  ['a span indicator', 'span-indicator'],
  ['a span id', 'data-span-id'],
  ['a link role', 'role="link"'],
  ['a focusable element', 'tabindex'],
  ['an entity indicator class', 'named-entity__'],
  ['the annotation wrapper', 'named-entity-preview'],
]

const exportModules = [
  'src/fragmentarium/ui/fragment/WordExport.tsx',
  'src/fragmentarium/ui/fragment/PdfExport.tsx',
  'src/corpus/ui/WordExport.tsx',
]

let wordService: jest.Mocked<WordService>

beforeEach(() => {
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  jest
    .spyOn(wordService, 'findAll')
    .mockImplementation((ids) =>
      Bluebird.resolve([...new Set(ids)].map((id) => createDictionaryWord(id))),
    )
})

function renderAsExported(): string {
  return renderToString(
    React.createElement(
      RouterLinkModeContext.Provider,
      { value: false },
      React.createElement(
        DictionaryContext.Provider,
        { value: wordService },
        React.createElement(TransliterationLines, {
          text: annotatedFragment.text,
        }),
      ),
    ),
  )
}

describe('the transliteration as the exporters render it', () => {
  it('renders the annotated words themselves', () => {
    expect(renderAsExported()).toContain('Transliteration__Word')
  })

  it.each(annotationMarkup)('renders no %s', (_label, markup) => {
    expect(renderAsExported()).not.toContain(markup)
  })
})

describe('the export modules', () => {
  it.each(exportModules)(
    '%s does not wire the annotation provider into its output',
    (module) => {
      const source = fs.readFileSync(path.join(process.cwd(), module), 'utf8')

      expect(source).not.toContain('NamedEntityPreview')
    },
  )
})
