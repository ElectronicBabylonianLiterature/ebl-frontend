import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SumerianDictionaryResultsList, {
  getSourceBadges,
} from 'sumerian-dictionary/ui/SumerianDictionaryResultsList'
import { sumerianWordSummaryFactory } from 'test-support/sumerian-dictionary-fixtures'
import { SumerianWordSummary } from 'sumerian-dictionary/domain/SumerianWordSummary'

function rowFor(summary: SumerianWordSummary): HTMLElement {
  render(
    <MemoryRouter>
      <SumerianDictionaryResultsList summaries={[summary]} />
    </MemoryRouter>,
  )
  return screen.getByRole('listitem')
}

it('shows a full row', () => {
  const row = rowFor(
    sumerianWordSummaryFactory.build({
      id: 'o0033341',
      citationForm: '{ĝeš}lugal',
      homonym: 'II',
      guideWord: 'king',
      pos: 'N',
      cuneiform: '𒈗',
      frenchSenses: ['roi', 'maître'],
      englishSenses: ['king', 'lord', 'owner', 'master', 'ruler'],
      hasAttinger: true,
      hasEpsd2: true,
      epsd2FormCount: 1200,
      akkadianCount: 2,
      citationCount: 3,
      compoundCount: 4,
      crossReferenceCount: 5,
      hasEmesal: true,
      matchedAlias: 'lu-gal',
    }),
  )
  expect(within(row).getByRole('link')).toHaveAttribute(
    'href',
    '/tools/sumerian-dictionary/o0033341',
  )
  expect(within(row).getByText('ĝeš').tagName).toEqual('SUP')
  expect(row).toHaveTextContent(
    'ĝešlugal II𒈗NounEmesal' +
      'Attinger sends lu-gal here' +
      'roi; maître · “king” · king; lord; owner; master' +
      'AttingerePSD2(1,200 forms)Borger(2)Citations(3)Compounds(4)See also(5)',
  )
  expect(within(row).getByText('roi; maître').tagName).toEqual('I')
})

it('shows a bare row with the Attinger part of speech', () => {
  const row = rowFor(
    sumerianWordSummaryFactory.build({
      citationForm: 'a',
      attingerPos: 'ADV',
      hasEpsd2: true,
    }),
  )
  expect(row).toHaveTextContent(/^aADVePSD2$/)
})

it('omits empty badges', () => {
  expect(getSourceBadges(sumerianWordSummaryFactory.build())).toEqual([])
})
