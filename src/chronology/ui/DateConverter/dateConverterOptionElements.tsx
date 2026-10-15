import React from 'react'

export function getLabelValueOptions(
  options: { label: string | JSX.Element; value: number | string }[],
): JSX.Element[] {
  return options.map(({ label, value }, index) => (
    <option
      key={index}
      value={value}
      {...(value === '' ? { hidden: true } : {})}
    >
      {label}
    </option>
  ))
}

export function getYearOptionLabel(
  year: number,
  era: 'western' | 'se' = 'western',
): string {
  const { eraPrefix, beforeEraPrefix } = {
    western: { eraPrefix: 'CE', beforeEraPrefix: 'BCE' },
    se: { eraPrefix: 'SE', beforeEraPrefix: 'BSE' },
  }[era]
  return year < 1
    ? `${Math.abs(year) + 1} ${beforeEraPrefix}`
    : `${year} ${eraPrefix}`
}

export function getNumberRangeOptions(
  from: number,
  to: number,
  labelFormatter?: (number) => string,
): JSX.Element[] {
  const numbersArray = Array.from(
    { length: to - from + 1 },
    (_, index) => index + from,
  )
  return numbersArray.map((number) => (
    <option key={number} value={number}>
      {labelFormatter ? labelFormatter(number) : number}
    </option>
  ))
}

export function getStringOptions(options: string[]): JSX.Element[] {
  return options.map((label, index) => (
    <option key={index} value={index + 1}>
      {label}
    </option>
  ))
}
