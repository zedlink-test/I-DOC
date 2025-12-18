import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
    en: {
        translation: {
            // Auth
            login: 'Login',
            email: 'Email',
            password: 'Password',
            logout: 'Logout',
            welcome: 'Welcome',

            // Roles
            admin: 'Admin',
            doctor: 'Doctor',
            secretary: 'Secretary',

            // Navigation
            dashboard: 'Dashboard',
            patients: 'Patients',
            schedules: 'Schedules',
            users: 'Users',
            myPatients: 'My Patients',

            // Patient Management
            addPatient: 'Add Patient',
            editPatient: 'Edit Patient',
            deletePatient: 'Delete Patient',
            firstName: 'First Name',
            lastName: 'Last Name',
            dateOfBirth: 'Date of Birth',
            age: 'Age',
            phoneNumber: 'Phone Number',
            condition: 'Condition',
            assignedDoctor: 'Assigned Doctor',

            // Payment
            totalAmount: 'Total Amount',
            paidAmount: 'Paid Amount',
            restToPay: 'Rest to Pay',
            paymentStatus: 'Payment Status',
            paid: 'Paid',
            partial: 'Partial',
            unpaid: 'Unpaid',
            versement: 'Versement',
            currency: 'DZD',

            // Schedule Management
            addSchedule: 'Add Schedule',
            editSchedule: 'Edit Schedule',
            deleteSchedule: 'Delete Schedule',
            appointmentDate: 'Appointment Date',
            duration: 'Duration (minutes)',
            status: 'Status',
            scheduled: 'Scheduled',
            completed: 'Completed',
            cancelled: 'Cancelled',

            // Visit Notes
            visitNotes: 'Visit Notes',
            addNote: 'Add Note',
            notes: 'Notes',
            editNote: 'Edit Note',
            noteContent: 'Note Content',
            appointmentPlan: 'Appointment Plan',
            whatToDo: 'What to do at this appointment',

            // Prescriptions
            prescriptions: 'Prescriptions',
            addPrescription: 'Add Prescription',
            medication: 'Medication',
            dosage: 'Dosage',
            instructions: 'Instructions',
            noPrescriptions: 'No prescriptions yet',
            noResults: 'No results found',
            patient: 'Patient',
            medicineName: 'Medicine Name',
            dosagePerDay: 'Dosage/Day',
            durationDays: 'Duration (Days)',
            addMedication: 'Add Medication',
            removeMedication: 'Remove',

            // Lab Tests
            labTests: 'Lab Tests',
            bloodTests: 'Blood Tests',
            urineTests: 'Urine Tests',
            addLabTest: 'Add Lab Test Prescription',
            selectTests: 'Select Tests',
            
            // Blood Test Categories
            completeBloodCount: 'Complete Blood Count (CBC)',
            metabolicPanel: 'Metabolic Panel',
            lipidPanel: 'Lipid Panel',
            liverFunction: 'Liver Function',
            thyroidPanel: 'Thyroid Panel',
            cardiacMarkers: 'Cardiac Markers',
            coagulation: 'Coagulation',
            inflammatory: 'Inflammatory Markers',
            diabetes: 'Diabetes',
            ironStudies: 'Iron Studies',
            kidneyFunction: 'Kidney Function',
            electrolytes: 'Electrolytes',
            vitamins: 'Vitamins',
            hormones: 'Hormones',
            infections: 'Infections',
            autoimmune: 'Autoimmune',
            tumorMarkers: 'Tumor Markers',

            // User Management
            addUser: 'Add User',
            inviteUser: 'Create New User',
            sendInvitation: 'Create Account',
            createAccount: 'Create Account',
            creating: 'Creating...',
            sending: 'Sending...',
            editUser: 'Edit User',
            deleteUser: 'Delete User',
            fullName: 'Full Name',
            role: 'Role',

            // Actions
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            view: 'View',
            search: 'Search',
            filter: 'Filter',
            print: 'Print',
            download: 'Download',
            update: 'Update',

            // Messages
            loading: 'Loading...',
            noData: 'No data available',
            error: 'An error occurred',
            success: 'Operation successful',
            confirmDelete: 'Are you sure you want to delete this item?',
            deleteSuccess: 'Deleted successfully',

            // Stats
            totalPatients: 'Total Patients',
            totalDoctors: 'Total Doctors',
            totalSecretaries: 'Total Secretaries',
            upcomingAppointments: 'Upcoming Appointments',
            todayAppointments: "Today's Appointments",
        }
    },
    fr: {
        translation: {
            // Auth
            login: 'Connexion',
            email: 'Email',
            password: 'Mot de passe',
            logout: 'Déconnexion',
            welcome: 'Bienvenue',

            // Roles
            admin: 'Administrateur',
            doctor: 'Médecin',
            secretary: 'Secrétaire',

            // Navigation
            dashboard: 'Tableau de bord',
            patients: 'Patients',
            schedules: 'Rendez-vous',
            users: 'Utilisateurs',
            myPatients: 'Mes Patients',

            // Patient Management
            addPatient: 'Ajouter un patient',
            editPatient: 'Modifier le patient',
            deletePatient: 'Supprimer le patient',
            firstName: 'Prénom',
            lastName: 'Nom',
            dateOfBirth: 'Date de naissance',
            age: 'Âge',
            phoneNumber: 'Numéro de téléphone',
            condition: 'Condition',
            assignedDoctor: 'Médecin assigné',

            // Payment
            totalAmount: 'Montant Total',
            paidAmount: 'Montant Payé',
            restToPay: 'Reste à Payer',
            paymentStatus: 'Statut de Paiement',
            paid: 'Payé',
            partial: 'Partiel',
            unpaid: 'Non Payé',
            versement: 'Versement',
            currency: 'DZD',

            // Schedule Management
            addSchedule: 'Ajouter un rendez-vous',
            editSchedule: 'Modifier le rendez-vous',
            deleteSchedule: 'Supprimer le rendez-vous',
            appointmentDate: 'Date du rendez-vous',
            duration: 'Durée (minutes)',
            status: 'Statut',
            scheduled: 'Planifié',
            completed: 'Terminé',
            cancelled: 'Annulé',

            // Visit Notes
            visitNotes: 'Notes de visite',
            addNote: 'Ajouter une note',
            notes: 'Notes',
            editNote: 'Modifier la note',
            noteContent: 'Contenu de la note',
            appointmentPlan: 'Plan du rendez-vous',
            whatToDo: 'Que faire lors de ce rendez-vous',

            // Prescriptions
            prescriptions: 'Ordonnances',
            addPrescription: 'Ajouter une ordonnance',
            medication: 'Médicament',
            dosage: 'Dosage',
            instructions: 'Instructions',
            noPrescriptions: 'Aucune ordonnance pour le moment',
            noResults: 'Aucun résultat trouvé',
            patient: 'Patient',
            medicineName: 'Nom du médicament',
            dosagePerDay: 'Dosage/Jour',
            durationDays: 'Durée (Jours)',
            addMedication: 'Ajouter un médicament',
            removeMedication: 'Supprimer',

            // Lab Tests
            labTests: 'Analyses de laboratoire',
            bloodTests: 'Analyses sanguines',
            urineTests: 'Analyses urinaires',
            addLabTest: 'Ajouter une ordonnance d\'analyses',
            selectTests: 'Sélectionner les analyses',

            // Blood Test Categories
            completeBloodCount: 'Numération Formule Sanguine (NFS)',
            metabolicPanel: 'Bilan Métabolique',
            lipidPanel: 'Bilan Lipidique',
            liverFunction: 'Bilan Hépatique',
            thyroidPanel: 'Bilan Thyroïdien',
            cardiacMarkers: 'Marqueurs Cardiaques',
            coagulation: 'Bilan de Coagulation',
            inflammatory: 'Marqueurs Inflammatoires',
            diabetes: 'Diabète',
            ironStudies: 'Bilan Martial',
            kidneyFunction: 'Bilan Rénal',
            electrolytes: 'Électrolytes',
            vitamins: 'Vitamines',
            hormones: 'Hormones',
            infections: 'Infections',
            autoimmune: 'Auto-immun',
            tumorMarkers: 'Marqueurs Tumoraux',

            // User Management
            addUser: 'Ajouter un utilisateur',
            inviteUser: 'Créer un utilisateur',
            sendInvitation: 'Créer le compte',
            createAccount: 'Créer le compte',
            creating: 'Création...',
            editUser: "Modifier l'utilisateur",
            deleteUser: "Supprimer l'utilisateur",
            fullName: 'Nom complet',
            role: 'Rôle',

            // Actions
            save: 'Enregistrer',
            cancel: 'Annuler',
            delete: 'Supprimer',
            edit: 'Modifier',
            view: 'Voir',
            search: 'Rechercher',
            filter: 'Filtrer',
            print: 'Imprimer',
            download: 'Télécharger',
            update: 'Mettre à jour',

            // Messages
            loading: 'Chargement...',
            noData: 'Aucune donnée disponible',
            error: 'Une erreur est survenue',
            success: 'Opération réussie',
            confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet élément?',
            deleteSuccess: 'Supprimé avec succès',

            // Stats
            totalPatients: 'Total des patients',
            totalDoctors: 'Total des médecins',
            totalSecretaries: 'Total des secrétaires',
            upcomingAppointments: 'Rendez-vous à venir',
            todayAppointments: "Rendez-vous d'aujourd'hui",
        }
    }
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    })

export default i18n
