import React, { Component } from 'react'
import _ from 'lodash'
import { Form, Col } from 'react-bootstrap'
import MuseumNumber, {
  museumNumberToString,
} from 'fragmentarium/domain/MuseumNumber'
import Select from 'react-select'
import { Provenances, provenances } from 'corpus/domain/provenance'

const ExcavationSites = {
  ..._.omit(Provenances, 'Standard Text'),
  '': {
    name: '',
    abbreviation: '',
    parent: null,
  },
}

type SiteKey = keyof typeof ExcavationSites
type ExcavationSite = typeof ExcavationSites[SiteKey]

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
  constructor(props: Props) {
    super(props)
    this.state = {
      excavationNumber: props.excavationNumber
        ? museumNumberToString(props.excavationNumber)
        : '',
      site: props.site?.name || '',
      isRegularExcavation: props.isRegularExcavation || true,
    }
  }

  updateExcavationNumber = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    this.setState({
      ...this.state,
      excavationNumber: event.target.value,
    })
  }

  updateSite = (event): void => {
    this.setState({
      ...this.state,
      site: event.value,
    })
  }

  updateIsRegularExcavation = (event): void => {
    this.setState({
      ...this.state,
      isRegularExcavation: event.value,
    })
  }

  render(): JSX.Element {
    const defaultOption = {
      value: '',
      label: '',
    }
    const options = provenances.map((site) => ({
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
              options={[...options, defaultOption]}
              value={{
                value: this.state.site,
                label: this.state.site,
              }}
              onChange={this.updateSite}
              isSearchable={true}
            />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group>
            <Form.Check
              inline
              type="checkbox"
              id={_.uniqueId('secondLineOfParallelism-')}
              label="Regular Excavation"
              checked={this.state.isRegularExcavation}
              onChange={this.updateIsRegularExcavation}
            />
          </Form.Group>
        </Form.Row>
      </Form>
    )
  }
}
