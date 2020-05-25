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

  injectReferences(fragment: Fragment): Promise<Fragment> {
    return this.createReferences(fragment.references)
      .then((references) => fragment.setReferences(references))
      .then((fragment) => this.injectReferencesToNotes(fragment))
  }

  private injectReferencesToNotes(fragment: Fragment): Promise<Fragment> {
    return new Promise((resolve, reject) => {
      produce(fragment, async (draft: Draft<Fragment>) => {
        await Promise.all(
          draft.text.allLines
            .filter(isNoteLine)
            .flatMap((line: any) => line.parts)
            .filter(isBibliographyPart)
            .map((part: any) =>
              createReference(part.reference, this.bibliographyService)
                .then((reference): void => {
                  part.reference = reference
                })
                .catch((error): void => {
                  console.error(error)
                })
            )
        )
      })
        .then(resolve)
        .catch(reject)
    })
  }

  private createReferences(
    referenceDtos: readonly any[]
  ): Promise<Reference[]> {
    return Promise.all<Reference>(
      referenceDtos.map((reference) =>
        createReference(reference, this.bibliographyService)
      )
    )
  }
}
