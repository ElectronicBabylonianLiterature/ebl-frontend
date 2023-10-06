import React from 'react'
import About from 'about/ui/about'
import Bluebird from 'bluebird'
import '@testing-library/jest-dom/extend-expect'
import MarkupService from 'markup/application/MarkupService'
import { markupDtoSerialized } from 'test-support/markup-fixtures'
import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

jest.mock('markup/application/MarkupService')

let mockDate: jest.SpyInstance<string, any>

beforeAll(() => {
  mockDate = jest.spyOn(Date.prototype, 'toLocaleDateString')
})

afterAll(() => {
  mockDate.mockRestore()
})

const markupServiceMock = new (MarkupService as jest.Mock<
  jest.Mocked<MarkupService>
>)()

test('Snapshot', async () => {
  mockDate.mockReturnValue('1/1/2023')
  markupServiceMock.fromString.mockReturnValue(
    Bluebird.resolve(markupDtoSerialized)
  )

  await act(async () => {
    const { container } = await render(
      <MemoryRouter>
        <About markupService={markupServiceMock} activeTab="corpus" />
      </MemoryRouter>
    )
    await waitForSpinnerToBeRemoved(screen)
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
    expect(container).toMatchSnapshot()
  })
})
