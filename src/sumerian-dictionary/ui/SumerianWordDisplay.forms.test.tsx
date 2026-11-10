import { fireEvent, screen, within } from '@testing-library/react'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import {
  region,
  renderWordAndWait,
} from 'sumerian-dictionary/ui/SumerianWordDisplay.testSupport'
import {
  renderingFactory,
  sumerianWordFactory,
} from 'test-support/sumerian-dictionary-fixtures'
import { Alias } from 'sumerian-dictionary/domain/SumerianWordParts'

jest.mock('sumerian-dictionary/application/SumerianDictionaryService')
jest.mock('markup/application/MarkupService')

beforeEach(() => {
  jest.clearAllMocks()
  installMockIntersectionObserver()
})

function alias(index: number, overrides: Partial<Alias> = {}): Alias {
  return {
    form: `form-${index}`,
    relation: 'see',
    entryId: `att-${index}`,
    method: 'exact',
    source: 'attinger',
    meanings: [],
    uncertain: false,
    ...overrides,
  }
}

it('shows the citation forms with their cuneiform and a known-wrong warning', async () => {
  const word = sumerianWordFactory.build({
    renderings: [
      renderingFactory.build({
        spelling: 'lugal',
        kind: 'key',
        cuneiform: ['𒈗'],
        knownWrongCharacters: ['𒈗'],
      }),
    ],
  })
  await renderWordAndWait(word)
  const forms = region(/^Citation forms/)
  expect(within(forms).getByRole('heading')).toHaveTextContent(
    'Citation formsAttinger',
  )
  expect(within(forms).getByRole('listitem')).toHaveTextContent('lugal𒈗')
  expect(
    within(forms).getByRole('img', {
      name: 'eBL stores this character; it is known to be wrong',
    }),
  ).toHaveAttribute(
    'title',
    'eBL stores this character; it is known to be wrong: 𒈗',
  )
})

it('shows a partial rendering with the unrendered token in Latin', async () => {
  const word = sumerianWordFactory.build({
    attingerForms: [
      { spelling: 'ab-si-n', nonStandard: true, attestations: 'Gilg. 12' },
    ],
    renderings: [
      renderingFactory.build({
        spelling: 'ab-si-n',
        kind: 'variant',
        complete: false,
        cuneiform: ['𒀊𒋛?'],
        unrendered: [{ token: 'N', reason: 'noCharacter' }],
      }),
    ],
  })
  await renderWordAndWait(word)
  const variants = region(/^Variant spellings/)
  expect(within(variants).getByText('n')).toHaveClass(
    'SumerianDictionary__cuneiform-missing',
  )
  expect(within(variants).getByText('Gilg. 12')).toBeInTheDocument()
})

it('leaves the cuneiform out when nothing renders a variant', async () => {
  const word = sumerianWordFactory.build({
    attingerForms: [{ spelling: 'x-x', nonStandard: true, attestations: '' }],
  })
  await renderWordAndWait(word)
  expect(
    within(region(/^Variant spellings/)).getByRole('listitem'),
  ).toHaveTextContent(/^x-x$/)
})

it('shows redirected forms with relation, glosses and a show-all toggle', async () => {
  const word = sumerianWordFactory.build({
    citationForm: 'du₁₁-g',
    aliases: [
      alias(0, {
        relation: 'equals',
        meanings: ['say', 'speak'],
        uncertain: true,
      }),
      ...Array.from({ length: 25 }, (_, index) => alias(index + 1)),
    ],
  })
  await renderWordAndWait(word)
  const aliases = region(/^Redirected forms/)
  const items = within(aliases).getAllByRole('listitem')
  expect(items).toHaveLength(24)
  expect(items[0]).toHaveTextContent('form-0(?)= du₁₁-g«say», «speak»')
  expect(items[1]).toHaveTextContent('form-1→ du₁₁-g')
  expect(within(aliases).getByText(/Lines Attinger prints/)).toBeInTheDocument()

  const toggle = within(aliases).getByRole('button', {
    name: 'Show all 26 forms',
  })
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  fireEvent.click(toggle)
  expect(within(aliases).getAllByRole('listitem')).toHaveLength(26)
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  expect(toggle).toHaveTextContent('Show the first 24 only')
})

it('shows Emesal forms', async () => {
  const word = sumerianWordFactory.build({
    emesal: [{ form: 'u₃-mu-un', source: 'attinger' }],
  })
  await renderWordAndWait(word)
  expect(region(/^Emesal/)).toHaveTextContent('EmesalAttingeru₃-mu-un')
})

it('shows ePSD2 spellings most frequent first, ten at a time', async () => {
  const forms = Array.from({ length: 11 }, (_, index) => ({
    spelling: `s${index}`,
    count: index * 1000,
    percent: index,
  }))
  const word = sumerianWordFactory.build({
    epsd2Forms: forms,
    renderings: [
      renderingFactory.build({
        spelling: 's10',
        source: 'epsd2',
        kind: 'form',
        cuneiform: ['𒈗'],
      }),
    ],
  })
  await renderWordAndWait(word)
  const table = within(region(/^Attested spellings/)).getByRole('table')
  const rows = within(table).getAllByRole('row')
  expect(rows).toHaveLength(11)
  expect(rows[1]).toHaveTextContent('𒈗s1010,000')
  const largest = within(rows[1]).getByRole('meter', { name: 'Share' })
  expect(largest).toHaveAttribute('aria-valuenow', '10')
  expect(largest).toContainHTML('<span style="width: 100%;"></span>')
  const next = within(rows[2]).getByRole('meter', { name: 'Share' })
  expect(next).toHaveAttribute('title', '9 %')
  expect(next).toContainHTML('<span style="width: 90%;"></span>')

  fireEvent.click(screen.getByRole('button', { name: 'Show all 11 spellings' }))
  expect(within(table).getAllByRole('row')).toHaveLength(12)
  expect(
    screen.getByRole('button', { name: 'Show the 10 most frequent only' }),
  ).toBeInTheDocument()
})

it('lists the forms sub-parts in the navigation when there are several', async () => {
  const word = sumerianWordFactory.build({
    emesal: [{ form: 'u₃-mu-un', source: 'attinger' }],
    epsd2Forms: [{ spelling: 'lugal', count: 1, percent: 0 }],
  })
  await renderWordAndWait(word)
  const navigation = screen.getByRole('navigation', { name: 'On this page' })
  expect(
    within(navigation)
      .getAllByRole('link')
      .map((link) => link.textContent),
  ).toEqual([
    expect.any(String),
    'Forms',
    'Emesal',
    'Attested spellings',
    'Sources',
  ])
})
