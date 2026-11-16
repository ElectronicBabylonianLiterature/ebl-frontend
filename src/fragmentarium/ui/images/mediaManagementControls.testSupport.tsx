import { render } from '@testing-library/react'
import type { MediaResource } from 'fragmentarium/domain/media'
import MediaManagementControls from 'fragmentarium/ui/images/MediaManagementControls'
import {
  galleryServices,
  mediaFixture,
} from 'fragmentarium/ui/images/gallery.testSupport'
import React from 'react'

export function setup({
  media = mediaFixture({ publicationStatus: 'PUBLISHED' }),
  manager = true,
  strict = false,
}: {
  media?: MediaResource
  manager?: boolean
  strict?: boolean
} = {}) {
  const management = {
    upload: jest.fn(),
    update: jest.fn().mockResolvedValue(media),
    setPrimary: jest.fn().mockResolvedValue(media),
    publish: jest.fn().mockResolvedValue(media),
    reject: jest.fn().mockResolvedValue(media),
    remove: jest.fn().mockResolvedValue(undefined),
  }
  const services = {
    ...galleryServices([media]),
    canUpload: true,
    canManage: manager,
    currentUserId: 'auth0|owner',
    management,
  }
  const onChanged = jest.fn()
  const component = (
    <MediaManagementControls
      media={media}
      fragmentNumber="K.1"
      services={services}
      onChanged={onChanged}
    />
  )
  const view = render(
    strict ? <React.StrictMode>{component}</React.StrictMode> : component,
  )
  return { ...view, management, onChanged, services }
}
