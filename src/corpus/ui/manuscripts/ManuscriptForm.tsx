import React from 'react'
import { Form, Col, InputGroup, Row } from 'react-bootstrap'
import _ from 'lodash'
import Promise from 'bluebird'
import { produce, castDraft, Draft } from 'immer'
import { ManuscriptTypes, Manuscript, types } from 'corpus/domain/manuscript'
import ReferencesForm from 'bibliography/ui/ReferencesForm'
import Reference from 'bibliography/domain/Reference'
import {
  periodModifiers,
  PeriodModifiers,
  periods,
  Periods,
} from 'common/period'
import { getProvenanceByName, Provenance } from 'corpus/domain/provenance'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Editor from 'editor/Editor'

const indent = '\u00A0'.repeat(4)

export default function ManuscriptForm({
  manuscript,
  provenanceOptions,
  onChange,
  searchBibliography,
}: {
  manuscript: Manuscript
  provenanceOptions: readonly Provenance[]
  onChange: (manuscript: Manuscript) => void
  searchBibliography: (query: string) => Promise<readonly BibliographyEntry[]>
}): JSX.Element {
  const handleChange =
    (property: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(
        produce(manuscript, (draft: Draft<Manuscript>) => {
          draft[property] = event.target.value
        }),
      )
  const handleEnumChange =
    (property: string, values: Record<string, unknown>) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const selectValue = event.currentTarget.value
      return onChange(
        produce(manuscript, (draft: Draft<Manuscript>) => {
          draft[property] = values[selectValue]
        }),
      )
    }

  const handleProvenanceChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) =>
    onChange(
      produce(manuscript, (draft: Draft<Manuscript>) => {
        draft.provenance = getProvenanceByName(event.currentTarget.value)
      }),
    )

  return (
    <>
      <Row>
        <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
          <Form.Label>Siglum</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              {manuscript.provenance.abbreviation}
              {manuscript.period.abbreviation}
              {manuscript.type.abbreviation}
            </InputGroup.Text>
            <Form.Control
              value={manuscript.siglumDisambiguator}
              onChange={handleChange('siglumDisambiguator')}
            />
          </InputGroup>
        </Form.Group>
        <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
          <Form.Label>Museum Number</Form.Label>
          <Form.Control
            value={manuscript.museumNumber}
            onChange={handleChange('museumNumber')}
          />
        </Form.Group>
        <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
          <Form.Label>Accession</Form.Label>
          <Form.Control
            value={manuscript.accession}
            onChange={handleChange('accession')}
          />
        </Form.Group>
      </Row>
      <Row>
        <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
          <Form.Label>Provenance</Form.Label>
          <Form.Control
            as="select"
            value={manuscript.provenance.name}
            onChange={handleProvenanceChange}
          >
            {provenanceOptions.map((provenance, index) => (
              <option key={index} value={provenance.name}>
                {provenance.parent && indent}
                {provenance.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col}>
          <label>Period</label>
          <InputGroup>
            <Form.Control
              as="select"
              aria-label="Period modifier"
              value={manuscript.periodModifier.name}
              onChange={handleEnumChange('periodModifier', PeriodModifiers)}
            >
              {periodModifiers.map((modifier) => (
                <option key={modifier.name} value={modifier.name}>
                  {modifier.displayName}
                </option>
              ))}
            </Form.Control>
            <Form.Control
              as="select"
              aria-label="Period"
              value={manuscript.period.name}
              onChange={handleEnumChange('period', Periods)}
            >
              {periods.map((period, index) => (
                <option key={index} value={period.name}>
                  {period.parent && indent}
                  {period.displayName ?? period.name} {period.description}
                </option>
              ))}
            </Form.Control>
          </InputGroup>
        </Form.Group>
        <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
          <Form.Label>Type</Form.Label>
          <Form.Control
            as="select"
            value={manuscript.type.name}
            onChange={handleEnumChange('type', ManuscriptTypes)}
          >
            {types.map((type) => (
              <option key={type.name} value={type.name}>
                {type.displayName ?? type.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Row>
      <Form.Group controlId={_.uniqueId('manuscript-')}>
        <Form.Label>Notes</Form.Label>
        <Form.Control
          value={manuscript.notes}
          onChange={handleChange('notes')}
        />
      </Form.Group>
      <Form.Group controlId={_.uniqueId('colophon-')}>
        <Form.Label>Colophon</Form.Label>{' '}
        <Editor
          name={_.uniqueId('colophon-editor-')}
          value={manuscript.colophon}
          onChange={(atf) =>
            onChange(
              produce(manuscript, (draft) => {
                draft.colophon = atf
              }),
            )
          }
        />
      </Form.Group>
      <Form.Group controlId={_.uniqueId('unplaced-lines-')}>
        <Form.Label>Unplaced Lines</Form.Label>{' '}
        <Editor
          name={_.uniqueId('unplaced-lines-editor-')}
          value={manuscript.unplacedLines}
          onChange={(atf) =>
            onChange(
              produce(manuscript, (draft) => {
                draft.unplacedLines = atf
              }),
            )
          }
        />
      </Form.Group>
      <ReferencesForm
        value={manuscript.references}
        label="References"
        onChange={(value: readonly Reference[]) =>
          onChange(
            produce(manuscript, (draft: Draft<Manuscript>) => {
              draft.references = castDraft(value)
            }),
          )
        }
        searchBibliography={searchBibliography}
        collapsed
      />
    </>
  )
}
