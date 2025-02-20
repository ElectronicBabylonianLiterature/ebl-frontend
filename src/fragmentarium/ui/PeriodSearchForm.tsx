import React, { CSSProperties } from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import withData from 'http/withData'
import Select from 'react-select'
import FragmentService from 'fragmentarium/application/FragmentService'
import { PeriodString, PeriodModifierString } from 'query/FragmentQuery'
import HelpCol from './HelpCol'
import { ScriptSearchHelp } from './SearchHelp'
import { helpColSize } from './SearchForm'

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
    fragmentService,
  }) => {
    const periodOptions = periodOptionsData.map((period) => ({
      value: period,
      label: period,
    }))
    const selectedPeriod = scriptPeriod
      ? { value: scriptPeriod, label: scriptPeriod }
      : null
    const selectedModifier = scriptPeriodModifier
      ? { value: scriptPeriodModifier, label: scriptPeriodModifier }
      : null

    const selectStyles = {
      menuPortal: (baseStyles: CSSProperties): CSSProperties => ({
        ...baseStyles,
        zIndex: 9999,
      }),
    }

    return (
      <Form.Group as={Row} controlId="period">
        <HelpCol overlay={ScriptSearchHelp()} />
        <Col sm={12 - helpColSize}>
          <Row>
            <Col>
              <Select
                aria-label="select-period-modifier"
                options={modifierOptions}
                value={selectedModifier}
                onChange={(selection) =>
                  onChangeScriptPeriodModifier(
                    (selection?.value as PeriodModifierString) || ''
                  )
                }
                isSearchable={true}
                placeholder="Period Modifier"
                menuPortalTarget={document.body}
                styles={selectStyles}
              />
            </Col>
            <Col>
              <Select
                aria-label="select-period"
                options={periodOptions}
                value={selectedPeriod}
                onChange={(selection) =>
                  onChangeScriptPeriod((selection?.value as PeriodString) || '')
                }
                isSearchable={true}
                placeholder="Period"
                menuPortalTarget={document.body}
                styles={selectStyles}
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
