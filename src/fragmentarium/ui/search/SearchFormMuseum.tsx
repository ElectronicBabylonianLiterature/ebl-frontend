import React from 'react'
import { Museums } from 'fragmentarium/domain/museum'
import SelectFormGroup from 'fragmentarium/ui/search/SelectFromGroup'
import { MuseumSearchHelp } from 'fragmentarium/ui/SearchHelp'

interface MuseumSearchFormGroupProps {
  value: string | null
  onChange: (value: string | null) => void
}

export const getCountryName = (countryCode: string): string => {
  const isValidCode = countryCode && countryCode.length === 2
  if (!isValidCode) return 'Unknown Country'

  const displayNames = new Intl.DisplayNames(undefined, {
    type: 'region',
    fallback: 'none',
  })
  return displayNames.of(countryCode) || countryCode
}

export default function MuseumSearchFormGroup({
  value,
  onChange,
}: MuseumSearchFormGroupProps): JSX.Element {
  const options = Object.entries(Museums).map(([key, museum]) => ({
    value: key,
    label: museum.name
      ? `${museum.name}, ${museum.city}, ${getCountryName(museum.country)}`
      : `${key[0]}${key.slice(1).toLowerCase()}`,
  }))

  return (
    <SelectFormGroup
      controlId="museum"
      helpOverlay={MuseumSearchHelp()}
      placeholder="Museum"
      options={options}
      value={value}
      onChange={onChange}
      classNamePrefix="museum-selector"
    />
  )
}
