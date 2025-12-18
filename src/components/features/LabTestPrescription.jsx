import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../common/Button'
import { supabase } from '../../lib/supabase'
import { FlaskConical, Droplets, Check } from 'lucide-react'

// Analyses Sanguines (Blood Tests) - French Standard
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
        'Facteurs de coagulation (VIII, IX, XI…)',
        'D-dimères',
    ],
    'Biochimie générale': [
        'Glycémie à jeun',
        'HbA1c',
        'Urée',
        'Créatinine',
        'Clairance de la créatinine',
        'Acide urique',
        'Protéines totales',
        'Albumine',
    ],
    'Bilan lipidique': [
        'Cholestérol total',
        'HDL',
        'LDL',
        'Triglycérides',
        'Apolipoprotéine A1 / B',
        'Lipoprotéine(a)',
    ],
    'Bilan hépatique (foie)': [
        'ASAT (TGO)',
        'ALAT (TGP)',
        'PAL (Phosphatases alcalines)',
        'GGT',
        'Bilirubine totale / directe / indirecte',
        'Albumine',
        'TP (fonction hépatique)',
    ],
    'Bilan rénal': [
        'Urée',
        'Créatinine',
        'Sodium (Na⁺)',
        'Potassium (K⁺)',
        'Chlore (Cl⁻)',
        'Calcium (Ca²⁺)',
        'Phosphore',
        'Magnésium',
    ],
    'Endocrinologie / Hormones': [
        'TSH',
        'T3 / T4 libres',
        'Insuline',
        'Cortisol',
        'ACTH',
        'Prolactine',
        'Testostérone',
        'Œstradiol',
        'Progestérone',
        'FSH',
        'LH',
        'β-HCG',
        'Parathormone (PTH)',
        'Vitamine D',
    ],
    'Bilan inflammatoire & immunologique': [
        'CRP',
        'Procalcitonine',
        'Facteur rhumatoïde',
        'Anti-CCP',
        'ANA (anticorps antinucléaires)',
        'Anti-dsDNA',
        'Complément C3 / C4',
    ],
    'Sérologie / Infections': [
        'VIH',
        'Hépatite B (HBsAg, anti-HBs…)',
        'Hépatite C',
        'Syphilis (VDRL, TPHA)',
        'Toxoplasmose',
        'Rubéole',
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
        'β-HCG',
    ],
}

// Analyses Urinaires (Urine Tests) - French Standard
const URINE_TESTS = {
    'Examen urinaire standard': [
        'ECBU (Examen cytobactériologique des urines)',
        'Aspect (couleur, limpidité)',
        'pH',
        'Densité',
    ],
    'Bandelette urinaire': [
        'Protéines',
        'Glucose',
        'Cétones',
        'Sang',
        'Leucocytes',
        'Nitrites',
        'Bilirubine',
        'Urobilinogène',
    ],
    'Analyse microscopique': [
        'Globules rouges',
        'Globules blancs',
        'Cylindres',
        'Cristaux',
        'Bactéries',
        'Levures',
    ],
    'Biochimie urinaire': [
        'Protéinurie (24h)',
        'Micro-albuminurie',
        'Créatinine urinaire',
        'Sodium urinaire',
        'Potassium urinaire',
        'Calcium urinaire',
        'Phosphore urinaire',
        'Acide urique urinaire',
    ],
    'Urines des 24 heures': [
        'Volume urinaire',
        'Protéines',
        'Calcium',
        'Phosphore',
        'Sodium',
        'Potassium',
        'Urée',
        'Créatinine',
    ],
    'Tests spécifiques urinaires': [
        'HCG urinaire (grossesse)',
        'Drogues urinaires (toxicologie)',
        'Catécholamines',
        'Cortisol urinaire',
        'Électrophorèse des protéines urinaires',
    ],
}

export const LabTestPrescription = ({ patient, onSave, onCancel }) => {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [selectedBloodTests, setSelectedBloodTests] = useState([])
    const [selectedUrineTests, setSelectedUrineTests] = useState([])
    const [expandedCategories, setExpandedCategories] = useState({})
    const [instructions, setInstructions] = useState('')

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }))
    }

    const toggleBloodTest = (test) => {
        setSelectedBloodTests(prev =>
            prev.includes(test)
                ? prev.filter(t => t !== test)
                : [...prev, test]
        )
    }

    const toggleUrineTest = (test) => {
        setSelectedUrineTests(prev =>
            prev.includes(test)
                ? prev.filter(t => t !== test)
                : [...prev, test]
        )
    }

    const selectAllInCategory = (category, tests, isBlood = true) => {
        if (isBlood) {
            const allSelected = tests.every(t => selectedBloodTests.includes(t))
            if (allSelected) {
                setSelectedBloodTests(prev => prev.filter(t => !tests.includes(t)))
            } else {
                setSelectedBloodTests(prev => [...new Set([...prev, ...tests])])
            }
        } else {
            const allSelected = tests.every(t => selectedUrineTests.includes(t))
            if (allSelected) {
                setSelectedUrineTests(prev => prev.filter(t => !tests.includes(t)))
            } else {
                setSelectedUrineTests(prev => [...new Set([...prev, ...tests])])
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        if (selectedBloodTests.length === 0 && selectedUrineTests.length === 0) {
            alert('Veuillez sélectionner au moins une analyse')
            setLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                alert('Vous devez être connecté pour créer une ordonnance')
                setLoading(false)
                return
            }

            const allTests = [
                ...selectedBloodTests.map(t => `🩸 ${t}`),
                ...selectedUrineTests.map(t => `🚽 ${t}`)
            ].join('\n')

            const prescriptionData = {
                medication: `Ordonnance d'Analyses:\n${allTests}`,
                dosage: `${selectedBloodTests.length} analyses sanguines, ${selectedUrineTests.length} analyses urinaires`,
                instructions: instructions,
                blood_tests: selectedBloodTests,
                urine_tests: selectedUrineTests,
                patient_id: patient.id,
                doctor_id: user.id,
                prescription_type: 'lab_test'
            }

            console.log('Creating lab test prescription:', prescriptionData)

            const { data, error } = await supabase
                .from('prescriptions')
                .insert([prescriptionData])
                .select()

            if (error) {
                console.error('Lab test error:', error)
                throw error
            }

            console.log('Lab test prescription created:', data)
            alert('✅ Ordonnance d\'analyses créée avec succès!')
            onSave()
        } catch (error) {
            console.error('Error saving lab test prescription:', error)
            alert(`Erreur: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const TestCheckbox = ({ test, isSelected, onToggle }) => (
        <label
            className={`lab-test-item cursor-pointer ${isSelected ? 'selected' : ''}`}
            onClick={onToggle}
        >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected
                    ? 'bg-primary-600 border-primary-600'
                    : 'border-gray-300 bg-white'
                }`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="flex-1 text-sm">{test}</span>
        </label>
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Patient Info */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">{t('patient')}</p>
                        <p className="font-semibold text-gray-800">{patient.first_name} {patient.last_name}</p>
                    </div>
                </div>
            </div>

            {/* Selection Summary */}
            <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                    <FlaskConical className="w-4 h-4 text-red-500" />
                    <span className="font-medium">{selectedBloodTests.length}</span>
                    <span className="text-gray-500">analyses sanguines</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Droplets className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{selectedUrineTests.length}</span>
                    <span className="text-gray-500">analyses urinaires</span>
                </div>
            </div>

            {/* Blood Tests Section */}
            <div className="space-y-3">
                <h3 className="section-header">
                    <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <FlaskConical className="w-4 h-4 text-red-600" />
                    </span>
                    🩸 ANALYSES SANGUINES
                </h3>

                <div className="space-y-2">
                    {Object.entries(BLOOD_TESTS).map(([category, tests]) => {
                        const isExpanded = expandedCategories[`blood_${category}`]
                        const selectedCount = tests.filter(t => selectedBloodTests.includes(t)).length

                        return (
                            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => toggleCategory(`blood_${category}`)}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-800">{category}</span>
                                        {selectedCount > 0 && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                                {selectedCount} sélectionné(s)
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                selectAllInCategory(category, tests, true)
                                            }}
                                            className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50"
                                        >
                                            {tests.every(t => selectedBloodTests.includes(t)) ? 'Tout désélectionner' : 'Tout sélectionner'}
                                        </button>
                                        <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                                    </div>
                                </button>
                                {isExpanded && (
                                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {tests.map(test => (
                                            <TestCheckbox
                                                key={test}
                                                test={test}
                                                isSelected={selectedBloodTests.includes(test)}
                                                onToggle={() => toggleBloodTest(test)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Urine Tests Section */}
            <div className="space-y-3">
                <h3 className="section-header">
                    <span className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-yellow-600" />
                    </span>
                    🚽 ANALYSES URINAIRES
                </h3>

                <div className="space-y-2">
                    {Object.entries(URINE_TESTS).map(([category, tests]) => {
                        const isExpanded = expandedCategories[`urine_${category}`]
                        const selectedCount = tests.filter(t => selectedUrineTests.includes(t)).length

                        return (
                            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => toggleCategory(`urine_${category}`)}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-800">{category}</span>
                                        {selectedCount > 0 && (
                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                                                {selectedCount} sélectionné(s)
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                selectAllInCategory(category, tests, false)
                                            }}
                                            className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50"
                                        >
                                            {tests.every(t => selectedUrineTests.includes(t)) ? 'Tout désélectionner' : 'Tout sélectionner'}
                                        </button>
                                        <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                                    </div>
                                </button>
                                {isExpanded && (
                                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {tests.map(test => (
                                            <TestCheckbox
                                                key={test}
                                                test={test}
                                                isSelected={selectedUrineTests.includes(test)}
                                                onToggle={() => toggleUrineTest(test)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    {t('instructions')}
                </label>
                <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="input-field min-h-[80px]"
                    placeholder="Instructions spéciales (ex: À jeun, heure de prélèvement)..."
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    {t('cancel')}
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? t('loading') : t('save')}
                </Button>
            </div>
        </form>
    )
}
