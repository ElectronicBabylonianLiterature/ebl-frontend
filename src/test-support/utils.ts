import {
  fireEvent,
  waitFor,
  act,
  RenderResult,
  Screen,
  Matcher,
} from '@testing-library/react'
import Bluebird from 'bluebird'
import _ from 'lodash'

interface ExpectResult<T> {
  toHaveBeenCalledWith(args: any): T
}
interface WhenResult<T> {
  expect(func: jest.Mock): ExpectResult<T>
}

type MatcherFactory<T> = (func: jest.Mock) => (args: any) => T

function when<T>(createMatcher: MatcherFactory<T>): WhenResult<T> {
  return {
    expect: (onChange: jest.Mock): ExpectResult<T> => ({
      toHaveBeenCalledWith: createMatcher(onChange),
    }),
  }
}

export function changeValue<T>(input: Element, newValue: T): void {
  fireEvent.change(input, { target: { value: newValue } })
}

export async function clickNth(
  element: RenderResult,
  text: Matcher,
  n = 0
): Promise<void> {
  const clickable = element.getAllByText(text)[n]
  await act(async () => {
    fireEvent.click(clickable)
  })
}

type Changer<T> = (
  element: RenderResult | Screen,
  selector: Matcher,
  newValue: T,
  n?: number
) => void

export function changeValueByValue<T>(
  element: RenderResult | Screen,
  value: Matcher,
  newValue: T,
  n = 0
): void {
  changeValue(element.getAllByDisplayValue(value)[n], newValue)
}

export function changeValueByLabel<T>(
  element: RenderResult | Screen,
  label: Matcher,
  newValue: T,
  n = 0
): void {
  changeValue(element.getAllByLabelText(label)[n], newValue)
}

export function whenClicked(
  element: RenderResult,
  text: Matcher,
  n = 0
): WhenResult<Promise<void>> {
  return when((onChange) => async (...expectedChange): Promise<void> => {
    await clickNth(element, text, n)
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(...expectedChange)
    )
  })
}

function whenChangedBy<T>(
  element: RenderResult | Screen,
  selector: Matcher,
  newValue: T,
  changer: Changer<T>
): WhenResult<void> {
  return when((onChange) => (expectedChangeFactory): void => {
    changer(element, selector, newValue)
    expect(onChange).toHaveBeenCalledWith(expectedChangeFactory(newValue))
  })
}

export function whenChangedByValue<T>(
  element: RenderResult | Screen,
  value: Matcher,
  newValue: T
): WhenResult<void> {
  return whenChangedBy(element, value, newValue, changeValueByValue)
}

export function whenChangedByLabel<T>(
  element: RenderResult | Screen,
  label: Matcher,
  newValue: T
): WhenResult<void> {
  return whenChangedBy(element, label, newValue, changeValueByLabel)
}

export async function submitForm(element: RenderResult): Promise<void> {
  await act(async () => {
    const result = element.container.querySelector('form')
    result && fireEvent.submit(result)
  })
}

export async function submitFormByTestId(
  element: RenderResult | Screen,
  testId: Matcher
): Promise<void> {
  await act(async () => {
    fireEvent.submit(element.getByTestId(testId))
  })
}

export type TestData = [string, any[], jest.Mock, any, (any[] | null)?, any?]
export function testDelegation(
  object: any,
  testData: readonly TestData[]
): void {
  describe.each(testData)(
    '%s',
    (method, params, target, expectedResult, expectedParams, targetResult) => {
      let result: any

      beforeEach(() => {
        jest.clearAllMocks()
        target.mockReturnValueOnce(targetResult || expectedResult)
        result = (_.isFunction(object) ? object() : object)[method](...params)
      })

      it(`Delegates`, () => {
        expect(target).toHaveBeenCalledWith(...(expectedParams || params))
      })

      it(`Returns`, async () => {
        if (result instanceof Bluebird || result instanceof Promise) {
          await expect(result).resolves.toEqual(expectedResult)
        } else {
          expect(result).toEqual(expectedResult)
        }
      })
    }
  )
}
