import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AfoRegisterSearchForm from './AfoRegisterSearchForm'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import Bluebird from 'bluebird'
import { AfoRegisterRecordSuggestion } from 'afo-register/domain/Record'

jest.mock('afo-register/application/AfoRegisterService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
  }),
}))

async function renderWithRouter(
  children: JSX.Element,
  path?: string
): Promise<void> {
  const history = createMemoryHistory()
  path && history.push(path)
  await act(async () => {
    render(<Router history={history}>{children}</Router>)
  })
}

describe('AfoRegisterSearch Component Tests', () => {
  let afoRegisterServiceMock

  beforeEach(() => {
    afoRegisterServiceMock = new (AfoRegisterService as jest.Mock<
      jest.Mocked<AfoRegisterService>
    >)()
    afoRegisterServiceMock.searchSuggestions.mockReturnValue(
      Bluebird.resolve([
        new AfoRegisterRecordSuggestion({
          text: 'Sample text',
          textNumbers: ['1', '2', '3', '4'],
        }),
      ])
    )
  })

  const mockQueryProp = {
    text: 'Sample Text',
    textNumber: '1',
  }

  test('renders without crashing', async () => {
    await renderWithRouter(
      <AfoRegisterSearchForm
        queryProp={mockQueryProp}
        afoRegisterService={afoRegisterServiceMock}
      />
    )
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Number')).toBeInTheDocument()
    })
  })

  test('handles form submission correctly', async () => {
    const historyMock = { push: jest.fn() }
    jest
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      .spyOn(require('react-router-dom'), 'useHistory')
      .mockReturnValue(historyMock)

    await renderWithRouter(
      <AfoRegisterSearchForm
        queryProp={mockQueryProp}
        afoRegisterService={afoRegisterServiceMock}
      />
    )

    const submitButton = screen.getByRole('button', { name: /search/i })

    userEvent.click(submitButton)

    await waitFor(() => {
      const expectedUrl = '?text=Sample%20Text&textNumber=1'
      expect(historyMock.push).toHaveBeenCalledWith(expectedUrl)
    })
  })

  test('updates state on input change', async () => {
    await renderWithRouter(
      <AfoRegisterSearchForm
        queryProp={mockQueryProp}
        afoRegisterService={afoRegisterServiceMock}
      />
    )
    const textNumberInput = screen.getByPlaceholderText('Number')

    fireEvent.change(textNumberInput, { target: { value: '456' } })

    await waitFor(() => {
      expect(expect(screen.getByDisplayValue('456')).toBeInTheDocument())
    })
  })
})
