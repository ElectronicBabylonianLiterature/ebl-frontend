import React, { ChangeEvent, Component, FormEvent } from 'react'
import _ from 'lodash'
import { Form, Col, Button } from 'react-bootstrap'
import Select, { ValueType } from 'react-select'
import {
  Archaeology,
  ArchaeologyDto,
  SiteKey,
  excavationSites,
} from 'fragmentarium/domain/archaeology'
import { Fragment } from 'fragmentarium/domain/fragment'

interface Props {
  archaeology?: Archaeology
  updateArchaeology: (archaeology: ArchaeologyDto) => Promise<Fragment>
  disabled?: boolean
}

interface State {
  excavationNumber: string
  site: SiteKey
  isRegularExcavation: boolean
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

export default class ArchaeologyEditor extends Component<Props, State> {
  private isDirty = false
  private originalState: State
  private updateArchaeology: (archaeology: ArchaeologyDto) => Promise<Fragment>

  constructor(props: Props) {
    super(props)
    const archaeology = props.archaeology || {}

    this.state = {
      excavationNumber: archaeology.excavationNumber || '',
      site: (archaeology.site?.name || '') as SiteKey,
      isRegularExcavation: archaeology.isRegularExcavation ?? true,
      error: null,
    }
    this.originalState = { ...this.state }
    this.updateArchaeology = props.updateArchaeology
  }

  updateState = (property: string) => (value: string | boolean): void => {
    const updatedState = {
      ...this.state,
      [property]: value,
    }
    this.isDirty = !_.isEqual(this.originalState, updatedState)
    this.setState(updatedState)
  }
  updateExcavationNumber = (event: ChangeEvent<HTMLInputElement>): void =>
    this.updateState('excavationNumber')(event.target.value)

  updateSite = (
    event: ValueType<typeof excavationOptions[number], false>
  ): void => this.updateState('site')(event?.value || '')

  updateIsRegularExcavation = (event: ChangeEvent<HTMLInputElement>): void =>
    this.updateState('isRegularExcavation')(event.target.checked)

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

  render(): JSX.Element {
    return (
      <Form onSubmit={this.submit} data-testid="archaeology-form">
        <Form.Row>{this.renderExcavationNumberForm()}</Form.Row>
        <Form.Row>{this.renderExcavationSiteForm()}</Form.Row>
        <Form.Row>{this.renderIsRegularExcavationForm()}</Form.Row>
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
