import React, { Fragment } from 'react'
import { Button } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'

import './Word.css'

function Word ({ token, onClick }) {
  return token.lemmatizable
    ? (
      <Button
        onClick={onClick}
        className={classNames({
          Word: true,
          'Word--with-lemma': !_.isEmpty(token.uniqueLemma),
          'Word--suggestion': token.suggested
        })}>
        {token.value}
        {_.isArray(token.uniqueLemma) && <span className='Word__lemmatization'>
          {token.uniqueLemma.map((lemma, index) => (
            <Fragment key={index}>
              {index > 0 && ', '}
              <span className='Word__lemma'>{lemma.lemma}</span>
              {lemma.homonym}
            </Fragment>
          ))}
        </span>}
      </Button>
    )
    : <span className='Word'>{token.value}</span>
}

export default Word
