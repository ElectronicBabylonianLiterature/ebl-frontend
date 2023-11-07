import React, { ChangeEvent, Component, FormEvent } from 'react'
import _ from 'lodash'
import { Form, Col, Button } from 'react-bootstrap'
import Select, { ValueType } from 'react-select'
import {
  Archaeology,
  ArchaeologyDto,
  Findspot,
  SiteKey,
  excavationSites,
} from 'fragmentarium/domain/archaeology'
import { Fragment } from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import { FindspotService } from 'fragmentarium/application/FindspotService'

interface Props {
  archaeology?: Archaeology
  updateArchaeology: (archaeology: ArchaeologyDto) => Promise<Fragment>
  findspots: readonly Findspot[]
  disabled?: boolean
}

interface State {
  excavationNumber: string
  site: SiteKey
  isRegularExcavation: boolean
  findspotId: number | null
  findspot: Findspot | null
  error: Error | null
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

class ArchaeologyEditor extends Component<Props, State> {
  private isDirty = false
  private originalState: State
  private updateArchaeology: (archaeology: ArchaeologyDto) => Promise<Fragment>
  private findspots: ReadonlyMap<number, Findspot>
  private findspotOptions

  constructor(props: Props) {
    super(props)
    const archaeology = props.archaeology || {}

    this.state = {
      excavationNumber: archaeology.excavationNumber || '',
      site: (archaeology.site?.name || '') as SiteKey,
      isRegularExcavation: archaeology.isRegularExcavation ?? true,
      error: null,
      findspotId: archaeology.findspotId || null,
      findspot: archaeology.findspot || null,
    }
    this.originalState = { ...this.state }
    this.updateArchaeology = props.updateArchaeology

    this.findspots = new Map(
      props.findspots.map((findspot) => [findspot.id, findspot])
    )
    this.findspotOptions = props.findspots.map((findspot) => ({
      value: findspot.id,
      label: findspot.toString(),
    }))
  }

  updateState = (property: string) => (
    value: string | boolean | number | Findspot | null
  ): void => {
    const updatedState = {
      ...this.state,
      [property]: value,
    }
    this.isDirty = !_.isEqual(this.originalState, updatedState)
    this.setState(updatedState)
  }
  updateFindspotState = (
    findspotId: number | null,
    findspot: Findspot | null
  ): void => {
    this.updateState('findspotId')(findspotId)
    this.updateState('findspot')(findspot)
  }

  updateExcavationNumber = (event: ChangeEvent<HTMLInputElement>): void =>
    this.updateState('excavationNumber')(event.target.value)

  updateSite = (
    event: ValueType<typeof excavationOptions[number], false>
  ): void => this.updateState('site')(event?.value || '')

  updateIsRegularExcavation = (event: ChangeEvent<HTMLInputElement>): void =>
    this.updateState('isRegularExcavation')(event.target.checked)

  updateFindspot = (
    event: ValueType<typeof this.findspotOptions[number], false>
  ): void => {
    if (_.isNull(event)) {
      this.updateFindspotState(null, null)
    } else {
      this.updateFindspotState(
        event.value,
        this.findspots.get(event.value) || null
      )
    }
  }

  submit = (event: FormEvent<HTMLElement>): void => {
    event.preventDefault()

    this.updateArchaeology({
      ..._.omitBy(
        { ...this.state, error: null },
        (value) => _.isNil(value) || value === ''
      ),
    })
      .then((_updatedFragment) => {
        this.originalState = { ...this.state }
        this.isDirty = false
        this.setState(this.originalState)
      })
      .catch((error) =>
        this.setState({
          ...this.state,
          error: error,
        })
      )
  }

  renderExcavationNumberForm = (): JSX.Element => (
    <Form.Group as={Col} controlId={_.uniqueId('excavationNumber-')}>
      <Form.Label>Excavation number</Form.Label>
      <Form.Control
        type="text"
        value={this.state.excavationNumber}
        onChange={this.updateExcavationNumber}
      />
    </Form.Group>
  )
  renderExcavationSiteForm = (): JSX.Element => (
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
  )
  renderIsRegularExcavationForm = (): JSX.Element => (
    <Form.Group>
      <Form.Check
        type="checkbox"
        id={_.uniqueId('isRegularExcavation-')}
        label="Regular Excavation"
        checked={this.state.isRegularExcavation}
        onChange={this.updateIsRegularExcavation}
      />
    </Form.Group>
  )
  renderFindspotForm = (): JSX.Element => (
    <Form.Group as={Col} controlId={_.uniqueId('findspot-')}>
      <Form.Label>Findspot</Form.Label>
      <Select
        aria-label="select-findspot"
        options={this.findspotOptions}
        value={{
          value: this.state.findspotId,
          label: this.state.findspot?.toString(),
        }}
        onChange={this.updateFindspot}
        isSearchable={true}
        isClearable
      />
    </Form.Group>
  )

  render(): JSX.Element {
    return (
      <Form onSubmit={this.submit} data-testid="archaeology-form">
        <Form.Row>{this.renderExcavationNumberForm()}</Form.Row>
        <Form.Row>{this.renderExcavationSiteForm()}</Form.Row>
        <Form.Row>{this.renderIsRegularExcavationForm()}</Form.Row>
        <Form.Row>{this.renderFindspotForm()}</Form.Row>
        <Button
          variant="primary"
          type="submit"
          disabled={this.props.disabled || !this.isDirty}
        >
          Save
        </Button>
      </Form>
    )
  }
}

export default withData<
  {
    archaeology?: Archaeology
    updateArchaeology: (archaeology: ArchaeologyDto) => Promise<Fragment>
    disabled?: boolean
  },
  { findspotService: FindspotService },
  readonly Findspot[]
>(
  ({ archaeology, updateArchaeology, disabled, data: findspots }) => {
    return (
      <ArchaeologyEditor
        archaeology={archaeology}
        updateArchaeology={updateArchaeology}
        findspots={findspots}
        disabled={disabled}
      />
    )
  },
  (props) => props.findspotService.fetchFindspots()
)
