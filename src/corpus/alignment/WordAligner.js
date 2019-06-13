import React, { Component } from 'react'
import { Popover, Overlay, Form } from 'react-bootstrap'
import _ from 'lodash'
import Word from './Word'

import './WordAligner.css'
import { produce } from 'immer'

export default class WordAligner extends Component {
  constructor(props) {
    super(props)
    this.popOverId = _.uniqueId('AlignmentPopOver-')
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

  handleChange = event => {
    this.props.onChange(
      produce(this.props.token, draft => {
        const alignmentIndex = event.target.value
        console.log(alignmentIndex)
        draft.alignment = /\d+/.test(alignmentIndex)
          ? Number(alignmentIndex)
          : null
      })
    )
    this.hide()
  }

  hide = () => {
    this.setState({ show: false })
  }

  render() {
    return (
      <span className="WordAligner">
        <Word
          token={this.props.token}
          onClick={this.handleClick}
          reconstructionTokens={this.props.reconstructionTokens}
        />
        <Overlay
          rootClose
          onHide={this.hide}
          show={this.state.show}
          target={this.state.target}
          placement="top"
          container={this}
        >
          <Popover
            id={this.popOverId}
            title="Align"
            className="WordAligner__form"
          >
            <Form.Group controlId={_.uniqueId('WordAligner-')}>
              <Form.Label>Ideal word</Form.Label>
              <Form.Control
                as="select"
                value={this.props.token.alignment}
                onChange={this.handleChange}
              >
                <option value="">--</option>
                {this.props.reconstructionTokens.map(
                  (reconstructionToken, index) => (
                    <option
                      key={index}
                      value={index}
                      disabled={reconstructionToken.type !== 'AkkadianWord'}
                    >
                      {' '}
                      {reconstructionToken.value}
                    </option>
                  )
                )}
              </Form.Control>
            </Form.Group>
          </Popover>
        </Overlay>
      </span>
    )
  }
}
