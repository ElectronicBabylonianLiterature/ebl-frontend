import React from 'react'
import { render, screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import SignService from 'signs/application/SignService'
import Bluebird from 'bluebird'
import SignImages from 'signs/ui/display/SignImages'
import { MemoryRouter } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import { PeriodModifiers, Periods } from 'common/period'

jest.mock('signs/application/SignService')

const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const signName = 'signName'
const imageString =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
const croppedAnnotations: CroppedAnnotation[] = [
  {
    fragmentNumber: 'K.6400',
    image: imageString,
    script: {
      period: Periods['Late Babylonian'],
      periodModifier: PeriodModifiers.None,
      uncertain: false,
    },
    label: 'label-1',
  },
  {
    fragmentNumber: 'K.6401',
    image: imageString,
    script: {
      period: Periods['Middle Babylonian'],
      periodModifier: PeriodModifiers.None,
      uncertain: false,
    },
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

test('Test CroppedAnnotation interface', () => {
  croppedAnnotations.forEach((croppedAnnotation) => {
    croppedAnnotation as CroppedAnnotation
  })
})

describe('Sign Images', () => {
  beforeEach(async () => {
    signService.getImages.mockReturnValue(Bluebird.resolve(croppedAnnotations))
    renderSignImages()
    await waitForSpinnerToBeRemoved(screen)
    expect(signService.getImages).toBeCalledWith(signName)
  })
  it('Check Images', () => {
    croppedAnnotations.forEach((croppedAnnotation) => {
      expect(screen.getByText(croppedAnnotation.fragmentNumber)).toBeVisible()
    })
  })
})

describe('Sign Images Empty', () => {
  beforeEach(async () => {
    signService.getImages.mockReturnValue(Bluebird.resolve([]))
    renderSignImages()
    await waitForSpinnerToBeRemoved(screen)
    expect(signService.getImages).toBeCalledWith(signName)
  })
  it('Check there are no Images', () => {
    croppedAnnotations.forEach((croppedAnnotation) => {
      expect(
        screen.queryByText(croppedAnnotation.fragmentNumber)
      ).not.toBeInTheDocument()
    })
  })
})
