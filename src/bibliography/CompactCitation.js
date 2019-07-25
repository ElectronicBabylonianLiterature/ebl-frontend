// @flow
import React from 'react'
import Reference from './Reference'

export default function CompactCitation({
  reference
}: {
  reference: Reference
}) {
  return <>{reference.compactCitation}</>
}
