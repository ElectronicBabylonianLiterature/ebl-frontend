import ListForm from 'common/List'
import { Manuscript } from 'corpus/domain/manuscript'
import React from 'react'
import { castDraft, produce } from 'immer'
import { Col, Form, Row } from 'react-bootstrap'
import _ from 'lodash'
import ArrayInput from 'common/ArrayInput'
import Editor from 'editor/Editor'
import { createManuscriptLine, ManuscriptLine } from 'corpus/domain/line'

interface ManuscriptLineFormProps {
  value: ManuscriptLine
  manuscripts: readonly Manuscript[]
  onChange: (line: ManuscriptLine) => void
  disabled: boolean
}

function ManuscriptLineForm({
  value,
  manuscripts,
  onChange,
  disabled,
}: ManuscriptLineFormProps): JSX.Element {
  const handleChange = (property) => (event) =>
    onChange(
      produce(value, (draft) => {
        draft[property] = event.target.value
      }),
    )
  const handleIdChange = (event) =>
    onChange(
      produce(value, (draft) => {
        draft.manuscriptId = Number(event.target.value)
      }),
    )
  return (
    <Row>
      <Form.Group as={Col} md={2} controlId={_.uniqueId('ManuscriptLine-')}>
        <Form.Label>Siglum</Form.Label>
        <Form.Control
          as="select"
          value={value.manuscriptId}
          onChange={handleIdChange}
        >
          <option value="0" disabled>
            --
          </option>
          {manuscripts.map((manuscript) => (
            <option key={manuscript.id} value={manuscript.id ?? ''}>
              {manuscript.siglum}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Col as={Col} md={1}>
        <ArrayInput
          value={value.labels}
          separator={' '}
          onChange={(labels) =>
            onChange(
              produce(value, (draft) => {
                draft.labels = castDraft(labels)
              }),
            )
          }
        >
          Side
        </ArrayInput>
      </Col>
      <Form.Group as={Col} md={1} controlId={_.uniqueId('ManuscriptLine-')}>
        <Form.Label>Line nr.</Form.Label>
        <Form.Control value={value.number} onChange={handleChange('number')} />
      </Form.Group>
      <Col>
        <label>Text</label>
        <Editor
          name={_.uniqueId('Text-')}
          value={value.atf}
          onChange={(atf) =>
            onChange(
              produce(value, (draft) => {
                draft.atf = atf
              }),
            )
          }
          disabled={disabled}
        />
      </Col>
    </Row>
  )
}

interface ManuscriptLinesProps {
  lines: readonly ManuscriptLine[]
  manuscripts: readonly Manuscript[]
  onChange: (lines: ManuscriptLine) => void
  disabled: boolean
}

export function ManuscriptLines({
  lines,
  manuscripts,
  onChange,
  disabled,
}: ManuscriptLinesProps): JSX.Element {
  return (
    <ListForm
      noun="manuscript"
      defaultValue={createManuscriptLine({})}
      value={lines}
      onChange={onChange}
    >
      {(line, onChange) => (
        <ManuscriptLineForm
          onChange={onChange}
          value={line}
          manuscripts={manuscripts}
          disabled={disabled}
        />
      )}
    </ListForm>
  )
}
