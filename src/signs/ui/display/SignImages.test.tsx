import React from 'react'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import SignService from 'signs/application/SignService'
import Bluebird from 'bluebird'
import SignImages from 'signs/ui/display/SignImages'

jest.mock('signs/application/SignService')

const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const signName = 'signName'
const image =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
const croppedAnnotations = [
  {
    fragmentNumber: 'K.6400',
    image: image,
    script: 'script-1',
    label: 'label-1',
  },
  {
    fragmentNumber: 'K.6401',
    image: image,
    script: 'script-2',
    label: 'label-2',
  },
]

function renderSignImages() {
  render(<SignImages signName={signName} signService={signService} />)
}

describe('Sign Images', () => {
  beforeEach(async () => {
    signService.getImages.mockReturnValue(Bluebird.resolve(croppedAnnotations))
    renderSignImages()
    await waitForElementToBeRemoved(() => screen.getByLabelText('Spinner'))
    expect(signService.getImages).toBeCalledWith(signName)
  })
  it('Check Images', async () => {
    croppedAnnotations.map((croppedAnnotation) => {
      expect(screen.getByText(croppedAnnotation.fragmentNumber)).toBeVisible()
    })
  })
})
