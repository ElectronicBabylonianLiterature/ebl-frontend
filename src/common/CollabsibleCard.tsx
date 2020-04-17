import classNames from 'classnames'
import React, { Component } from 'react'
import _ from 'lodash'
import { Card, Collapse } from 'react-bootstrap'

function CollapseIndicator({ open }) {
  return (
    <i
      data-testid="CollapseIndicator"
      className={classNames({
        fas: true,
        'fa-angle-up': open,
        'fa-angle-down': !open,
      })}
    />
  )
}

export class CollapsibleCard extends Component<
  { label; children; collapsed: boolean },
  { open: boolean }
> {
  private readonly collapseId: string

  constructor(props) {
    super(props)
    this.state = {
      open: !this.props.collapsed,
    }
    this.collapseId = _.uniqueId('List-collapse-')
  }

  render() {
    const toggleState = () => this.setState({ open: !this.state.open })
    return (
      <Card border="light">
        {this.props.label && (
          <Card.Header>
            <span
              className="List__toggle"
              onClick={toggleState}
              aria-controls={this.collapseId}
              aria-expanded={this.state.open}
            >
              {this.props.label} <CollapseIndicator open={this.state.open} />
            </span>
          </Card.Header>
        )}
        <Collapse in={this.state.open}>
          <div id={this.collapseId}>{this.props.children}</div>
        </Collapse>
      </Card>
    )
  }
}
