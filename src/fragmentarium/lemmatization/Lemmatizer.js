import React, { Component, Fragment } from 'react'
import { Button } from 'react-bootstrap'
import _ from 'lodash'
import LemmatizationForm from './LemmatizationForm'
import Word from './Word'

import './Lemmatizer.css'

export default class Lemmatizer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      disabled: false,
      selectedToken: null,
      columnIndex: 0,
      rowIndex: 0,
      tokens: props.lemmatization
    }
  }

  setLemma = selectedOption => {
    const newTokens = _.cloneDeep(this.state.tokens)
    const token = newTokens[this.state.rowIndex][this.state.columnIndex]
    token.uniqueLemma = selectedOption.map(option => option.value)
    this.setState({
      ...this.state,
      tokens: newTokens
    })
  }

  submit = () => {
    this.setState({
      ...this.state,
      disabled: true
    })
    this.props.fragmentService.updateLemmatization(
      this.props.number,
      this.state.tokens
    ).finally(() => {
      this.setState({
        ...this.state,
        disabled: false
      })
    })
  }

  render () {
    return <div>
      {this.state.selectedToken &&
        <LemmatizationForm
          token={this.state.selectedToken}
          fragmentService={this.props.fragmentService}
          onChange={this.setLemma}
          multi
        />
      }
      <ol className='Lemmatizer__transliteration'>
        {this.state.tokens.map((row, rowIndex) => (
          <li key={rowIndex}>
            {row.map((token, columnIndex) => <Fragment key={columnIndex}>
              <Word
                columnIndex={columnIndex}
                rowIndex={rowIndex}
                token={token}
                onClick={() => this.setState({
                  ...this.state,
                  columnIndex,
                  rowIndex,
                  selectedToken: token
                })} />
              {' '}
            </Fragment>)}
          </li>
        ))}
      </ol>
      <Button onClick={this.submit} disabled={this.state.disabled} bsStyle='primary'>Save</Button>
    </div>
  }
}
