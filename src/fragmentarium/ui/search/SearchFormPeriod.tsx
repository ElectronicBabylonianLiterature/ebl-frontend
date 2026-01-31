import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import withData from 'http/withData'
import Select from 'react-select'
import FragmentService from 'fragmentarium/application/FragmentService'
import { PeriodString, PeriodModifierString } from 'query/FragmentQuery'
import { HelpCol, ScriptSearchHelp } from 'fragmentarium/ui/SearchHelp'
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

const selectStyles = {
  menuPortal: (base: React.CSSProperties) => ({
    ...base,
    zIndex: 9999,
  }),
}

interface SelectColumnProps<T> {
  sm: number
  ariaLabel: string
  options: { value: string; label: string }[]
  value: { value: string; label: string } | null
  onChange: (value: T | '') => void
  placeholder: string
}

const SelectColumn = <T extends string>({
  sm,
  ariaLabel,
  options,
  value,
  onChange,
  placeholder,
}: SelectColumnProps<T>) => (
  <Col sm={sm}>
    <Select
      aria-label={ariaLabel}
      options={options}
      value={value}
      onChange={(selection) => onChange((selection?.value as T) || '')}
      isSearchable={true}
      isClearable
      placeholder={placeholder}
      menuPortalTarget={document.body}
      styles={selectStyles}
    />
  </Col>
)

interface SelectColumnConfig<T> {
  sm: number
  ariaLabel: string
  options: { value: string; label: string }[]
  value: T | null
  onChange: (value: T | '') => void
  placeholder: string
}

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

    const selectConfigs: SelectColumnConfig<string>[] = [
      {
        sm: 8,
        ariaLabel: 'select-period',
        options: periodOptions,
        value: scriptPeriod,
        onChange: onChangeScriptPeriod,
        placeholder: 'Period',
      },
      {
        sm: 4,
        ariaLabel: 'select-period-modifier',
        options: modifierOptions,
        value: scriptPeriodModifier,
        onChange: onChangeScriptPeriodModifier,
        placeholder: 'Modifier',
      },
    ]

    return (
      <Form.Group as={Row} controlId="period">
        <HelpCol overlay={ScriptSearchHelp()} />
        <Col sm={12 - helpColSize}>
          <Row>
            {selectConfigs.map((config, index) => {
              const selectedValue = config.value
                ? { value: config.value, label: config.value }
                : null
              return (
                <SelectColumn
                  key={index}
                  sm={config.sm}
                  ariaLabel={config.ariaLabel}
                  options={config.options}
                  value={selectedValue}
                  onChange={config.onChange}
                  placeholder={config.placeholder}
                />
              )
            })}
          </Row>
        </Col>
      </Form.Group>
    )
  },
  ({ fragmentService }) => fragmentService.fetchPeriods(),
)

export default PeriodSearchFormGroup
