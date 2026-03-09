import { ChangeEvent } from 'react'
import { handleDateConverterFormChange } from './DateConverterFormChange'
import DateConverter from 'chronology/domain/DateConverter'

const createMockEvent = (
  name: string,
  value: string,
): ChangeEvent<HTMLInputElement> => ({
  target: {
    name,
    value,
  } as unknown as HTMLInputElement,
  nativeEvent: new Event('change'),
  currentTarget: document.createElement('input'),
  bubbles: true,
  cancelable: true,
  defaultPrevented: false,
  eventPhase: Event.NONE,
  isTrusted: false,
  preventDefault: jest.fn(),
  isDefaultPrevented: jest.fn(),
  stopPropagation: jest.fn(),
  isPropagationStopped: jest.fn(),
  persist: jest.fn(),
  timeStamp: Date.now(),
  type: 'change',
})

const setScenario = jest.fn()
const dateConverter = new DateConverter()
let mockFormData, mockDateConverter, mockSetFormData
let handleChange

beforeEach(() => {
  mockDateConverter = {
    setToGregorianDate: jest.fn(),
    setToJulianDate: jest.fn(),
    setToSeBabylonianDate: jest.fn(),
    setToMesopotamianDate: jest.fn(),
    rulerToBrinkmanKings: jest.fn(),
  }
  mockFormData = dateConverter.calendar
  mockSetFormData = jest.fn()
  mockDateConverter.rulerToBrinkmanKings.mockReturnValue({ totalOfYears: '10' })

  handleChange = (
    scenario:
      | 'setToGregorianDate'
      | 'setToJulianDate'
      | 'setToSeBabylonianDate'
      | 'setToMesopotamianDate',
    mockEvent: ChangeEvent<HTMLInputElement>,
  ): void => {
    handleDateConverterFormChange({
      event: mockEvent,
      scenario: scenario,
      formData: mockFormData,
      dateConverter: mockDateConverter,
      setFormData: mockSetFormData,
      setScenario,
    })
  }
})

it('handles setToGregorianDate scenario correctly', () => {
  handleChange('setToGregorianDate', createMockEvent('month', '12'))
  expect(mockDateConverter.setToGregorianDate).toBeCalledWith(-310, 3, 29)
})

it('handles setToJulianDate scenario correctly', () => {
  handleChange('setToJulianDate', createMockEvent('month', '12'))
  expect(mockDateConverter.setToJulianDate).toBeCalledWith(-310, 4, 3)
})

it('handles setToSeBabylonianDate scenario correctly', () => {
  handleChange('setToSeBabylonianDate', createMockEvent('month', '12'))
  expect(mockDateConverter.setToSeBabylonianDate).toBeCalledWith(1, 1, 1)
})

it('handles setToMesopotamianDate scenario correctly', () => {
  handleChange('setToMesopotamianDate', createMockEvent('month', '12'))
  expect(mockDateConverter.setToMesopotamianDate).toBeCalledWith(
    'Seleucus I Nicator',
    1,
    1,
    1,
  )
})
