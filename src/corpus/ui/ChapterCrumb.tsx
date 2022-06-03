import React from 'react'
import { Crumb } from 'common/Breadcrumbs'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { stageToAbbreviation } from 'corpus/domain/period'

export default class ChapterCrumb implements Crumb {
  constructor(readonly id: ChapterId) {}

  get text(): React.ReactNode {
    return `Chapter ${this.id.stage} ${this.id.name}`
  }

  get link(): string {
    return `/corpus/${this.id.textId.genre}/${this.id.textId.category}/${
      this.id.textId.index
    }/${stageToAbbreviation(this.id.stage)}/${this.id.name}`
  }
}
