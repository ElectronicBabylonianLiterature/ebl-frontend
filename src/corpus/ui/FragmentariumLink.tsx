import React from 'react'
import FragmentLink from 'fragmentarium/ui/FragmentLink'

export default function FragmentariumLink({
  item,
}: {
  item: { museumNumber: string; isInFragmentarium: boolean; accession?: string }
}): JSX.Element {
  return item.isInFragmentarium ? (
    <FragmentLink number={item.museumNumber}>{item.museumNumber}</FragmentLink>
  ) : (
    <>{item.museumNumber || item.accession}</>
  )
}
