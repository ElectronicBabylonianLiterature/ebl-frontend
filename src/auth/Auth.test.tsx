import { renderHook } from '@testing-library/react'
import { createScopeString, useAuthentication } from 'auth/Auth'
import applicationScopes from 'auth/applicationScopes.json'
import { guestSession } from 'auth/Session'

test('defaults to an unauthenticated guest without a provider', async () => {
  const { result } = renderHook(() => useAuthentication())
  const authentication = result.current
  expect(authentication.login()).toBeUndefined()
  await expect(authentication.logout()).resolves.toBeUndefined()
  expect(authentication.getSession()).toBe(guestSession)
  expect(authentication.isAuthenticated()).toBe(false)
  expect(() => authentication.getAccessToken()).toThrow('Not authenticated')
  expect(() => authentication.getUser()).toThrow('Not authenticated')
})

describe('requested Auth0 scopes', () => {
  const mediaScopes = ['upload:fragment_media', 'manage:fragment_media']
  const scopes = (mediaUploadEnabled: boolean): string[] =>
    createScopeString({ mediaUploadEnabled }).split(' ')

  test('omit media write scopes while media uploads are disabled', () => {
    const requested = scopes(false)
    mediaScopes.forEach((scope) => expect(requested).not.toContain(scope))
    expect(requested).toEqual(
      expect.arrayContaining([
        'openid',
        'profile',
        'read:fragments',
        'annotate:fragments',
      ]),
    )
  })

  test('include media write scopes while media uploads are enabled', () => {
    expect(scopes(true)).toEqual(expect.arrayContaining(mediaScopes))
  })

  test('request every application scope when media uploads are enabled', () => {
    expect(scopes(true)).toEqual([
      'openid',
      'profile',
      ...Object.values(applicationScopes),
    ])
  })

  test('only differ by the media write scopes', () => {
    expect(
      scopes(true).filter((scope) => !mediaScopes.includes(scope)),
    ).toEqual(scopes(false))
  })

  test.each([
    [undefined, false],
    ['false', false],
    ['true', true],
  ])(
    'scopeString follows REACT_APP_MEDIA_UPLOAD_ENABLED=%p',
    (flag, expected) => {
      const original = process.env.REACT_APP_MEDIA_UPLOAD_ENABLED
      if (flag === undefined) delete process.env.REACT_APP_MEDIA_UPLOAD_ENABLED
      else process.env.REACT_APP_MEDIA_UPLOAD_ENABLED = flag
      try {
        jest.isolateModules(() => {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { scopeString } = require('auth/Auth')
          expect(scopeString).toEqual(
            createScopeString({ mediaUploadEnabled: expected }),
          )
        })
      } finally {
        if (original === undefined)
          delete process.env.REACT_APP_MEDIA_UPLOAD_ENABLED
        else process.env.REACT_APP_MEDIA_UPLOAD_ENABLED = original
      }
    },
  )
})
