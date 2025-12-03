import React from 'react'
import _ from 'lodash'
import InlineMarkdown from 'common/InlineMarkdown'
import Reference from 'bibliography/domain/Reference'
import Citation from 'bibliography/domain/Citation'
import referencePopover from './referencePopover'

const ReferenceDetails = ({ reference }: { reference: Reference }) => {
  const linesCited =
    reference.linesCited.length > 0
      ? ` [l. ${reference.linesCited.join(', ')}]`
      : ''
  return (
    <span className="reference-popover__interactive">
      {reference.pages}
      {linesCited}
    </span>
  )
}

const PopoverReferenceDetails = referencePopover(ReferenceDetails)

const SingleReferenceEntry = ({ reference }: { reference: Reference }) => {
  return (
    <span className="reference-popover__interactive">
      <InlineMarkdown source={Citation.for(reference).getMarkdown()} />
      <span className="type-abbreviation">
        {` (${reference.typeAbbreviation})`}
      </span>
    </span>
  )
}

const PopoverSingleReference = referencePopover(SingleReferenceEntry)

interface Props {
  references: readonly Reference[]
}

export default function CompactCitation({ references }: Props): JSX.Element {
  const primaryReference = _.head(references)

  if (!primaryReference) {
    return <></>
  }

  if (references.length === 1) {
    return <PopoverSingleReference reference={primaryReference} />
  }

  const headerReference = primaryReference.setPages('').setLinesCited([])
  const headerMarkdown = Citation.for(headerReference)
    .getMarkdown()
    .trim()
    .replace(/:$/, '')

  const hasDetails = references.some(
    (reference) => reference.pages || reference.linesCited.length > 0
  )

  return (
    <>
      <InlineMarkdown source={headerMarkdown} />
      {hasDetails && ': '}
      {references.map((reference, index) => (
        <React.Fragment key={index}>
          {index > 0 && '; '}
          <PopoverReferenceDetails reference={reference} />
        </React.Fragment>
      ))}
      <span className="type-abbreviation">
        {` (${primaryReference.typeAbbreviation})`}
      </span>
    </>
  )
}
