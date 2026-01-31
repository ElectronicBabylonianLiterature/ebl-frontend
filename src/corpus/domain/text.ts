import Reference from 'bibliography/domain/Reference'
import { produce, Draft, immerable } from 'immer'
import _ from 'lodash'
import { MarkupPart } from 'transliteration/domain/markup'
import { Chapter } from './chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { TextId } from 'transliteration/domain/text-id'
import { ResearchProject } from 'research-projects/researchProject'

export function createChapter(data: Partial<Chapter>): Chapter {
  return new Chapter(
    data.textId ?? { genre: 'L', category: 0, index: 0 },
    data.textHasDoi ?? false,
    data.classification ?? 'Ancient',
    data.stage ?? 'Neo-Assyrian',
    data.version ?? '',
    data.name ?? '',
    data.order ?? 0,
    data.manuscripts ?? [],
    data.uncertainFragments ?? [],
    data.lines ?? [],
  )
}
export interface TextInfo {
  readonly genre: string
  readonly category: number
  readonly index: number
  readonly name: string
  readonly hasDoi?: boolean
  readonly numberOfVerses: number
  readonly approximateVerses: boolean
}

export interface UncertainFragment {
  readonly museumNumber: string
}

export interface ChapterListing {
  readonly name: string
  readonly stage: string
  readonly title: readonly MarkupPart[]
  readonly uncertainFragments: readonly UncertainFragment[]
}

export class Text implements TextInfo {
  readonly [immerable] = true
  readonly genre: string = 'L'
  readonly category: number = 0
  readonly index: number = 0
  readonly name: string = ''
  readonly hasDoi: boolean = false
  readonly numberOfVerses: number = 0
  readonly approximateVerses: boolean = false
  readonly intro: string = ''
  readonly chapters: ReadonlyArray<ChapterListing> = []
  readonly references: ReadonlyArray<Reference> = []
  readonly projects: ReadonlyArray<ResearchProject> = []

  get id(): TextId {
    return {
      genre: this.genre,
      category: this.category,
      index: this.index,
    }
  }

  get hasMultipleStages(): boolean {
    return _(this.chapters).map('stage').uniq().size() > 1
  }
}

export function createChapterId(
  text: Text,
  chapter: Pick<ChapterListing, 'stage' | 'name'>,
): ChapterId {
  return {
    textId: text.id,
    stage: chapter.stage,
    name: chapter.name,
  }
}

export function createText(data: Partial<Text>): Text {
  return produce(new Text(), (draft: Draft<Text>) => {
    _.assign(draft, data)
  })
}
