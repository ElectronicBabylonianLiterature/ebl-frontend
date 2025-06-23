import React from 'react'
import TokenAnnotation from 'fragmentarium/ui/fragment/linguistic-annotation/TokenAnnotation'

export default class NamedEntityAnnotator extends TokenAnnotation {
  render(): React.ReactNode {
    return <this.RenderText />
  }
}
