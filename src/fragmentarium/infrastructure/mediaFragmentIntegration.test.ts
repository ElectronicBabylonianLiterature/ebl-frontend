import { createFragment } from 'fragmentarium/infrastructure/fragmentFactories'
import {
  createQuerySummaryFragment,
  QuerySummaryItemDto,
} from 'fragmentarium/infrastructure/querySummaryFragment'
import { createSummaryItemDto } from 'fragmentarium/infrastructure/fragmentRepository.testSupport'
import { fragmentDto } from 'test-support/test-fragment'
import { mediaFixture } from 'fragmentarium/ui/images/gallery.testSupport'

const media = mediaFixture({ type: 'COPY' })
const summary = {
  count: 1,
  types: ['COPY'],
  primary: {
    id: media.id,
    type: media.type,
    thumbnail: media.representations.thumbnails.small,
  },
}

test('maps a new-only media summary without making COPY a photo', () => {
  const fragment = createFragment({
    ...fragmentDto,
    hasPhoto: false,
    legacyHasPhoto: false,
    mediaSummary: summary,
  })
  expect(fragment.mediaSummary).toEqual(summary)
  expect(fragment.hasPhoto).toBe(false)
  expect(fragment.legacyHasPhoto).toBe(false)
})

test('maps media summaries for compact search results', () => {
  const fragment = createQuerySummaryFragment(
    createSummaryItemDto({
      hasPhoto: false,
      mediaSummary: summary,
    }) as QuerySummaryItemDto,
    {},
  )
  expect(fragment.mediaSummary).toEqual(summary)
  expect(fragment.hasPhoto).toBe(false)
})

test('ignores malformed summaries while retaining legacy photo access', () => {
  const fragment = createFragment({
    ...fragmentDto,
    hasPhoto: true,
    mediaSummary: { count: -1 },
  })
  expect(fragment.mediaSummary).toBeUndefined()
  expect(fragment.hasPhoto).toBe(true)
})
