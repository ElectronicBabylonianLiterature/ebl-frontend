import { render, screen, waitFor } from '@testing-library/react'
import { folios } from 'about/ui/folios'
import MarkupService from 'markup/application/MarkupService'
import { markupDtoSerialized } from 'test-support/markup-fixtures'

jest.mock('markup/application/MarkupService')

const markupServiceMock = new (MarkupService as jest.Mock<
  jest.Mocked<MarkupService>
>)()

beforeEach(() => {
  markupServiceMock.fromString.mockReturnValue(
    Promise.resolve(markupDtoSerialized),
  )
})

test('lists the folio owners in chronological order', () => {
  expect(folios.map(({ initials }) => initials)).toEqual([
    'GS',
    'JS',
    'CB',
    'FWG',
    'HHF',
    'AHA',
    'ER',
    'WGL',
    'JA',
    'RB',
    'AS',
    'EL',
    'WRM',
    'JPB',
    'SJL',
    'AKG',
    'MJG',
    'SP',
    'ILF',
    'WS',
    'ARG',
    'USK',
    'JLP',
    'UG',
    'VAM',
  ])
})

test.each(folios.map((folio) => [folio.initials, folio] as const))(
  'renders the description of folio %s',
  async (_initials, folio) => {
    const { container } = render(folio.content(markupServiceMock))
    await waitFor(() => {
      expect(screen.queryAllByLabelText('Spinner')).toHaveLength(0)
    })

    expect(container).not.toBeEmptyDOMElement()
  },
)
