import React from 'react'
import { act, waitFor, within } from '@testing-library/react'
import { render, fireEvent, screen } from '@testing-library/react'
import MarkupService from 'markup/application/MarkupService'
import DateConverterForm, {
  AboutDateConverter,
} from 'chronology/ui/DateConverter/DateConverterForm'
import { markupDtoSerialized } from 'test-support/markup-fixtures'
import { MemoryRouter } from 'react-router-dom'
import Bluebird from 'bluebird'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

jest.mock('markup/application/MarkupService')

describe('AboutDateConverter', () => {
  const markupServiceMock = new (MarkupService as jest.Mock<
    jest.Mocked<MarkupService>
  >)()
  it('renders without crashing', async () => {
    markupServiceMock.fromString.mockReturnValue(
      Bluebird.resolve(markupDtoSerialized)
    )
    await act(async () => {
      await render(
        <MemoryRouter>{AboutDateConverter(markupServiceMock)}</MemoryRouter>
      )
      await waitForSpinnerToBeRemoved(screen)
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })
      expect(screen.getByText(/proleptic Gregorian/i)).toBeInTheDocument()
    })
  })
})

const optionToArray = (select: HTMLElement): number => {
  try {
    return within(select).getAllByRole('option').length
  } catch {
    return 0
  }
}

describe('DateConverterForm', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(true),
      },
      writable: true,
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders form, options, and scenario panel correctly', () => {
    render(<DateConverterForm />)
    expect(screen.getAllByLabelText(/date/i)).toHaveLength(4)
    expect(screen.getByText('Copy JSON')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/cjdn|lunation/i)).toHaveLength(2)
    expect(optionToArray(screen.getByLabelText('Ruler'))).toStrictEqual(29)
    expect(screen.getAllByLabelText(/year/i).map(optionToArray)).toStrictEqual([
      701,
      702,
      30,
      701,
      0,
      0,
    ])
    expect(
      screen.getAllByLabelText(/month/i).map(optionToArray)
    ).toStrictEqual([12, 12, 13, 0])
    expect(screen.getAllByLabelText(/day/i).map(optionToArray)).toStrictEqual([
      31,
      7,
      30,
      29,
    ])
  })

  it('renders initial form values correctly', () => {
    render(<DateConverterForm />)
    expect(screen.getByLabelText('Year')).toHaveValue('-309')
    expect(screen.getByLabelText('Month')).toHaveValue('3')
    expect(screen.getByLabelText('Day')).toHaveValue('29')
    expect(screen.getByLabelText('Julian Year')).toHaveValue('-310')
    expect(screen.getByLabelText('Julian Month')).toHaveValue('4')
    expect(screen.getByLabelText('Julian Day')).toHaveValue('3')
    expect(screen.getByLabelText('Mesopotamian Month')).toHaveValue('1')
    expect(screen.getByLabelText('Mesopotamian Month Length')).toHaveValue('29')
    expect(screen.getByLabelText('Mesopotamian Day')).toHaveValue('1')
    expect(screen.getByLabelText('Ruler')).toHaveValue('Seleucus I Nicator')
    expect(screen.getByLabelText('Regnal Year')).toHaveValue('1')
    expect(screen.getByLabelText('SE Babylonian Year')).toHaveValue('1')
    expect(screen.getByLabelText('SE Macedonian Year')).toHaveValue('1')
    expect(screen.getByLabelText('SE Arsacid Year')).toHaveValue('')
    expect(screen.getByLabelText('CJDN')).toHaveValue('1607923')
    expect(screen.getByLabelText('Lunation Nabonassar')).toHaveValue('5395')
  })

  it('responds to scenario change', () => {
    render(<DateConverterForm />)
    const julianRadio = screen.getByLabelText('Julian date')
    const seleucidRadio = screen.getByLabelText('Seleucid (Babylonian) date')
    const nabonassarRadio = screen.getByLabelText('Nabonassar date')
    const modernRadio = screen.getByLabelText('Modern date')
    act(() => {
      fireEvent.click(julianRadio)
    })
    expect(screen.getByLabelText('Julian Year')).toBeEnabled()
    expect(screen.getByLabelText('Julian Month')).toBeEnabled()
    expect(screen.getByLabelText('Julian Day')).toBeEnabled()
    act(() => {
      fireEvent.click(seleucidRadio)
    })
    expect(screen.getByLabelText('SE Babylonian Year')).toBeEnabled()
    expect(screen.getByLabelText('Mesopotamian Month')).toBeEnabled()
    expect(screen.getByLabelText('Mesopotamian Day')).toBeEnabled()
    act(() => {
      fireEvent.click(nabonassarRadio)
    })
    expect(screen.getByLabelText('Ruler')).toBeEnabled()
    expect(screen.getByLabelText('Regnal Year')).toBeEnabled()
    expect(screen.getByLabelText('Mesopotamian Month')).toBeEnabled()
    expect(screen.getByLabelText('Mesopotamian Day')).toBeEnabled()
    act(() => {
      fireEvent.click(modernRadio)
    })
    expect(screen.getByLabelText('Year')).toBeEnabled()
    expect(screen.getByLabelText('Month')).toBeEnabled()
    expect(screen.getByLabelText('Day')).toBeEnabled()
  })

  it('responds to select change', async () => {
    render(<DateConverterForm />)
    await act(async () => {
      fireEvent.click(
        within(screen.getByLabelText('Year')).getByText('300 BCE')
      )
    })
    expect(screen.getByLabelText('Year')).toHaveValue('-309')
    expect(screen.getByLabelText('Month')).toHaveValue('3')
    expect(screen.getByLabelText('Day')).toHaveValue('29')
    expect(screen.getByLabelText('Julian Year')).toHaveValue('-310')
    expect(screen.getByLabelText('Julian Month')).toHaveValue('4')
    expect(screen.getByLabelText('Julian Day')).toHaveValue('3')
    expect(screen.getByLabelText('Mesopotamian Month')).toHaveValue('1')
    expect(screen.getByLabelText('Mesopotamian Month Length')).toHaveValue('29')
    expect(screen.getByLabelText('Mesopotamian Day')).toHaveValue('1')
    expect(screen.getByLabelText('Ruler')).toHaveValue('Seleucus I Nicator')
    expect(screen.getByLabelText('Regnal Year')).toHaveValue('1')
    expect(screen.getByLabelText('SE Babylonian Year')).toHaveValue('1')
    expect(screen.getByLabelText('SE Macedonian Year')).toHaveValue('1')
    expect(screen.getByLabelText('SE Arsacid Year')).toHaveValue('')
    expect(screen.getByLabelText('CJDN')).toHaveValue('1607923')
    expect(screen.getByLabelText('Lunation Nabonassar')).toHaveValue('5395')
  })

  it("copies the form's JSON to clipboard", async () => {
    render(<DateConverterForm />)
    await act(async () => {
      fireEvent.click(screen.getByText('Copy JSON'))
    })
    const expected = {
      gregorianYear: -309,
      gregorianMonth: 3,
      gregorianDay: 29,
      julianYear: -310,
      julianMonth: 4,
      julianDay: 3,
      cjdn: 1607923,
      weekDay: 4,
      mesopotamianMonth: 1,
      seBabylonianYear: 1,
      lunationNabonassar: 5395,
      bcJulianYear: 311,
      bcGregorianYear: 310,
      mesopotamianDay: 1,
      mesopotamianMonthLength: 29,
      ruler: 'Seleucus I Nicator',
      regnalYear: 1,
      regnalYears: 30,
      seMacedonianYear: 1,
    }
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      JSON.stringify(expected)
    )
  })
})
