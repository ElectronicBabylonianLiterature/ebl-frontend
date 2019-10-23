import React from 'react'
import { Button } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'

import './Word.css'
import { AtfToken, ReconstructionToken } from 'corpus/text'

function Word({
  token,
  reconstructionTokens,
  onClick
}: {
  readonly token: AtfToken;
  readonly reconstructionTokens: ReadonlyArray<ReconstructionToken>;
  readonly onClick: (x0: any) => any;
}) {
  return token.lemmatizable ? (
    <Button
      onClick={onClick}
      size="sm"
      variant="outline-dark"
      className={classNames({
        Word: true,
        'Word--with-alignment': _.isNumber(token.alignment)
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
