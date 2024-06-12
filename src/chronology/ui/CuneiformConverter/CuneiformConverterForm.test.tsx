import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import CuneiformConverterForm from 'chronology/ui/CuneiformConverter/CuneiformConverterForm'
import SignService from 'signs/application/SignService'

jest.mock('signs/application/SignService')
const signServiceMock = new (SignService as jest.Mock<
  jest.Mocked<SignService>
>)()

describe('CuneiformConverterForm', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(true),
      },
      writable: true,
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders form, options, and scenario panel correctly', () => {
    render(<CuneiformConverterForm signService={signServiceMock} />)
    expect(screen.getByLabelText('Text to Convert')).toBeInTheDocument()
    expect(screen.getByLabelText('Select Font')).toBeInTheDocument()
    expect(screen.getByLabelText('Text to Convert')).toBeInTheDocument()
  })
  it('handles input change', () => {
    render(<CuneiformConverterForm signService={signServiceMock} />)
    const inputTextArea = screen.getByLabelText('Text to Convert')
    fireEvent.change(inputTextArea, { target: { value: 'test text' } })
    expect(inputTextArea).toHaveValue('test text')
  })
  it('handles font change', () => {
    render(<CuneiformConverterForm signService={signServiceMock} />)
    const fontSelector = screen.getByLabelText('Select Font')
    fireEvent.change(fontSelector, { target: { value: 'Neo-Babylonian' } })
    expect(fontSelector).toHaveValue('Neo-Babylonian')
  })
  it('converts text correctly', async () => {
    signServiceMock.getUnicodeFromAtf.mockResolvedValueOnce([
      { unicode: [73979] },
    ])
    render(<CuneiformConverterForm signService={signServiceMock} />)

    const inputTextArea = screen.getByLabelText('Text to Convert')
    fireEvent.change(inputTextArea, { target: { value: 'test text' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    await waitFor(() => {
      expect(screen.getByLabelText('Converted Text')).toHaveValue('𒃻')
    })
  })
})
