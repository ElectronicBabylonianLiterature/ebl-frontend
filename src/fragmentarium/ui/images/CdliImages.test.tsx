import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import CdliImages from './CdliImages'
import { fragmentFactory } from 'test-support/fragment-fixtures'

describe('CdliImages', () => {
  const testCases = [
    {
      description: 'photo tab',
      image: 'P000011.jpg',
      tabName: 'Photo',
      altText: 'CDLI Photo',
    },
    {
      description: 'line art tab',
      image: 'P000011_l.jpg',
      tabName: 'Line Art',
      altText: 'CDLI Line Art',
    },
    {
      description: 'detail line art tab',
      image: 'P000011_ld.jpg',
      tabName: 'Detail Line Art',
      altText: 'CDLI Detail Line Art',
    },
    {
      description: 'detail photo tab',
      image: 'P000011_d.jpg',
      tabName: 'Detail Photo',
      altText: 'CDLI Detail Photo',
    },
  ]

  testCases.forEach(({ description, image, tabName, altText }) => {
    it(`Renders ${description} when ${tabName} URL is provided`, async () => {
      const fragment = fragmentFactory.build({ cdliImages: [image] })
      render(<CdliImages fragment={fragment} fragmentService={{}} />)
      await waitFor(() => {
        expect(screen.getByText(tabName)).toBeInTheDocument()
      })
      expect(screen.getByAltText(altText)).toHaveAttribute(
        'src',
        `https://cdli.earth/${image}`,
      )
    })
  })

  it('Renders all tabs when all image types are provided', async () => {
    const fragment = fragmentFactory.build({
      cdliImages: [
        'P000011.jpg',
        'P000011_l.jpg',
        'P000011_ld.jpg',
        'P000011_d.jpg',
      ],
    })
    render(<CdliImages fragment={fragment} fragmentService={{}} />)
    await waitFor(() => {
      expect(screen.getByText('Photo')).toBeInTheDocument()
    })
    expect(screen.getByText('Line Art')).toBeInTheDocument()
    expect(screen.getByText('Detail Line Art')).toBeInTheDocument()
    expect(screen.getByText('Detail Photo')).toBeInTheDocument()
  })

  it('Shows "No images" when no images are provided', async () => {
    const fragment = fragmentFactory.build({ cdliImages: [] })
    render(<CdliImages fragment={fragment} fragmentService={{}} />)
    await waitFor(() => {
      expect(screen.getByText('No images')).toBeInTheDocument()
    })
  })

  it('Does not render tabs for missing image types', async () => {
    const fragment = fragmentFactory.build({ cdliImages: ['P000011.jpg'] })
    render(<CdliImages fragment={fragment} fragmentService={{}} />)
    await waitFor(() => {
      expect(screen.getByText('Photo')).toBeInTheDocument()
    })
    expect(screen.queryByText('Line Art')).not.toBeInTheDocument()
    expect(screen.queryByText('Detail Line Art')).not.toBeInTheDocument()
    expect(screen.queryByText('Detail Photo')).not.toBeInTheDocument()
  })

  it('Handles undefined fragment cdliImages', async () => {
    const fragment = fragmentFactory.build({ cdliImages: undefined })
    render(<CdliImages fragment={fragment} fragmentService={{}} />)
    await waitFor(() => {
      expect(screen.getByText('No images')).toBeInTheDocument()
    })
  })
})
