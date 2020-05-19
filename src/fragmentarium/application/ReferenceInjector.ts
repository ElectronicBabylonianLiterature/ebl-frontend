import produce, { Draft } from 'immer'
import Promise from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'
import Reference from 'bibliography/domain/Reference'
import createReference from 'bibliography/application/createReference'
import {
  isNoteLine,
  isBibliographyPart,
} from 'transliteration/domain/type-guards'
import BibliographyService from 'bibliography/application/BibliographyService'

export default class ReferenceInjector {
  private readonly bibliographyService: BibliographyService

  constructor(bibliographyService: BibliographyService) {
    this.bibliographyService = bibliographyService
  }

  async injectReferences(fragment: Fragment): Promise<Fragment> {
    return await this.createReferences(fragment.references)
      .then((references) => fragment.setReferences(references))
      .then((fragment) => this.injectReferencesToNotes(fragment))
  }

  private async injectReferencesToNotes(fragment: Fragment): Promise<Fragment> {
    return await produce(fragment, async (draft: Draft<Fragment>) => {
      await Promise.all(
        draft.text.allLines
          .filter(isNoteLine)
          .flatMap((line: any) => line.parts)
          .filter(isBibliographyPart)
          .map(async (part: any) => {
            part.reference = await createReference(
              part.reference,
              this.bibliographyService
            ).catch((error) => {
              console.error(error)
              return part.reference
            })
          })
      )
    })
  }
  
  private async createReferences(
    referenceDtos: readonly any[]
  ): Promise<Reference[]> {
    return await Promise.all<Reference>(
      referenceDtos.map((reference) =>
        createReference(reference, this.bibliographyService)
      )
    )
  }
}
