import React, { Component } from 'react'
import { Popover, Overlay, Form } from 'react-bootstrap'
import _ from 'lodash'
import Word from './Word'

import './WordAligner.css'
import produce, { Draft } from 'immer'

import { ReconstructionToken } from 'corpus/domain/text'
import { Token } from 'transliteration/domain/token'

interface Props {
  readonly token: Token
  readonly reconstructionTokens: ReadonlyArray<ReconstructionToken>
  readonly onChange: (token: Token) => void
}

class AlignmentForm extends Component<Props> {
  handleAlignmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onChange(
      produce(this.props.token, (draft: Draft<Token>) => {
        const alignmentIndex = event.target.value
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
            value={String(this.props.token.alignment)}
            onChange={this.handleAlignmentChange}
          >
            <option value="">--</option>
            {this.props.reconstructionTokens.map((reconstructionToken, index) =>
              ['AkkadianWord', 'Word'].includes(reconstructionToken.type) ? (
                <option key={index} value={index}>
                  {' '}
                  {reconstructionToken.value}
                </option>
              ) : null
            )}
          </Form.Control>
        </Form.Group>
      </>
    )
  }
}

interface State {
  readonly target?
  readonly show: boolean
}

export default class WordAligner extends Component<Props, State> {
  readonly popOverId: string

  constructor(props: Props) {
    super(props)
    this.popOverId = _.uniqueId('AlignmentPopOver-')
    this.state = {
      show: false,
    }
  }

  handleClick = (event: React.MouseEvent): void => {
    this.setState({
      target: event.target,
      show: !this.state.show,
    })
  }

  handleChange = (value: Token): void => {
    this.props.onChange(value)
    this.hide()
  }

  hide = (): void => {
    this.setState({ show: false })
  }

  render(): JSX.Element {
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
        >
          <Popover
            id={this.popOverId}
            title="Align"
            className="WordAligner__form"
          >
            <Popover.Content>
              <AlignmentForm
                token={this.props.token}
                reconstructionTokens={this.props.reconstructionTokens}
                onChange={this.handleChange}
              />
            </Popover.Content>
          </Popover>
        </Overlay>
      </span>
    )
  }
}
