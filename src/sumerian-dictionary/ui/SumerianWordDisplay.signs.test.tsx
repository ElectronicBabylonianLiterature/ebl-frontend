import { screen, within } from '@testing-library/react'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import {
  region,
  renderWordAndWait,
} from 'sumerian-dictionary/ui/SumerianWordDisplay.testSupport'
import {
  signEntryFactory,
  sumerianWordFactory,
} from 'test-support/sumerian-dictionary-fixtures'
import { SignEntry } from 'sumerian-dictionary/domain/SumerianWordParts'

jest.mock('sumerian-dictionary/application/SumerianDictionaryService')
jest.mock('markup/application/MarkupService')

beforeEach(() => {
  jest.clearAllMocks()
  installMockIntersectionObserver()
})

async function signsSectionOf(
  signs: readonly SignEntry[],
): Promise<HTMLElement> {
  await renderWordAndWait(sumerianWordFactory.build({ signs }))
  return region(/Signs$/)
}

it('links a sign eBL identifies to its sign page', async () => {
  const section = await signsSectionOf([
    signEntryFactory.build({
      reading: 'lugal',
      name: 'LUGAL',
      utf8: '𒈗',
      sources: [
        { source: 'attinger', spelling: 'lugal' },
        { source: 'epsd2', spelling: 'lugal' },
      ],
    }),
  ])
  const card = within(section).getByRole('link', {
    name: /LUGAL/,
  })
  expect(card).toHaveAttribute('href', '/tools/signs/LUGAL')
  expect(card).toHaveAttribute('title', 'LUGAL in the eBL sign list')
  expect(card).toHaveTextContent('𒈗lugalLUGALeBLAttinger lugalePSD2 lugal')
  expect(
    within(section).getByText(/Each sign as eBL's sign list identifies/),
  ).toBeInTheDocument()
})

it('does not link an OGSL fallback sign and says why', async () => {
  const section = await signsSectionOf([
    signEntryFactory.build({
      reading: 'ŋa₂',
      name: 'GA₂',
      signList: 'ogsl',
      characterList: 'ogsl',
      formOf: ['GA₂', 'MA'],
      determinative: true,
    }),
  ])
  expect(within(section).queryByRole('link')).not.toBeInTheDocument()
  expect(within(section).getByText('OGSL')).toHaveAttribute(
    'title',
    'eBL does not carry this reading',
  )
  expect(within(section).getByText('{ŋa₂}')).toBeInTheDocument()
  expect(within(section).getByText('form of GA₂, MA')).toBeInTheDocument()
  expect(within(section).getByText('character from OGSL')).toBeInTheDocument()
})

it('marks an unresolved reading and an eBL character known to be wrong', async () => {
  const section = await signsSectionOf([
    signEntryFactory.build({
      reading: 'x',
      name: '',
      utf8: '',
      signList: '',
      unresolved: true,
    }),
    signEntryFactory.build({ name: 'KA', knownWrongCharacter: true }),
  ])
  expect(within(section).getByText('not in OGSL')).toBeInTheDocument()
  expect(within(section).getByText('?')).toHaveClass(
    'SumerianDictionary__sign-glyph',
  )
  expect(screen.getByText('eBL character known wrong')).toHaveAttribute(
    'title',
    'eBL stores this character; it is known to be wrong',
  )
  expect(within(section).getAllByRole('link')).toHaveLength(1)
})
