import {fireEvent, wait} from 'react-testing-library'

function when (createMatcher) {
  return {
    expect: onChange => ({
      toHaveBeenCalledWith: createMatcher(onChange)
    })
  }
}

export async function changeValue (input, newValue) {
  input.value = newValue
  fireEvent.change(input)

  await wait()
}

export async function clickNth (element, text, n) {
  const clickable = element.getAllByText(text)[n]
  fireEvent.click(clickable)
  await wait()
}

export async function changeValueByValue (element, value, newValue) {
  await changeValue(element.getByValue(value), newValue)
}

export async function changeValueByLabel (element, label, newValue) {
  await changeValue(element.getByLabelText(label), newValue)
}

export function whenClicked (element, text, n = 0) {
  return when(onChange => async (...expectedChange) => {
    await clickNth(element, text, n)
    expect(onChange).toHaveBeenCalledWith(...expectedChange)
  })
}

export function whenChanged (element, value, newValue) {
  return when(onChange => async expectedChangeFactory => {
    await changeValueByValue(element, value, newValue)
    expect(onChange).toHaveBeenCalledWith(expectedChangeFactory(newValue))
  })
}

export async function submitForm (element, query) {
  fireEvent.submit(element.container.querySelector(query))
  await wait()
}

export class AbortError extends Error {
  constructor (...params) {
    super(...params)
    this.name = 'AbortError'
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AbortError)
    }
  }
}
