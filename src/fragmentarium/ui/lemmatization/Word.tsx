import React, { Fragment, FunctionComponent } from 'react'
import { Button } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'

import './Word.css'
import { LemmatizationToken } from 'fragmentarium/domain/Lemmatization'

interface Props {
  token: LemmatizationToken
  onClick: any
}
const Word: FunctionComponent<Props> = ({ token, onClick }: Props) => {
  return token.lemmatizable ? (
    <Button
      onClick={onClick}
      size="sm"
      variant="outline-dark"
      className={classNames({
        Word: true,
        'Word--with-lemma': !_.isEmpty(token.uniqueLemma),
        'Word--suggestion': token.suggested
      })}
    >
      {token.value}
      {_.isArray(token.uniqueLemma) && (
        <span className="Word__lemmatization">
          {token.uniqueLemma.map((lemma, index) => (
            <Fragment key={index}>
              {index > 0 && ', '}
              <span className="Word__lemma">{lemma.lemma}</span>
              {lemma.homonym}
            </Fragment>
          ))}
        </span>
      )}
    </Button>
  ) : (
    <span className="Word">{token.value}</span>
  )
}

export default Word
