import { jsPDF } from 'jspdf'
import getJunicodeRegular from 'fragmentarium/ui/fragment/pdf-fonts/Junicode'
import getJunicodeBold from 'fragmentarium/ui/fragment/pdf-fonts/JunicodeBold'
import getJunicodeItalic from 'fragmentarium/ui/fragment/pdf-fonts/JunicodeItalic'

export function addCustomFonts(doc: jsPDF): void {
  doc.addFileToVFS('Junicode.ttf', getJunicodeRegular())
  doc.addFont('Junicode.ttf', 'Junicode', 'normal')

  doc.addFileToVFS('JunicodeBold.ttf', getJunicodeBold())
  doc.addFont('JunicodeBold.ttf', 'JunicodeBold', 'normal')

  doc.addFileToVFS('JunicodeItalic.ttf', getJunicodeItalic())
  doc.addFont('JunicodeItalic.ttf', 'JunicodeItalic', 'normal')
}
