import createFolio from 'fragmentarium/createFolio'

function createFragment (dto) {
  return {
    ...dto,
    folios: dto.folios.map(({ name, number }) => createFolio(name, number))
  }
}

export default createFragment
