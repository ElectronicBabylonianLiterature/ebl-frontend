import React, { useState } from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import _ from 'lodash'
import withData from 'http/withData'
import DossiersService from 'dossiers/application/DossiersService'
import DossierRecord from 'dossiers/domain/DossierRecord'
import { DossiersGroupedDisplay } from 'dossiers/ui/DossiersGroupedDisplay'
import { Markdown } from 'common/ui/Markdown'

function DossiersIntroduction(): JSX.Element {
  return (
    <Markdown
      className="dossiers-search-page__introduction"
      text="Dossiers group cuneiform fragments by their historical and textual context,
      associating them with known archival collections, provenances, and script periods.
      Use the filters below to browse dossiers by period or provenance."
    />
  )
}

function FilterSelect({
  controlId,
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  controlId: string
  label: string
  allLabel: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}): JSX.Element {
  return (
    <Col sm={6}>
      <Form.Group controlId={controlId}>
        <Form.Label>{label}</Form.Label>
        <Form.Select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`Filter by ${label.toLowerCase()}`}
        >
          <option value="">{allLabel}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </Col>
  )
}

function DossiersFilters({
  records,
  period,
  provenance,
  onPeriodChange,
  onProvenanceChange,
}: {
  records: readonly DossierRecord[]
  period: string
  provenance: string
  onPeriodChange: (value: string) => void
  onProvenanceChange: (value: string) => void
}): JSX.Element {
  const periods = _.sortBy(
    _.uniq(
      records.map((record) => record.script?.period?.name).filter(Boolean),
    ),
  ) as string[]

  const provenances = _.sortBy(
    _.uniq(records.map((record) => record.provenance?.name).filter(Boolean)),
  ) as string[]

  return (
    <Form className="dossiers-search-page__filters">
      <Row>
        <FilterSelect
          controlId="dossiers-period-filter"
          label="Period"
          allLabel="All Periods"
          value={period}
          options={periods}
          onChange={onPeriodChange}
        />
        <FilterSelect
          controlId="dossiers-provenance-filter"
          label="Provenance"
          allLabel="All Provenances"
          value={provenance}
          options={provenances}
          onChange={onProvenanceChange}
        />
      </Row>
    </Form>
  )
}

function DossiersContent({
  data,
}: {
  data: readonly DossierRecord[]
}): JSX.Element {
  const [period, setPeriod] = useState('')
  const [provenance, setProvenance] = useState('')

  const filteredRecords = data.filter((record) => {
    if (period && record.script?.period?.name !== period) {
      return false
    }
    if (provenance && record.provenance?.name !== provenance) {
      return false
    }
    return true
  })

  return (
    <>
      <DossiersFilters
        records={data}
        period={period}
        provenance={provenance}
        onPeriodChange={setPeriod}
        onProvenanceChange={setProvenance}
      />
      {filteredRecords.length === 0 ? (
        <p className="dossiers-search-page__empty">
          No dossiers match the selected filters.
        </p>
      ) : (
        <DossiersGroupedDisplay
          records={filteredRecords}
          showProvenance={!provenance}
        />
      )}
    </>
  )
}

const DossiersContentWithData = withData<
  object,
  { dossiersService: DossiersService },
  readonly DossierRecord[]
>(
  ({ data }) => <DossiersContent data={data} />,
  (props, signal) => props.dossiersService.fetchAllDossiers(signal),
)

export default function DossiersSearchPage({
  dossiersService,
}: {
  dossiersService: DossiersService
}): JSX.Element {
  return (
    <>
      <DossiersIntroduction />
      <DossiersContentWithData dossiersService={dossiersService} />
    </>
  )
}
