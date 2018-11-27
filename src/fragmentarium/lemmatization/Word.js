import React, { Fragment } from 'react'
import { Button } from 'react-bootstrap'
import _ from 'lodash'

function isClickable (token) {
  return !/x|X|\/|\d+.?\.|\.\.\.|^[#$&$]|^\s*$/.test(token.token)
}

function Word ({ value, columnIndex, rowIndex, onClick }) {
  return (
    <Fragment>
      {isClickable(value)
        ? <Button key={columnIndex} onClick={onClick}>
          {!_.isEmpty(value.uniqueLemma)
            ? <b>{value.token}</b>
            : value.token}
        </Button>
        : <span key={columnIndex}>{value.token}</span>}
      {' '}
    </Fragment>
  )
}

export default Word
