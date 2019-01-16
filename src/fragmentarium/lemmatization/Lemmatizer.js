import React, { Component, Fragment } from 'react'
import { Button, Popover, OverlayTrigger } from 'react-bootstrap'
import _ from 'lodash'
import ErrorAlert from 'common/ErrorAlert'
import LemmatizationForm from './LemmatizationForm'
import Word from './Word'
import Spinner from 'common/Spinner'

import './Lemmatizer.css'

export default class Lemmatizer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null,
      disabled: true,
      lemmatization: null,
      previousTokens: null
    }
    this.updatePromise = props.fragmentService
      .createLemmatization(props.text)
      .then(lemmatization => this.setState({
        error: null,
        disabled: false,
        lemmatization: lemmatization,
        previousTokens: _.cloneDeep(lemmatization.tokens)
      }))
  }

  get hasChanges () {
    return !_.isEqual(this.state.lemmatization.tokens, this.state.previousTokens)
  }

  componentWillUnmount () {
    this.updatePromise.cancel()
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
        autoFocus={this.props.autoFocusLemmaSelect}
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
          placement='top'
          overlay={this.FormPopover(rowIndex, columnIndex, token)}>
          <Word token={token} />
        </OverlayTrigger>
        {' '}
      </Fragment>)}
    </Fragment>
  )

  SubmitButton = () => (
    <Button
      onClick={this.submit}
      disabled={this.state.disabled || !this.hasChanges}
      bsStyle='primary'>
      Save
    </Button>
  )

  setLemma = (rowIndex, columnIndex, uniqueLemma) => {
    this.setState({
      ...this.state,
      lemmatization: this.state.lemmatization.setLemma(rowIndex, columnIndex, uniqueLemma)
    })
  }

  submit = () => {
    this.updatePromise.cancel()
    this.setState({
      ...this.state,
      error: null,
      disabled: true
    })
    this.updatePromise = this.props.fragmentService.updateLemmatization(
      this.props.number,
      this.state.lemmatization.toDto()
    ).then(() => {
      this.setState({
        ...this.state,
        disabled: false,
        previousTokens: _.cloneDeep(this.state.lemmatization.tokens)
      })
    }).catch(error => {
      this.setState({
        ...this.state,
        error: error,
        disabled: false
      })
    })
  }

  render () {
    return _.isNil(this.state.lemmatization)
      ? <Spinner />
      : <Fragment>
        <ol className='Lemmatizer__transliteration'>
          {this.state.lemmatization.tokens.map((row, rowIndex) => (
            <li key={rowIndex} className='Lemmatizer__row'>
              <this.Row rowIndex={rowIndex} row={row} />
            </li>
          ))}
        </ol>
        <this.SubmitButton />
        <ErrorAlert error={this.state.error} />
      </Fragment>
  }
}
