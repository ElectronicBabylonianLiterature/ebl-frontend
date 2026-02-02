import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AfoRegisterSearchForm from './AfoRegisterSearchForm'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import { MemoryRouter } from 'react-router-dom'
import Bluebird from 'bluebird'
import { AfoRegisterRecordSuggestion } from 'afo-register/domain/Record'

jest.mock('afo-register/application/AfoRegisterService')
jest.mock('fragmentarium/application/FragmentService')
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

async function renderWithRouter(
  children: JSX.Element,
  path?: string,
): Promise<void> {
  render(<MemoryRouter>{children}</MemoryRouter>)
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
      ]),
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
      />,
    )
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Number')).toBeInTheDocument()
    })
  })

  test('handles form submission correctly', async () => {
    mockNavigate.mockClear()

    await renderWithRouter(
      <AfoRegisterSearchForm
        queryProp={mockQueryProp}
        afoRegisterService={afoRegisterServiceMock}
      />,
    )

    const submitButton = screen.getByRole('button', { name: /search/i })

    await userEvent.click(submitButton)

    await waitFor(() => {
      const expectedUrl = '?text=Sample%20Text&textNumber=1'
      expect(mockNavigate).toHaveBeenCalledWith(expectedUrl)
    })
  })

  test('updates state on input change', async () => {
    await renderWithRouter(
      <AfoRegisterSearchForm
        queryProp={mockQueryProp}
        afoRegisterService={afoRegisterServiceMock}
      />,
    )
    const textNumberInput = screen.getByPlaceholderText('Number')

    fireEvent.change(textNumberInput, { target: { value: '456' } })

    await waitFor(() => {
      expect(expect(screen.getByDisplayValue('456')).toBeInTheDocument())
    })
  })

  test('fetchTextNumberOptions updates options correctly', async () => {
    afoRegisterServiceMock.searchSuggestions.mockReturnValue(
      Bluebird.resolve([
        new AfoRegisterRecordSuggestion({
          text: 'Test',
          textNumbers: ['111', '222'],
        }),
      ]),
    )
    await renderWithRouter(
      <AfoRegisterSearchForm
        queryProp={{ text: 'Test', textNumber: '' }}
        afoRegisterService={afoRegisterServiceMock}
      />,
    )
    const exactSwitch = screen.getByLabelText('Exact number')
    await userEvent.click(exactSwitch)
    const numberInput = screen.getByLabelText('select-text-number')
    await userEvent.click(numberInput)
    await waitFor(() => {
      expect(screen.getByText('—')).toBeInTheDocument()
    })
    expect(screen.getByText('111')).toBeInTheDocument()
    expect(screen.getByText('222')).toBeInTheDocument()
  })

  test('handles condition when textNumber is not set', async () => {
    const queryProp = { text: 'Some text', textNumber: '' }

    await renderWithRouter(
      <AfoRegisterSearchForm
        queryProp={queryProp}
        afoRegisterService={afoRegisterServiceMock}
      />,
    )
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Number')).toHaveValue('')
    })
  })
})
