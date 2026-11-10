import React from 'react'
import { render, screen } from '@testing-library/react'
import ExternalResources from 'fragmentarium/ui/info/ExternalResources'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'

let fragment: Fragment

describe('missing external resources', () => {
  function setup(): void {
    fragment = fragmentFactory.build(
      {},
      {
        associations: {
          externalNumbers: {},
        },
      },
    )
    render(<ExternalResources fragment={fragment} />)
  }

  test.each([
    'CDLI',
    'The British Museum',
    'BDTNS',
    'RSTI',
    'Chicago ISAC',
    'Archibab',
    'Ur Online',
    'Hilprecht Collection',
    'Hilprecht Collection – HeiCuBeDa',
    'Achemenet',
    'NaBuCCo',
    'Digitale Keilschrift Bibliothek',
    'The Metropolitan Museum of Art',
    'Pierpont Morgan Library',
    'Louvre',
    'Royal Ontario Museum',
    'Kelsey Museum',
    'Harvard Art Museums',
    'ETCSRI',
    'SketchFab',
    'MDZ Digitale Bibliothek',
    'Deutsches Museum',
    'SMÄK',
    'ark',
    'Trinity College Dublin',
    'MAA Cambridge',
    'Ashmolean Museum',
    'Alalah HPM Number',
    'Australian Institute of Archaeology',
    'Penn Museum',
    'Yale Babylonian Collection',
    'Spurlock Museum',
  ])('Mising %s number is not shown', async (label) => {
    setup()
    expect(screen.queryByText(label)).not.toBeInTheDocument()
  })
})
