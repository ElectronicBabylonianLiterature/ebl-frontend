import React from 'react'
import FolioPager from './FolioPager'
import FolioImage from './FolioImage'

import './FolioDetails.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import Folio from 'fragmentarium/domain/Folio'

interface Props {
  fragmentService: FragmentService
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
