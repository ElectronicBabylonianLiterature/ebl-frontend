import Promise from 'bluebird'
import { fragmentDto } from 'test-support/test-fragment'
import {
  apiClient,
  fragmentId,
  fragmentRepository,
} from 'fragmentarium/infrastructure/fragmentRepository.testSupport'

describe('named entity annotations', () => {
  const namedEntities = [
    { id: 'Entity-1', type: 'PERSONAL_NAME' as const, span: ['Word-2'] },
  ]
  const realia = [
    { id: 'Realia-1', realiaId: 'realia_000846', span: ['Word-2'] },
  ]

  beforeEach(() => jest.clearAllMocks())

  it('posts the two lists without an annotations key', async () => {
    apiClient.postJson.mockReturnValue(Promise.resolve(fragmentDto))

    await fragmentRepository.updateNamedEntityAnnotations(fragmentId, {
      namedEntities,
      realia,
    })

    expect(apiClient.postJson).toHaveBeenCalledWith(
      `/fragments/${encodeURIComponent(fragmentId)}/named-entities`,
      { namedEntities, realia },
    )
  })
})
