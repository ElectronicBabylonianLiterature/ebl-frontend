import React from 'react'
import _ from 'lodash'

import './Word.css'
import { Token } from 'transliteration/domain/token'
import { AlignmentToken } from 'corpus/domain/alignment'

interface Props {
  token: AlignmentToken
  reconstructionTokens: ReadonlyArray<Token>
}

function Word({ token, reconstructionTokens }: Props): JSX.Element {
  return (
    <>
      {token.value}
      {_.isNumber(token.alignment) && (
        <span className="Word__alignment">
          {reconstructionTokens[Number(token.alignment)].value}
        </span>
      )}
    </>
  )
}

export default Word
