import React, { ReactNode } from 'react'
import { Route } from 'react-router-dom'
import { CachedMarkupService } from 'markup/application/MarkupService'

import FullRecord from 'fragmentarium/ui/info/FullRecord'

export default function RecordsRoutes({
  sitemap,
  cachedMarkupService,
}: {
  sitemap: boolean
  cachedMarkupService: CachedMarkupService
}): JSX.Element[] {
  return [
    <Route
      key="full-record-tabs"
      exact
      path="/records"
      render={(): ReactNode => <FullRecord record={[]} />}
    />,
  ]
}
