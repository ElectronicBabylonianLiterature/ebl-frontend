import React, { ChangeEvent, Component, ReactNode } from 'react'
import { FormGroup, FormLabel, FormControl } from 'react-bootstrap'
import _ from 'lodash'
interface Props {
  value: readonly string[]
  onChange: (value: readonly string[]) => void
  separator: string
  children?: ReactNode
}
class ArrayInput extends Component<Props, { id: string }> {
  private readonly id: string

  constructor(props: Props) {
    super(props)
    this.id = _.uniqueId('ArrayInput-')
  }

  onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value
    const array = _.isEmpty(value) ? [] : value.split(this.props.separator)
    this.props.onChange(array)
  }

  render(): JSX.Element {
    return (
      <FormGroup controlId={this.id}>
        <FormLabel>{this.props.children}</FormLabel>
        <FormControl
          type="text"
          value={this.props.value.join(this.props.separator)}
          onChange={this.onChange}
        />
      </FormGroup>
    )
  }
}

export default ArrayInput
