import React, { Fragment } from 'react'

export default function UncuratedReferences ({ uncuratedReferences }) {
  return <Fragment>{uncuratedReferences.count()} uncurated references</Fragment>
}
