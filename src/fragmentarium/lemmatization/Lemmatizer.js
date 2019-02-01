import React, { Component, Fragment } from 'react'
import { Button } from 'react-bootstrap'
import _ from 'lodash'
import Promise from 'bluebird'
import HelpTrigger from 'common/HelpTrigger'
import ErrorAlert from 'common/ErrorAlert'
import WordLemmatizer from './WordLemmatizer'
import Spinner from 'common/Spinner'
import withData from 'http/withData'

import LemmatizationHelp from './LemmatizationHelp'

import './Lemmatizer.css'

class Lemmatizer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null,
      disabled: false,
      previousTokens: _.cloneDeep(props.data.tokens),
      lemmatization: props.data.applySuggestions()
    }
    this.updatePromise = Promise.resolve()
  }

  get hasChanges () {
    return !_.isEqual(this.state.lemmatization.tokens, this.state.previousTokens)
  }

  componentWillUnmount () {
    this.updatePromise.cancel()
  }

  Row = ({ rowIndex, row }) => (
    <Fragment>
      {this.state.lemmatization.getRowPrefix(rowIndex)}{' '}
      {row.map((token, columnIndex) => <Fragment key={columnIndex}>
        <WordLemmatizer
          fragmentService={this.props.fragmentService}
          token={token}
          onChange={_.partial(this.setLemma, rowIndex, columnIndex)}
          autoFocusLemmaSelect={this.props.autoFocusLemmaSelect} />
        {' '}
      </Fragment>)}
    </Fragment>
  )

  SubmitButton = () => (
    <Button
      onClick={this.submit}
      disabled={this.state.disabled || !this.hasChanges}
      variant='primary'>
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
        lemmatization: this.state.lemmatization.clearSuggestionFlags(),
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
    return <>
      <Spinner loading={_.isNil(this.state.lemmatization) && _.isNil(this.state.error)} />
      {this.state.lemmatization &&
        <Fragment>
          <ol className='Lemmatizer__transliteration'>
            {this.state.lemmatization.tokens.map((row, rowIndex) => (
              <li key={rowIndex} className='Lemmatizer__row'>
                <this.Row rowIndex={rowIndex} row={row} />
              </li>
            ))}
          </ol>
          <HelpTrigger overlay={LemmatizationHelp()} />
          {' '}
          <this.SubmitButton />
        </Fragment>}
      <ErrorAlert error={this.state.error} />
    </>
  }
}

export default withData(
  Lemmatizer,
  props => props.fragmentService.createLemmatization(props.text)
)
