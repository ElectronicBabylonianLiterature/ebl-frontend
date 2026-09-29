type ObjectUrlMocks = {
  mockCreateObjectURL: jest.Mock
  mockRevokeObjectURL: jest.Mock
}

export function setupObjectUrlMocks(): ObjectUrlMocks {
  const mockCreateObjectURL = jest.fn()
  const mockRevokeObjectURL = jest.fn()
  let originalCreateObjectURL: typeof URL.createObjectURL
  let originalRevokeObjectURL: typeof URL.revokeObjectURL

  beforeAll(() => {
    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = mockCreateObjectURL
    URL.revokeObjectURL = mockRevokeObjectURL
  })

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  beforeEach(() => {
    mockCreateObjectURL.mockClear()
    mockRevokeObjectURL.mockClear()
    mockCreateObjectURL.mockImplementation(
      (blob) => `blob:http://localhost/${Math.random()}`,
    )
  })

  return { mockCreateObjectURL, mockRevokeObjectURL }
}
