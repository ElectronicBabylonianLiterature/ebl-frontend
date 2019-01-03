import createFolio from 'fragmentarium/createFolio'

function lineToAtf (line) {
  return `${
    line.prefix
  }${
    line.type === 'TextLine' ? ' ' : ''
  }${
    line.content.map(token => token.value).join(' ')
  }`
}

function createFragment (dto) {
  return {
    ...dto,
    folios: dto.folios.map(({ name, number }) => createFolio(name, number)),
    transliteration: dto.text.lines
      .map(lineToAtf)
      .join('\n')
  }
}

export default createFragment
