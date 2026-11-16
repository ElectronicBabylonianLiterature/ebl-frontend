import { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'
import ApiMediaManagementRepository from 'fragmentarium/infrastructure/ApiMediaManagementRepository'

export const metadata: MediaMetadata = {
  type: 'PHOTO',
  caption: 'Obverse',
  sourceInstitution: 'Museum',
  rightsStatement: 'Permission granted',
  permissionAttested: true,
}

export const api = { requestJson: jest.fn(), uploadBinary: jest.fn() }

export const changed = jest.fn()

export let repository: ApiMediaManagementRepository

export function resetMediaRepository() {
  jest.clearAllMocks()
  repository = new ApiMediaManagementRepository(api, changed)
}
