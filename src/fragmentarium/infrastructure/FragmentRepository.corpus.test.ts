import { textDto } from 'test-support/test-corpus-text'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { manuscriptDtoFactory } from 'test-support/manuscript-fixtures'
import Word from 'dictionary/domain/Word'
import { wordFactory } from 'test-support/word-fixtures'
import {
  createFragmentRepositoryTestContext,
  fragmentId,
} from 'fragmentarium/infrastructure/FragmentRepository.testSupport'

const { apiClient, fragmentRepository } = createFragmentRepositoryTestContext()

const chapterId: ChapterId = {
  textId: {
    genre: textDto.genre,
    category: textDto.category,
    index: textDto.index,
  },
  stage: textDto.chapters[0].stage,
  name: textDto.chapters[0].name,
} as ChapterId
const manuscriptSiglum = 'UrIII Nippur1'

describe('findInCorpus', () => {
  test('Maps manuscript attestations', async () => {
    const manuscriptDto = manuscriptDtoFactory.build()
    apiClient.fetchJson.mockResolvedValueOnce({
      manuscriptAttestations: [
        {
          text: textDto,
          chapterId,
          manuscript: manuscriptDto,
          manuscriptSiglum,
        },
      ],
      uncertainFragmentAttestations: [],
    })

    const { manuscriptAttestations } =
      await fragmentRepository.findInCorpus(fragmentId)

    expect(manuscriptAttestations).toHaveLength(1)
    expect(manuscriptAttestations[0].manuscriptSiglum).toEqual(manuscriptSiglum)
    expect(manuscriptAttestations[0].chapterId).toEqual(chapterId)
    expect(manuscriptAttestations[0].text.name).toEqual(textDto.name)
  })

  test('Maps uncertain fragment attestations', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({
      manuscriptAttestations: [],
      uncertainFragmentAttestations: [{ text: textDto, chapterId }],
    })

    const { uncertainFragmentAttestations } =
      await fragmentRepository.findInCorpus(fragmentId)

    expect(uncertainFragmentAttestations).toHaveLength(1)
    expect(uncertainFragmentAttestations[0].chapterId).toEqual(chapterId)
    expect(uncertainFragmentAttestations[0].text.name).toEqual(textDto.name)
  })
})

describe('collectLemmaSuggestions', () => {
  test('Maps each suggested word to a lemma option', async () => {
    const word: Word = wordFactory.build()
    apiClient.fetchJson.mockResolvedValueOnce({ 'token-1': [word] })

    const suggestions =
      await fragmentRepository.collectLemmaSuggestions(fragmentId)

    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      `/fragments/${encodeURIComponent(fragmentId)}/collect-lemmas`,
      false,
    )
    expect([...suggestions.keys()]).toEqual(['token-1'])
    expect(suggestions.get('token-1')).toHaveLength(1)
    expect(suggestions.get('token-1')?.[0].value).toEqual(word._id)
  })

  test('Answers an empty map when there are no suggestions', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({})

    await expect(
      fragmentRepository.collectLemmaSuggestions(fragmentId),
    ).resolves.toEqual(new Map())
  })
})
