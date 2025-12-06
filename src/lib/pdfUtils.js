import { PDFDocument, rgb } from 'pdf-lib'

export const generatePrescriptionPDF = async (prescription, patient, doctor) => {
    try {
        // Fetch the template PDF
        const templateUrl = '/prescription-template.pdf'
        const existingPdfBytes = await fetch(templateUrl).then(res => res.arrayBuffer())

        // Load the PDF
        const pdfDoc = await PDFDocument.load(existingPdfBytes)
        const pages = pdfDoc.getPages()
        const firstPage = pages[0]

        // Get page dimensions
        const { width, height } = firstPage.getSize()

        // Format date
        const date = new Date(prescription.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        // Calculate patient age
        const calculateAge = (dob) => {
            const birthDate = new Date(dob)
            const today = new Date()
            let age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--
            }
            return age
        }

        const age = calculateAge(patient.date_of_birth)

        // Add text to PDF (adjust coordinates based on your template)
        // You'll need to adjust these coordinates to match your PDF template
        firstPage.drawText(`${patient.first_name} ${patient.last_name}`, {
            x: 150,
            y: height - 150,
            size: 12,
            color: rgb(0, 0, 0),
        })

        firstPage.drawText(`Age: ${age} years`, {
            x: 150,
            y: height - 170,
            size: 10,
            color: rgb(0, 0, 0),
        })

        firstPage.drawText(date, {
            x: width - 150,
            y: height - 150,
            size: 10,
            color: rgb(0, 0, 0),
        })

        firstPage.drawText(`Medication: ${prescription.medication}`, {
            x: 100,
            y: height - 250,
            size: 11,
            color: rgb(0, 0, 0),
        })

        firstPage.drawText(`Dosage: ${prescription.dosage}`, {
            x: 100,
            y: height - 280,
            size: 11,
            color: rgb(0, 0, 0),
        })

        if (prescription.instructions) {
            firstPage.drawText(`Instructions: ${prescription.instructions}`, {
                x: 100,
                y: height - 310,
                size: 10,
                color: rgb(0, 0, 0),
            })
        }

        firstPage.drawText(`Dr. ${doctor.full_name}`, {
            x: width - 200,
            y: 100,
            size: 11,
            color: rgb(0, 0, 0),
        })

        // Serialize the PDF
        const pdfBytes = await pdfDoc.save()

        return pdfBytes
    } catch (error) {
        console.error('Error generating PDF:', error)
        throw error
    }
}

export const downloadPDF = (pdfBytes, filename) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

export const printPDF = (pdfBytes) => {
    try {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)

        // Try to open in new window for printing
        const printWindow = window.open(url, '_blank')

        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print()
                // Don't auto-close - let user close manually after printing
                // setTimeout(() => {
                //     printWindow.close()
                //     URL.revokeObjectURL(url)
                // }, 5000)
            }
        } else {
            // Fallback: if popup blocked, use iframe method
            const iframe = document.createElement('iframe')
            iframe.style.position = 'fixed'
            iframe.style.right = '0'
            iframe.style.bottom = '0'
            iframe.style.width = '0'
            iframe.style.height = '0'
            iframe.style.border = '0'
            iframe.src = url
            document.body.appendChild(iframe)

            iframe.onload = () => {
                try {
                    iframe.contentWindow.focus()
                    iframe.contentWindow.print()
                } catch (e) {
                    console.error('Print error:', e)
                    alert('Please allow popups to print prescriptions')
                }
                setTimeout(() => {
                    document.body.removeChild(iframe)
                    URL.revokeObjectURL(url)
                }, 1000)
            }
        }
    } catch (error) {
        console.error('Error in printPDF:', error)
        throw error
    }
}
