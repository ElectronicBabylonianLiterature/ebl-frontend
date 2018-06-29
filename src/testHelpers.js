import {fireEvent, wait} from 'react-testing-library'

function when (createMatcher) {
  return {
    expect: onChange => ({
      toHaveBeenCalledWith: createMatcher(onChange)
    })
  }
}

export async function clickNth (element, text, n) {
  const clickable = element.getAllByText(text)[n]
  fireEvent.click(clickable)
  await wait()
}

export async function changeValue (element, value, newValue) {
  const input = element.getByValue(value)
  input.value = newValue
  fireEvent.change(input)

  await wait()
}

export function whenClicked (element, text, n = 0) {
  return when(onChange => async expectedChange => {
    await clickNth(element, text, n)
    expect(onChange).toHaveBeenCalledWith(expectedChange)
  })
}

export function whenChanged (element, value, newValue) {
  return when(onChange => async expectedChangeFactory => {
    await changeValue(element, value, newValue)
    expect(onChange).toHaveBeenCalledWith(expectedChangeFactory(newValue))
  })
}
