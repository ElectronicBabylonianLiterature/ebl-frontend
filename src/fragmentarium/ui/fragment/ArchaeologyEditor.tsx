import React, { ChangeEvent, Component, FormEvent } from 'react'
import _ from 'lodash'
import { Form, Col, Button } from 'react-bootstrap'
import MuseumNumber, {
  museumNumberToString,
} from 'fragmentarium/domain/MuseumNumber'
import Select, { ValueType } from 'react-select'
import {
  ArchaeologyDto,
  ExcavationSite,
  excavationSites,
} from 'fragmentarium/domain/archaeology'

interface Props {
  excavationNumber?: MuseumNumber
  site?: ExcavationSite
  isRegularExcavation?: boolean
}

interface State {
  excavationNumber: string
  site: string
  isRegularExcavation: boolean
}

const excavationOptions = [
  {
    value: '',
    label: '-',
  },
  ..._.values(excavationSites).map((site) => ({
    value: site.name,
    label: site.name,
  })),
]

export default class ArchaeologyEditor extends Component<Props, State> {
  private isDirty = false
  private originalState: State

  constructor(props: Props) {
    super(props)
    this.state = {
      excavationNumber: props.excavationNumber
        ? museumNumberToString(props.excavationNumber)
        : '',
      site: props.site?.name || '',
      isRegularExcavation: props.isRegularExcavation ?? true,
    }
    this.originalState = { ...this.state }
  }

  updateState = (property: string) => (value: string | boolean): void => {
    const updatedState = {
      ...this.state,
      [property]: value,
    }
    this.isDirty = !_.isEqual(this.state, updatedState)
    this.setState(updatedState)
  }
  updateExcavationNumber = (event: React.ChangeEvent<HTMLInputElement>): void =>
    this.updateState('excavationNumber')(event.target.value)

  updateSite = (
    event: ValueType<typeof excavationOptions[number], false>
  ): void => this.updateState('site')(event?.value || '')

  updateIsRegularExcavation = (event: ChangeEvent<HTMLInputElement>): void =>
    this.updateState('isRegularExcavation')(event.target.checked)

  submit = (event: FormEvent<HTMLElement>): void => {
    // if there are any updates, create ArchaeologyDto and call update function
    const updates: Partial<ArchaeologyDto> = {}
    console.log(updates)
    event.preventDefault()
  }

  render(): JSX.Element {
    return (
      <Form onSubmit={this.submit}>
        <Form.Row>
          <Form.Group as={Col} controlId={_.uniqueId('excavationNumber-')}>
            <Form.Label>Excavation number</Form.Label>
            <Form.Control
              type="text"
              value={this.state.excavationNumber}
              onChange={this.updateExcavationNumber}
            />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} controlId={_.uniqueId('excavationSite-')}>
            <Form.Label>Excavation site</Form.Label>
            <Select
              aria-label="select-site"
              options={excavationOptions}
              value={{
                value: this.state.site,
                label: this.state.site,
              }}
              onChange={this.updateSite}
              isSearchable={true}
              isClearable
            />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group>
            <Form.Check
              type="checkbox"
              id={_.uniqueId('regularExcavation-')}
              label="Regular Excavation"
              checked={this.state.isRegularExcavation}
              onChange={this.updateIsRegularExcavation}
            />
          </Form.Group>
        </Form.Row>
        <Button variant="primary" type="submit" disabled={!this.isDirty}>
          Save
        </Button>
      </Form>
    )
  }
}
