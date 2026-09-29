import { render, screen, waitFor } from '@testing-library/react'
import AboutBibliography from 'about/ui/bibliography'
import { indexedPublications } from 'about/ui/indexedPublications'
import MarkupService from 'markup/application/MarkupService'
import { markupDtoSerialized } from 'test-support/markup-fixtures'

jest.mock('markup/application/MarkupService')

const markupServiceMock = new (MarkupService as jest.Mock<
  jest.Mocked<MarkupService>
>)()

test('renders a heading and references for every indexed letter', async () => {
  markupServiceMock.fromString.mockReturnValue(
    Promise.resolve(markupDtoSerialized),
  )

  render(AboutBibliography(markupServiceMock))
  await waitFor(() => {
    expect(screen.queryAllByLabelText('Spinner')).toHaveLength(0)
  })

  expect(
    screen
      .getAllByRole('heading', { level: 4 })
      .map(({ textContent }) => textContent),
  ).toEqual(indexedPublications.map(({ letter }) => letter))
  expect(markupServiceMock.fromString.mock.calls.map(([text]) => text)).toEqual(
    indexedPublications.map(({ references }) => references.join(' ')),
  )
})
