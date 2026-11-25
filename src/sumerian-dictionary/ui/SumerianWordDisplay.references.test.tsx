import { fireEvent, screen, within } from '@testing-library/react'
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
  const attinger = region(/^Attinger’s Glossaire/)
  const epsd2 = region(/^ePSD2/)
  expect(
    within(attinger).getByRole('region', { name: /^Meanings/ }),
  ).toHaveTextContent('MeaningsFrenchroi')
  expect(
    within(epsd2).getByRole('region', { name: /^Meanings/ }),
  ).toHaveTextContent('MeaningsEnglishking')
  expect(attinger.compareDocumentPosition(epsd2)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  )
})

it('names Attinger’s edition and entry at the head of his section', async () => {
  const word = sumerianWordFactory.build({
    attingerSenses: [{ meaning: 'roi', lang: 'fr', entryId: 'att-1' }],
  })
  await renderWordAndWait(word)
  expect(region(/^Attinger’s Glossaire/)).toHaveTextContent(
    'P. Attinger, Glossaire sumérien–français, 3rd edition (manuscript). ' +
      'Everything in this section is Attinger’s.',
  )
})

it('adds the Attinger entry to the edition line when the word has one', async () => {
  const word = sumerianWordFactory.build({
    sources: {
      attinger: {
        entryId: 'att-02133',
        node: 'n',
        letter: 'D',
        depth: 0,
        partOfSpeech: 'V',
        headword: { text: 'diri-g', display: 'diri-g', marks: [] },
      },
      epsd2: null,
    },
  })
  await renderWordAndWait(word)
  expect(region(/^Attinger’s Glossaire/)).toHaveTextContent(
    '3rd edition (manuscript) · entry att-02133. Everything',
  )
})

it('leaves out the Akkadian equivalents from Borger', async () => {
  const word = sumerianWordFactory.build({
    akkadianEquivalents: [
      { wordId: 'šarru I', source: 'borger', indexNumbers: 'L118' },
    ],
  })
  await renderWordAndWait(word)
  expect(
    screen.queryByRole('region', { name: /Akkadian Equivalents$/ }),
  ).not.toBeInTheDocument()
  expect(screen.queryByText(/Borger/)).not.toBeInTheDocument()
  expect(
    screen.queryByRole('link', { name: /šarru I/ }),
  ).not.toBeInTheDocument()
})

it('keeps lexical and proper-noun compounds apart', async () => {
  const word = sumerianWordFactory.build({
    compounds: [gub],
    nameCompounds: [enlil],
  })
  await renderWordAndWait(word)
  const compounds = region(/^Compounds/)
  expect(
    within(compounds)
      .getAllByRole('columnheader')
      .map((header) => header.textContent),
  ).toEqual(['Form', 'Meaning'])
  const [, row] = within(compounds).getAllByRole('row')
  expect(within(row).getByRole('link', { name: 'gub I' })).toHaveAttribute(
    'href',
    '/tools/sumerian-dictionary/o0029228',
  )
  expect(row).toHaveTextContent('gub Istand')
  expect(compounds).toHaveTextContent('Compounds1')
  expect(
    within(region(/^In proper nouns/)).getByRole('link', { name: /en-lil₂/ }),
  ).toBeInTheDocument()
  expect(region(/^In proper nouns/)).toHaveTextContent('In proper nouns1')
})

it('opens each cited work for its ETCSL edition, or says there is none', async () => {
  const word = sumerianWordFactory.build({
    citations: [
      { work: 'ELA', passage: '12', etcsl: '1.8.2.3', compositionId: 'c-1' },
      { work: 'InBil.', passage: '', etcsl: '', compositionId: '' },
    ],
  })
  await renderWordAndWait(word)
  const items = within(region(/^Citations/)).getAllByRole('listitem')
  expect(items.map((item) => item.textContent)).toEqual(['ELA 12', 'InBil.'])
  fireEvent.click(within(items[0]).getByRole('button', { name: 'ELA' }))
  expect(
    await screen.findByRole('link', { name: 'ETCSL 1.8.2.3' }),
  ).toHaveAttribute(
    'href',
    'https://etcsl.orinst.ox.ac.uk/cgi-bin/etcsl.cgi?text=c.1.8.2.3',
  )
  fireEvent.click(within(items[1]).getByRole('button', { name: 'InBil.' }))
  expect(await screen.findByText('No ETCSL edition')).toBeInTheDocument()
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
  const items = within(region(/^See also/)).getAllByRole('listitem')
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
