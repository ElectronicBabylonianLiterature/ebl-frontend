import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MuseumSearchFormGroup, {
  getCountryName,
} from 'fragmentarium/ui/search/SearchFormMuseum'

describe('getCountryName', () => {
  it.each([
    ['DE', 'Germany'],
    ['', 'Unknown Country'],
    ['DEU', 'Unknown Country'],
    ['QQ', 'QQ'],
  ])('maps %p to %p', (countryCode, expected) => {
    expect(getCountryName(countryCode)).toEqual(expected)
  })
})

describe('MuseumSearchFormGroup', () => {
  it('lists named and unnamed museums and selects one', async () => {
    const onChange = jest.fn()
    render(<MuseumSearchFormGroup value={null} onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('select-museum'), 'Hilprecht')
    await userEvent.click(
      screen.getByText(
        'Frau Professor Hilprecht Collection of Babylonian Antiquities, Jena, Germany',
      ),
    )
    expect(onChange).toHaveBeenCalledWith('HILPRECHT_COLLECTION')
    await userEvent.type(screen.getByLabelText('select-museum'), 'Hyper')
    expect(screen.getByText('Hyperuranion')).toBeVisible()
  })
})
