import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import {
  EditLiteVariant,
  parseEditLiteParameters,
} from 'corpus/ui/edit-lite/editLiteParameters'
import VariantSwitcher, {
  variantLabels,
} from 'corpus/ui/edit-lite/VariantSwitcher'

const path = '/corpus/L/1/2/SB/I/edit-lite'

const labels: readonly (readonly [EditLiteVariant, string])[] = [
  ['accordion', 'A · Accordion'],
  ['pages', 'B · Pages'],
  ['split', 'C · Split view'],
  ['score', 'D · Inline score'],
]

function LocatedSwitcher(): JSX.Element {
  const location = useLocation()
  return (
    <>
      <VariantSwitcher
        variant={parseEditLiteParameters(location.search).variant}
        search={location.search}
      />
      <output aria-label="Location">
        {location.pathname}
        {location.search}
        {location.hash}
      </output>
    </>
  )
}

function renderSwitcher(search = ''): void {
  render(
    <MemoryRouter initialEntries={[`${path}${search}`]}>
      <LocatedSwitcher />
    </MemoryRouter>,
  )
}

function link(label: string): HTMLElement {
  return screen.getByRole('link', { name: label })
}

test('labels the four versions', () => {
  expect(Object.entries(variantLabels)).toEqual(labels)
})

test('lists one link per version inside a labelled navigation', () => {
  renderSwitcher()
  const navigation = screen.getByRole('navigation', { name: 'Editor version' })

  expect(
    within(navigation)
      .getAllByRole('link')
      .map((element) => element.textContent),
  ).toEqual(labels.map(([, label]) => label))
})

test.each(labels)(
  'links %s to the same page with only the variant set',
  (variant, label) => {
    renderSwitcher()

    expect(link(label)).toHaveAttribute('href', `${path}?variant=${variant}`)
  },
)

test.each(labels)('marks %s as the current version', (variant, label) => {
  renderSwitcher(`?variant=${variant}`)
  const currentLinks = screen
    .getAllByRole('link')
    .filter((element) => element.hasAttribute('aria-current'))

  expect(currentLinks).toEqual([link(label)])
  expect(link(label)).toHaveAttribute('aria-current', 'page')
  expect(link(label)).toHaveClass('active')
})

test('marks the accordion as current without a variant', () => {
  renderSwitcher()

  expect(link('A · Accordion')).toHaveAttribute('aria-current', 'page')
  expect(link('C · Split view')).not.toHaveClass('active')
})

test('keeps the other parameters in every link', () => {
  renderSwitcher('?source=legacy&variant=pages&size=25&line=12a')

  expect(link('D · Inline score')).toHaveAttribute(
    'href',
    `${path}?line=12a&size=25&source=legacy&variant=score`,
  )
  expect(link('B · Pages')).toHaveAttribute(
    'href',
    `${path}?line=12a&size=25&source=legacy&variant=pages`,
  )
})

test('changes only the variant in the location when a link is followed', async () => {
  renderSwitcher('?source=api&line=3')

  await userEvent.click(link('C · Split view'))

  expect(screen.getByLabelText('Location')).toHaveTextContent(
    `${path}?line=3&source=api&variant=split`,
  )
  expect(link('C · Split view')).toHaveAttribute('aria-current', 'page')
  expect(link('A · Accordion')).not.toHaveAttribute('aria-current')
})
