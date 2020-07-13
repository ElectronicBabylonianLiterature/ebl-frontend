import produce, { Draft, castDraft } from 'immer'
import Promise from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'
import Reference from 'bibliography/domain/Reference'
import createReference from 'bibliography/application/createReference'
import BibliographyService from 'bibliography/application/BibliographyService'
import {
  BibliographyPart,
  NoteLine,
  NoteLinePart,
} from 'transliteration/domain/line'
import { AbstractLine } from 'transliteration/domain/abstract-line'

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
    function isNoteLine(line: Draft<AbstractLine>): line is Draft<NoteLine> {
      return line.type === 'NoteLine'
    }

    function isBibliographyPart(
      part: Draft<NoteLinePart>
    ): part is Draft<BibliographyPart> {
      return part.type === 'BibliographyPart'
    }

    return new Promise((resolve, reject) => {
      produce(fragment, async (draft: Draft<Fragment>) => {
        await Promise.all(
          draft.text.allLines
            .filter(isNoteLine)
            .flatMap((line: Draft<NoteLine>) => line.parts)
            .filter(isBibliographyPart)
            .map((part: Draft<BibliographyPart>) =>
              createReference(part.reference, this.bibliographyService)
                .then((reference): void => {
                  part.reference = castDraft(reference)
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
