import { guestSession } from 'auth/Session'
import Folio from 'fragmentarium/domain/Folio'

const writePermissions = [
  'isAllowedToWriteWords',
  'isAllowedToWriteBibliography',
  'isAllowedToTransliterateFragments',
  'isAllowedToLemmatizeFragments',
  'isAllowedToAnnotateFragments',
  'isAllowedToWriteTexts',
] as const

const readPermissions = [
  'isAllowedToReadWords',
  'isAllowedToReadBibliography',
  'isAllowedToReadFragments',
  'isAllowedToReadTexts',
] as const

describe('Security: guest session permissions', () => {
  it('should mark the guest session as a guest session', () => {
    expect(guestSession.isGuestSession()).toBe(true)
  })

  it.each(writePermissions)('should not allow %s for guests', (permission) => {
    expect(guestSession[permission]()).toBe(false)
  })

  it.each(readPermissions)('should allow %s for guests', (permission) => {
    expect(guestSession[permission]()).toBe(true)
  })

  it('should block closed folios for guest users', () => {
    const openFolio = new Folio({ name: 'AHA', number: '1' })
    const closedFolio = new Folio({ name: 'ARG', number: '1' })

    expect(guestSession.isAllowedToReadFolio(openFolio)).toBe(true)
    expect(guestSession.isAllowedToReadFolio(closedFolio)).toBe(false)
  })
})
