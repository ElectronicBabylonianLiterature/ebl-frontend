import produce, { Draft, castDraft } from 'immer'
import Promise from 'bluebird'
import Reference from 'bibliography/domain/Reference'
import BibliographyService from 'bibliography/application/BibliographyService'
import { NoteLine } from 'transliteration/domain/note-line'
import { BibliographyPart, MarkupPart } from 'transliteration/domain/markup'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import TranslationLine from 'transliteration/domain/translation-line'
import { Text } from 'transliteration/domain/text'

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

export default class ReferenceInjector {
  private readonly bibliographyService: BibliographyService

  constructor(bibliographyService: BibliographyService) {
    this.bibliographyService = bibliographyService
  }

  injectReferences(text: Text): Promise<Text> {
    return new Promise((resolve, reject) => {
      produce(text, async (draft: Draft<Text>) => {
        await Promise.all(
          draft.allLines
            .filter(isMarkupLine)
            .flatMap((line: Draft<NoteLine | TranslationLine>) => line.parts)
            .filter(isBibliographyPart)
            .map((part: Draft<BibliographyPart>) =>
              this.createReference(part.reference as ReferenceDto)
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

  private createReference(data: ReferenceDto): Promise<Reference> {
    return this.bibliographyService
      .find(data.id)
      .then(
        (entry) =>
          new Reference(
            data.type,
            data.pages,
            data.notes,
            data.linesCited,
            entry
          )
      )
  }
}
