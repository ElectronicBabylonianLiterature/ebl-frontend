// @flow
import React from 'react'
import InlineMarkdown from 'common/InlineMarkdown'
import Reference from 'bibliography/domain/Reference'

export default function CompactCitation({
  reference
}: {
  reference: Reference
}) {
  const citation = reference.useContainerCitation
    ? [
        `*${reference.shortContainerTitle}*`,
        ' ',
        reference.collectionNumber ? `${reference.collectionNumber}, ` : '',
        reference.pages,
        ' ',
        reference.hasLinesCited
          ? `\\[l. ${reference.linesCited.join(', ')}\\] `
          : '',
        `(${reference.typeAbbreviation})`
      ].join('')
    : reference.compactCitation
  return <InlineMarkdown source={citation} />
}
