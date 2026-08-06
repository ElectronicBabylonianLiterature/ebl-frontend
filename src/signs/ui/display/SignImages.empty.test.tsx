import { screen } from '@testing-library/react'
import {
  createMockSignService,
  croppedAnnotations,
  setUpSignImages,
} from 'signs/ui/display/SignImages.testSupport'

jest.mock('signs/application/SignService')

const signService = createMockSignService()

describe('Sign Images Empty', () => {
  it('Check there are no Images', async () => {
    await setUpSignImages(signService, [])

    croppedAnnotations.forEach((croppedAnnotation) => {
      expect(
        screen.queryByText(croppedAnnotation.fragmentNumber),
      ).not.toBeInTheDocument()
    })
  })
})
