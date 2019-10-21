import React, { Component } from 'react'
import List from 'common/List'
import { FormGroup } from 'react-bootstrap'

import AmplifiedMeaningInput from './AmplifiedMeaningInput'

class AmplifiedMeaningList extends Component<{entry: boolean, children, value, onChange}> {
  static defaultProps = {
    entry: false
  }
  get noun() {
    return this.props.entry ? 'entry' : 'amplified meaning'
  }

  get defaultValue() {
    return this.props.entry
      ? { meaning: '', vowels: [] }
      : { key: '', meaning: '', vowels: [], entries: [] }
  }

  render() {
    return (
      <FormGroup>
        <List
          label={this.props.children}
          value={this.props.value}
          onChange={this.props.onChange}
          noun={this.noun}
          defaultValue={this.defaultValue}
          ordered={this.props.entry}
        >
          {(entry, onChange) => (
            <AmplifiedMeaningInput
              onChange={onChange}
              value={entry}
              entry={this.props.entry}
            />
          )}
        </List>
      </FormGroup>
    )
  }
}

export default AmplifiedMeaningList
