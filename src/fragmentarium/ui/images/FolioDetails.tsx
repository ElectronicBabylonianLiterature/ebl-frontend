import React from 'react'
import FolioPager from 'fragmentarium/ui/images/FolioPager'
import FolioImage from 'fragmentarium/ui/images/FolioImage'

import 'fragmentarium/ui/images/FolioDetails.css'
import { ImageFragmentService } from 'fragmentarium/ui/images/ImageFragmentService'
import Folio from 'fragmentarium/domain/Folio'

interface Props {
  fragmentService: ImageFragmentService
  fragmentNumber: string
  folio: Folio
}
export default function FolioDetails({
  fragmentService,
  fragmentNumber,
  folio,
}: Props): JSX.Element | null {
  return folio.hasImage ? (
    <>
      <header className="Folios__Pager">
        <FolioPager
          fragmentService={fragmentService}
          folio={folio}
          fragmentNumber={fragmentNumber}
        />
      </header>
      <FolioImage fragmentService={fragmentService} folio={folio} />
    </>
  ) : null
}
