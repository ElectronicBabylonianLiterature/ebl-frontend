import React from 'react'
import { Crumb } from 'common/Breadcrumbs'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { stageToAbbreviation } from 'corpus/domain/period'

export default class ChapterCrumb implements Crumb {
  constructor(readonly id: ChapterId, readonly displayPrefix: boolean = true) {}

  get text(): React.ReactNode {
    const prefix = this.displayPrefix ? 'Chapter ' : ''
    const name = this.id.name !== '-' ? ` ${this.id.name}` : ''
    return `${prefix}${this.id.stage}${name}`
  }

  get link(): string {
    return `/corpus/${this.id.textId.genre}/${this.id.textId.category}/${
      this.id.textId.index
    }/${stageToAbbreviation(this.id.stage)}/${this.id.name}`
  }
}
