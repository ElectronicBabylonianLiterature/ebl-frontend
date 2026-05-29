import React from 'react'
import { render, screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import SignService from 'signs/application/SignService'
import Bluebird from 'bluebird'
import SignImages from 'signs/ui/display/SignImages'
import { MemoryRouter } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import userEvent from '@testing-library/user-event'

jest.mock('signs/application/SignService')

const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const signName = 'signName'
const imageString =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
const croppedAnnotations: CroppedAnnotation[] = [
  {
    fragmentNumber: 'K.6400',
    image: imageString,
    script: '',
    provenance: 'ASSUR',
    label: 'label-1',
  },
  {
    fragmentNumber: 'K.6401',
    image: imageString,
    script: 'MA',
    label: 'label-2',
  },
]

function renderSignImages() {
  render(
    <MemoryRouter>
      <SignImages signName={signName} signService={signService} />
    </MemoryRouter>,
  )
}

describe('Sign Images', () => {
  async function setup(): Promise<void> {
    signService.getImages.mockReturnValue(Bluebird.resolve(croppedAnnotations))
    renderSignImages()
    await waitForSpinnerToBeRemoved(screen)
    expect(signService.getImages).toBeCalledWith(signName)
  }
  it('Check Images', async () => {
    await setup()
    await userEvent.click(screen.getByRole('button', { name: 'Unclassified' }))
    expect(screen.getByText(croppedAnnotations[0].fragmentNumber)).toBeVisible()
  })

  it('Provenance is displayed', async () => {
    await setup()
    await userEvent.click(screen.getByRole('button', { name: 'Unclassified' }))
    const provenanceSpan = screen.getByText('ASSUR', {
      selector: '.provenance',
    })
    expect(provenanceSpan).toBeInTheDocument()
  })
})

describe('Sign Images Empty', () => {
  async function setup(): Promise<void> {
    signService.getImages.mockReturnValue(Bluebird.resolve([]))
    renderSignImages()
    await waitForSpinnerToBeRemoved(screen)
    expect(signService.getImages).toBeCalledWith(signName)
  }
  it('Check there are no Images', async () => {
    await setup()
    croppedAnnotations.forEach((croppedAnnotation) => {
      expect(
        screen.queryByText(croppedAnnotation.fragmentNumber),
      ).not.toBeInTheDocument()
    })
  })
})
