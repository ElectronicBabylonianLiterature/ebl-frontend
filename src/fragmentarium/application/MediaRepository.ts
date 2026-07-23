import { MediaResource } from 'fragmentarium/domain/media'

export default interface MediaRepository {
  findByFragment(fragmentNumber: string): Promise<readonly MediaResource[]>
}
