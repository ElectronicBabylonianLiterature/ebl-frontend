import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import CuneiformConverterForm from 'signs/ui/CuneiformConverter/CuneiformConverterForm'
import SignService from 'signs/application/SignService'

jest.mock('signs/application/SignService')
const signServiceMock = new (SignService as jest.Mock<
  jest.Mocked<SignService>
>)()

let container: HTMLElement

describe('CuneiformConverterForm', () => {
  const setup = (): void => {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(true),
      },
      writable: true,
    })
    container = render(
      <CuneiformConverterForm signService={signServiceMock} />,
    ).container
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders form, options, and scenario panel correctly', () => {
    setup()
    expect(container).toMatchSnapshot()
  })
  it('handles input change', () => {
    setup()
    const inputTextArea = screen.getByLabelText('input-atf')
    fireEvent.change(inputTextArea, { target: { value: 'test text' } })
    expect(inputTextArea).toHaveValue('test text')
  })
  it('handles font change', () => {
    setup()
    const fontSelector = screen.getByLabelText('Select Font')
    fireEvent.change(fontSelector, { target: { value: 'Esagil' } })
    expect(fontSelector).toHaveValue('Esagil')
  })
  it('converts text correctly', async () => {
    setup()
    signServiceMock.getUnicodeFromAtf.mockResolvedValueOnce([
      { unicode: [73979] },
    ])

    const inputTextArea = screen.getByLabelText('input-atf')
    fireEvent.change(inputTextArea, { target: { value: 'test text' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    await waitFor(() => {
      expect(screen.getByLabelText('Converted Text')).toHaveValue('𒃻')
    })
  })

  it('copies converted text to clipboard', async () => {
    setup()
    signServiceMock.getUnicodeFromAtf.mockResolvedValueOnce([
      { unicode: [73979] },
    ])

    const inputTextArea = screen.getByLabelText('input-atf')
    fireEvent.change(inputTextArea, { target: { value: 'test text' } })

    const convertButton = screen.getByText('Convert')
    fireEvent.click(convertButton)

    await waitFor(() => {
      expect(screen.getByLabelText('Converted Text')).toHaveValue('𒃻')
    })

    const copyButton = screen.getByText('Copy')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('𒃻')
    })
  })
})
