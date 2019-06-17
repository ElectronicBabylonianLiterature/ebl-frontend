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

  handleChange = (event: SyntheticEvent<HTMLSelectElement>) => {
    this.props.onChange(
      produce(this.props.token, (draft: Draft<AtfToken>) => {
        const alignmentIndex = (event.target: any).value
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
