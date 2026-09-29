export const mockSuggestionDto = {
  id: 'D001',
  description: 'Test dossier description',
}

export const mockSearchSuggestions = jest.fn()
export const mockOnChange = jest.fn()

export const dossierSearchProps = {
  ariaLabel: 'Dossier Search',
  searchSuggestions: mockSearchSuggestions,
  onChange: mockOnChange,
}

export function resetDossierSearchMocks(): void {
  mockSearchSuggestions.mockClear()
  mockSearchSuggestions.mockResolvedValue([])
  mockOnChange.mockClear()
}
