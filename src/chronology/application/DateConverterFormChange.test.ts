import { ChangeEvent } from 'react'
import { handleDateConverterFormChange } from './DateConverterFormChange'
import DateConverter from 'chronology/domain/DateConverter'

const createMockEvent = (
  name: string,
  value: string
): ChangeEvent<HTMLInputElement> => ({
  target: ({
    name,
    value,
  } as unknown) as HTMLInputElement,
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

beforeEach(() => {
  mockDateConverter = {
    setToGregorianDate: jest.fn(),
    setToJulianDate: jest.fn(),
    setToSeBabylonianDate: jest.fn(),
    setToMesopotamianDate: jest.fn(),
  }
  mockFormData = dateConverter.calendar
  mockSetFormData = jest.fn()
})

it('handles setToGregorianDate scenario correctly', () => {
  const mockEvent = createMockEvent('month', '12')
  handleDateConverterFormChange({
    event: mockEvent,
    scenario: 'setToGregorianDate',
    formData: mockFormData,
    dateConverter: mockDateConverter,
    setFormData: mockSetFormData,
    setScenario,
  })
  expect(mockDateConverter.setToGregorianDate).toBeCalledWith(-310, 3, 29)
})

it('handles setToJulianDate scenario correctly', () => {
  const mockEvent = createMockEvent('month', '12')
  handleDateConverterFormChange({
    event: mockEvent,
    scenario: 'setToJulianDate',
    formData: mockFormData,
    dateConverter: mockDateConverter,
    setFormData: mockSetFormData,
    setScenario,
  })
  expect(mockDateConverter.setToJulianDate).toBeCalledWith(-310, 4, 3)
})

it('handles setToJulianDate scenario correctly', () => {
  const mockEvent = createMockEvent('month', '12')
  handleDateConverterFormChange({
    event: mockEvent,
    scenario: 'setToJulianDate',
    formData: mockFormData,
    dateConverter: mockDateConverter,
    setFormData: mockSetFormData,
    setScenario,
  })
  expect(mockDateConverter.setToJulianDate).toBeCalledWith(-310, 4, 3)
})

it('handles setToSeBabylonianDate scenario correctly', () => {
  const mockEvent = createMockEvent('month', '12')
  handleDateConverterFormChange({
    event: mockEvent,
    scenario: 'setToSeBabylonianDate',
    formData: mockFormData,
    dateConverter: mockDateConverter,
    setFormData: mockSetFormData,
    setScenario,
  })
  expect(mockDateConverter.setToSeBabylonianDate).toBeCalledWith(1, 1, 1)
})

it('handles setToMesopotamianDate scenario correctly', () => {
  const mockEvent = createMockEvent('month', '12')
  handleDateConverterFormChange({
    event: mockEvent,
    scenario: 'setToMesopotamianDate',
    formData: mockFormData,
    dateConverter: mockDateConverter,
    setFormData: mockSetFormData,
    setScenario,
  })
  expect(mockDateConverter.setToMesopotamianDate).toBeCalledWith(
    'Seleucus I Nicator',
    1,
    1,
    1
  )
})
