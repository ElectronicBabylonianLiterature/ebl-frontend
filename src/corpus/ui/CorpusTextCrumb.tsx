import React from 'react'
import { Crumb } from 'common/Breadcrumbs'
import InlineMarkdown from 'common/InlineMarkdown'
import { Text } from 'corpus/domain/text'

export default class CorpusTextCrumb implements Crumb {
  constructor(readonly corpusText: Text) {}

  get text(): React.ReactNode {
    return <InlineMarkdown source={this.corpusText.title} />
  }

  get link(): string {
    return `/corpus/${this.corpusText.genre}/${this.corpusText.category}/${this.corpusText.index}`
  }

  static ofText(corpusText: Text): CorpusTextCrumb {
    return new CorpusTextCrumb(corpusText)
  }
}
