import React from 'react'
import romans from 'romans'
import { TextId } from 'corpus/domain/text'

export default function DisplayTextId({ id }: { id: TextId }): JSX.Element {
  return (
    <>
      {id.genre} {id.category && romans.romanize(id.category)}.{id.index}
    </>
  )
}
