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

            // Prescriptions
            prescriptions: 'Prescriptions',
            addPrescription: 'Add Prescription',
            medication: 'Medication',
            dosage: 'Dosage',
            instructions: 'Instructions',
            noPrescriptions: 'No prescriptions yet',
            noResults: 'No results found',
            patient: 'Patient',

            // User Management
            addUser: 'Add User',
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

            // Messages
            loading: 'Loading...',
            noData: 'No data available',
            error: 'An error occurred',
            success: 'Operation successful',
            confirmDelete: 'Are you sure you want to delete this item?',

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

            // Prescriptions
            prescriptions: 'Ordonnances',
            addPrescription: 'Ajouter une ordonnance',
            medication: 'Médicament',
            dosage: 'Dosage',
            instructions: 'Instructions',
            noPrescriptions: 'Aucune ordonnance pour le moment',
            noResults: 'Aucun résultat trouvé',
            patient: 'Patient',

            // User Management
            addUser: 'Ajouter un utilisateur',
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

            // Messages
            loading: 'Chargement...',
            noData: 'Aucune donnée disponible',
            error: 'Une erreur est survenue',
            success: 'Opération réussie',
            confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet élément?',

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
