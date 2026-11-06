import { screen, within } from '@testing-library/react'
import { observeConsole } from 'setupTests'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import {
  region,
  renderWordAndWait,
} from 'sumerian-dictionary/ui/SumerianWordDisplay.testSupport'
import {
  sumerianWordFactory,
  wordLinkFactory,
} from 'test-support/sumerian-dictionary-fixtures'
import { CrossReference } from 'sumerian-dictionary/domain/SumerianWordParts'

jest.mock('sumerian-dictionary/application/SumerianDictionaryService')
jest.mock('markup/application/MarkupService')

beforeEach(() => {
  jest.clearAllMocks()
  installMockIntersectionObserver()
})

const gub = wordLinkFactory.build({
  id: 'o0029228',
  citationForm: 'gub',
  homonym: 'I',
  guideWord: 'stand',
})
const enlil = wordLinkFactory.build({
  id: 'o0026343',
  citationForm: '{d}en-lil₂',
  guideWord: '',
})

function crossReference(overrides: Partial<CrossReference>): CrossReference {
  return {
    relation: 'see',
    target: 'gub',
    targets: [],
    nameTargets: [],
    method: 'exact',
    ambiguous: false,
    ...overrides,
  }
}

it('shows Attinger meanings before ePSD2 meanings, each labelled', async () => {
  const word = sumerianWordFactory.build({
    attingerSenses: [{ meaning: 'roi', lang: 'fr', entryId: 'att-1' }],
    epsd2Senses: [{ num: '1.', meaning: 'king', lang: 'en' }],
  })
  await renderWordAndWait(word)
  expect(region(/^Attinger, Glossaire/)).toHaveTextContent(
    'Attinger, Glossaire sumérien–françaisFrenchroi',
  )
  expect(region(/^ePSD2/)).toHaveTextContent('ePSD2Englishking')
  expect(
    region(/^Attinger, Glossaire/).compareDocumentPosition(region(/^ePSD2/)),
  ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
})

it('links Akkadian equivalents to the Akkadian dictionary', async () => {
  const word = sumerianWordFactory.build({
    akkadianEquivalents: [
      { wordId: 'šarru I', source: 'borger', indexNumbers: 'L118' },
      { wordId: 'bēlu I', source: 'borger', indexNumbers: '' },
    ],
  })
  await renderWordAndWait(word)
  const section = region(/Akkadian Equivalents$/)
  expect(
    within(section).getByRole('link', { name: 'šarru I L118' }),
  ).toHaveAttribute('href', '/tools/dictionary/%C5%A1arru%20I')
  expect(
    within(section).getByRole('link', { name: 'bēlu I' }),
  ).toBeInTheDocument()
  expect(section).toHaveTextContent("From Borger's Bilinguen-Glossar.")
})

it('lists one Akkadian word from several index numbers', async () => {
  const consoleError = observeConsole('error')
  const word = sumerianWordFactory.build({
    akkadianEquivalents: [
      { wordId: 'šarru I', source: 'borger', indexNumbers: 'L118' },
      { wordId: 'šarru I', source: 'borger', indexNumbers: 'L119' },
    ],
  })
  await renderWordAndWait(word)
  const section = region(/Akkadian Equivalents$/)
  expect(
    within(section)
      .getAllByRole('link')
      .map((link) => link.textContent),
  ).toEqual(['šarru IL118', 'šarru IL119'])
  expect(consoleError).not.toHaveBeenCalled()
})

it('keeps lexical and proper-noun compounds apart', async () => {
  const word = sumerianWordFactory.build({
    compounds: [gub],
    nameCompounds: [enlil],
  })
  await renderWordAndWait(word)
  expect(
    within(region(/^Compounds/)).getByRole('link', {
      name: 'gub I stand',
    }),
  ).toHaveAttribute('href', '/tools/sumerian-dictionary/o0029228')
  expect(region(/^Compounds/)).toHaveTextContent('Compounds1')
  expect(
    within(region(/^In proper nouns/)).getByRole('link', { name: /en-lil₂/ }),
  ).toBeInTheDocument()
  expect(region(/^In proper nouns/)).toHaveTextContent('In proper nouns1')
})

it('lists citations with an ETCSL link where there is one', async () => {
  const word = sumerianWordFactory.build({
    citations: [
      { work: 'ELA', passage: '12', etcsl: '1.8.2.3', compositionId: 'c-1' },
      { work: 'InBil.', passage: '', etcsl: '', compositionId: '' },
    ],
  })
  await renderWordAndWait(word)
  const items = within(region(/Citations$/)).getAllByRole('listitem')
  expect(items[0]).toHaveTextContent('ELA 12 · ETCSL 1.8.2.3')
  expect(within(items[0]).getByRole('link')).toHaveAttribute(
    'href',
    'https://etcsl.orinst.ox.ac.uk/cgi-bin/etcsl.cgi?text=c.1.8.2.3',
  )
  expect(items[1]).toHaveTextContent('InBil.')
  expect(within(items[1]).queryByRole('link')).not.toBeInTheDocument()
})

it('groups cross-reference targets, shows ambiguity and unresolved pointers', async () => {
  const word = sumerianWordFactory.build({
    crossReferences: [
      crossReference({
        relation: 'compare',
        target: 'gub',
        targets: [gub],
        nameTargets: [enlil],
        ambiguous: true,
      }),
      crossReference({ target: 'su₈-g' }),
    ],
  })
  await renderWordAndWait(word)
  const items = within(region(/See Also$/)).getAllByRole('listitem')
  expect(within(items[0]).getAllByRole('group')).toHaveLength(2)
  expect(
    within(items[0]).getByRole('group', { name: 'Words' }),
  ).toHaveTextContent('gub I stand')
  expect(
    within(items[0]).getByRole('group', { name: 'Proper nouns' }),
  ).toHaveTextContent('den-lil₂')
  expect(items[0]).toHaveTextContent(/^cf\./)
  expect(items[0]).toHaveTextContent('(gub)')
  expect(items[1]).toHaveTextContent('see su₈-g')
  expect(within(items[1]).queryByRole('link')).not.toBeInTheDocument()
})

it('shows only the sources the word has', async () => {
  await renderWordAndWait(sumerianWordFactory.build({ id: 'sux-003830' }))
  expect(screen.getByRole('definition')).toHaveTextContent('sux-003830')
  expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual([
    'Identifier',
  ])
})
