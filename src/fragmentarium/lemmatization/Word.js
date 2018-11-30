import React, { Fragment } from 'react'
import { Button } from 'react-bootstrap'
import _ from 'lodash'

function isClickable (token) {
  return !/x|X|\/|\d+.?\.|\.\.\.|^[#$&$@]|^\s*$/.test(token.value)
}

function LemmaIndicator ({ token, children }) {
  return !_.isEmpty(token.uniqueLemma)
    ? <b>{children}</b>
    : children
}

function Word ({ token, onClick }) {
  return (
    <Fragment>
      {isClickable(token)
        ? <Button onClick={onClick}>
          <LemmaIndicator token={token}>{token.value}</LemmaIndicator>
        </Button>
        : <span>{token.value}</span>}
      {' '}
    </Fragment>
  )
}

export default Word
