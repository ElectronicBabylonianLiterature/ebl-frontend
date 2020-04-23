import React from 'react'
import { Button, Col, Form } from 'react-bootstrap'
import _ from 'lodash'
import ListForm from 'common/List'
import Editor from 'editor/Editor'
import { createDefaultLineFactory } from 'corpus/line-factory'
import { produce } from 'immer'
import { ManuscriptLines } from './ManuscriptLines'

function ChapterLineForm({ value, manuscripts, onChange, disabled }) {
  const handleChangeValue = (property) => (propertyValue) =>
    onChange(
      produce(value, (draft) => {
        draft[property] = propertyValue
      })
    )
  const handleChange = (property) => (event) =>
    onChange(
      produce(value, (draft) => {
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

export default function ChapterLines({ chapter, onChange, onSave, disabled }) {
  const handleChange = (lines) =>
    onChange(
      produce(chapter, (draft) => {
        draft.lines = lines
      })
    )
  return (
    <Form>
      <fieldset disabled={disabled}>
        <ListForm
          noun="line"
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
        <Button onClick={onSave}>Save lines</Button>
      </fieldset>
    </Form>
  )
}
