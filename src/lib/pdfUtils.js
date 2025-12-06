import { PDFDocument, rgb, PageSizes } from 'pdf-lib'

// Helper to scale coordinates from A4 to A5
const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89
const A5_WIDTH = 419.53
const A5_HEIGHT = 595.28
const SCALE = A5_WIDTH / A4_WIDTH // ~0.705

export const generatePrescriptionPDF = async (prescription, patient, doctor) => {
    try {
        // Fetch the template PDF (Assumed to be A4)
        const templateUrl = '/prescription-template.pdf'
        const existingPdfBytes = await fetch(templateUrl).then(res => res.arrayBuffer())

        // Load the template
        const templateDoc = await PDFDocument.load(existingPdfBytes)

        // Create a new PDF for output (A5)
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage(PageSizes.A5)
        const { width, height } = page.getSize()

        // Embed the template page
        const [embeddedPage] = await pdfDoc.embedPages([templateDoc.getPages()[0]])

        // Draw the template scaled down to fit A5
        page.drawPage(embeddedPage, {
            x: 0,
            y: 0,
            width: width,
            height: height,
        })

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

        // Helper for scaled font size
        const fontSize = (size) => size * SCALE

        // Draw Text with scaled coordinates
        // Original: x=150, y=H-150 (Top margin 150, Left margin 150)
        // New: x=150*SCALE, y=(H_A4-150)*SCALE? 
        // No, simplest is to use relative factor from the scaled page dimensions
        // A4 Top-Left Origin logic: y_from_top = 150. New y_from_top = 150 * SCALE

        // Patient Name
        page.drawText(`${patient.first_name} ${patient.last_name}`, {
            x: 150 * SCALE,
            y: height - (150 * SCALE),
            size: fontSize(12),
            color: rgb(0, 0, 0),
        })

        // Age
        page.drawText(`Age: ${age} years`, {
            x: 150 * SCALE,
            y: height - (170 * SCALE),
            size: fontSize(10),
            color: rgb(0, 0, 0),
        })

        // Date
        // Original: x=Width-150. New: Width_A5 - (150*SCALE)
        page.drawText(date, {
            x: width - (150 * SCALE),
            y: height - (150 * SCALE),
            size: fontSize(10),
            color: rgb(0, 0, 0),
            // Adjust to align right if needed, but standard text drawing is left-aligned.
            // If original was right-aligned visually, this keeps proportional position.
        })

        // Medication
        page.drawText(`Medication: ${prescription.medication}`, {
            x: 100 * SCALE,
            y: height - (250 * SCALE),
            size: fontSize(11),
            color: rgb(0, 0, 0),
        })

        // Dosage
        page.drawText(`Dosage: ${prescription.dosage}`, {
            x: 100 * SCALE,
            y: height - (280 * SCALE),
            size: fontSize(11),
            color: rgb(0, 0, 0),
        })

        // Instructions
        if (prescription.instructions) {
            page.drawText(`Instructions: ${prescription.instructions}`, {
                x: 100 * SCALE,
                y: height - (310 * SCALE),
                size: fontSize(10),
                color: rgb(0, 0, 0),
            })
        }

        // Doctor Name
        // Original: y=100 (from bottom). New: y=100*SCALE
        page.drawText(`Dr. ${doctor.full_name}`, {
            x: width - (200 * SCALE), // Visual approximation of original position
            y: 100 * SCALE,
            size: fontSize(11),
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
