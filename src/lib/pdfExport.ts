import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function downloadPDF(elementId: string, filename: string = 'invoice.pdf'): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width

  let heightLeft = pdfHeight
  let position = 0
  const pageHeight = pdf.internal.pageSize.getHeight()

  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)

  heightLeft -= pageHeight
  while (heightLeft > 0) {
    position -= pageHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}

export function printElement(elementId: string): void {
  const element = document.getElementById(elementId)
  if (!element) return

  const win = window.open('', '_blank')
  if (!win) return

  win.document.write(`
    <html>
      <head>
        <title>Print Invoice</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${element.innerHTML}</body>
    </html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 500)
}
