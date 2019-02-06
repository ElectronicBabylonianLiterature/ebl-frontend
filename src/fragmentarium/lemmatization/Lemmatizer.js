import React, { Component, Fragment } from 'react'
import { Button } from 'react-bootstrap'
import _ from 'lodash'
import HelpTrigger from 'common/HelpTrigger'
import WordLemmatizer from './WordLemmatizer'
import withData from 'http/withData'

import LemmatizationHelp from './LemmatizationHelp'

import './Lemmatizer.css'

class Lemmatizer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      lemmatization: _.cloneDeep(props.data)
    }
  }

  get hasNoChanges () {
    return _.isEqual(this.state.lemmatization.tokens, this.props.data.tokens) &&
      !this.state.lemmatization.tokens.some(row => row.some(token => token.suggested))
  }

  Row = ({ rowIndex, row }) => (
    <Fragment>
      {this.state.lemmatization.getRowPrefix(rowIndex)}{' '}
      {row.map((token, columnIndex) => <Fragment key={columnIndex}>
        <WordLemmatizer
          fragmentService={this.props.fragmentService}
          token={token}
          onChange={_.partial(this.setLemma, rowIndex, columnIndex)} />
        {' '}
      </Fragment>)}
    </Fragment>
  )

  SubmitButton = () => (
    <Button
      onClick={this.submit}
      disabled={this.props.disabled || this.hasNoChanges}
      variant='primary'>
      Save
    </Button>
  )

  setLemma = (rowIndex, columnIndex, uniqueLemma) => {
    this.setState({
      lemmatization: this.state.lemmatization.setLemma(rowIndex, columnIndex, uniqueLemma)
    })
  }

  submit = () => {
    this.props.updateLemmatization(
      this.state.lemmatization
    )
  }

  render () {
    return <>
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
    </>
  }
}

export default withData(
  Lemmatizer,
  props => props.fragmentService.createLemmatization(props.text).then(lemmatization => lemmatization.applySuggestions()),
  {
    shouldUpdate: (prevProps, props) => !_.isEqual(prevProps.text, props.text)
  }
)
