import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import SubmitCorrectionsButton from 'common/SubmitCorrectionsButton'

let windowSpy

beforeEach(() => {
  windowSpy = jest.spyOn(window, 'open')
})

afterEach(() => {
  windowSpy.mockRestore()
})

it('Does window open', () => {
  render(<SubmitCorrectionsButton id={'X.1'} />)
  fireEvent.click(screen.getByRole('button'))
  expect(windowSpy).toHaveBeenCalledTimes(1)
  expect(windowSpy).toHaveBeenCalledWith(
    'mailto:corrections@example.com?subject=eBL%20Correction%20to%20X.1&body=To%20the%20X.1%20(http%3A%2F%2Flocalhost%2F)%2C%20I%20have%20the%20following%20correction%3A%0A%0A%5Bcomment%5D',
  )
})
