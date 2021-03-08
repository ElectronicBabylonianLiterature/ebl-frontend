import classNames from 'classnames'
import React, { Component, ReactNode } from 'react'
import _ from 'lodash'
import { Card, Collapse } from 'react-bootstrap'

function CollapseIndicator({ open }: { open: boolean }): JSX.Element {
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
interface Props {
  label: ReactNode
  children: ReactNode
  collapsed: boolean
}
export class CollapsibleCard extends Component<Props, { open: boolean }> {
  private readonly collapseId: string

  constructor(props: Props) {
    super(props)
    this.state = {
      open: !this.props.collapsed,
    }
    this.collapseId = _.uniqueId('List-collapse-')
  }

  render(): JSX.Element {
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
