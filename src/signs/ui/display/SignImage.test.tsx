import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SignImage from 'signs/ui/display/SignImage'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import { imageString } from 'signs/ui/display/SignImages.testSupport'
import { mesopotamianDateFactory } from 'test-support/date-fixtures'

function renderSignImage(overrides: Partial<CroppedAnnotation>): void {
  render(
    <MemoryRouter>
      <SignImage
        croppedAnnotation={
          {
            fragmentNumber: 'K.1',
            image: imageString,
            script: '',
            annotationId: 'annotation-1',
            ...overrides,
          } as CroppedAnnotation
        }
      />
    </MemoryRouter>,
  )
}

test('An annotation without a label renders an empty caption label', () => {
  renderSignImage({ label: undefined })

  expect(screen.getByRole('link', { name: /K.1/ })).toBeVisible()
})

test('An annotation with a date shows the date', () => {
  const date = mesopotamianDateFactory.build()
  renderSignImage({ label: 'label-1', date })

  expect(screen.getByRole('figure')).toHaveTextContent('label-1')
  expect(screen.getByRole('figure')).toHaveTextContent(
    date.toString().split(' (')[0],
  )
})
