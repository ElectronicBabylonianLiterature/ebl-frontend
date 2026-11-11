import { normalizeRelativeMediaUrl } from 'fragmentarium/infrastructure/mediaMapperValidation'
import { fragmentMediaOriginalUrl } from 'fragmentarium/infrastructure/mediaUrls'
import { mediaId } from 'fragmentarium/ui/images/gallery.testSupport'

const original = `/media/${mediaId}/file`

test.each(['K.1', 'K.1/2', 'Ištar', 'K?1', 'K#1', 'K+1'])(
  'accepts a canonical encoded fragment query for %s',
  (number) => {
    const url = fragmentMediaOriginalUrl(number, mediaId)
    expect(normalizeRelativeMediaUrl(url)).toBe(url)
  },
)

test.each([
  `${original}?token=secret`,
  `${original}?fragment=K.1&token=secret`,
  `${original}?fragment=K.1&fragment=K.2`,
  `${original}?fragment=`,
  `${original}?fragment=%20`,
  `${original}?fragment=%zz`,
  `${original}?fragment=K.1?token=secret`,
  `${original}?fragment=%0A`,
  `${original}?fragment=..%2Fadmin`,
  `${original}?fragment=K.1#fragment`,
  `/other/${mediaId}/file?fragment=K.1`,
])('rejects unexpected query content %s', (url) => {
  expect(normalizeRelativeMediaUrl(url)).toBeUndefined()
})
