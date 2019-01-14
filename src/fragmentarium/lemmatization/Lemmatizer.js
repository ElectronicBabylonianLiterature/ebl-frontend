import React, { Component, Fragment } from 'react'
import { Button, Popover, OverlayTrigger } from 'react-bootstrap'
import _ from 'lodash'
import Lemmatization from './Lemmatization'
import LemmatizationForm from './LemmatizationForm'
import Word from './Word'

import './Lemmatizer.css'

export default class Lemmatizer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      disabled: false,
      lemmatization: new Lemmatization(props.text)
    }
  }

  FormPopover = (rowIndex, columnIndex, token) => (
    <Popover
      id={`LemmatizationForm-${rowIndex},${columnIndex}`}
      title='Lemmatize'
      className='Lemmatizer__form'>
      <LemmatizationForm
        token={token}
        fragmentService={this.props.fragmentService}
        onChange={_.partial(this.setLemma, rowIndex, columnIndex)}
      />
    </Popover>
  )

  Row = ({ rowIndex, row }) => (
    <Fragment>
      {this.state.lemmatization.getRowPrefix(rowIndex)}{' '}
      {row.map((token, columnIndex) => <Fragment key={columnIndex}>
        <OverlayTrigger
          trigger='click'
          rootClose
          placement='bottom'
          overlay={this.FormPopover(rowIndex, columnIndex, token)}>
          <Word token={token} />
        </OverlayTrigger>
        {' '}
      </Fragment>)}
    </Fragment>
  )

  setLemma = (rowIndex, columnIndex, uniqueLemma) => {
    this.setState({
      ...this.state,
      lemmatization: this.state.lemmatization.setLemma(rowIndex, columnIndex, uniqueLemma)
    })
  }

  submit = () => {
    this.setState({
      ...this.state,
      disabled: true
    })
    this.props.fragmentService.updateLemmatization(
      this.props.number,
      this.state.lemmatization.toDto()
    ).finally(() => {
      this.setState({
        ...this.state,
        disabled: false
      })
    })
  }

  render () {
    return (
      <Fragment>
        <ol className='Lemmatizer__transliteration'>
          {this.state.lemmatization.tokens.map((row, rowIndex) => (
            <li key={rowIndex} className='Lemmatizer__row'>
              <this.Row rowIndex={rowIndex} row={row} />
            </li>
          ))}
        </ol>
        <Button onClick={this.submit} disabled={this.state.disabled} bsStyle='primary'>Save</Button>
      </Fragment>
    )
  }
}
