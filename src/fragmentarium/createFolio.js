const folioNames = {
  WGL: 'Lambert',
  FWG: 'Geers',
  EL: 'Leichty',
  AKG: 'Grayson',
  MJG: 'Geller'
}
const foliosWithImages = ['WGL', 'AKG', 'MJG', 'EL']

export default class Folio {
  constructor ({ name, number }) {
    this.name = name
    this.number = number
    Object.freeze(this)
  }

  get humanizedName () {
    return folioNames[this.name] || this.name
  }

  get hasImage () {
    return foliosWithImages.includes(this.name)
  }

  get fileName () {
    return `${this.name}_${this.number}.jpg`
  }
}
