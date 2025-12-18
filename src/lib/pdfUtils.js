import { PDFDocument, rgb, PageSizes } from 'pdf-lib'

// Test definitions - matching LabTestPrescription.jsx
const BLOOD_TESTS = {
    'Hématologie (sang)': [
        'NFS / Hémogramme complet',
        'Globules rouges (GR)',
        'Hémoglobine (Hb)',
        'Hématocrite (Ht)',
        'VGM, TCMH, CCMH',
        'Globules blancs (GB) + formule leucocytaire',
        'Plaquettes',
        'VS (Vitesse de sédimentation)',
        'Réticulocytes',
        'Frottis sanguin',
    ],
    'Coagulation': [
        'TP (Taux de prothrombine)',
        'INR',
        'TCA (aPTT)',
        'Fibrinogène',
        'Facteurs de coagulation (VIII, IX, XI...)',
        'D-dimeres',
    ],
    'Biochimie générale': [
        'Glycemie a jeun',
        'HbA1c',
        'Uree',
        'Creatinine',
        'Clairance de la creatinine',
        'Acide urique',
        'Proteines totales',
        'Albumine',
    ],
    'Bilan lipidique': [
        'Cholesterol total',
        'HDL',
        'LDL',
        'Triglycerides',
        'Apolipoproteine A1 / B',
        'Lipoproteine(a)',
    ],
    'Bilan hepatique (foie)': [
        'ASAT (TGO)',
        'ALAT (TGP)',
        'PAL (Phosphatases alcalines)',
        'GGT',
        'Bilirubine totale / directe / indirecte',
        'Albumine',
        'TP (fonction hepatique)',
    ],
    'Bilan renal': [
        'Uree',
        'Creatinine',
        'Sodium (Na+)',
        'Potassium (K+)',
        'Chlore (Cl-)',
        'Calcium (Ca2+)',
        'Phosphore',
        'Magnesium',
    ],
    'Endocrinologie / Hormones': [
        'TSH',
        'T3 / T4 libres',
        'Insuline',
        'Cortisol',
        'ACTH',
        'Prolactine',
        'Testosterone',
        'Oestradiol',
        'Progesterone',
        'FSH',
        'LH',
        'beta-HCG',
        'Parathormone (PTH)',
        'Vitamine D',
    ],
    'Bilan inflammatoire & immunologique': [
        'CRP',
        'Procalcitonine',
        'Facteur rhumatoide',
        'Anti-CCP',
        'ANA (anticorps antinucleaires)',
        'Anti-dsDNA',
        'Complement C3 / C4',
    ],
    'Serologie / Infections': [
        'VIH',
        'Hepatite B (HBsAg, anti-HBs...)',
        'Hepatite C',
        'Syphilis (VDRL, TPHA)',
        'Toxoplasmose',
        'Rubeole',
        'CMV',
        'EBV',
        'COVID-19',
    ],
    'Marqueurs tumoraux': [
        'PSA',
        'AFP',
        'CEA',
        'CA 19-9',
        'CA 125',
        'CA 15-3',
        'beta-HCG',
    ],
}

const URINE_TESTS = {
    'Examen urinaire standard': [
        'ECBU (Examen cytobacteriologique des urines)',
        'Aspect (couleur, limpidite)',
        'pH',
        'Densite',
    ],
    'Bandelette urinaire': [
        'Proteines',
        'Glucose',
        'Cetones',
        'Sang',
        'Leucocytes',
        'Nitrites',
        'Bilirubine',
        'Urobilinogene',
    ],
    'Analyse microscopique': [
        'Globules rouges',
        'Globules blancs',
        'Cylindres',
        'Cristaux',
        'Bacteries',
        'Levures',
    ],
    'Biochimie urinaire': [
        'Proteinurie (24h)',
        'Micro-albuminurie',
        'Creatinine urinaire',
        'Sodium urinaire',
        'Potassium urinaire',
        'Calcium urinaire',
        'Phosphore urinaire',
        'Acide urique urinaire',
    ],
    'Urines des 24 heures': [
        'Volume urinaire',
        'Proteines',
        'Calcium',
        'Phosphore',
        'Sodium',
        'Potassium',
        'Uree',
        'Creatinine',
    ],
    'Tests specifiques urinaires': [
        'HCG urinaire (grossesse)',
        'Drogues urinaires (toxicologie)',
        'Catecholamines',
        'Cortisol urinaire',
        'Electrophorese des proteines urinaires',
    ],
}

// Helper function to draw a checkbox
const drawCheckbox = (page, x, y, size, isChecked, label, fontSize) => {
    // Draw checkbox square
    page.drawRectangle({
        x: x,
        y: y,
        width: size,
        height: size,
        borderColor: rgb(0, 0, 0),
        borderWidth: 0.5,
        color: rgb(1, 1, 1),
    })

    // Draw checkmark if selected
    if (isChecked) {
        // Draw checkmark as X
        page.drawText('X', {
            x: x + 1.5,
            y: y + 1,
            size: size - 2,
            color: rgb(0, 0.5, 0),
        })
    }

    // Draw label
    const maxLabelWidth = 35 // characters
    const truncatedLabel = label.length > maxLabelWidth ? label.substring(0, maxLabelWidth - 3) + '...' : label
    page.drawText(truncatedLabel, {
        x: x + size + 3,
        y: y + 2,
        size: fontSize,
        color: rgb(0, 0, 0),
    })
}

export const generatePrescriptionPDF = async (prescription, patient, doctor) => {
    try {
        // Create a new PDF
        const pdfDoc = await PDFDocument.create()

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

        // Check if this is a lab test prescription
        if (prescription.prescription_type === 'lab_test') {
            // Multi-page lab test prescription with checkbox grid
            const selectedBloodTests = prescription.blood_tests || []
            const selectedUrineTests = prescription.urine_tests || []

            let currentPage = pdfDoc.addPage(PageSizes.A4)
            let { width, height } = currentPage.getSize()
            let currentY = height - 60
            const margin = 40
            const checkboxSize = 8
            const itemHeight = 12
            const columnWidth = (width - 2 * margin - 10) / 2
            const testFontSize = 7

            // Header on first page
            currentPage.drawText('LABORATORY TEST PRESCRIPTION', {
                x: margin,
                y: currentY,
                size: 16,
                color: rgb(0.2, 0.2, 0.8),
            })
            currentY -= 30

            // Patient info
            currentPage.drawText(`Patient: ${patient.first_name} ${patient.last_name}`, {
                x: margin,
                y: currentY,
                size: 11,
                color: rgb(0, 0, 0),
            })
            currentPage.drawText(`Age: ${age} years`, {
                x: width - margin - 120,
                y: currentY,
                size: 11,
                color: rgb(0, 0, 0),
            })
            currentY -= 15
            currentPage.drawText(`Date: ${date}`, {
                x: margin,
                y: currentY,
                size: 10,
                color: rgb(0.3, 0.3, 0.3),
            })
            currentY -= 20

            // Payment Information (if available)
            const totalAmount = parseFloat(patient.total_amount) || 0
            const paidAmount = parseFloat(patient.paid_amount) || 0
            const restToPay = Math.max(0, totalAmount - paidAmount)

            if (totalAmount > 0) {
                // Payment section
                currentPage.drawText('PAYMENT INFORMATION', {
                    x: margin,
                    y: currentY,
                    size: 10,
                    color: rgb(0.2, 0.2, 0.2),
                })
                currentY -= 15

                // Payment details in a box
                currentPage.drawRectangle({
                    x: margin,
                    y: currentY - 40,
                    width: 280,
                    height: 45,
                    borderColor: rgb(0.7, 0.7, 0.7),
                    borderWidth: 1,
                    color: rgb(0.98, 0.98, 0.98),
                })

                currentPage.drawText(`Total Amount: ${totalAmount.toFixed(2)} DA`, {
                    x: margin + 10,
                    y: currentY - 15,
                    size: 9,
                    color: rgb(0, 0, 0),
                })
                currentPage.drawText(`Paid (Versement): ${paidAmount.toFixed(2)} DA`, {
                    x: margin + 10,
                    y: currentY - 27,
                    size: 9,
                    color: rgb(0, 0.5, 0),
                })
                currentPage.drawText(`Rest to Pay: ${restToPay.toFixed(2)} DA`, {
                    x: margin + 10,
                    y: currentY - 39,
                    size: 9,
                    color: restToPay > 0 ? rgb(0.8, 0, 0) : rgb(0, 0, 0),
                })

                // Payment status badge
                let paymentStatus = 'UNPAID'
                let statusColor = rgb(0.8, 0, 0)
                if (paidAmount >= totalAmount) {
                    paymentStatus = 'PAID'
                    statusColor = rgb(0, 0.6, 0)
                } else if (paidAmount > 0) {
                    paymentStatus = 'PARTIAL'
                    statusColor = rgb(0.8, 0.5, 0)
                }

                currentPage.drawText(`Status: ${paymentStatus}`, {
                    x: margin + 150,
                    y: currentY - 27,
                    size: 10,
                    color: statusColor,
                })

                currentY -= 50
            }
            currentY -= 5

            // Function to check if we need a new page
            const checkNewPage = (neededSpace) => {
                if (currentY - neededSpace < 80) {
                    currentPage = pdfDoc.addPage(PageSizes.A4)
                    const pageSize = currentPage.getSize()
                    width = pageSize.width
                    height = pageSize.height
                    currentY = height - 60
                    return true
                }
                return false
            }

            // Draw a horizontal line
            currentPage.drawLine({
                start: { x: margin, y: currentY },
                end: { x: width - margin, y: currentY },
                thickness: 1,
                color: rgb(0.8, 0, 0),
            })
            currentY -= 20

            // BLOOD TESTS Section
            currentPage.drawText('BLOOD TESTS', {
                x: margin,
                y: currentY,
                size: 13,
                color: rgb(0.8, 0, 0),
            })
            currentY -= 20

            // Render blood tests in 2-column grid
            Object.entries(BLOOD_TESTS).forEach(([category, tests]) => {
                checkNewPage(20)

                // Category header
                currentPage.drawText(category, {
                    x: margin,
                    y: currentY,
                    size: 9,
                    color: rgb(0.3, 0.3, 0.3),
                })
                currentY -= 15

                // Draw tests in 2 columns
                let column = 0
                tests.forEach((test, idx) => {
                    const xPos = margin + (column * columnWidth)

                    if (column === 1 || idx === tests.length - 1) {
                        checkNewPage(itemHeight + 2)
                    }

                    const isChecked = selectedBloodTests.includes(test)
                    drawCheckbox(currentPage, xPos, currentY, checkboxSize, isChecked, test, testFontSize)

                    column++
                    if (column >= 2) {
                        column = 0
                        currentY -= itemHeight
                    }
                })

                if (column > 0) {
                    currentY -= itemHeight
                }
                currentY -= 8
            })

            currentY -= 10
            checkNewPage(20)

            // Draw separator
            currentPage.drawLine({
                start: { x: margin, y: currentY },
                end: { x: width - margin, y: currentY },
                thickness: 1,
                color: rgb(0.7, 0.5, 0),
            })
            currentY -= 20

            // URINE TESTS Section
            currentPage.drawText('URINE TESTS', {
                x: margin,
                y: currentY,
                size: 13,
                color: rgb(0.7, 0.5, 0),
            })
            currentY -= 20

            // Render urine tests in 2-column grid
            Object.entries(URINE_TESTS).forEach(([category, tests]) => {
                checkNewPage(20)

                // Category header
                currentPage.drawText(category, {
                    x: margin,
                    y: currentY,
                    size: 9,
                    color: rgb(0.3, 0.3, 0.3),
                })
                currentY -= 15

                // Draw tests in 2 columns
                let column = 0
                tests.forEach((test, idx) => {
                    const xPos = margin + (column * columnWidth)

                    if (column === 1 || idx === tests.length - 1) {
                        checkNewPage(itemHeight + 2)
                    }

                    const isChecked = selectedUrineTests.includes(test)
                    drawCheckbox(currentPage, xPos, currentY, checkboxSize, isChecked, test, testFontSize)

                    column++
                    if (column >= 2) {
                        column = 0
                        currentY -= itemHeight
                    }
                })

                if (column > 0) {
                    currentY -= itemHeight
                }
                currentY -= 8
            })

            // Instructions
            if (prescription.instructions) {
                currentY -= 15
                checkNewPage(40)
                currentPage.drawText('INSTRUCTIONS:', {
                    x: margin,
                    y: currentY,
                    size: 10,
                    color: rgb(0, 0, 0),
                })
                currentY -= 15
                currentPage.drawText(prescription.instructions, {
                    x: margin,
                    y: currentY,
                    size: 9,
                    color: rgb(0.2, 0.2, 0.2),
                })
            }


        } else {
            // Regular medication prescription (A5 size with template)
            const templateUrl = '/prescription-template.pdf'
            const existingPdfBytes = await fetch(templateUrl).then(res => res.arrayBuffer())
            const templateDoc = await PDFDocument.load(existingPdfBytes)

            const A5_WIDTH = 419.53
            const A5_HEIGHT = 595.28
            const SCALE = A5_WIDTH / 595.28

            const page = pdfDoc.addPage(PageSizes.A5)
            const { width, height } = page.getSize()
            const [embeddedPage] = await pdfDoc.embedPages([templateDoc.getPages()[0]])

            page.drawPage(embeddedPage, {
                x: 0,
                y: 0,
                width: width,
                height: height,
            })

            const fontSize = (size) => size * SCALE
            const leftMargin = 100 * SCALE

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
            page.drawText(date, {
                x: width - (150 * SCALE),
                y: height - (150 * SCALE),
                size: fontSize(10),
                color: rgb(0, 0, 0),
            })

            let currentY = height - (190 * SCALE)
            const lineHeight = fontSize(14)

            // Payment Information (if available)
            const totalAmount = parseFloat(patient.total_amount) || 0
            const paidAmount = parseFloat(patient.paid_amount) || 0
            const restToPay = Math.max(0, totalAmount - paidAmount)

            if (totalAmount > 0) {
                currentY -= fontSize(5)

                // Payment section header
                page.drawText('PAYMENT INFO', {
                    x: leftMargin,
                    y: currentY,
                    size: fontSize(9),
                    color: rgb(0.2, 0.2, 0.2),
                })
                currentY -= fontSize(12)

                // Payment box
                page.drawRectangle({
                    x: leftMargin - 5,
                    y: currentY - fontSize(28),
                    width: width - 2 * leftMargin + 10,
                    height: fontSize(32),
                    borderColor: rgb(0.7, 0.7, 0.7),
                    borderWidth: 0.5,
                    color: rgb(0.98, 0.98, 0.98),
                })

                page.drawText(`Total: ${totalAmount.toFixed(2)} DA`, {
                    x: leftMargin,
                    y: currentY,
                    size: fontSize(8),
                    color: rgb(0, 0, 0),
                })
                currentY -= fontSize(10)

                page.drawText(`Paid: ${paidAmount.toFixed(2)} DA`, {
                    x: leftMargin,
                    y: currentY,
                    size: fontSize(8),
                    color: rgb(0, 0.5, 0),
                })
                currentY -= fontSize(10)

                page.drawText(`Rest: ${restToPay.toFixed(2)} DA`, {
                    x: leftMargin,
                    y: currentY,
                    size: fontSize(8),
                    color: restToPay > 0 ? rgb(0.8, 0, 0) : rgb(0, 0, 0),
                })

                // Status
                let paymentStatus = 'UNPAID'
                let statusColor = rgb(0.8, 0, 0)
                if (paidAmount >= totalAmount) {
                    paymentStatus = 'PAID'
                    statusColor = rgb(0, 0.6, 0)
                } else if (paidAmount > 0) {
                    paymentStatus = 'PARTIAL'
                    statusColor = rgb(0.8, 0.5, 0)
                }

                page.drawText(`[${paymentStatus}]`, {
                    x: width - leftMargin - fontSize(35),
                    y: currentY + fontSize(10),
                    size: fontSize(8),
                    color: statusColor,
                })

                currentY -= fontSize(18)
            }

            // Content starts here
            currentY -= fontSize(5)

            // Medication
            page.drawText(`Medication: ${prescription.medication}`, {
                x: leftMargin,
                y: currentY,
                size: fontSize(11),
                color: rgb(0, 0, 0),
            })
            currentY -= lineHeight

            // Dosage
            if (prescription.dosage) {
                page.drawText(`Dosage: ${prescription.dosage}`, {
                    x: leftMargin,
                    y: currentY,
                    size: fontSize(11),
                    color: rgb(0, 0, 0),
                })
                currentY -= lineHeight
            }

            // Instructions
            if (prescription.instructions) {
                page.drawText(`Instructions: ${prescription.instructions}`, {
                    x: leftMargin,
                    y: currentY,
                    size: fontSize(10),
                    color: rgb(0, 0, 0),
                })
            }

        }

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
