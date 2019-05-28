import React, { Component } from 'react'
import { Popover, Overlay } from 'react-bootstrap'
import _ from 'lodash'
import LemmatizationForm from './LemmatizationForm'
import Word from './Word'

import './WordLemmatizer.css'

export default class WordLemmatizer extends Component {
  constructor (props) {
    super(props)
    this.popOverId = _.uniqueId('LemmatizationPopOver-')
    this.state = {
      show: false
    }
  }

  handleClick = e => {
    this.setState({
      target: e.target,
      show: !this.state.show
    })
  }

  handleCange = uniqueLemma => {
    this.props.onChange(uniqueLemma)
    this.hide()
  }

  hide = () => {
    this.setState({ show: false })
  }

  render () {
    return (
      <span className='WordLemmatizer'>
        <Word token={this.props.token} onClick={this.handleClick} />
        <Overlay
          rootClose
          onHide={this.hide}
          show={this.state.show}
          target={this.state.target}
          placement='top'
          container={this}
        >
          <Popover
            id={this.popOverId}
            title='Lemmatize'
            className='WordLemmatizer__form'
          >
            <LemmatizationForm
              token={this.props.token}
              fragmentService={this.props.fragmentService}
              onChange={this.handleCange}
            />
          </Popover>
        </Overlay>
      </span>
    )
  }
}
