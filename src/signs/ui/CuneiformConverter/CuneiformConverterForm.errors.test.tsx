import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import CuneiformConverterForm from 'signs/ui/CuneiformConverter/CuneiformConverterForm'
import SignService from 'signs/application/SignService'

jest.mock('signs/application/SignService')

const signServiceMock = new (SignService as jest.Mock<
  jest.Mocked<SignService>
>)()

let consoleErrorSpy: jest.SpyInstance

function setUpForm(writeText: jest.Mock = jest.fn().mockResolvedValue(true)) {
  Object.defineProperty(window.navigator, 'clipboard', {
    value: { writeText },
    writable: true,
  })
  render(<CuneiformConverterForm signService={signServiceMock} />)
}

function convert(value: string): void {
  fireEvent.change(screen.getByLabelText('input-atf'), { target: { value } })
  fireEvent.click(screen.getByText('Convert'))
}

beforeEach(() => {
  jest.resetAllMocks()
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
    return undefined
  })
})

afterEach(() => {
  consoleErrorSpy.mockRestore()
})

it('reports a failed line conversion and leaves that line empty', async () => {
  const queryError = new Error('query failed')
  signServiceMock.getUnicodeFromAtf
    .mockRejectedValueOnce(queryError)
    .mockResolvedValueOnce([{ unicode: [73979] }])
  setUpForm()

  convert('first\nsecond')

  await waitFor(() => {
    expect(screen.getByLabelText('Converted Text')).toHaveValue('\n𒃻')
  })
  expect(consoleErrorSpy).toHaveBeenCalledWith('Query Error:', queryError)
})

it('reports conversion failures that are not cancellations', async () => {
  const conversionError = new Error('conversion failed')
  signServiceMock.getUnicodeFromAtf.mockImplementation(() => {
    throw conversionError
  })
  setUpForm()

  convert('first')

  await waitFor(() => {
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Query Error:',
      conversionError,
    )
  })
  expect(screen.getByLabelText('Converted Text')).toHaveValue('')
})

it('converts on Shift + Enter', async () => {
  signServiceMock.getUnicodeFromAtf.mockResolvedValue([{ unicode: [73979] }])
  setUpForm()

  const inputTextArea = screen.getByLabelText('input-atf')
  fireEvent.change(inputTextArea, { target: { value: 'first' } })
  fireEvent.keyDown(inputTextArea, { key: 'Enter', shiftKey: true })

  await waitFor(() => {
    expect(screen.getByLabelText('Converted Text')).toHaveValue('𒃻')
  })
})

it('does not convert on Enter without Shift', async () => {
  signServiceMock.getUnicodeFromAtf.mockResolvedValue([{ unicode: [73979] }])
  setUpForm()

  const inputTextArea = screen.getByLabelText('input-atf')
  fireEvent.change(inputTextArea, { target: { value: 'first' } })
  fireEvent.keyDown(inputTextArea, { key: 'Enter', shiftKey: false })

  expect(signServiceMock.getUnicodeFromAtf).not.toHaveBeenCalled()
})

it('does not report cancelled conversions', async () => {
  const pendingQueries: Array<() => void> = []
  signServiceMock.getUnicodeFromAtf.mockImplementation(
    () =>
      new Promise((resolve) => {
        pendingQueries.push(() => resolve([{ unicode: [73979] }]))
      }),
  )
  setUpForm()

  convert('a\nb\nc\nd\ne')
  await waitFor(() => expect(pendingQueries).toHaveLength(4))

  convert('f')
  pendingQueries.forEach((resolveQuery) => resolveQuery())

  await waitFor(() => {
    expect(screen.getByLabelText('Converted Text')).toHaveValue('')
  })
  expect(consoleErrorSpy).not.toHaveBeenCalled()
})

it('reports clipboard failures', async () => {
  const clipboardError = new Error('clipboard unavailable')
  setUpForm(jest.fn().mockRejectedValue(clipboardError))

  fireEvent.click(screen.getByText('Copy'))

  await waitFor(() => {
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to copy text: ',
      clipboardError,
    )
  })
})
