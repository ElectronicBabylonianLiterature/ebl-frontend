import React, { ChangeEvent, Component, FormEvent } from 'react'
import _ from 'lodash'
import { Form, Button, Row } from 'react-bootstrap'
import type { SingleValue } from 'react-select'
import {
  ExcavationNumberField,
  ExcavationSiteField,
  FindspotField,
  FindspotOption,
  FindspotUncertainField,
  RegularExcavationField,
  SiteOption,
} from 'fragmentarium/ui/fragment/ArchaeologyEditorFields'
import { Archaeology, Findspot } from 'fragmentarium/domain/archaeology'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { Fragment } from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

interface Props {
  archaeology: Archaeology | null
  updateArchaeology: (archaeology: ArchaeologyDto) => Promise<Fragment>
  findspots: readonly Findspot[]
  provenances: readonly ProvenanceRecord[]
  disabled?: boolean
}

interface State {
  excavationNumber: string
  site: string
  isRegularExcavation: boolean
  isFindspotUncertain: boolean
  findspotId: number | null
  findspot: Findspot | null
  error: Error | null
}

class ArchaeologyEditor extends Component<Props, State> {
  private isDirty = false
  private originalState: State
  private updateArchaeology: (archaeology: ArchaeologyDto) => Promise<Fragment>
  private findspotsById: ReadonlyMap<number, Findspot>
  private findspots: readonly Findspot[]

  constructor(props: Props) {
    super(props)
    const archaeology = props.archaeology || {}

    this.state = {
      excavationNumber: archaeology.excavationNumber || '',
      site: archaeology.site?.name || '',
      isRegularExcavation: archaeology.isRegularExcavation ?? false,
      isFindspotUncertain: archaeology.isFindspotUncertain ?? false,
      error: null,
      findspotId: archaeology.findspotId || null,
      findspot: archaeology.findspot || null,
    }
    this.originalState = { ...this.state }
    this.updateArchaeology = props.updateArchaeology

    this.findspotsById = new Map(
      props.findspots.map((findspot) => [findspot.id, findspot]),
    )
    this.findspots = props.findspots
  }

  get findspotOptions(): FindspotOption[] {
    return this.state.site
      ? this.findspots
          .filter((findspot) => findspot.site.name === this.state.site)
          .map((findspot) => ({
            value: findspot.id,
            label: findspot.toString(),
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      : []
  }

  get siteOptions(): SiteOption[] {
    const options = this.props.provenances.map((provenance) => ({
      value: provenance.longName,
      label: provenance.longName,
    }))

    return [{ value: '', label: '-' }, ...options]
  }

  updateState =
    (property: string) =>
    (value: string | boolean | number | Findspot | null): void => {
      const updatedState = {
        ...this.state,
        [property]: value,
      }
      this.isDirty = !_.isEqual(this.originalState, updatedState)
      this.setState(updatedState)
    }
  updateFindspotState = (
    findspotId: number | null,
    findspot: Findspot | null,
  ): void => {
    const updatedState = {
      ...this.state,
      findspotId: findspotId,
      findspot: findspot,
    }
    this.isDirty = !_.isEqual(this.originalState, updatedState)
    this.setState(updatedState)
  }

  updateExcavationNumber = (event: ChangeEvent<HTMLInputElement>): void =>
    this.updateState('excavationNumber')(event.target.value)

  updateSite = (event: SingleValue<SiteOption>): void => {
    const updatedState: State = {
      ...this.state,
      site: event?.value || '',
      findspotId: null,
      findspot: null,
    }
    this.isDirty = !_.isEqual(this.originalState, updatedState)
    this.setState(updatedState)
  }

  updateIsRegularExcavation = (event: ChangeEvent<HTMLInputElement>): void =>
    this.updateState('isRegularExcavation')(event.target.checked)

  updateIsFindspotUncertain = (event: ChangeEvent<HTMLInputElement>): void =>
    this.updateState('isFindspotUncertain')(event.target.checked)

  updateFindspot = (event: SingleValue<FindspotOption>): void => {
    if (!event || !event.value) {
      this.updateFindspotState(null, null)
    } else {
      this.updateFindspotState(
        event.value,
        this.findspotsById.get(event.value) || null,
      )
    }
  }

  submit = (event: FormEvent<HTMLElement>): void => {
    event.preventDefault()

    this.updateArchaeology({
      ..._.omitBy(
        {
          ...this.state,
          findspot: null,
          error: null,
        },
        (value) => _.isNil(value) || value === '',
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
        }),
      )
  }

  render(): JSX.Element {
    return (
      <Form onSubmit={this.submit} data-testid="archaeology-form">
        <Row>
          <ExcavationNumberField
            value={this.state.excavationNumber}
            onChange={this.updateExcavationNumber}
          />
        </Row>
        <Row>
          <ExcavationSiteField
            site={this.state.site}
            options={this.siteOptions}
            onChange={this.updateSite}
          />
        </Row>
        <Row>
          <RegularExcavationField
            checked={this.state.isRegularExcavation}
            onChange={this.updateIsRegularExcavation}
          />
        </Row>
        <Row>
          <FindspotField
            findspotId={this.state.findspotId}
            findspotLabel={this.state.findspot?.toString() ?? null}
            options={this.findspotOptions}
            onChange={this.updateFindspot}
          />
        </Row>
        <Row>
          <FindspotUncertainField
            checked={this.state.isFindspotUncertain}
            onChange={this.updateIsFindspotUncertain}
          />
        </Row>
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
    archaeology: Archaeology | null
    updateArchaeology: (archaeology: ArchaeologyDto) => Promise<Fragment>
    disabled?: boolean
  },
  { findspotService: FindspotService; fragmentService: FragmentService },
  { findspots: readonly Findspot[]; provenances: readonly ProvenanceRecord[] }
>(
  ({ archaeology, updateArchaeology, disabled, data }) => {
    return (
      <ArchaeologyEditor
        archaeology={archaeology}
        updateArchaeology={updateArchaeology}
        findspots={data.findspots}
        provenances={data.provenances}
        disabled={disabled}
      />
    )
  },
  (props) =>
    Promise.all([
      props.findspotService.fetchFindspots(),
      props.fragmentService.fetchProvenances(),
    ]).then(([findspots, provenances]) => ({ findspots, provenances })),
)
