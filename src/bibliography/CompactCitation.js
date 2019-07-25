// @flow
import React from 'react'
import _ from 'lodash'
import Reference from './Reference'

export default function CompactCitation({
  reference
}: {
  reference: Reference
}) {
  return <>{reference.compactCitation}</>
}
