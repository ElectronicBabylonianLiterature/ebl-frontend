import React from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'

export default function FullTextSearch(): JSX.Element {
  return (
    <AppContent
      crumbs={[new SectionCrumb('Bibliography')]}
      title="Full Text Search Test"
    >
      <p>Full text search will be here.</p>
    </AppContent>
  )
}
