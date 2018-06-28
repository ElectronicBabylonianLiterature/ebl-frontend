import {fireEvent, wait} from 'react-testing-library'

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
