import type { MediaResource } from 'fragmentarium/domain/media'

export default interface MediaRepository {
  findByFragment(
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<readonly MediaResource[]>
}

export class UnsupportedMediaResponseError extends Error {}
