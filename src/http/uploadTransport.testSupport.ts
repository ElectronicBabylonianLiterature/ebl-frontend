export let xhr: {
  open: jest.Mock
  setRequestHeader: jest.Mock
  send: jest.Mock
  abort: jest.Mock
  upload: {
    onprogress?: (event: Partial<ProgressEvent>) => void
    onload?: () => void
  }
  onload?: () => void
  onabort?: () => void
  onerror?: () => void
  status: number
  statusText: string
  responseText: string
}

export let originalXHR: typeof XMLHttpRequest

export function prepareUploadTransport() {
  originalXHR = window.XMLHttpRequest
  xhr = {
    open: jest.fn(),
    setRequestHeader: jest.fn(),
    send: jest.fn(),
    abort: jest.fn(() => xhr.onabort?.()),
    upload: {},
    status: 201,
    statusText: 'Created',
    responseText: '{"media":[]}',
  }
  window.XMLHttpRequest = jest.fn(() => xhr) as unknown as typeof XMLHttpRequest
}

export function restoreUploadTransport() {
  window.XMLHttpRequest = originalXHR
}

export const mediaMetadata = {
  type: 'PHOTO' as const,
  caption: 'Obverse',
  sourceInstitution: '',
  rightsStatement: 'Permission',
  permissionAttested: true,
}
