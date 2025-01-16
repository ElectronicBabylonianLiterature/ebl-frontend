import { DossierReference } from './DossierReference'

describe('DossierReference', () => {
  it('should allow creation of a valid DossierReference object', () => {
    const validDossier: DossierReference = {
      dossierId: '12345',
      isUncertain: true,
    }
    expect(validDossier.dossierId).toBe('12345')
    expect(validDossier.isUncertain).toBe(true)
  })

  it('should allow omission of the optional isUncertain property', () => {
    const validDossier: DossierReference = {
      dossierId: '12345',
    }
    expect(validDossier.dossierId).toBe('12345')
    expect(validDossier.isUncertain).toBeUndefined()
  })
})
