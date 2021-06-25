import produce, { castDraft } from 'immer'
import _ from 'lodash'
import React from 'react'
import { Button, Col, Form } from 'react-bootstrap'
import ListForm from 'common/List'
import { createDefaultLineFactory } from 'corpus/application/line-factory'
import { createVariant, LineVariant, Line } from 'corpus/domain/line'
import { Chapter } from 'corpus/domain/text'
import { Manuscript } from 'corpus/domain/manuscript'
import Editor from 'editor/Editor'
import { ManuscriptLines } from './ManuscriptLines'

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
  const handleChange = (property: string) => (propertyValue): void =>
    onChange(
      produce(value, (draft) => {
        draft[property] = propertyValue
      })
    )

  return (
    <>
      <Form.Row>
        <Col>
          <label>Ideal reconstruction</label>
          <Editor
            name={_.uniqueId('IdealReconstruction-')}
            value={value.reconstruction}
            onChange={handleChange('reconstruction')}
            disabled={disabled}
          />
        </Col>
      </Form.Row>
      <ManuscriptLines
        lines={value.manuscripts}
        manuscripts={manuscripts}
        onChange={handleChange('manuscripts')}
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
  const handleChange = (property: string) => (propertyValue): void =>
    onChange(
      produce(value, (draft) => {
        draft[property] = propertyValue
      })
    )

  const handleNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    onChange(
      produce(value, (draft) => {
        draft.number = event.target.value
      })
    )
  }
  const handleVariantsChange = (variants: LineVariant[]): void =>
    onChange(
      produce(value, (draft) => {
        draft.variants = castDraft(variants)
      })
    )
  return (
    <>
      <Form.Row>
        <Col md={1}>
          <Form.Group controlId={_.uniqueId('Lines-')}>
            <Form.Label>Number</Form.Label>
            <Form.Control value={value.number} onChange={handleNumberChange} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Check
            inline
            type="checkbox"
            id={_.uniqueId('secondLineOfParallelism-')}
            label="second line of parallelism"
            checked={value.isSecondLineOfParallelism}
            onChange={(): void =>
              handleChange('isSecondLineOfParallelism')(
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
              handleChange('isBeginningOfSection')(!value.isBeginningOfSection)
            }
          />
        </Col>
        <Col>
          <label>Translation</label>
          <Editor
            name={_.uniqueId('Translation-')}
            value={value.translation}
            onChange={handleChange('translation')}
            disabled={disabled}
          />
        </Col>
      </Form.Row>
      <Form.Row>
        <Col>
          <ListForm
            noun="variant"
            defaultValue={createVariant({})}
            value={value.variants}
            onChange={handleVariantsChange}
          >
            {(
              variant: LineVariant,
              onChange: (variant: LineVariant) => void
            ) => (
              <LineVariantForm
                onChange={onChange}
                value={variant}
                manuscripts={manuscripts}
                disabled={disabled}
              />
            )}
          </ListForm>
        </Col>
      </Form.Row>
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
