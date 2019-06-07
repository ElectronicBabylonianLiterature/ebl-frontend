import { fireEvent, wait } from '@testing-library/react'
import * as bluebird from 'bluebird'
import _ from 'lodash'

function when(createMatcher) {
  return {
    expect: onChange => ({
      toHaveBeenCalledWith: createMatcher(onChange)
    })
  }
}

export function changeValue(input, newValue) {
  fireEvent.change(input, { target: { value: newValue } })
}

export async function clickNth(element, text, n = 0) {
  const clickable = element.getAllByText(text)[n]
  fireEvent.click(clickable)
  await wait()
}

export function changeValueByValue(element, value, newValue, n = 0) {
  changeValue(element.getAllByDisplayValue(value)[n], newValue)
}

export function changeValueByLabel(element, label, newValue, n = 0) {
  changeValue(element.getAllByLabelText(label)[n], newValue)
}

export function whenClicked(element, text, n = 0) {
  return when(onChange => async (...expectedChange) => {
    await clickNth(element, text, n)
    await wait(() => expect(onChange).toHaveBeenCalledWith(...expectedChange))
  })
}

function whenChangedBy(element, selector, newValue, changer) {
  return when(onChange => expectedChangeFactory => {
    changer(element, selector, newValue)
    expect(onChange).toHaveBeenCalledWith(expectedChangeFactory(newValue))
  })
}

export function whenChangedByValue(element, value, newValue) {
  return whenChangedBy(element, value, newValue, changeValueByValue)
}

export function whenChangedByLabel(element, label, newValue) {
  return whenChangedBy(element, label, newValue, changeValueByLabel)
}

export async function submitForm(element, query) {
  fireEvent.submit(element.container.querySelector(query))
  await wait()
}

export async function submitFormByTestId(element, testId) {
  fireEvent.submit(element.getByTestId(testId))
  await wait()
}

export function testDelegation(object, testData) {
  describe.each(testData)(
    '%s',
    (method, params, target, expectedResult, expectedParams, targetResult) => {
      let result

      beforeEach(() => {
        jest.clearAllMocks()
        target.mockReturnValueOnce(targetResult || expectedResult)
        result = (_.isFunction(object) ? object() : object)[method](...params)
      })

      it(`Delegates`, () => {
        expect(target).toHaveBeenCalledWith(...(expectedParams || params))
      })

      it(`Returns`, async () => {
        if (result instanceof bluebird.Promise || result instanceof Promise) {
          await expect(result).resolves.toEqual(expectedResult)
        } else {
          expect(result).toEqual(expectedResult)
        }
      })
    }
  )
}
