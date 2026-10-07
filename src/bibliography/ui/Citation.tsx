import React from 'react'
import Reference from 'bibliography/domain/Reference'
import CompactCitation from 'bibliography/ui/CompactCitation'

export default function Citation({
  reference,
}: {
  reference: Reference
}): JSX.Element {
  return <CompactCitation references={[reference]} />
}
