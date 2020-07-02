import React, { Fragment } from 'react'
import { Button } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'

import './Word.css'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'

interface Props {
  token: LemmatizationToken
  active?: boolean
  onClick(): unknown
}
const Word = React.forwardRef<HTMLButtonElement & Button, Props>(function word(
  { token, onClick, active }: Props,
  ref
) {
  return token.lemmatizable ? (
    <Button
      ref={ref}
      onClick={onClick}
      size="sm"
      variant="outline-dark"
      className={classNames({
        Word: true,
        'Word--with-lemma': !_.isEmpty(token.uniqueLemma),
        'Word--suggestion': token.suggested,
      })}
      active={active}
    >
      {token.value}
      {_.isArray(token.uniqueLemma) && (
        <span ref={ref} className="Word__lemmatization">
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
})

export default Word
