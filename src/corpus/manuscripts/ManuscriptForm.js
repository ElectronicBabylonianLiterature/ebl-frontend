// @flow
import React from 'react'
import { Form, Col, InputGroup } from 'react-bootstrap'
import _ from 'lodash'
import { types } from '../text'
// $FlowFixMe
import ReferencesForm from 'bibliography/ReferencesForm'
import { periodModifiers, periods } from '../period'
import { provenances } from '../provenance'
import type { Manuscript } from '../text'
// $FlowFixMe
import produce, { Draft } from 'immer'
import { Map } from 'immutable'

export default function ManuscriptForm({
  manuscript,
  onChange,
  searchBibliography
}: {
  manuscript: Manuscript,
  onChange: Manuscript => void,
  searchBibliography: any
}) {
  const handleChange = (property: string) => event =>
    onChange(
      produce(manuscript, (draft: Draft<Manuscript>) => {
        draft[property] = event.target.value
      })
    )
  const handelRecordChange = (
    property: string,
    values: Map<string, any>
  ) => event =>
    onChange(
      produce(manuscript, (draft: Draft<Manuscript>) => {
        draft[property] = values.get(event.target.value)
      })
    )

  return (
    <>
      <Form.Row>
        <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
          <Form.Label>Siglum</Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>
                {manuscript.provenance.abbreviation}
                {manuscript.period.abbreviation}
                {manuscript.type.abbreviation}
              </InputGroup.Text>
            </InputGroup.Prepend>
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
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
          <Form.Label>Provenance</Form.Label>
          <Form.Control
            as="select"
            value={manuscript.provenance.name}
            onChange={handelRecordChange('provenance', provenances)}
          >
            {provenances.toIndexedSeq().map(provenance =>
              _.isNil(provenance.parent) ? (
                <option key={provenance.name} value={provenance.name}>
                  {provenance.name}
                </option>
              ) : (
                <option key={provenance.name} value={provenance.name}>
                  &nbsp;&nbsp;&nbsp;&nbsp;{provenance.name}
                </option>
              )
            )}
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col}>
          <label>Period</label>
          <InputGroup>
            <Form.Control
              as="select"
              aria-label="Period modifier"
              value={manuscript.periodModifier.name}
              onChange={handelRecordChange('periodModifier', periodModifiers)}
            >
              {periodModifiers.toIndexedSeq().map(modifier => (
                <option key={modifier.name} value={modifier.name}>
                  {modifier.displayName}
                </option>
              ))}
            </Form.Control>
            <Form.Control
              as="select"
              aria-label="Period"
              value={manuscript.period.name}
              onChange={handelRecordChange('period', periods)}
            >
              {periods.toIndexedSeq().map(period =>
                _.isNil(period.parent) ? (
                  <option key={period.name} value={period.name}>
                    {period.name} {period.description}
                  </option>
                ) : (
                  <option key={period.name} value={period.name}>
                    &nbsp;&nbsp;&nbsp;&nbsp;{period.name} {period.description}
                  </option>
                )
              )}
            </Form.Control>
          </InputGroup>
        </Form.Group>
        <Form.Group as={Col} controlId={_.uniqueId('manuscript-')}>
          <Form.Label>Type</Form.Label>
          <Form.Control
            as="select"
            value={manuscript.type.name}
            onChange={handelRecordChange('type', types)}
          >
            {types.toIndexedSeq().map(type => (
              <option key={type.name} value={type.name}>
                {type.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Form.Row>
      <Form.Group controlId={_.uniqueId('manuscript-')}>
        <Form.Label>Notes</Form.Label>
        <Form.Control
          value={manuscript.notes}
          onChange={handleChange('notes')}
        />
      </Form.Group>
      <ReferencesForm
        value={manuscript.references}
        label="References"
        onChange={value =>
          onChange(
            produce(manuscript, (draft: Draft<Manuscript>) => {
              draft.references = value
            })
          )
        }
        searchBibliography={searchBibliography}
        collapsed
      />
    </>
  )
}
