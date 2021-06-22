import React from 'react'
import { Form, Col, InputGroup } from 'react-bootstrap'
import _ from 'lodash'
import Promise from 'bluebird'
import produce, { castDraft, Draft } from 'immer'
import { types, Manuscript } from 'corpus/domain/manuscript'
import ReferencesForm from 'bibliography/ui/ReferencesForm'
import Reference from 'bibliography/domain/Reference'
import { periodModifiers, periods } from 'corpus/domain/period'
import { provenances } from 'corpus/domain/provenance'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Editor from 'editor/Editor'

export default function ManuscriptForm({
  manuscript,
  onChange,
  searchBibliography,
}: {
  manuscript: Manuscript
  onChange: (manuscript: Manuscript) => void
  searchBibliography: (query: string) => Promise<readonly BibliographyEntry[]>
}): JSX.Element {
  const handleChange = (property: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) =>
    onChange(
      produce(manuscript, (draft: Draft<Manuscript>) => {
        draft[property] = event.target.value
      })
    )
  const handleMapChange = (
    property: string,
    values: ReadonlyMap<string, unknown>
  ) => (event: React.ChangeEvent<HTMLSelectElement>) => {
    return onChange(
      produce(manuscript, (draft: Draft<Manuscript>) => {
        draft[property] = values.get(event.target.value)
      })
    )
  }

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
            onChange={handleMapChange('provenance', provenances)}
          >
            {[...provenances.values()].map((provenance) =>
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
              onChange={handleMapChange('periodModifier', periodModifiers)}
            >
              {[...periodModifiers.values()].map((modifier) => (
                <option key={modifier.name} value={modifier.name}>
                  {modifier.displayName}
                </option>
              ))}
            </Form.Control>
            <Form.Control
              as="select"
              aria-label="Period"
              value={manuscript.period.name}
              onChange={handleMapChange('period', periods)}
            >
              {[...periods.values()].map((period) =>
                _.isNil(period.parent) ? (
                  <option key={period.name} value={period.name}>
                    {period.displayName ?? period.name} {period.description}
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
            onChange={handleMapChange('type', types)}
          >
            {[...types.values()].map((type) => (
              <option key={type.name} value={type.name}>
                {type.displayName ?? type.name}
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
      <Form.Group controlId={_.uniqueId('colophon-')}>
        <Form.Label>Colophon</Form.Label>{' '}
        <Editor
          name={_.uniqueId('colophon-editor-')}
          value={manuscript.colophon}
          onChange={(atf) =>
            onChange(
              produce(manuscript, (draft) => {
                draft.colophon = atf
              })
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
              })
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
            })
          )
        }
        searchBibliography={searchBibliography}
        collapsed
      />
    </>
  )
}
