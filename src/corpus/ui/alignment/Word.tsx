import React from 'react'
import _ from 'lodash'

import './Word.css'
import { Token } from 'transliteration/domain/token'
import { AlignmentToken } from 'corpus/domain/alignment'
import classNames from 'classnames'

interface Props {
  token: AlignmentToken
  reconstructionTokens: ReadonlyArray<Token>
}

function Word({ token, reconstructionTokens }: Props): JSX.Element {
  return (
    <span
      className={classNames({
        Word: true,
        'Word--with-alignment': !_.isNil(token.alignment),
        'Word--suggestion': token.suggested,
      })}
    >
      {token.value}
      {_.isNumber(token.alignment) && (
        <span className="Word__alignment">
          {reconstructionTokens[Number(token.alignment)].value}
        </span>
      )}
    </span>
  )
}

export default Word
