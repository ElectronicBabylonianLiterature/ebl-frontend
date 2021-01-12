import React from 'react'
import { Badge, Button, Col, Form } from 'react-bootstrap'
import _ from 'lodash'
import ListForm from 'common/List'
import Editor from 'editor/Editor'
import { createDefaultLineFactory } from 'corpus/application/line-factory'
import produce, { castDraft } from 'immer'
import { ManuscriptLines } from './ManuscriptLines'
import {
  Manuscript,
  Line,
  Chapter,
  LineVariant,
  createVariant,
} from 'corpus/domain/text'

interface VariantFormProps {
  value: LineVariant
  manuscripts: readonly Manuscript[]
  onChange: (line: LineVariant) => void
  disabled?: boolean
}

function LineVariantForm({
  value,
  manuscripts,
  onChange,
  disabled = false,
}: VariantFormProps) {
  const handleChangeValue = (property: string) => (propertyValue): void =>
    onChange(
      produce(value, (draft) => {
        draft[property] = propertyValue
      })
    )

  const handleChange = (property: string) => (event): void => {
    onChange(
      produce(value, (draft) => {
        draft[property] = event.target.value
      })
    )
  }
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

interface FormProps {
  value: Line
  manuscripts: readonly Manuscript[]
  onChange: (line: Line) => void
  disabled?: boolean
}

function ChapterLineForm({
  value,
  manuscripts,
  onChange,
  disabled = false,
}: FormProps) {
  const handleChangeValue = (property: string) => (propertyValue): void =>
    onChange(
      produce(value, (draft) => {
        draft[property] = propertyValue
      })
    )

  const handleChange = (variants: LineVariant[]): void =>
    onChange(
      produce(value, (draft) => {
        draft.variants = castDraft(variants)
      })
    )
  return (
    <>
      <Form.Row>
        <Form.Check
          inline
          type="checkbox"
          id={_.uniqueId('secondLineOfParallelism-')}
          label="second line of parallelism"
          checked={value.isSecondLineOfParallelism}
          onChange={(): void =>
            handleChangeValue('isSecondLineOfParallelism')(
              !value.isSecondLineOfParallelism
            )
          }
        />
        <Form.Check
          inline
          type="checkbox"
          id={_.uniqueId('beginningOfSection-')}
          label="beginning of a section"
          checked={value.isBeginningOfSection}
          onChange={(): void =>
            handleChangeValue('isBeginningOfSection')(
              !value.isBeginningOfSection
            )
          }
        />
      </Form.Row>
      <ListForm
        noun="variant"
        defaultValue={createVariant({})}
        value={value.variants}
        onChange={handleChange}
      >
        {(variant: LineVariant, onChange: (variant: LineVariant) => void) => (
          <LineVariantForm
            onChange={onChange}
            value={variant}
            manuscripts={manuscripts}
            disabled={disabled}
          />
        )}
      </ListForm>
    </>
  )
}

interface ChapterLinesLinesProps {
  chapter: Chapter
  onChange: (chapter: Chapter) => void
  onSave: () => unknown
  disabled?: boolean
}

export default function ChapterLines({
  chapter,
  onChange,
  onSave,
  disabled = false,
}: ChapterLinesLinesProps): JSX.Element {
  const handleChange = (lines: Line[]): void =>
    onChange(
      produce(chapter, (draft) => {
        draft.lines = castDraft(lines)
      })
    )
  return (
    <Form>
      <Badge variant="warning">Beta</Badge>
      <fieldset disabled={disabled}>
        <ListForm
          noun="line"
          defaultValue={createDefaultLineFactory(_.last(chapter.lines))}
          value={chapter.lines}
          onChange={handleChange}
        >
          {(line: Line, onChange: (line: Line) => void) => (
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
