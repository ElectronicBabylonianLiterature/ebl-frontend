import React from 'react'
import { Crumb } from 'common/Breadcrumbs'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { stageToAbbreviation } from 'common/period'

export default class ChapterCrumb implements Crumb {
  constructor(
    readonly id: ChapterId,
    readonly displayPrefix: boolean = true,
    readonly abbreviateStage: boolean = false,
  ) {}

  get text(): React.ReactNode {
    const prefix = this.displayPrefix ? 'Chapter ' : ''
    const stage = this.abbreviateStage
      ? stageToAbbreviation(this.id.stage)
      : this.id.stage
    const name = this.id.name !== '-' ? ` ${this.id.name}` : ''
    return `${prefix}${stage}${name}`
  }

  get link(): string {
    return `/corpus/${this.id.textId.genre}/${this.id.textId.category}/${
      this.id.textId.index
    }/${stageToAbbreviation(this.id.stage)}/${this.id.name}`
  }
}
