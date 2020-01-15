import {
  fireEvent,
  wait,
  act,
  RenderResult,
  Matcher
} from '@testing-library/react'
import Bluebird from 'bluebird'
import _ from 'lodash'

interface ExpectResult<T> {
  toHaveBeenCalledWith(args: any): T
}
interface WhenResult<T> {
  expect(func: Function): ExpectResult<T>
}

type MatcherFactory<T> = (func: Function) => (args: any) => T

function when<T>(createMatcher: MatcherFactory<T>): WhenResult<T> {
  return {
    expect: (onChange: Function): ExpectResult<T> => ({
      toHaveBeenCalledWith: createMatcher(onChange)
    })
  }
}

export function changeValue<T>(input: Element, newValue: T): void {
  act(() => {
    fireEvent.change(input, { target: { value: newValue } })
  })
}

export function clickNth(element: RenderResult, text: Matcher, n = 0): void {
  const clickable = element.getAllByText(text)[n]
  act(() => {
    fireEvent.click(clickable)
  })
}

type Changer<T> = (
  element: RenderResult,
  selector: Matcher,
  newValue: T,
  n?: number
) => void

export function changeValueByValue<T>(
  element: RenderResult,
  value: Matcher,
  newValue: T,
  n = 0
): void {
  changeValue(element.getAllByDisplayValue(value)[n], newValue)
}

export function changeValueByLabel<T>(
  element: RenderResult,
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
  return when(onChange => async (...expectedChange): Promise<void> => {
    clickNth(element, text, n)
    await wait(() => expect(onChange).toHaveBeenCalledWith(...expectedChange))
  })
}

function whenChangedBy<T>(
  element: RenderResult,
  selector: Matcher,
  newValue: T,
  changer: Changer<T>
): WhenResult<void> {
  return when(onChange => (expectedChangeFactory): void => {
    changer(element, selector, newValue)
    expect(onChange).toHaveBeenCalledWith(expectedChangeFactory(newValue))
  })
}

export function whenChangedByValue<T>(
  element: RenderResult,
  value: Matcher,
  newValue: T
): WhenResult<void> {
  return whenChangedBy(element, value, newValue, changeValueByValue)
}

export function whenChangedByLabel<T>(
  element: RenderResult,
  label: Matcher,
  newValue: T
): WhenResult<void> {
  return whenChangedBy(element, label, newValue, changeValueByLabel)
}

export function submitForm(element: RenderResult, query: string): void {
  act(() => {
    const result = element.container.querySelector(query)
    result && fireEvent.submit(result)
  })
}

export function submitFormByTestId(
  element: RenderResult,
  testId: Matcher
): void {
  act(() => {
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
