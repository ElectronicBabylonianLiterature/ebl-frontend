// @flow
import React from 'react'
import { Button } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'

import './Word.css'
import type { AtfToken, ReconstructionToken } from '../text'

function Word({
  token,
  reconstructionTokens,
  onClick
}: {
  +token: AtfToken,
  +reconstructionTokens: $ReadOnlyArray<ReconstructionToken>,
  +onClick: (SyntheticEvent<>) => void
}) {
  return token.lemmatizable ? (
    <Button
      onClick={onClick}
      size="sm"
      variant="outline-dark"
      className={classNames({
        Word: true,
        'Word--with-alignment': _.isNumber(token.alignment),
        'Word--with-apparatus': token.hasApparatusEntry
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
