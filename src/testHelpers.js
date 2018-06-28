import {fireEvent, wait} from 'react-testing-library'

export async function clickNth (element, text, n) {
  const clickable = element.getAllByText(text)[n]
  fireEvent.click(clickable)
  await wait()
}
