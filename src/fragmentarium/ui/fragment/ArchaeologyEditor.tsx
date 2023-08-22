import React, { Component } from 'react'
import _ from 'lodash'
import { Form, Col, Button } from 'react-bootstrap'
import MuseumNumber, {
  museumNumberToString,
} from 'fragmentarium/domain/MuseumNumber'
import Select from 'react-select'
import { Provenances } from 'corpus/domain/provenance'

const excavationSites = {
  ..._.omit(Provenances, 'Standard Text'),
  '': {
    name: '',
    abbreviation: '',
    parent: null,
  },
}

type SiteKey = keyof typeof excavationSites
type ExcavationSite = typeof excavationSites[SiteKey]

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

  updateExcavationNumber = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const updatedNumber = event.target.value
    this.isDirty = updatedNumber !== this.originalState.excavationNumber
    this.setState({
      excavationNumber: updatedNumber || this.originalState.excavationNumber,
    })
  }

  updateSite = (event): void => {
    const updatedSite = event?.value || ''
    this.isDirty = updatedSite !== this.originalState.site
    this.setState({
      site: updatedSite,
    })
  }

  updateIsRegularExcavation = (event): void => {
    const updatedIsRegularExcavation = event.target.checked
    this.isDirty =
      updatedIsRegularExcavation !== this.originalState.isRegularExcavation
    this.setState({
      isRegularExcavation: updatedIsRegularExcavation,
    })
  }

  render(): JSX.Element {
    const defaultOption = {
      value: '',
      label: '-',
    }
    const options = _.values(excavationSites).map((site) => ({
      value: site.name,
      label: site.name,
    }))
    return (
      <Form>
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
              options={[defaultOption, ...options]}
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
              id={_.uniqueId('secondLineOfParallelism-')}
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
