import React, { Component, Fragment } from 'react'
import { Button, Popover, OverlayTrigger } from 'react-bootstrap'
import _ from 'lodash'
import LemmatizationForm from './LemmatizationForm'
import Word from './Word'

import './Lemmatizer.css'

export default class Lemmatizer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      disabled: false,
      tokens: props.text.lines.map(line => line.content)
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

  setLemma = (rowIndex, columnIndex, selectedOption) => {
    const newTokens = _.cloneDeep(this.state.tokens)
    const token = newTokens[rowIndex][columnIndex]
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
      this.state.tokens.map(row => [
        ...row.map(token => _.pick(token, 'value', 'uniqueLemma')
        )
      ])
    ).finally(() => {
      this.setState({
        ...this.state,
        disabled: false
      })
    })
  }

  render () {
    return (
      <div>
        <ol className='Lemmatizer__transliteration'>
          {this.state.tokens.map((row, rowIndex) => (
            <li key={rowIndex} className='Lemmatizer__row'>
              {this.props.text.lines[rowIndex].prefix}
              {row.map((token, columnIndex) => <Fragment key={columnIndex}>
                <OverlayTrigger
                  trigger='click'
                  rootClose
                  placement='bottom'
                  overlay={this.FormPopover(rowIndex, columnIndex, token)}>
                  <Word
                    columnIndex={columnIndex}
                    rowIndex={rowIndex}
                    token={token} />
                </OverlayTrigger>
                {' '}
              </Fragment>)}
            </li>
          ))}
        </ol>
        <Button onClick={this.submit} disabled={this.state.disabled} bsStyle='primary'>Save</Button>
      </div>
    )
  }
}
