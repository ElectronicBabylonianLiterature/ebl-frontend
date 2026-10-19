import React from 'react'
import { render } from '@testing-library/react'
import FolioDetails from 'fragmentarium/ui/images/FolioDetails'
import Folio from 'fragmentarium/domain/Folio'
import { ImageFragmentService } from 'fragmentarium/ui/images/ImageFragmentService'

const pending = (): Promise<never> => new Promise(() => undefined)
const fragmentService: ImageFragmentService = {
  findPhoto: pending,
  findFolio: pending,
  folioPager: pending,
}

it('renders nothing for a folio without an image', () => {
  const folio = new Folio({ name: 'FOLIO_WITHOUT_IMAGE', number: '1' })
  const { container } = render(
    <FolioDetails
      fragmentService={fragmentService}
      fragmentNumber="K.1"
      folio={folio}
    />,
  )

  expect(folio.hasImage).toBe(false)
  expect(container).toBeEmptyDOMElement()
})
