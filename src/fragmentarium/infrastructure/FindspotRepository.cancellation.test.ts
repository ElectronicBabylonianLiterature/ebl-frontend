import { ApiFindspotRepository } from 'fragmentarium/infrastructure/FindspotRepository'
import { findspotMapDataDto } from 'test-support/map-fixtures'

it('passes cancellation to the HTTP request while validating the returned scope', async () => {
  const expected = [findspotMapDataDto()]
  const client = {
    fetchJson: jest.fn().mockResolvedValue({ findspots: expected }),
    postJson: jest.fn(),
    fetchBlob: jest.fn(),
  }
  const repository = new ApiFindspotRepository(client)
  const controller = new AbortController()

  await expect(
    repository.fetchMapData('ASSUR', controller.signal),
  ).resolves.toEqual(expected)
  expect(client.fetchJson).toHaveBeenCalledWith(
    '/findspots/map-data?site=ASSUR',
    false,
    controller.signal,
  )
})
