import { screen, within } from '@testing-library/react'

export const getPageItem = (label: string): HTMLElement => {
  const pagination = screen.getByLabelText('result-pagination')
  const items = within(pagination).getAllByRole('listitem')
  const item = items.find((listItem) =>
    listItem.textContent?.trim().startsWith(label),
  )
  if (!item) {
    throw new Error(`Could not find pagination item for page ${label}`)
  }
  return item
}
