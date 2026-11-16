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

export function isDefinitiveRejection(error: unknown): boolean {
  const status = apiErrorStatus(error)
  return isClientErrorStatus(status) && status !== 409
}

function apiErrorStatus(error: unknown): number | undefined {
  return error instanceof ApiError ? error.status : undefined
}

function isClientErrorStatus(status: number | undefined): status is number {
  return status !== undefined && status >= 400 && status < 500
}

const STALE_REVISION_STATUSES: ReadonlySet<number | undefined> = new Set([
  412, 428,
])

export function isStaleRevision(error: unknown): boolean {
  return STALE_REVISION_STATUSES.has(apiErrorStatus(error))
}

export function isServerError(error: unknown): boolean {
  const status = apiErrorStatus(error)
  return status !== undefined && status >= 500 && status < 600
}
