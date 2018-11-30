import React, { Fragment } from 'react'
import { Button } from 'react-bootstrap'
import _ from 'lodash'

function isClickable (token) {
  return !/x|X|\/|\d+.?\.|\.\.\.|^[#$&$@]|^\s*$/.test(token.value)
}

function Word ({ token, onClick }) {
  return (
    <Fragment>
      {isClickable(token)
        ? <Button onClick={onClick}>
          {!_.isEmpty(token.uniqueLemma)
            ? <b>{token.value}</b>
            : token.value}
        </Button>
        : <span>{token.value}</span>}
      {' '}
    </Fragment>
  )
}

export default Word
