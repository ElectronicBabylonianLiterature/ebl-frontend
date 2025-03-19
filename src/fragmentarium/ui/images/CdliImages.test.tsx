import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import CdliImages from './CdliImages'
import { Fragment } from 'fragmentarium/domain/fragment'

describe('CdliImages', () => {
  it('Renders photo tab when photo URL is provided', async () => {
    const fragment = { cdliImages: ['P000011.jpg'] } as Fragment
    render(<CdliImages fragment={fragment} fragmentService={{}} />)
    await waitFor(() => {
      expect(screen.getByText('Photo')).toBeInTheDocument()
    })
    expect(screen.getByAltText('CDLI Photo')).toHaveAttribute(
      'src',
      'https://cdli.mpiwg-berlin.mpg.de/P000011.jpg'
    )
  })

  it('Renders line art tab when line art URL is provided', async () => {
    const fragment = { cdliImages: ['P000011_l.jpg'] } as Fragment
    render(<CdliImages fragment={fragment} fragmentService={{}} />)
    await waitFor(() => {
      expect(screen.getByText('Line Art')).toBeInTheDocument()
    })
    expect(screen.getByAltText('CDLI Line Art')).toHaveAttribute(
      'src',
      'https://cdli.mpiwg-berlin.mpg.de/P000011_l.jpg'
    )
  })

  it('Renders detail line art tab when detail line art URL is provided', async () => {
    const fragment = { cdliImages: ['P000011_ld.jpg'] } as Fragment
    render(<CdliImages fragment={fragment} fragmentService={{}} />)
    await waitFor(() => {
      expect(screen.getByText('Detail Line Art')).toBeInTheDocument()
    })
    expect(screen.getByAltText('CDLI Detail Line Art')).toHaveAttribute(
      'src',
      'https://cdli.mpiwg-berlin.mpg.de/P000011_ld.jpg'
    )
  })

  it('Renders detail photo tab when detail photo URL is provided', async () => {
    const fragment = { cdliImages: ['P000011_d.jpg'] } as Fragment
    render(<CdliImages fragment={fragment} fragmentService={{}} />)
    await waitFor(() => {
      expect(screen.getByText('Detail Photo')).toBeInTheDocument()
    })
    expect(screen.getByAltText('CDLI Detail Photo')).toHaveAttribute(
      'src',
      'https://cdli.mpiwg-berlin.mpg.de/P000011_d.jpg'
    )
  })

  it('Renders all tabs when all image types are provided', async () => {
    const fragment = {
      cdliImages: [
        'P000011.jpg',
        'P000011_l.jpg',
        'P000011_ld.jpg',
        'P000011_d.jpg',
      ],
    } as Fragment
    render(<CdliImages fragment={fragment} fragmentService={{}} />)
    await waitFor(() => {
      expect(screen.getByText('Photo')).toBeInTheDocument()
      expect(screen.getByText('Line Art')).toBeInTheDocument()
      expect(screen.getByText('Detail Line Art')).toBeInTheDocument()
      expect(screen.getByText('Detail Photo')).toBeInTheDocument()
    })
  })

  it('Shows "No images" when no images are provided', async () => {
    const fragment = { cdliImages: [] } as Fragment
    render(<CdliImages fragment={fragment} fragmentService={{}} />)
    await waitFor(() => {
      expect(screen.getByText('No images')).toBeInTheDocument()
    })
  })

  it('Does not render tabs for missing image types', async () => {
    const fragment = { cdliImages: ['P000011.jpg'] } as Fragment
    render(<CdliImages fragment={fragment} fragmentService={{}} />)
    await waitFor(() => {
      expect(screen.getByText('Photo')).toBeInTheDocument()
    })
    expect(screen.queryByText('Line Art')).not.toBeInTheDocument()
    expect(screen.queryByText('Detail Line Art')).not.toBeInTheDocument()
    expect(screen.queryByText('Detail Photo')).not.toBeInTheDocument()
  })

  it('Handles undefined fragment cdliImages', async () => {
    const fragment = {} as Fragment
    render(<CdliImages fragment={fragment} fragmentService={{}} />)
    await waitFor(() => {
      expect(screen.getByText('No images')).toBeInTheDocument()
    })
  })
})
