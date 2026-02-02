import { produce, Draft, castDraft } from 'immer'
import Promise from 'bluebird'
import Reference from 'bibliography/domain/Reference'
import BibliographyService from 'bibliography/application/BibliographyService'
import { NoteLine } from 'transliteration/domain/note-line'
import { MarkupPart } from 'transliteration/domain/markup'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import TranslationLine from 'transliteration/domain/translation-line'
import { Text } from 'transliteration/domain/text'
import { isBibliographyPart } from 'transliteration/domain/type-guards'
import { OldLineNumber } from 'transliteration/domain/line-number'
import { OldLineNumberDto } from 'corpus/application/dtos'
import { Introduction, Notes } from 'fragmentarium/domain/fragment'
import _ from 'lodash'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

function isMarkupLine(line: AbstractLine): line is NoteLine | TranslationLine {
  return ['NoteLine', 'TranslationLine'].includes(line.type)
}

export default class ReferenceInjector {
  private readonly bibliographyService: BibliographyService

  constructor(bibliographyService: BibliographyService) {
    this.bibliographyService = bibliographyService
  }

  injectReferencesToText(text: Text): Promise<Text> {
    return Promise.resolve(text)
      .then((currentText) => {
        const markupLines = currentText.allLines.filter(isMarkupLine)
        return Promise.all(
          markupLines.map((line) => this.injectReferencesToMarkup(line.parts)),
        ).then((updatedParts) => ({ currentText, updatedParts }))
      })
      .then(({ currentText, updatedParts }) =>
        produce(currentText, (draft: Draft<Text>) => {
          let index = 0
          draft.allLines
            .filter(
              isMarkupLine as unknown as (
                line: Draft<AbstractLine>,
              ) => line is Draft<NoteLine | TranslationLine>,
            )
            .forEach((line) => {
              line.parts = castDraft(updatedParts[index])
              index += 1
            })
        }),
      )
  }

  private mergeEntries(
    parts: readonly MarkupPart[],
    entries: readonly BibliographyEntry[],
  ): MarkupPart[] {
    const entryMap = _.keyBy(entries, 'id')

    return parts.map((part) => {
      if (isBibliographyPart(part)) {
        const dto = part.reference
        const reference = new Reference(
          dto.type,
          dto.pages,
          dto.notes,
          dto.linesCited,
          entryMap[dto.id],
        )
        return { ...part, reference }
      }

      return part
    })
  }

  injectReferencesToMarkup(
    parts: readonly MarkupPart[],
  ): Promise<MarkupPart[]> {
    const ids = parts
      .filter(isBibliographyPart)
      .map((part) => part.reference.id)

    return _.isEmpty(ids)
      ? Promise.resolve(parts as MarkupPart[])
      : this.bibliographyService
          .findMany(ids)
          .then((entries) => this.mergeEntries(parts, entries))
          .catch((error) => {
            console.error(error)
            return parts as MarkupPart[]
          })
  }

  injectReferencesToIntroduction(
    introduction: Introduction,
  ): Promise<Introduction> {
    return this.injectReferencesToMarkup(introduction.parts).then((parts) =>
      produce(introduction, (draft) => {
        draft.parts = castDraft(parts)
      }),
    )
  }

  injectReferencesToNotes(notes: Notes): Promise<Notes> {
    return this.injectReferencesToMarkup(notes.parts).then((parts) =>
      produce(notes, (draft) => {
        draft.parts = castDraft(parts)
      }),
    )
  }

  injectReferenceToOldLineNumber(
    oldLineNumberDto: OldLineNumberDto,
  ): Promise<OldLineNumber> {
    return this.createReference(oldLineNumberDto.reference).then(
      (reference): OldLineNumber => ({ ...oldLineNumberDto, reference }),
    )
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
            entry,
          ),
      )
  }
}
