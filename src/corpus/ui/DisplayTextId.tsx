import React from 'react'
import { TextId, textIdToString } from 'transliteration/domain/text-id'

export default function DisplayTextId({ id }: { id: TextId }): JSX.Element {
  return (
    <>
      {id.genre} {textIdToString(id)}
    </>
  )
}
