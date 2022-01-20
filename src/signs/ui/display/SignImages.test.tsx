import React from 'react'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import SignService from 'signs/application/SignService'
import Bluebird from 'bluebird'
import SignImages from 'signs/ui/display/SignImages'
import { MemoryRouter } from 'react-router-dom'

jest.mock('signs/application/SignService')

const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const signName = 'signName'
const imageString =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
const croppedAnnotations = [
  {
    fragmentNumber: 'K.6400',
    image: imageString,
    script: 'script-1',
    label: 'label-1',
  },
  {
    fragmentNumber: 'K.6401',
    image: imageString,
    script: 'script-2',
    label: 'label-2',
  },
]

function renderSignImages() {
  render(
    <MemoryRouter>
      <SignImages signName={signName} signService={signService} />
    </MemoryRouter>
  )
}

describe('Sign Images', () => {
  beforeEach(async () => {
    signService.getImages.mockReturnValue(Bluebird.resolve(croppedAnnotations))
    renderSignImages()
    await waitForElementToBeRemoved(() => screen.getByLabelText('Spinner'))
    expect(signService.getImages).toBeCalledWith(signName)
  })
  it('Check Images', () => {
    croppedAnnotations.forEach((croppedAnnotation) => {
      expect(screen.getByText(croppedAnnotation.fragmentNumber)).toBeVisible()
    })
  })
})
