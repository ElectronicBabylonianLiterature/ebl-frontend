import React from 'react'
import { render, act, screen, fireEvent } from '@testing-library/react'

import SubmitCorrectionsButton from 'common/SubmitCorrectionsButton'

let windowSpy

beforeEach(() => {
  windowSpy = jest.spyOn(window, 'open')
  render(<SubmitCorrectionsButton id={'X.1'} />)
})

afterEach(() => {
  windowSpy.mockRestore()
})

it('Does window open', () => {
  act(() => {
    fireEvent.click(screen.getByRole('button'))
  })
  expect(windowSpy).toHaveBeenCalledTimes(1)
  expect(windowSpy).toHaveBeenCalledWith(
    'mailto:zsombor.foldi@lmu.de?subject=eBL%20Correction%20to%20X.1&body=To%20the%20X.1%2C%20I%20have%20the%20following%20correction%3A%0A%0A%5Bcomment%5D'
  )
})
