/* eslint-disable testing-library/prefer-screen-queries */
import {
  fireEvent,
  waitFor,
  act,
  RenderResult,
  Screen,
  Matcher,
} from '@testing-library/react'
import Bluebird from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'
import _ from 'lodash'
import { QueryItem } from 'query/QueryResult'

interface ExpectResult<T> {
  toHaveBeenCalledWith(...args: unknown[]): T
}
interface WhenResult<T> {
  expect(func: jest.Mock): ExpectResult<T>
}

type MatcherFactory<T, A = unknown> = (func: jest.Mock) => (args: A) => T

function when<T, A = unknown>(
  createMatcher: MatcherFactory<T, A>,
): WhenResult<T> {
  return {
    expect: (onChange: jest.Mock): ExpectResult<T> => ({
      toHaveBeenCalledWith: createMatcher(onChange),
    }),
  }
}

export function changeValue<T>(input: Element, newValue: T): void {
  fireEvent.change(input, { target: { value: newValue } })
}

export function clickNth(
  element: RenderResult | Screen,
  text: Matcher,
  n = 0,
): void {
  const clickable = element.getAllByText(text)[n]
  fireEvent.click(clickable)
}

type Changer<T> = (
  element: RenderResult | Screen,
  selector: Matcher,
  newValue: T,
  n?: number,
) => void

export function changeValueByValue<T>(
  element: RenderResult | Screen,
  value: Matcher,
  newValue: T,
  n = 0,
): void {
  changeValue(element.getAllByDisplayValue(value)[n], newValue)
}

export function changeValueByLabel<T>(
  element: RenderResult | Screen,
  label: Matcher,
  newValue: T,
  n = 0,
): void {
  changeValue(element.getAllByLabelText(label)[n], newValue)
}

export function whenClicked(
  element: RenderResult | Screen,
  text: Matcher,
  n = 0,
): WhenResult<Promise<void>> {
  return when((onChange) => async (...expectedChange): Promise<void> => {
    clickNth(element, text, n)
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(...expectedChange),
    )
  })
}

function whenChangedBy<T>(
  element: RenderResult | Screen,
  selector: Matcher,
  newValue: T,
  changer: Changer<T>,
): WhenResult<void> {
  return when<void, (value: T) => unknown>(
    (onChange) =>
      (expectedChangeFactory: (value: T) => unknown): void => {
        changer(element, selector, newValue)
        expect(onChange).toHaveBeenCalledWith(expectedChangeFactory(newValue))
      },
  )
}

export function whenChangedByValue<T>(
  element: RenderResult | Screen,
  value: Matcher,
  newValue: T,
): WhenResult<void> {
  return whenChangedBy(element, value, newValue, changeValueByValue)
}

export function whenChangedByLabel<T>(
  element: RenderResult | Screen,
  label: Matcher,
  newValue: T,
): WhenResult<void> {
  return whenChangedBy(element, label, newValue, changeValueByLabel)
}

export async function submitForm(container: HTMLElement): Promise<void> {
  await act(async () => {
    // eslint-disable-next-line
    const result = container.querySelector('form')
    result && fireEvent.submit(result)
  })
}

export function submitFormByTestId(
  element: RenderResult | Screen,
  testId: Matcher,
): void {
  fireEvent.submit(element.getByTestId(testId))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TestData<S, T = any, Y extends any[] = any[]> {
  constructor(
    public method: keyof S,
    public params: unknown[],
    public target: jest.Mock<T, Y> | jest.MockInstance<T, Y>,
    public expectedResult: unknown,
    public expectedParams?: Y,
    public targetResult?: T,
  ) {}
}

export function testDelegation<S>(
  object: S,
  testData: readonly TestData<S>[],
): void {
  describe.each(testData)(
    '%s',
    ({
      method,
      params,
      target,
      expectedResult,
      expectedParams,
      targetResult,
    }) => {
      let result: unknown

      beforeEach(() => {
        jest.clearAllMocks()
        target.mockReturnValueOnce(targetResult ?? expectedResult)
        result = (_.isFunction(object) ? object() : object)[method](...params)
      })

      it('Delegates', () => {
        expect(target).toHaveBeenCalledWith(...(expectedParams ?? params))
      })

      it('Returns', async () => {
        if (result instanceof Bluebird || result instanceof Promise) {
          const resolvedResult = await result
          await expect(resolvedResult).toEqual(expectedResult)
        } else {
          expect(result).toEqual(expectedResult)
        }
      })
    },
  )
}

export function queryItemOf(fragment: Fragment): QueryItem {
  return {
    museumNumber: fragment.number,
    matchingLines: [],
    matchCount: 0,
  }
}
