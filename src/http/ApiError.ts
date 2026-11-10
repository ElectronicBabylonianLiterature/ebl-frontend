import _ from 'lodash'
import captureStackTrace from 'common/utils/captureStackTrace'

export class ApiError extends Error {
  readonly data: unknown
  readonly status?: number

  constructor(message: string, data: unknown, status?: number) {
    super(message)
    this.name = this.constructor.name
    this.data = data
    this.status = status
    captureStackTrace(this, this.constructor)
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    return response
      .json()
      .then(
        (body) =>
          new ApiError(
            ApiError.bodyToMessage(body, response.statusText),
            body,
            response.status,
          ),
      )
      .catch(
        () =>
          new ApiError(
            ApiError.statusMessage(response.status, response.statusText),
            {},
            response.status,
          ),
      )
  }

  static statusMessage(status: number, statusText: string): string {
    return statusText || `HTTP ${status}`
  }

  static bodyToMessage(
    body: { [key: string]: unknown },
    statusText: string,
  ): string {
    if (_.isString(body.description)) return body.description
    if (body.description || body.title)
      return ApiError.titleAndDescriptionToMessage(body, statusText)
    return JSON.stringify(body)
  }

  private static titleAndDescriptionToMessage(
    body: { [key: string]: unknown },
    statusText: string,
  ): string {
    const title = body.title || statusText
    const description = body.description
      ? ': ' + JSON.stringify(body.description)
      : ''
    return `${title}${description}`
  }
}

/**
 * True only when the server definitively rejected a request (HTTP 4xx) and so
 * cannot have committed it. Every other failure of a sent mutation — network
 * errors (status 0), gateway/server errors, unreadable success bodies, aborts —
 * leaves the server-side outcome uncertain.
 *
 * 409 is excluded: the backend answers a retried idempotency key with 409 while
 * the original upload is still being processed or has already committed, so a
 * conflict can mean the change exists on the server.
 */
export function isDefinitiveRejection(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status !== undefined &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 409
  )
}
