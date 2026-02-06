import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import withData from 'http/withData'
import Select, { StylesConfig } from 'react-select'
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

const modifierOptions: { value: PeriodModifierString; label: string }[] = [
  'Early',
  'Middle',
  'Late',
].map((val) => ({
  value: val as PeriodModifierString,
  label: val,
}))

const selectStyles: StylesConfig<{ value: string; label: string }, false> = {
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
}

interface SelectColumnProps {
  sm: number
  ariaLabel: string
  options: { value: string; label: string }[]
  value: { value: string; label: string } | null
  onChange: (value: string) => void
  placeholder: string
}

const SelectColumn = ({
  sm,
  ariaLabel,
  options,
  value,
  onChange,
  placeholder,
}: SelectColumnProps) => (
  <Col sm={sm}>
    <Select
      aria-label={ariaLabel}
      options={options}
      value={value}
      onChange={(selection) => onChange(selection?.value ?? '')}
      isSearchable={true}
      isClearable
      placeholder={placeholder}
      menuPortalTarget={document.body}
      styles={selectStyles}
      className="SearchForm__select"
      classNamePrefix="search-form-select"
    />
  </Col>
)

interface SelectColumnConfig {
  sm: number
  ariaLabel: string
  options: { value: string; label: string }[]
  value: string | null
  onChange: (value: string) => void
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
    const periodOptions = (periodOptionsData as PeriodString[]).map(
      (period) => ({
        value: period,
        label: period,
      }),
    )

    const selectConfigs: SelectColumnConfig[] = [
      {
        sm: 8,
        ariaLabel: 'select-period',
        options: periodOptions,
        value: scriptPeriod,
        onChange: (value) => onChangeScriptPeriod(value as PeriodString),
        placeholder: 'Period',
      },
      {
        sm: 4,
        ariaLabel: 'select-period-modifier',
        options: modifierOptions as { value: string; label: string }[],
        value: scriptPeriodModifier,
        onChange: (value) =>
          onChangeScriptPeriodModifier(value as PeriodModifierString),
        placeholder: 'Modifier',
      },
    ]

    return (
      <Form.Group as={Row} controlId="period">
        <HelpCol overlay={ScriptSearchHelp()} />
        <Col sm={12 - helpColSize}>
          <Row className="g-0">
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
