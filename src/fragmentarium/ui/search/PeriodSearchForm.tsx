import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import withData from 'http/withData'
import SelectFromGroup from './SelectFromGroup'
import FragmentService from 'fragmentarium/application/FragmentService'
import { PeriodString, PeriodModifierString } from 'query/FragmentQuery'
import HelpCol from 'fragmentarium/ui/HelpCol'
import { ScriptSearchHelp } from 'fragmentarium/ui/SearchHelp'
import { helpColSize } from 'fragmentarium/ui/SearchForm'

interface PeriodSearchFormGroupProps {
  scriptPeriod: PeriodString
  scriptPeriodModifier: PeriodModifierString
  onChangeScriptPeriod: (value: PeriodString) => void
  onChangeScriptPeriodModifier: (value: PeriodModifierString) => void
  fragmentService: FragmentService
}

const modifierOptions = ['Early', 'Middle', 'Late'].map((val) => ({
  value: val,
  label: val,
}))

const PeriodSearchFormGroup = withData<
  PeriodSearchFormGroupProps,
  { fragmentService: FragmentService },
  string[]
>(
  ({
    data: periodOptionsData,
    scriptPeriod,
    scriptPeriodModifier,
    onChangeScriptPeriod,
    onChangeScriptPeriodModifier,
  }) => {
    const periodOptions = periodOptionsData.map((period) => ({
      value: period,
      label: period,
    }))

    return (
      <Form.Group as={Row} controlId="period">
        <HelpCol overlay={ScriptSearchHelp()} />
        <Col sm={12 - helpColSize}>
          <Row>
            <Col sm={8}>
              <SelectFromGroup
                controlId="period-select"
                helpOverlay={<></>}
                placeholder="Period"
                options={periodOptions}
                value={scriptPeriod}
                onChange={(value) =>
                  onChangeScriptPeriod((value as PeriodString) || '')
                }
                classNamePrefix="period-selector"
              />
            </Col>
            <Col sm={4}>
              <SelectFromGroup
                controlId="modifier-select"
                helpOverlay={<></>} // Empty since we have the main HelpCol
                placeholder="Modifier"
                options={modifierOptions}
                value={scriptPeriodModifier}
                onChange={(value) =>
                  onChangeScriptPeriodModifier(
                    (value as PeriodModifierString) || ''
                  )
                }
                classNamePrefix="modifier-selector"
              />
            </Col>
          </Row>
        </Col>
      </Form.Group>
    )
  },
  ({ fragmentService }) => fragmentService.fetchPeriods()
)

export default PeriodSearchFormGroup
