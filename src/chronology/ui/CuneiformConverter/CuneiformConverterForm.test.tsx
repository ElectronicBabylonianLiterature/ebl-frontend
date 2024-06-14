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
    expect(
      screen.getByLabelText(
        'This tool allows to convert transliterations to Unicode cuneiform (ranges U+12000-U+123FF, U+12400-U+1247F, and U+12480-U+1254F), using the mapping from the eBL sign list. Different fonts, developed by S. Vanseveren, can be used to display the cuneiform text.'
      )
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Select Font')).toBeInTheDocument()
    expect(screen.getByLabelText('Converted Text')).toBeInTheDocument()
  })
  it('handles input change', () => {
    render(<CuneiformConverterForm signService={signServiceMock} />)
    const inputTextArea = screen.getByLabelText(
      'This tool allows to convert transliterations to Unicode cuneiform (ranges U+12000-U+123FF, U+12400-U+1247F, and U+12480-U+1254F), using the mapping from the eBL sign list. Different fonts, developed by S. Vanseveren, can be used to display the cuneiform text.'
    )
    fireEvent.change(inputTextArea, { target: { value: 'test text' } })
    expect(inputTextArea).toHaveValue('test text')
  })
  it('handles font change', () => {
    render(<CuneiformConverterForm signService={signServiceMock} />)
    const fontSelector = screen.getByLabelText('Select Font')
    fireEvent.change(fontSelector, { target: { value: 'Esagil' } })
    expect(fontSelector).toHaveValue('Esagil')
  })
  it('converts text correctly', async () => {
    signServiceMock.getUnicodeFromAtf.mockResolvedValueOnce([
      { unicode: [73979] },
    ])
    render(<CuneiformConverterForm signService={signServiceMock} />)

    const inputTextArea = screen.getByLabelText(
      'This tool allows to convert transliterations to Unicode cuneiform (ranges U+12000-U+123FF, U+12400-U+1247F, and U+12480-U+1254F), using the mapping from the eBL sign list. Different fonts, developed by S. Vanseveren, can be used to display the cuneiform text.'
    )
    fireEvent.change(inputTextArea, { target: { value: 'test text' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    await waitFor(() => {
      expect(screen.getByLabelText('Converted Text')).toHaveValue('𒃻')
    })
  })
})
