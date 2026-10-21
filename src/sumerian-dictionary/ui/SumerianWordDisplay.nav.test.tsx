import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import {
  region,
  renderWordAndWait,
} from 'sumerian-dictionary/ui/SumerianWordDisplay.testSupport'
import { sumerianWordFactory } from 'test-support/sumerian-dictionary-fixtures'

jest.mock('sumerian-dictionary/application/SumerianDictionaryService')
jest.mock('markup/application/MarkupService')

beforeEach(() => {
  jest.clearAllMocks()
  installMockIntersectionObserver()
})

const word = sumerianWordFactory.build({
  id: 'o0033341',
  citationForm: 'lugal',
  homonym: 'I',
  guideWord: 'king',
  pos: 'N',
  attingerSenses: [{ meaning: 'roi', lang: 'fr', entryId: 'att-1' }],
  epsd2Senses: [{ num: '1.', meaning: 'king', lang: 'en' }],
  attestation: { count: 9, periods: ['Ur III', 'Old Babylonian', 'Ur III'] },
  sources: {
    attinger: {
      entryId: 'att-04420',
      node: 'n',
      letter: 'L',
      depth: 0,
      partOfSpeech: 'N',
      headword: { text: 'lugal', display: 'lugal, ES u₃-mu-un', marks: [] },
    },
    epsd2: { oid: 'o0033341', headword: 'lugal[king]N', builds: [] },
  },
  match: {
    tier: 'exact',
    method: 'm',
    spelling: 'lugal',
    candidateCount: 1,
    curated: true,
    curatedOid: '',
    curatedStatus: '',
    oidStatus: '',
    review: [],
  },
})

function navigation(): HTMLElement {
  return screen.getByRole('navigation', { name: 'On this page' })
}

it('heads the navigation with the title, guide word and part of speech', async () => {
  await renderWordAndWait(word)
  expect(
    within(navigation()).getByText('lugal I', {
      selector: '.EntryPage__nav-top-title',
    }),
  ).toBeInTheDocument()
  expect(
    within(navigation()).getByText('king · Noun', {
      selector: '.EntryPage__nav-top-type',
    }),
  ).toBeInTheDocument()
  expect(
    within(navigation())
      .getAllByRole('link')
      .map((link) => link.getAttribute('href')),
  ).toEqual([
    '#entry-top',
    '#meanings',
    '#meanings-attinger',
    '#meanings-epsd2',
    '#sources',
  ])
})

it('shows the sources with alignment, curation and de-duplicated periods', async () => {
  await renderWordAndWait(word)
  const sources = region(/Sources$/)
  expect(sources).toHaveTextContent(
    'Attingerlugal, ES u₃-mu-un (att-04420)' +
      'ePSD2lugal[king]N (o0033341)' +
      'AlignmentAttinger and ePSD2 agree on the spelling and part of speech — decided by a curating scholar' +
      'PeriodsUr III, Old Babylonian' +
      'Identifiero0033341',
  )
  expect(
    within(sources).getByRole('link', { name: /lugal\[king\]N/ }),
  ).toHaveAttribute('href', 'https://oracc.museum.upenn.edu/epsd2/o0033341')
})

it('writes the section to the URL hash when a menu link is clicked', async () => {
  await renderWordAndWait(word)
  fireEvent.click(within(navigation()).getByRole('link', { name: 'ePSD2' }))
  await waitFor(() =>
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/#meanings-epsd2',
    ),
  )
  expect(
    within(navigation()).getByRole('link', { name: 'ePSD2' }),
  ).toHaveAttribute('aria-current', 'true')
})

it('collapses a section from its heading and keeps the menu in sync', async () => {
  await renderWordAndWait(word, { initialEntry: '/#meanings-epsd2' })
  const toggle = screen.getByRole('button', { name: 'I. Meanings' })
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(
    within(navigation()).getByRole('button', { name: 'Expand Meanings' }),
  ).toHaveAttribute('aria-expanded', 'false')
})
