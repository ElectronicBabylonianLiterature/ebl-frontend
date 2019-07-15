// @flow
import React, { Component } from 'react'
import { Popover, Overlay, Form } from 'react-bootstrap'
import _ from 'lodash'
import Word from './Word'

import './WordAligner.css'
// $FlowFixMe
import { Draft, produce } from 'immer'
import type { AtfToken, ReconstructionToken } from '../text'

type Props = {
  +token: AtfToken,
  +reconstructionTokens: $ReadOnlyArray<ReconstructionToken>,
  +onChange: AtfToken => void
}

class AlignmentForm extends Component<Props> {
  handleAlignmentChange = (event: SyntheticEvent<HTMLSelectElement>) => {
    this.props.onChange(
      produce(this.props.token, (draft: Draft<AtfToken>) => {
        const alignmentIndex = (event.target: any).value
        draft.alignment = /\d+/.test(alignmentIndex)
          ? Number(alignmentIndex)
          : null
      })
    )
  }

  render() {
    return (
      <>
        <Form.Group controlId={_.uniqueId('WordAligner-Select-')}>
          <Form.Label>Ideal word</Form.Label>
          <Form.Control
            as="select"
            value={this.props.token.alignment}
            onChange={this.handleAlignmentChange}
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
      </>
    )
  }
}

type State = {
  +target?: EventTarget,
  +show: boolean
}

export default class WordAligner extends Component<Props, State> {
  +popOverId: string

  constructor(props: Props) {
    super(props)
    this.popOverId = _.uniqueId('AlignmentPopOver-')
    this.state = {
      show: false
    }
  }

  handleClick = (event: SyntheticEvent<>) => {
    this.setState({
      target: event.target,
      show: !this.state.show
    })
  }

  handleChange = (value: AtfToken) => {
    this.props.onChange(value)
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
            <AlignmentForm
              token={this.props.token}
              reconstructionTokens={this.props.reconstructionTokens}
              onChange={this.handleChange}
            />
          </Popover>
        </Overlay>
      </span>
    )
  }
}
