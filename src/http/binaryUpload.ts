import { ApiError } from './ApiError'

export interface BinaryUploadOptions {
  signal?: AbortSignal
  onDispatched?: () => void
  onProgress?: (loaded: number, total?: number) => void
  onProcessing?: () => void
}

function cancelled(): DOMException {
  return new DOMException('Upload cancelled', 'AbortError')
}

function responseBody(request: XMLHttpRequest): unknown {
  try {
    return request.responseText ? JSON.parse(request.responseText) : null
  } catch {
    throw new ApiError(
      'The upload response could not be read.',
      {},
      request.status,
    )
  }
}

function responseError(request: XMLHttpRequest, body: unknown): ApiError {
  const fields = body && typeof body === 'object' ? body : {}
  return new ApiError(
    ApiError.bodyToMessage(
      fields as Record<string, unknown>,
      request.statusText,
    ),
    body,
    request.status,
  )
}

function uploadProgress(
  request: XMLHttpRequest,
  options: BinaryUploadOptions,
): void {
  request.upload.onprogress = (event) => {
    if (options.signal?.aborted) return
    options.onProgress?.(
      event.loaded,
      event.lengthComputable ? event.total : undefined,
    )
  }
  request.upload.onload = () => {
    if (!options.signal?.aborted) options.onProcessing?.()
  }
}

function uploadResponse<T>(
  request: XMLHttpRequest,
  resolve: (value: T) => void,
  reject: (error: Error) => void,
): void {
  try {
    const body = responseBody(request)
    if (request.status >= 200 && request.status < 300) resolve(body as T)
    else reject(responseError(request, body))
  } catch (error) {
    reject(error as Error)
  }
}

export function uploadBinaryRequest<T>(
  url: string,
  file: File,
  headers: Headers,
  options: BinaryUploadOptions,
): Promise<T> {
  if (options.signal?.aborted) return Promise.reject(cancelled())
  return new Promise<T>((resolve, reject) => {
    const request = new XMLHttpRequest()
    const abort = (): void => request.abort()
    const cleanup = (): void =>
      options.signal?.removeEventListener('abort', abort)
    request.open('POST', url)
    headers.forEach((value, name) => request.setRequestHeader(name, value))
    uploadProgress(request, options)
    request.onabort = () => {
      cleanup()
      reject(cancelled())
    }
    request.onerror = () => {
      cleanup()
      reject(new ApiError('Upload connection failed', {}, 0))
    }
    request.onload = () => {
      cleanup()
      uploadResponse(request, resolve, reject)
    }
    options.signal?.addEventListener('abort', abort, { once: true })
    if (options.signal?.aborted) {
      cleanup()
      reject(cancelled())
      return
    }
    request.send(file)
    options.onDispatched?.()
  })
}
