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
      .catch(() => new ApiError(response.statusText, {}, response.status))
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
