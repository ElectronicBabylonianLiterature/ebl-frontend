import React from 'react'
import { Col, Form } from 'react-bootstrap'
import _ from 'lodash'
import ListForm from 'common/List'
import Editor from 'editor/Editor'
import { createManuscriptLine } from './text'
import ArrayInput from 'common/ArrayInput'
import { createDefaultLineFactory } from './line-factory'
import { produce } from 'immer'

function ManuscriptLineForm ({ value, manuscripts, onChange, disabled }) {
  const handleChange = property => event =>
    onChange(
      produce(value, draft => {
        draft[property] = event.target.value
      })
    )
  const handleIdChange = event =>
    onChange(
      produce(value, draft => {
        draft.manuscriptId = event.target.value
      })
    )
  return (
    <Form.Row>
      <Form.Group as={Col} md={2} controlId={_.uniqueId('ManuscriptLine-')}>
        <Form.Label>Siglum</Form.Label>
        <Form.Control
          as='select'
          value={value.manuscriptId}
          onChange={handleIdChange}
        >
          <option value='0' disabled>
            --
          </option>
          {manuscripts.map(manuscript => (
            <option key={manuscript.id} value={manuscript.id}>
              {manuscript.siglum}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Col as={Col} md={1}>
        <ArrayInput
          value={value.labels}
          separator={' '}
          onChange={labels =>
            onChange(
              produce(value, draft => {
                draft.labels = labels
              })
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
          onChange={atf =>
            onChange(
              produce(value, draft => {
                draft.atf = atf
              })
            )
          }
          disabled={disabled}
        />
      </Col>
    </Form.Row>
  )
}

function ManuscriptLines ({ lines, manuscripts, onChange, disabled }) {
  return (
    <ListForm
      noun='manuscript'
      defaultValue={createManuscriptLine()}
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

function ChapterLineForm ({ value, manuscripts, onChange, disabled }) {
  const handleChangeValue = property => propertyValue =>
    onChange(
      produce(value, draft => {
        draft[property] = propertyValue
      })
    )
  const handleChange = property => event =>
    onChange(
      produce(value, draft => {
        draft[property] = event.target.value
      })
    )
  return (
    <>
      <Form.Row>
        <Form.Group as={Col} md={1} controlId={_.uniqueId('Lines-')}>
          <Form.Label>Number</Form.Label>
          <Form.Control
            value={value.number}
            onChange={handleChange('number')}
          />
        </Form.Group>
        <Col>
          <label>Ideal reconstruction</label>
          <Editor
            name={_.uniqueId('IdealReconstruction-')}
            value={value.reconstruction}
            onChange={handleChangeValue('reconstruction')}
            disabled={disabled}
          />
        </Col>
      </Form.Row>
      <ManuscriptLines
        lines={value.manuscripts}
        manuscripts={manuscripts}
        onChange={handleChangeValue('manuscripts')}
        disabled={disabled}
      />
    </>
  )
}

export default function ChapterLines ({ chapter, onChange, disabled }) {
  const handleChange = lines =>
    onChange(
      produce(chapter, draft => {
        draft.lines = lines
      })
    )
  return (
    <ListForm
      noun='line'
      defaultValue={createDefaultLineFactory(_.last(chapter.lines))}
      value={chapter.lines}
      onChange={handleChange}
    >
      {(line, onChange) => (
        <ChapterLineForm
          onChange={onChange}
          value={line}
          manuscripts={chapter.manuscripts}
          disabled={disabled}
        />
      )}
    </ListForm>
  )
}
