const folioNames = {
  WGL: 'Lambert',
  FWG: 'Geers',
  EL: 'Leichty',
  AKG: 'Grayson',
  MJG: 'Geller'
}
const foliosWithImages = ['WGL', 'AKG', 'MJG', 'EL']

export default function createFolio (name, number) {
  return {
    humanizedName: folioNames[name] || name,
    name: name,
    number: number,
    hasImage: foliosWithImages.includes(name),
    fileName: `${name}_${number}.jpg`
  }
}
