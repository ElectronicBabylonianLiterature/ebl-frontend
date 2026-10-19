import { FolioEntry } from 'about/ui/FolioEntry'
import { earlyFolios } from 'about/ui/foliosEarly'
import { twentiethCenturyFolios } from 'about/ui/foliosTwentiethCentury'
import { contemporaryFolios } from 'about/ui/foliosContemporary'

export const folios: FolioEntry[] = [
  ...earlyFolios,
  ...twentiethCenturyFolios,
  ...contemporaryFolios,
]
