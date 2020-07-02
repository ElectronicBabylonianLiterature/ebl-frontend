import React, { Fragment } from 'react'
import classNames from 'classnames'
import _ from 'lodash'

import './Word.css'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'

interface Props {
  token: LemmatizationToken
}
const Word = ({ token }: Props): JSX.Element => (
  <span
    className={classNames({
      Word: true,
      'Word--with-lemma': !_.isEmpty(token.uniqueLemma),
      'Word--suggestion': token.suggested,
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
  </span>
)

export default Word
