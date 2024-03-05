import React from 'react'
import { render, screen } from '@testing-library/react'
import ExternalResources from './ExternalResources'

import {
  externalNumbersFactory,
  fragmentFactory,
} from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'

const cdliNumber = 'P 0000+q'
const bmIdNumber = 'bm 00000+q'
const bdtnsNumber = 'bdtns123'
const archibabNumber = 'A38'
const urOnlineNumber = 'U5'
const hilprechtJenaNumber = 'H42'
const hilprechtHeidelbergNumber = 'H007'
const achemenetNumber = 'H00744'
const nabuccoNumber = 'H00765'
const metropolitanNumber = 'M123'
const louvreNumber = 'L123'
const alalahHpmNumber = 'L123'
const australianinstituteofarchaeologyNumber = 'L123'
const philadelphiaNumber = 'P123'
const yalePeabodyNumber = 'y123'
const sealNumber = 'L123'
let fragment: Fragment
let container: HTMLElement

describe('external resources', () => {
  beforeEach(async () => {
    fragment = fragmentFactory.build(
      {},
      {
        associations: {
          externalNumbers: externalNumbersFactory.build({
            cdliNumber,
            bmIdNumber,
            bdtnsNumber,
            archibabNumber,
            urOnlineNumber,
            hilprechtJenaNumber,
            hilprechtHeidelbergNumber,
            achemenetNumber,
            nabuccoNumber,
            metropolitanNumber,
            louvreNumber,
            alalahHpmNumber,
            australianinstituteofarchaeologyNumber,
            philadelphiaNumber,
            yalePeabodyNumber,
            sealNumber,
          }),
        },
      }
    )
    container = render(<ExternalResources fragment={fragment} />).container
  })

  test.each([
    ['CDLI', 'https://cdli.mpiwg-berlin.mpg.de/', cdliNumber],
    [
      'The British Museum',
      'https://www.britishmuseum.org/collection/object/',
      bmIdNumber,
    ],
    ['BDTNS', 'http://bdtns.filol.csic.es/', bdtnsNumber],
    ['Archibab', 'http://www.archibab.fr/', archibabNumber],
    ['Ur Online', 'http://www.ur-online.org/subject/', urOnlineNumber],
    [
      'Hilprecht Collection',
      'https://hilprecht.mpiwg-berlin.mpg.de/object3d/',
      hilprechtJenaNumber,
    ],
    [
      'Hilprecht Collection – HeiCuBeDa',
      'https://doi.org/10.11588/heidicon/',
      hilprechtHeidelbergNumber,
    ],
    [
      'Achemenet',
      'http://www.achemenet.com/en/item/?/textual-sources/texts-by-languages-and-scripts/babylonian/',
      achemenetNumber,
    ],
    [
      'NaBuCCo',
      'https://nabucco.acdh.oeaw.ac.at/archiv/tablet/detail/',
      nabuccoNumber,
    ],
    [
      'The Metropolitan Museum of Art',
      'https://www.metmuseum.org/art/collection/search/',
      metropolitanNumber,
    ],
    ['Louvre', 'https://collections.louvre.fr/ark:/53355/', louvreNumber],
    [
      'Alalah HPM Number',
      'https://www.hethport.uni-wuerzburg.de/Alalach/bildpraep.php?fundnr=',
      alalahHpmNumber,
    ],
    [
      'Australian Institute of Archaeology',
      'https://aiarch.pedestal3d.com/r/',
      australianinstituteofarchaeologyNumber,
    ],
    [
      'Penn Museum',
      'https://www.penn.museum/collections/object/',
      philadelphiaNumber,
    ],
    [
      'Yale Babylonian Collection',
      'https://collections.peabody.yale.edu/search/Record/YPM-',
      yalePeabodyNumber,
    ],
    ['SEAL Number', 'https://seal.huji.ac.il/node/', sealNumber],
  ])('%s number is shown', async (label, link, number) => {
    expect(screen.getByLabelText(`${label} text ${number}`)).toHaveAttribute(
      'href',
      `${link}${encodeURIComponent(number)}`
    )
  })
  test('Snapshot', async () => expect(container).toMatchSnapshot())
})

describe('missing external resources', () => {
  beforeEach(async () => {
    fragment = fragmentFactory.build(
      {},
      {
        associations: {
          externalNumbers: {},
        },
      }
    )
    render(<ExternalResources fragment={fragment} />)
  })

  test.each([
    'CDLI',
    'The British Museum',
    'BDTNS',
    'Archibab',
    'Ur Online',
    'Hilprecht Collection',
    'Hilprecht Collection – HeiCuBeDa',
    'Achemenet',
    'NaBuCCo',
    'The Metropolitan Museum of Art',
    'Louvre',
    'Alalah HPM Number',
    'Australian Institute of Archaeology',
    'Penn Museum',
    'Yale Babylonian Collection',
  ])('Mising %s number is not shown', async (label) => {
    expect(screen.queryByText(label)).not.toBeInTheDocument()
  })
})
