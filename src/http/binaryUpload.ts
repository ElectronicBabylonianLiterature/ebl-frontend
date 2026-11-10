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

const unparsed = Symbol('unparsed')

function responseBody(request: XMLHttpRequest): unknown {
  try {
    return request.responseText ? JSON.parse(request.responseText) : null
  } catch {
    return unparsed
  }
}

function succeeded(request: XMLHttpRequest): boolean {
  return request.status >= 200 && request.status < 300
}

function responseError(request: XMLHttpRequest, body: unknown): ApiError {
  // Proxies and gateways (e.g. an nginx 413 or 502 page) answer with HTML or
  // an empty body; report their status like ApiError.fromResponse does.
  if (body === unparsed || !body || typeof body !== 'object')
    return new ApiError(
      request.status === 413
        ? 'The file is too large to upload.'
        : ApiError.statusMessage(request.status, request.statusText),
      {},
      request.status,
    )
  return new ApiError(
    ApiError.bodyToMessage(body as Record<string, unknown>, request.statusText),
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
  const body = responseBody(request)
  if (!succeeded(request)) reject(responseError(request, body))
  else if (body === unparsed)
    reject(
      new ApiError(
        'The upload response could not be read.',
        {},
        request.status,
      ),
    )
  else resolve(body as T)
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
