import React from 'react'
import { Button } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'

import './Word.css'

function Word({ token, onClick, reconstructionTokens }) {
  return token.lemmatizable ? (
    <Button
      onClick={onClick}
      size="sm"
      variant="outline-dark"
      className={classNames({
        Word: true,
        'Word--with-alignment': _.isNumber(token.alignment),
        'Word--suggestion': token.suggested
      })}
    >
      {token.value}
      {_.isNumber(token.alignment) && (
        <span className="Word__alignment">
          {reconstructionTokens[token.alignment].value}
        </span>
      )}
    </Button>
  ) : (
    <span className="Word">{token.value}</span>
  )
}

export default Word
