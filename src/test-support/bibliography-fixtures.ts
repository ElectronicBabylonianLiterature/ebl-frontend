import { factory, DefaultAdapter } from 'factory-girl'
import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

class ReferenceAdapter extends DefaultAdapter {
  build(Model, props) {
    const model = new Model(
      props.type,
      props.pages,
      props.notes,
      props.linesCited,
      props.document
    )
    return model
  }
  async save(model, Model) {
    return model
  }
  async destroy(model, Model) {
    return model
  }
  get(model, attr, Model) {
    return model[attr]
  }
  set(props, model, Model) {
    throw new Error('ReferenceAdapter.set is not implemented.')
  }
}

function integer(min, max) {
  return factory.chance('integer', { min: min, max: max })
}

factory.define('author', Object, {
  given: factory.chance('first'),
  family: factory.chance('last'),
})

factory.define('cslData', Object, {
  id: factory.chance('guid'),
  title: factory.chance('sentence'),
  type: factory.chance('pickone', ['article-journal', 'paper-conference']),
  issued: () => {
    const date = factory.chance('date')()
    return {
      'date-parts': [[date.getFullYear(), date.getMonth(), date.getDate()]],
    }
  },
  volume: () => String(integer(1, 99)()),
  page: () => `${integer(1, 99)()}-${integer(100, 999)()}`,
  issue: integer(1, 99),
  'container-title': factory.chance('sentence'),
  author: factory.assocAttrsMany('author', 2),
  URL: factory.chance('url'),
})

factory.extend('cslData', 'cslDataWithContainerTitleShort', {
  'container-title-short': factory.chance('syllable'),
})

factory.define(
  'bibliographyEntry',
  BibliographyEntry,
  async (buildOptions) => buildOptions.cslData ?? factory.build('cslData')
)

export async function buildBorger1957(): Promise<BibliographyEntry> {
  return await factory.build('bibliographyEntry', {
    author: [{ family: 'Borger' }],
    issued: { 'date-parts': [[1957]] },
  })
}

factory.define('referenceDto', Object, {
  id: factory.chance('string'),
  type: factory.chance('pickone', ['EDITION', 'DISCUSSION', 'COPY', 'PHOTO']),
  pages: async () =>
    `${await factory.chance('natural')()}-${await factory.chance('natural')()}`,
  notes: factory.chance('sentence'),
  linesCited: factory.chance('pickset', ['1.', '2.', "3'.", "4'.2."], 2),
})

factory.define('reference', Reference, async (buildOptions) => ({
  ...(await factory.build('referenceDto')),
  document: await factory.build('bibliographyEntry'),
}))
factory.setAdapter(new ReferenceAdapter(), 'reference')

export async function buildReferenceWithContainerTitle(
  type: string,
  cslData = {}
): Promise<Reference> {
  return factory
    .build('cslDataWithContainerTitleShort', cslData)
    .then((cslData) => factory.build('bibliographyEntry', cslData))
    .then((entry) =>
      factory.build('reference', { type: type, document: entry })
    )
}

export async function buildReferenceWithManyAuthors(): Promise<Reference> {
  const authors = await factory.buildMany('author', 4)
  return factory
    .build('cslData', { author: authors })
    .then((cslData) => factory.build('bibliographyEntry', cslData))
    .then((entry) =>
      factory.build('reference', { type: 'COPY', document: entry })
    )
}
