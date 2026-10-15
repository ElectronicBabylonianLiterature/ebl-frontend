export const mockSuggestionDto = {
  id: 'D001',
  description: 'Test dossier description',
}

export function setupDossierMocks(): {
  mockSearchSuggestions: jest.Mock
  mockOnChange: jest.Mock
} {
  const mockSearchSuggestions = jest.fn()
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockSearchSuggestions.mockClear()
    mockSearchSuggestions.mockResolvedValue([])
    mockOnChange.mockClear()
  })

  return { mockSearchSuggestions, mockOnChange }
}
