import React from 'react'
import _ from 'lodash'
import ExternalLink from 'common/ui/ExternalLink'

export { OraccLinks, SealLinks } from 'fragmentarium/ui/info/ExternalTextLinks'

interface Props {
  number: string
  baseUrl: string
  label: string
  encodeUri: boolean
}
function ExternalNumberLink({
  baseUrl,
  number,
  label,
  encodeUri,
}: Props): JSX.Element {
  const url = `${baseUrl}${encodeUri ? encodeURIComponent(number) : number}`
  return (
    <>
      {`${label} (`}
      <ExternalLink href={url} aria-label={`${label} text ${number}`}>
        {number}
      </ExternalLink>
      {')'}
    </>
  )
}

type NumberLinkComponent = ({ number }: { number: string }) => JSX.Element

interface NumberLinkOptions {
  encodeUri?: boolean
  formatNumber?: (number: string) => string
}

export function createNumberLink(
  baseUrl: string,
  label: string,
  { encodeUri = true, formatNumber = _.identity }: NumberLinkOptions = {},
): NumberLinkComponent {
  return function NumberLink({ number }: { number: string }): JSX.Element {
    return (
      <ExternalNumberLink
        number={formatNumber(number)}
        baseUrl={baseUrl}
        label={label}
        encodeUri={encodeUri}
      />
    )
  }
}

export const BmIdLink = createNumberLink(
  'https://www.britishmuseum.org/collection/object/',
  'The British Museum',
)

export const CdliLink = createNumberLink('https://cdli.earth/', 'CDLI')

export const BdtnsLink = createNumberLink('http://bdtns.cesga.es/', 'BDTNS')

export const RstiLink = createNumberLink(
  'https://pi.lib.uchicago.edu/1001/org/ochre/',
  'RSTI',
)

export const ChicagoIsacLink = createNumberLink(
  'https://isac-idb.uchicago.edu/id/',
  'Chicago ISAC',
)

export const ArchibabLink = createNumberLink(
  'http://www.archibab.fr/',
  'Archibab',
)

export const UrOnlineLink = createNumberLink(
  'http://www.ur-online.org/subject/',
  'Ur Online',
)

export const HilprechtJenaLink = createNumberLink(
  'https://hilprecht.mpiwg-berlin.mpg.de/object3d/',
  'Hilprecht Collection',
)

export const HilprechtHeidelbergLink = createNumberLink(
  'https://doi.org/10.11588/heidicon/',
  'Hilprecht Collection – HeiCuBeDa',
)

export const YalePeabodyLink = createNumberLink(
  'https://collections.peabody.yale.edu/search/Record/YPM-',
  'Yale Babylonian Collection',
  { formatNumber: (number) => number.replace(/^BC\./g, 'BC-') },
)

export const AchemenetLink = createNumberLink(
  'http://www.achemenet.com/en/item/?/textual-sources/texts-by-languages-and-scripts/babylonian/',
  'Achemenet',
)

export const NabuccoLink = createNumberLink(
  'https://nabucco.acdh.oeaw.ac.at/archiv/tablet/detail/',
  'NaBuCCo',
)

export const DigitaleKeilschriftBibliothekLink = createNumberLink(
  'https://gwdu64.gwdg.de/pls/tlinnemann/keilpublic_1$tafel.QueryViewByKey?',
  'Digitale Keilschrift Bibliothek',
  { encodeUri: false },
)

export const MetropolitanLink = createNumberLink(
  'https://www.metmuseum.org/art/collection/search/',
  'The Metropolitan Museum of Art',
)

export const pierpontMorganLink = createNumberLink(
  'https://www.themorgan.org/seals-and-tablets/',
  'Pierpont Morgan Library',
)

export const LouvreLink = createNumberLink(
  'https://collections.louvre.fr/ark:/53355/',
  'Louvre',
)

export const ontarioLink = createNumberLink(
  'https://collections.rom.on.ca/objects/',
  'Royal Ontario Museum',
)

export const kelseyLink = createNumberLink(
  'https://quod.lib.umich.edu/k/kelsey/x-',
  'Kelsey Museum',
)

export const harvardHamLink = createNumberLink(
  'https://harvardartmuseums.org/collections/object/',
  'Harvard Art Museums',
)

export const etcsriLink = createNumberLink(
  'https://oracc.museum.upenn.edu/etcsri/',
  'ETCSRI',
)

export const sketchfabLink = createNumberLink(
  'https://sketchfab.com/3d-models/',
  'SketchFab',
)

export const arkLink = createNumberLink('https://n2t.net/ark:/', 'ark')

export const dublinTcdLink = createNumberLink(
  'https://digitalcollections.tcd.ie/concern/works/',
  'Trinity College Dublin',
)

export const cambridgeMaaLink = createNumberLink(
  'https://collections.maa.cam.ac.uk/objects/',
  'MAA Cambridge',
)

export const ashmoleanLink = createNumberLink(
  'https://collections.ashmolean.org/object/',
  'Ashmolean Museum',
)

export const alalahHpmLink = createNumberLink(
  'https://www.hethport.uni-wuerzburg.de/Alalach/bildpraep.php?fundnr=',
  'Alalah HPM Number',
)

export const sealLink = createNumberLink(
  'https://seal.huji.ac.il/node/',
  'SEAL Number',
)

export const australianinstituteofarchaeologyLink = createNumberLink(
  'https://aiarch.pedestal3d.com/r/',
  'Australian Institute of Archaeology',
)

export const PhiladelphiaLink = createNumberLink(
  'https://www.penn.museum/collections/object/',
  'Penn Museum',
)

export const spurlockLink = createNumberLink(
  'https://www.spurlock.illinois.edu/collections/search-collection/details.php?a=',
  'Spurlock Museum',
)
