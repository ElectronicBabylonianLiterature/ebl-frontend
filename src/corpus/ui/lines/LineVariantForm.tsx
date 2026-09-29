import { produce } from 'immer'
import _ from 'lodash'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { LineVariant } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import Editor from 'editor/Editor'
import { ManuscriptLines } from 'corpus/ui/lines/ManuscriptLines'

interface VariantFormProps {
  value: LineVariant
  manuscripts: readonly Manuscript[]
  onChange: (line: LineVariant) => void
  disabled?: boolean
}

export default function LineVariantForm({
  value,
  manuscripts,
  onChange,
  disabled = false,
}: VariantFormProps): JSX.Element {
  const handleChange =
    (property: string) =>
    (propertyValue): void =>
      onChange(
        produce(value, (draft) => {
          draft[property] = propertyValue
        }),
      )

  return (
    <>
      <Row>
        <Col>
          <label>Intertext</label>
          <Editor
            name={_.uniqueId('Intertext-')}
            value={value.intertext}
            onChange={handleChange('intertext')}
            disabled={disabled}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <label>Ideal reconstruction</label>
          <Editor
            name={_.uniqueId('IdealReconstruction-')}
            value={value.reconstruction}
            onChange={handleChange('reconstruction')}
            disabled={disabled}
          />
        </Col>
      </Row>
      <ManuscriptLines
        lines={value.manuscripts}
        manuscripts={manuscripts}
        onChange={handleChange('manuscripts')}
        disabled={disabled}
      />
    </>
  )
}
