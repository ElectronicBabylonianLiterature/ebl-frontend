import { screen, fireEvent, waitFor } from '@testing-library/react'
import { NAMED_ENTITY_TAGS } from 'dictionary/domain/namedEntityTags'
import {
  createProperNounPanelTestContext,
  resetProperNounPanelMocks,
} from 'fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.testSupport'

jest.mock('dictionary/application/WordService')

const { wordServiceMock, renderPanel } = createProperNounPanelTestContext()

beforeEach(() => {
  resetProperNounPanelMocks(wordServiceMock)
})

describe('Input Validation', () => {
  it('renders the input field with correct label', () => {
    renderPanel()
    expect(screen.getByLabelText('properNoun-input')).toBeInTheDocument()
    expect(screen.getByText('Proper Noun Name')).toBeInTheDocument()
  })

  it('capitalizes the first letter of input', async () => {
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')

    fireEvent.change(input, { target: { value: 'marduk' } })

    await waitFor(() => {
      expect(input).toHaveValue('Marduk')
    })
  })

  it('trims leading and trailing whitespace before storing input', async () => {
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')

    fireEvent.change(input, { target: { value: '  marduk  ' } })

    await waitFor(() => {
      expect(input).toHaveValue('Marduk')
    })
  })

  it('filters out non-Latin characters', async () => {
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')
    fireEvent.change(input, { target: { value: 'Test123@#$' } })
    await waitFor(() => {
      expect(input).toHaveValue('Test')
    })
  })

  it('allows Latin extended characters', async () => {
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')
    fireEvent.change(input, { target: { value: 'šamaš' } })
    await waitFor(() => {
      expect(input).toHaveValue('Šamaš')
    })
  })

  it('allows spaces and hyphens', async () => {
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')
    fireEvent.change(input, { target: { value: 'sin-leqi-unninni' } })
    await waitFor(() => {
      expect(input).toHaveValue('Sin-leqi-unninni')
    })
  })

  it('clears input when only non-Latin characters are entered', async () => {
    renderPanel()
    const input = screen.getByLabelText('properNoun-input')

    fireEvent.change(input, { target: { value: '12345' } })

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })
})

describe('Named Entity Tag Selection', () => {
  it('renders the named entity tag select with correct label', () => {
    renderPanel()
    expect(screen.getByLabelText('properNoun-type-select')).toBeInTheDocument()
    expect(
      screen.getByText('Named entity (proper noun) type'),
    ).toBeInTheDocument()
  })

  it('displays default empty option', () => {
    renderPanel()
    const select = screen.getByLabelText(
      'properNoun-type-select',
    ) as HTMLSelectElement
    expect(select.value).toBe('')
    expect(screen.getByText('---')).toBeInTheDocument()
  })

  it('displays all named entity tag options', () => {
    renderPanel()
    const select = screen.getByLabelText(
      'properNoun-type-select',
    ) as HTMLSelectElement
    const renderedOptions = Array.from(select.options)
      .slice(1)
      .map((option) => [option.value, option.text])

    expect(renderedOptions).toEqual(Object.entries(NAMED_ENTITY_TAGS))
  })

  it('updates named entity tag value when option is selected', () => {
    renderPanel()
    const select = screen.getByLabelText(
      'properNoun-type-select',
    ) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'DN' } })
    expect(select.value).toBe('DN')
  })

  it('allows changing named entity tag multiple times', () => {
    renderPanel()
    const select = screen.getByLabelText(
      'properNoun-type-select',
    ) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'DN' } })
    expect(select.value).toBe('DN')
    fireEvent.change(select, { target: { value: 'PN' } })
    expect(select.value).toBe('PN')
    fireEvent.change(select, { target: { value: 'GN' } })
    expect(select.value).toBe('GN')
  })
})
