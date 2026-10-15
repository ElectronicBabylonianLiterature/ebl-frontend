import useObjectUrl from 'common/hooks/useObjectUrl'

export type BlobHookProps = { blob: Blob | null }
export type BlobHookResult = ReturnType<typeof useObjectUrl>

export const mockCreateObjectURL: jest.MockedFunction<
  typeof URL.createObjectURL
> = jest.fn()
export const mockRevokeObjectURL: jest.MockedFunction<
  typeof URL.revokeObjectURL
> = jest.fn()

export function installObjectUrlMocks(): void {
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
  })
}
