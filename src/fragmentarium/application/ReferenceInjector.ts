import produce, { Draft, castDraft } from 'immer'
import Promise from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'
import Reference from 'bibliography/domain/Reference'
import createReference from 'bibliography/application/createReference'
import BibliographyService from 'bibliography/application/BibliographyService'
import { NoteLine } from 'transliteration/domain/note-line'
import { BibliographyPart, MarkupPart } from 'transliteration/domain/markup'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import TranslationLine from 'transliteration/domain/translation-line'

export default class ReferenceInjector {
  private readonly bibliographyService: BibliographyService

  constructor(bibliographyService: BibliographyService) {
    this.bibliographyService = bibliographyService
  }

  injectReferences(fragment: Fragment): Promise<Fragment> {
    return this.createReferences(fragment.references)
      .then((references) => fragment.setReferences(references))
      .then((fragment) => this.injectReferencesToMarkup(fragment))
  }

  private injectReferencesToMarkup(fragment: Fragment): Promise<Fragment> {
    function isMarkupLine(
      line: Draft<AbstractLine>
    ): line is Draft<NoteLine | TranslationLine> {
      return ['NoteLine', 'TranslationLine'].includes(line.type)
    }

    function isBibliographyPart(
      part: Draft<MarkupPart>
    ): part is Draft<BibliographyPart> {
      return part.type === 'BibliographyPart'
    }

    return new Promise((resolve, reject) => {
      produce(fragment, async (draft: Draft<Fragment>) => {
        await Promise.all(
          draft.text.allLines
            .filter(isMarkupLine)
            .flatMap((line: Draft<NoteLine | TranslationLine>) => line.parts)
            .filter(isBibliographyPart)
            .map((part: Draft<BibliographyPart>) =>
              createReference(
                part.reference as ReferenceDto,
                this.bibliographyService
              )
                .then((reference): void => {
                  part.reference = castDraft(reference)
                })
                .catch(console.error)
            )
        )
      })
        .then(resolve)
        .catch(reject)
    })
  }

  private createReferences(
    referenceDtos: readonly ReferenceDto[]
  ): Promise<Reference[]> {
    return Promise.all<Reference>(
      referenceDtos.map((reference) =>
        createReference(reference, this.bibliographyService)
      )
    )
  }
}
