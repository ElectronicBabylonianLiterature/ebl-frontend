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

  it('fetches both layers from the two-list body', async () => {
    apiClient.fetchJson.mockReturnValue(
      Promise.resolve({ namedEntities, realia }),
    )

    await expect(
      fragmentRepository.fetchNamedEntityAnnotations(fragmentId),
    ).resolves.toEqual({ namedEntities, realia })
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      `/fragments/${encodeURIComponent(fragmentId)}/named-entities`,
      false,
    )
  })

  it('treats a missing key as an empty list', async () => {
    apiClient.fetchJson.mockReturnValue(Promise.resolve({ namedEntities }))

    await expect(
      fragmentRepository.fetchNamedEntityAnnotations(fragmentId),
    ).resolves.toEqual({ namedEntities, realia: [] })
  })

  it('treats a missing named entity key as an empty list', async () => {
    apiClient.fetchJson.mockReturnValue(Promise.resolve({ realia }))

    await expect(
      fragmentRepository.fetchNamedEntityAnnotations(fragmentId),
    ).resolves.toEqual({ namedEntities: [], realia })
  })

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
