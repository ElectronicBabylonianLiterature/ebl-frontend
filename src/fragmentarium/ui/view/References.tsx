import React, { Component } from 'react'
import { Button, Form } from 'react-bootstrap'
import _ from 'lodash'
import Reference from 'bibliography/domain/Reference';
import ReferencesForm, {
  defaultReference
} from 'bibliography/ui/ReferencesForm'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry';

type Props = {
  searchBibliography(query: string): readonly BibliographyEntry[]
  references: readonly Reference[]
  disabled: boolean
}

function References({
  searchBibliography,
  references,
  onChange,
  onSubmit,
  disabled
}: Props & { onChange(references: readonly Reference[]): void; onSubmit(event: React.FormEvent<HTMLFormElement>): void }) {
  return (
    <Form onSubmit={onSubmit} data-testid="references-form">
      <ReferencesForm
        value={references}
        onChange={onChange}
        searchBibliography={searchBibliography}
      />
      <Button type="submit" variant="primary" disabled={disabled}>
        Save
      </Button>
    </Form>
  )
}

type State = {
  references: readonly Reference[];
}

type ControllerProps = {
  updateReferences(references: readonly Reference[]): any
} & Props
export default class ReferencesController extends Component<ControllerProps, State> {
  static defaultProps = {
    disabled: false
  }

  constructor(props: ControllerProps) {
    super(props)
    this.state = {
      references: _.isEmpty(props.references)
        ? [defaultReference()]
        : props.references
    }
  }

  handleChange = (value: readonly Reference[]) => this.setState({ references: value })

  submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    this.props.updateReferences(this.state.references)
  }

  render() {
    return (
      <>
        <References
          searchBibliography={this.props.searchBibliography}
          references={this.state.references}
          onChange={this.handleChange}
          onSubmit={this.submit}
          disabled={
            this.props.disabled ||
            _.isEqual(this.props.references, this.state.references)
          }
        />
      </>
    )
  }
}
