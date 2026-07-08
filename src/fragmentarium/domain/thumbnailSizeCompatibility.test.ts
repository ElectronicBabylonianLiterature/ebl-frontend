import type { ThumbnailSize as LegacyThumbnailSize } from 'fragmentarium/application/FragmentService'
import type { ThumbnailSize as DomainThumbnailSize } from './media'

type Assert<T extends true> = T

type IsAssignable<From, To> = [From] extends [To] ? true : false

type DomainFitsLegacy = Assert<
  IsAssignable<DomainThumbnailSize, LegacyThumbnailSize>
>
type LegacyFitsDomain = Assert<
  IsAssignable<LegacyThumbnailSize, DomainThumbnailSize>
>

const compatibilityChecks: [DomainFitsLegacy, LegacyFitsDomain] = [true, true]

test('keeps thumbnail size types mutually assignable', () => {
  expect(compatibilityChecks).toEqual([true, true])
})
