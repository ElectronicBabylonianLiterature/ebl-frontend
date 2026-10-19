import { screen, within } from '@testing-library/react'

export function getPageItem(label: string): HTMLElement {
  const pagination = screen.getByLabelText('result-pagination')
  const [item] = within(pagination)
    .getAllByRole('listitem')
    .filter((listItem) => String(listItem.textContent).trim().startsWith(label))
  expect(item).toBeDefined()
  return item
}
