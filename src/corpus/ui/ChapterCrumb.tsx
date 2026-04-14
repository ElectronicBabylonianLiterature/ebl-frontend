import React from 'react'
import { Crumb } from 'common/ui/Breadcrumbs'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { stageToAbbreviation } from 'common/utils/period'

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
    const stage = this.id.stage ? stageToAbbreviation(this.id.stage) : ''
    const parts = [
      'corpus',
      this.id.textId.genre,
      String(this.id.textId.category),
      String(this.id.textId.index),
      stage,
      this.id.name,
    ].filter((part) => part !== '')

    return `/${parts.join('/')}`
  }
}
