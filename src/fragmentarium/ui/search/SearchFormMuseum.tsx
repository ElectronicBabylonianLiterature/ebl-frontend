import React from 'react'
import { Museums } from 'fragmentarium/domain/museum'
import SelectFormGroup from './SelectFromGroup'
import { MuseumSearchHelp } from 'fragmentarium/ui/SearchHelp'

interface MuseumSearchFormGroupProps {
  value: string | null
  onChange: (value: string | null) => void
}

export default function MuseumSearchFormGroup({
  value,
  onChange,
}: MuseumSearchFormGroupProps): JSX.Element {
  const getCountryName = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) {
      return 'Unknown Country'
    }
    try {
      const displayName = new Intl.DisplayNames(undefined, {
        type: 'region',
      }).of(countryCode)
      return displayName || 'Unknown Country'
    } catch (e) {
      return 'Unknown Country'
    }
  }

  const options = Object.entries(Museums).map(([key, museum]) => {
    const keyInSentenceCase = key[0] + key.slice(1).toLowerCase()
    return {
      value: key,
      label: museum.name
        ? `${museum.name}, ${museum.city}, ${getCountryName(museum.country)}`
        : keyInSentenceCase,
    }
  })

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
