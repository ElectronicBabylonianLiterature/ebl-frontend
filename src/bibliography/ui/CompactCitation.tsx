import React from 'react'
import InlineMarkdown from 'common/InlineMarkdown'
import Reference from 'bibliography/domain/Reference'
import Citation from 'bibliography/domain/Citation'

export default function CompactCitation({
  reference,
}: {
  reference: Reference
}): JSX.Element {
  return (
    <>
      <InlineMarkdown source={Citation.for(reference).getMarkdown()} />
      <span
        className={'type-abbreviation'}
      >{` (${reference.typeAbbreviation})`}</span>
    </>
  )
}
