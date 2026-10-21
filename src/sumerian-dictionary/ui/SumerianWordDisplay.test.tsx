import { screen, waitFor, within } from '@testing-library/react'
import MemorySession from 'auth/Session'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import {
  markupService,
  renderWord,
  renderWordAndWait,
  sectionHeadings,
  sumerianDictionaryService,
} from 'sumerian-dictionary/ui/SumerianWordDisplay.testSupport'
import {
  renderingFactory,
  sumerianWordFactory,
  wordLinkFactory,
} from 'test-support/sumerian-dictionary-fixtures'

jest.mock('sumerian-dictionary/application/SumerianDictionaryService')
jest.mock('markup/application/MarkupService')

beforeEach(() => {
  jest.clearAllMocks()
  installMockIntersectionObserver()
})

it('refuses the page without the read:sumerian-words scope and fetches nothing', () => {
  renderWord(sumerianWordFactory.build(), { session: new MemorySession([]) })
  expect(
    screen.getByText(/available to authorised users only/),
  ).toBeInTheDocument()
  expect(sumerianDictionaryService.find).not.toHaveBeenCalled()
})

it('fetches the word with a signal', async () => {
  const word = sumerianWordFactory.build({ id: 'o0033341' })
  await renderWordAndWait(word)
  expect(sumerianDictionaryService.find).toHaveBeenCalledWith(
    'o0033341',
    expect.any(AbortSignal),
  )
})

it('shows the title block with the head cuneiform and guide word', async () => {
  const word = sumerianWordFactory.build({
    citationForm: '{ĝeš}sar',
    homonym: 'II',
    guideWord: 'garden',
    renderings: [renderingFactory.build({ kind: 'key', cuneiform: ['𒄑𒊬'] })],
  })
  await renderWordAndWait(word)
  const heading = screen.getByRole('heading', { level: 1 })
  expect(heading).toHaveTextContent('ĝešsar II𒄑𒊬“garden”')
  expect(within(heading).getByText('ĝeš').tagName).toEqual('SUP')
  expect(screen.getByText('development', { exact: false })).toHaveClass(
    'sumerian-dictionary-development-notice',
  )
})

it('renders the citation form from eBL-ATF where present', async () => {
  markupService.fromString.mockResolvedValue([
    { type: 'EmphasisPart', text: 'marked-up' },
  ])
  const word = sumerianWordFactory.build({ atf: '{ŋeš}sar' })
  await renderWordAndWait(word)
  await screen.findByText('marked-up')
  expect(markupService.fromString).toHaveBeenCalledWith(
    '@sux{{ŋeš}sar}',
    expect.any(AbortSignal),
  )
})

it('shows every metadata item that has a value', async () => {
  const word = sumerianWordFactory.build({
    guideWord: 'king',
    pos: 'N',
    atf: 'lugal',
    emesal: [{ form: 'u₃-mu-un', source: 'attinger' }],
    stems: ['lugal'],
    determinatives: ['lu₂'],
    caseFrame: ['-e'],
    head: wordLinkFactory.build({ citationForm: 'gal', guideWord: 'big' }),
    attestation: { count: 12345, periods: [] },
    uncertain: true,
  })
  markupService.fromString.mockResolvedValue([])
  await renderWordAndWait(word)
  const metadata = screen.getByRole('group', { name: 'Entry details' })
  expect(metadata).toHaveTextContent(
    'Guide word: king Part of speech: Noun (N) eBL-ATF: lugal Emesal: u₃-mu-un Stems: lugal Determinatives: lu₂ Case frame: -e Compound of: gal big ePSD2 instances: 12,345 Status: uncertain',
  )
  expect(
    within(metadata).getByRole('link', { name: 'gal big' }),
  ).toHaveAttribute('href', `/tools/sumerian-dictionary/${word.head?.id}`)
})

it('leaves out metadata without a value', async () => {
  await renderWordAndWait(sumerianWordFactory.build())
  expect(
    screen.getByRole('group', { name: 'Entry details' }),
  ).toBeEmptyDOMElement()
})

it('sets the page title once the word has loaded', async () => {
  await renderWordAndWait(
    sumerianWordFactory.build({ citationForm: 'lugal', homonym: 'I' }),
  )
  await waitFor(() =>
    expect(document.title).toEqual('lugal I · Sumerian Dictionary - eBL'),
  )
})

it('lists only the sections with content, numbered in order', async () => {
  const word = sumerianWordFactory.build({
    epsd2Senses: [{ num: '1.', meaning: 'king', lang: 'en' }],
    citations: [{ work: 'ELA', passage: '', etcsl: '', compositionId: '' }],
  })
  await renderWordAndWait(word)
  expect(sectionHeadings()).toEqual([
    'I. Meanings',
    'II. Citations',
    'III. Sources',
  ])
})
