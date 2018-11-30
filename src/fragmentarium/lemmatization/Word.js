import React from 'react'
import { Button } from 'react-bootstrap'
import classNames from 'classnames'
import _ from 'lodash'

import './Word.css'

function isClickable (token) {
  return !/x|X|\/|\d+.?\.|\.\.\.|^[#$&$@]|^\s*$/.test(token.value)
}

function Word ({ token, onClick }) {
  return isClickable(token)
    ? (
      <Button
        onClick={onClick}
        className={classNames({
          Word: true,
          'Word--with-lemma': !_.isEmpty(token.uniqueLemma)
        })}>
        {token.value}
      </Button>
    )
    : <span className='Word'>{token.value}</span>
}

export default Word
