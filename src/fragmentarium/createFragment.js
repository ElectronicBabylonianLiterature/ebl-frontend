import createFolio from 'fragmentarium/createFolio'

function createFragment (dto) {
  return {
    ...dto,
    folios: dto.folios.map(({ name, number }) => createFolio(name, number)),
    transliteration: dto.lemmatization.map(row => row.map(token => token.value).join(' ')).join('\n')
  }
}

export default createFragment
