import React from 'react'
import { Button } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'

import './Word.css'
import { Token } from 'transliteration/domain/token'

function Word({
  token,
  reconstructionTokens,
  onClick,
}: {
  readonly token: Token
  readonly reconstructionTokens: ReadonlyArray<Token>
  readonly onClick: (event: React.MouseEvent) => void
}): JSX.Element {
  return token.lemmatizable ? (
    <Button
      onClick={onClick}
      size="sm"
      variant="outline-dark"
      className={classNames({
        Word: true,
        'Word--with-alignment': _.isNumber(token.alignment),
      })}
    >
      {token.value}
      {_.isNumber(token.alignment) && (
        <span className="Word__alignment">
          {reconstructionTokens[Number(token.alignment)].value}
        </span>
      )}
    </Button>
  ) : (
    <span className="Word">{token.value}</span>
  )
}

export default Word
