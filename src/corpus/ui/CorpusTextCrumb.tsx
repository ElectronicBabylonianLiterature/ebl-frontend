import React from 'react'
import { Crumb } from 'common/Breadcrumbs'
import InlineMarkdown from 'common/InlineMarkdown'
import { Text } from 'corpus/domain/text'
import { TextId, textIdToString } from 'transliteration/domain/text-id'
import { ChapterDisplay } from 'corpus/domain/chapter'

export default class CorpusTextCrumb implements Crumb {
  constructor(
    readonly id: TextId,
    readonly name: string,
    readonly hasLink: boolean = true,
  ) {}

  get title(): string {
    return `${textIdToString(this.id)} ${this.name}`
  }

  get text(): React.ReactNode {
    return <InlineMarkdown source={this.title} />
  }

  get link(): string | null {
    return this.hasLink
      ? `/corpus/${this.id.genre}/${this.id.category}/${this.id.index}`
      : null
  }

  static ofText(text: Text): CorpusTextCrumb {
    return new CorpusTextCrumb(text.id, text.name)
  }

  static ofChapterDisplay(chapter: ChapterDisplay): CorpusTextCrumb {
    return new CorpusTextCrumb(chapter.id.textId, chapter.textName)
  }
}
