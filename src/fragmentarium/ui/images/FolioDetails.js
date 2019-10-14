import React from 'react'
import FolioPager from './FolioPager'
import FolioImage from './FolioImage'

export default function FolioDetails({
  fragmentService,
  fragmentNumber,
  folio
}) {
  return (
    folio.hasImage && (
      <>
        <header className="Folios__Pager">
          <FolioPager
            fragmentService={fragmentService}
            folio={folio}
            fragmentNumber={fragmentNumber}
          />
        </header>
        <FolioImage
          fragmentService={fragmentService}
          folio={folio}
          alt={folio.fileName}
        />
      </>
    )
  )
}
