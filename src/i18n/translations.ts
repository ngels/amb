export type Language = 'en' | 'fr';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    submit: 'Submit',
    submitting: 'Submitting...',
    or: 'or',
    'navigation.previous': 'Previous',
    'navigation.next': 'Next',

    // Sign Up Page
    'signup.title': 'Sign Up',
    'signup.fullName': 'Full Name',
    'signup.fullName.placeholder': 'John Doe',
    'signup.email': 'Email',
    'signup.email.placeholder': 'you@example.com',
    'signup.password': 'Password',
    'signup.password.placeholder': 'Enter your password',
    'signup.terms': 'I accept the Terms and Conditions',
    'signup.newsletter': 'Subscribe to our newsletter',
    'signup.submit': 'Sign Up',
    'signup.haveAccount': 'Already have an account?',
    'signup.signIn': 'Sign In',

    // Sign In Page
    'signin.title': 'Sign In',
    'signin.email': 'Email',
    'signin.email.placeholder': 'you@example.com',
    'signin.password': 'Password',
    'signin.password.placeholder': 'Enter your password',
    'signin.submit': 'Sign In',
    'signin.noAccount': "Don't have an account?",
    'signin.signup': 'Sign Up',
    'signin.forgotPassword': 'Forgot Password?',
    'signin.homeLink': 'Go to homepage',
    'signin.homeLabel': 'Home',
    'signin.languageLabel': 'Language',
    'signin.helpLabel': 'Help',
    'signin.helpLink.aria': 'Open the help center in a new tab',

    // Forgot Password Page
    'forgotPassword.title': 'Forgot Password?',
    'forgotPassword.description':
      "Enter your email address and we'll send you a link to reset your password.",
    'forgotPassword.email': 'Email',
    'forgotPassword.email.placeholder': 'you@example.com',
    'forgotPassword.submit': 'Send Reset Link',
    'forgotPassword.rememberPassword': 'Remember your password?',
    'forgotPassword.signIn': 'Sign In',

    // Validation
    'validation.nameRequired': 'Name is required',
    'validation.nameNoNumbers': 'Name cannot contain numbers',
    'validation.emailRequired': 'Email is required',
    'validation.emailInvalid': 'Invalid email address',
    'validation.passwordRequired': 'Password is required',
    'validation.passwordMinLength': 'Password must be at least 6 characters',
    'validation.termsRequired': 'You must accept the terms and conditions',

    // Messages
    'message.signupSuccess': 'Sign up successful! Redirecting...',
    'message.signupError': 'Sign up failed. Please try again.',
    'message.signinSuccess': 'Sign in successful! Redirecting...',
    'message.signinError': 'Sign in failed. Please try again.',
    'message.forgotPasswordSuccess':
      'Reset link sent! Check your email for instructions.',
    'message.forgotPasswordError':
      'Failed to send reset link. Please try again.',
    'message.requestFailed': 'Request failed',

    // Dashboard
    'dashboard.identification': 'Identification',
    'identification.commencer': 'New',
    'identification.continuer': 'Continue',
    'identification.voirTout':'see All',
    'identification.filters.statusLabel': 'Status filter',
    'identification.filters.statusAll': 'All statuses',
    'dashboard.welcome':'Welcome to your dashboard.',
    'dashboard.completedProfiles':'Special Identification Form :',
    'dashboard.collapseView.expand': 'Expand view',
    'dashboard.collapseView.collapse': 'Collapse view',
    'dashboard.viewFullProfile': 'View Full Profile',
    'dashboard.approvalSection.statusLabel': 'Current Status',
    'dashboard.approvalSection.approve': 'Approve',
    'dashboard.approvalSection.markIncomplete': 'Mark Incomplete',
    'dashboard.approvalSection.processing': 'Processing...',
    'dashboard.approvalSection.pendingIntegration': 'Status actions will be wired to the backend soon.',
    'dashboard.approvalSection.approvedSuccess': 'Profile approved successfully.',
    'dashboard.approvalSection.incompleteSuccess': 'Profile marked as incomplete.',
    'dashboard.approvalSection.error': 'Unable to update profile status.',
    'dashboard.approvalSection.errorMissingProfile': 'Unable to update because the profile is missing.',
    'dashboard.feedbackModal.title': 'Provide feedback',
    'dashboard.feedbackModal.description': 'Let the user know what to fix before resubmitting.',
    'dashboard.feedbackModal.placeholder': 'Describe missing documents, corrections, or next steps...',
    'dashboard.feedbackModal.cancel': 'Cancel',
    'dashboard.feedbackModal.submit': 'Send feedback',
    'dashboard.feedbackModal.errorRequired': 'Feedback message is required.',
    'dashboard.feedbackHistory.title': 'Feedback history',
    'dashboard.feedbackHistory.caption': 'Review past notes left while the profile was incomplete.',
    'dashboard.feedbackHistory.empty': 'No feedback has been recorded yet.',
    'dashboard.feedbackHistory.toggle': 'Expand or collapse feedback history',
    'dashboard.feedbackHistory.unknownDate': 'Date unavailable',
    'dashboard.feedbackHistory.reviewer': 'Reviewer',
    'dashboard.openMenu': 'Open menu',

    // Profile Summary
    'profile.summary.title': 'Profile Summary',
    'profile.summary.print': 'Print Profile',
    'profile.summary.loading': 'Loading profile...',
    'profile.summary.returnToTop': 'Return to Top',
    'profile.summary.back': 'Back',
    'profile.summary.notProvided': 'Not provided',
    'profile.summary.preparingPdf': 'Preparing PDF...',
    'profile.summary.printError': 'Failed to generate PDF',
    'profile.summary.generalInfo': 'General Information',
    'profile.summary.firstName': 'First Name',
    'profile.summary.lastName': 'Last Name',
    'profile.summary.email': 'Email',
    'profile.summary.dateOfBirth': 'Date of Birth',
    'profile.summary.gender': 'Gender',
    'profile.summary.status': 'Status',
    'profile.summary.id': 'Profile ID',
    'profile.status.incomplete': 'Incomplete',
    'profile.status.underReview': 'Under review',
    'profile.status.changeRequested': 'Change requested',
    'profile.status.completeWithRemark': 'Complete with remark',
    'profile.status.complete': 'Complete',

    // Identification - Start Intro    
    'identification.startIntro': 'Complete your profile by filling in the following steps.',

    // Identification - Steps
    'identification.selectPlaceholder': 'Select...',
    'identification.step1.title': 'Step 1: Personal Information',
    'identification.step1.firstName': 'Last Name (Nom)',
    'identification.step1.givenName': 'First Names (Prénoms)',
    'identification.step1.givenNameHelper': 'If multiple, separate with commas',
    'identification.step1.lastName': 'Nicknames (Surnom(s))',
    'identification.step1.gender': 'Gender (Sexe)',
    'identification.step1.subjectQuality': 'Subject Quality (Qualité du sujet)',
    'identification.step1.subjectQualityHelper': 'Select the document quality that matches the subject (diplomatic, service, ordinary, etc.)',
    'identification.step1.bloodType': 'Blood Type (Groupe sanguin)',
    'identification.step1.nsi': 'NSI',
    'identification.step1.dateOfBirth': 'Date of Birth (Date de naissance)',
    'identification.step1.placeOfBirth': 'Place of Birth (Lieu de naissance)',

    'identification.step2.title': 'Step 2: Geographic and Nationality Information',
    'identification.step2.tribe': 'Tribe (Tribu)',
    'identification.step2.villageOfOrigin': 'Village of Origin (Village d\'origine)',
    'identification.step2.group': 'Group (Groupement)',
    'identification.step2.sector': 'Sector/Chiefdom (Secteur/chefferie)',
    'identification.step2.district': 'District',
    'identification.step2.province': 'Province',
    'identification.step2.nationality': 'Congolese Nationality (Nationalité congolaise)',

    'identification.step3.title': 'Step 3: Social and Educational Status',
    'identification.step3.maritalStatus': 'Marital Status (État civil)',
    'identification.step3.spouse': 'Spouse (Conjoint(e))',
    'identification.step3.level_of_education': 'Level of Education (Niveau d\'études)',
    'identification.step3.institution': 'Institution (Établissement)',
    'identification.step3.year': 'Year (Année)',
    'identification.step3.residence': 'Residence (Résidence)',
    'identification.step3.home': 'Home (Domicile)',

    'identification.step4.title': 'Step 4: Criminal and Security Background',
    'identification.step4.criminalOrSecurityBackground': 'Criminal or Security Background (Antécédents judiciaire ou sécuritaire)',
    'identification.step4.militaryService': 'Military Service (Service militaire)',
    'identification.step4.occupationAndPosition': 'Occupation and Position (Profession et fonction)',
    'identification.step4.phone': 'Phone (Téléphone)',
    'identification.step4.phoneCountryCode': 'Country Code (Code pays)',
    'identification.step4.phoneNumber': 'Number (Numéro)',
    'identification.step4.phoneNumberPlaceholder': 'Numbers only',
    'identification.step4.email': 'Email',

    'identification.step5.title': 'Step 5: Family Background',
    'identification.step5.block1': 'Paternal Grandparents (Grand-parents paternels)',
    'identification.step5.block1.section1': 'Grandfather (Grand-père)',
    'identification.step5.block1.section2': 'Grandmother (Grand-mère)',
    'identification.step5.block2': 'Maternal Grandparents (Grand-parents maternels)',
    'identification.step5.block2.section1': 'Grandfather (Grand-père)',
    'identification.step5.block2.section2': 'Grandmother (Grand-mère)',
    'identification.step5.names': 'Names (Noms)',
    'identification.step5.givenName': 'Given Name (Prénom)',
    'identification.step5.group': 'Group (Groupement)',
    'identification.step5.secteur': 'Sector/Chiefdom (Secteur/chefferie)',
    'identification.step5.territory': 'Territory (Territoire)',
    'identification.step5.district': 'District',
    'identification.step5.province': 'Province',
    'identification.step5.country': 'Country (Pays)',

    'identification.step6.title': 'Step 6: Contact Information',
    'identification.step6.field1': 'Field 1',
    'identification.step6.field2': 'Field 2',

    'identification.review': 'Review Your Profile',
    'identification.backToEditing': 'Back to Editing',
    'identification.saveProfile': 'Save Profile',
    'identification.saving': 'Saving...',
    'identification.previous': 'Previous',
    'identification.next': 'Next',
    'identification.fieldRequired': 'This field is required',
    'identification.requiredFieldsMissing': 'Please fill in all required fields',
    'identification.submitDisabled': 'Submission is disabled for the current profile status.',

    // sign out
    'auth.signout_confirm': 'Are you sure you want to sign out?',
    'auth.signout': 'Sign out'
  },
  fr: {
    // General
    submit: 'Soumettre',
    submitting: 'Envoi en cours...',
    or: 'ou',
    'navigation.previous': 'Précédent',
    'navigation.next': 'Suivant',

    // Sign Up Page
    'signup.title': "S'inscrire",
    'signup.fullName': 'Nom complet',
    'signup.fullName.placeholder': 'Jean Dupont',
    'signup.email': 'E-mail',
    'signup.email.placeholder': 'vous@exemple.com',
    'signup.password': 'Mot de passe',
    'signup.password.placeholder': 'Entrez votre mot de passe',
    'signup.terms': "J'accepte les conditions générales",
    'signup.newsletter': "S'abonner à notre infolettre",
    'signup.submit': "S'inscrire",
    'signup.haveAccount': 'Vous avez déjà un compte?',
    'signup.signIn': 'Se connecter',

    // Sign In Page
    'signin.title': 'Se connecter',
    'signin.email': 'E-mail',
    'signin.email.placeholder': 'vous@exemple.com',
    'signin.password': 'Mot de passe',
    'signin.password.placeholder': 'Entrez votre mot de passe',
    'signin.submit': 'Se connecter',
    'signin.noAccount': "Vous n'avez pas de compte?",
    'signin.signup': "S'inscrire",
    'signin.forgotPassword': 'Mot de passe oublié?',
    'signin.homeLink': "Revenir à la page d'accueil",
    'signin.homeLabel': 'Accueil',
    'signin.languageLabel': 'Langue',
    'signin.helpLabel': 'Aide',
    'signin.helpLink.aria': "Ouvrir la page d'aide dans un nouvel onglet",

    // Forgot Password Page
    'forgotPassword.title': 'Mot de passe oublié?',
    'forgotPassword.description':
      'Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
    'forgotPassword.email': 'E-mail',
    'forgotPassword.email.placeholder': 'vous@exemple.com',
    'forgotPassword.submit': 'Envoyer le lien de réinitialisation',
    'forgotPassword.rememberPassword': 'Vous vous souvenez de votre mot de passe?',
    'forgotPassword.signIn': 'Se connecter',

    // Validation
    'validation.nameRequired': 'Le nom est requis',
    'validation.nameNoNumbers': 'Le nom ne peut pas contenir de chiffres',
    'validation.emailRequired': 'L\'e-mail est requis',
    'validation.emailInvalid': 'Adresse e-mail invalide',
    'validation.passwordRequired': 'Le mot de passe est requis',
    'validation.passwordMinLength':
      'Le mot de passe doit contenir au moins 6 caractères',
    'validation.termsRequired':
      'Vous devez accepter les conditions et les modalités',

    // Messages
    'message.signupSuccess': 'Inscription réussie! Redirection en cours...',
    'message.signupError': "L'inscription a échoué. Veuillez réessayer.",
    'message.signinSuccess': 'Connexion réussie! Redirection en cours...',
    'message.signinError': 'La connexion a échoué. Veuillez réessayer.',
    'message.forgotPasswordSuccess':
      'Lien de réinitialisation envoyé! Vérifiez votre e-mail pour les instructions.',
    'message.forgotPasswordError':
      'Échec de l\'envoi du lien de réinitialisation. Veuillez réessayer.',
    'message.requestFailed': 'La demande a échoué',

    // Dashboard
    'dashboard.identification': 'Identification',
    'identification.commencer': 'Commencer',
    'identification.continuer': 'Continuer',
    'identification.voirTout':'Voir tout',
    'identification.filters.statusLabel': 'Filtrer par statut',
    'identification.filters.statusAll': 'Tous les statuts',
    'dashboard.welcome':'Bienvenue sur votre tableau de bord.',
    'dashboard.completedProfiles':'Fiche d\'identification spéciale :',
    'dashboard.collapseView.expand': 'Déplier la vue',
    'dashboard.collapseView.collapse': 'Réduire la vue',
    'dashboard.viewFullProfile': 'Voir le profil complet',
    'dashboard.approvalSection.statusLabel': 'Statut actuel',
    'dashboard.approvalSection.approve': 'Approuver',
    'dashboard.approvalSection.markIncomplete': 'Marquer comme incomplet',
    'dashboard.approvalSection.processing': 'Traitement...',
    'dashboard.approvalSection.pendingIntegration': 'Les actions de statut seront bientôt connectées au backend.',
    'dashboard.approvalSection.approvedSuccess': 'Profil approuvé avec succès.',
    'dashboard.approvalSection.incompleteSuccess': 'Profil marqué comme incomplet.',
    'dashboard.approvalSection.error': 'Impossible de mettre à jour le statut du profil.',
    'dashboard.approvalSection.errorMissingProfile': 'Impossible de modifier le statut car le profil est introuvable.',
    'dashboard.feedbackModal.title': 'Ajouter un retour',
    'dashboard.feedbackModal.description': 'Indiquez à l’utilisateur ce qu’il doit corriger avant une nouvelle soumission.',
    'dashboard.feedbackModal.placeholder': 'Précisez les pièces manquantes, corrections ou prochaines étapes...',
    'dashboard.feedbackModal.cancel': 'Annuler',
    'dashboard.feedbackModal.submit': 'Envoyer le retour',
    'dashboard.feedbackModal.errorRequired': 'Un message de retour est requis.',
    'dashboard.feedbackHistory.title': 'Historique des retours',
    'dashboard.feedbackHistory.caption': 'Consultez les notes laissées tant que le profil est incomplet.',
    'dashboard.feedbackHistory.empty': "Aucun retour n’a encore été enregistré.",
    'dashboard.feedbackHistory.toggle': "Afficher ou masquer l’historique des retours",
    'dashboard.feedbackHistory.unknownDate': 'Date indisponible',
    'dashboard.feedbackHistory.reviewer': 'Relecteur',
    'dashboard.openMenu': 'Ouvrir le menu',

    // Profile Summary
    'profile.summary.title': 'Résumé du profil',
    'profile.summary.print': 'Imprimer le profil',
    'profile.summary.loading': 'Chargement du profil...',
    'profile.summary.returnToTop': 'Retour en haut',
    'profile.summary.back': 'Retour',
    'profile.summary.notProvided': 'Non fourni',
    'profile.summary.preparingPdf': 'Préparation du PDF...',
    'profile.summary.printError': 'Impossible de générer le PDF',
    'profile.summary.generalInfo': 'Informations générales',
    'profile.summary.firstName': 'Nom',
    'profile.summary.lastName': 'Prénoms',
    'profile.summary.email': 'Courriel',
    'profile.summary.dateOfBirth': 'Date de naissance',
    'profile.summary.gender': 'Sexe',
    'profile.summary.status': 'Statut',
    'profile.summary.id': 'Identifiant du profil',
    'profile.status.incomplete': 'Incomplet',
    'profile.status.underReview': 'En cours de vérification',
    'profile.status.changeRequested': 'Modifications demandées',
    'profile.status.completeWithRemark': 'Complet avec remarque',
    'profile.status.complete': 'Complet',

    // Identification - Start Intro    
    'identification.startIntro': 'Complétez votre identification en remplissant les étapes suivantes.',

    // Identification - Steps
    'identification.selectPlaceholder': 'Sélectionner...',
    'identification.step1.title': 'Étape 1 : Informations personnelles',
    'identification.step1.firstName': 'Nom',
    'identification.step1.givenName': 'Prénom(s)',
    'identification.step1.givenNameHelper': 'Si plusieurs, séparer par une virgule',
    'identification.step1.lastName': 'Surnom(s)',
    'identification.step1.gender': 'Sexe',
    'identification.step1.subjectQuality': 'Qualité du sujet',
    'identification.step1.subjectQualityHelper': 'Sélectionnez la qualité du sujet (passeport diplomatique, de service, ordinaire, etc.)',
    'identification.step1.bloodType': 'Groupe sanguin',
    'identification.step1.nsi': 'NSI',
    'identification.step1.dateOfBirth': 'Date de naissance',
    'identification.step1.placeOfBirth': 'Lieu de naissance',

    'identification.step2.title': 'Étape 2 : Informations géographiques et nationalité',
    'identification.step2.tribe': 'Tribu',
    'identification.step2.villageOfOrigin': 'Village d\'origine',
    'identification.step2.group': 'Groupement',
    'identification.step2.sector': 'Secteur/chefferie',
    'identification.step2.district': 'District',
    'identification.step2.province': 'Province',
    'identification.step2.nationality': 'Nationalité congolaise',

    'identification.step3.title': 'Étape 3 : Situation sociale et éducation',
    'identification.step3.maritalStatus': 'État civil',
    'identification.step3.spouse': 'Conjoint(e)',
    'identification.step3.level_of_education': 'Niveau d\'études',
    'identification.step3.institution': 'Établissement',
    'identification.step3.year': 'Année',
    'identification.step3.residence': 'Résidence',
    'identification.step3.home': 'Domicile',

    'identification.step4.title': 'Étape 4 : Antécédents judiciaires ou sécuritaires',
    'identification.step4.criminalOrSecurityBackground': 'Antécédents judiciaires ou sécuritaires',
    'identification.step4.militaryService': 'Service militaire',
    'identification.step4.occupationAndPosition': 'Profession et fonction',
    'identification.step4.phone': 'Téléphone',
    'identification.step4.phoneCountryCode': 'Code pays',
    'identification.step4.phoneNumber': 'Numéro',
    'identification.step4.phoneNumberPlaceholder': 'Chiffres uniquement',
    'identification.step4.email': 'E-mail',

    'identification.step5.title': 'Étape 5 : Antécédents familiaux',
    'identification.step5.block1': 'Grand-parents paternels',
    'identification.step5.block1.section1': 'Grand-père',
    'identification.step5.block1.section2': 'Grand-mère',
    'identification.step5.block2': 'Grand-parents maternels',
    'identification.step5.block2.section1': 'Grand-père',
    'identification.step5.block2.section2': 'Grand-mère',
    'identification.step5.names': 'Noms',
    'identification.step5.givenName': 'Prénom',
    'identification.step5.group': 'Groupement',
    'identification.step5.secteur': 'Secteur/chefferie',
    'identification.step5.territory': 'Territoire',
    'identification.step5.district': 'District',
    'identification.step5.province': 'Province',
    'identification.step5.country': 'Pays',

    'identification.step6.title': 'Étape 6 : Informations de contact',
    'identification.step6.field1': 'Champ 1',
    'identification.step6.field2': 'Champ 2',

    'identification.review': 'Examinez votre profil',
    'identification.backToEditing': 'Retour à l\'édition',
    'identification.saveProfile': 'Enregistrer le profil',
    'identification.saving': 'Enregistrement en cours...',
    'identification.previous': 'Précédent',
    'identification.next': 'Suivant',
    'identification.fieldRequired': 'Ce champ est requis',
    'identification.requiredFieldsMissing': 'Veuillez remplir tous les champs obligatoires',
    'identification.submitDisabled': 'La soumission est désactivée pour ce statut de profil.',

    // sign out
    'auth.signout_confirm': 'Êtes-vous sûr de vouloir vous déconnecter?',
    'auth.signout': 'Déconnexion'
  },
};

export function getTranslation(
  language: Language,
  key: string,
  fallback?: string
): string {
  return translations[language][key] || fallback || key;
}

export interface HelpFaqEntry {
  id: string;
  question: Record<Language, string>;
  answers: Record<Language, string[]>;
}

export const helpFaqEntries: HelpFaqEntry[] = [
  {
    id: 'resetPassword',
    question: {
      en: 'How do I reset my password?',
      fr: 'Comment réinitialiser mon mot de passe ?'
    },
    answers: {
      en: [
        'Use the Forgot password link on the sign-in screen, then follow the email instructions. The link expires after 30 minutes for security.'
      ],
      fr: [
        "Utilisez le lien Mot de passe oublié sur l'écran de connexion, puis suivez les instructions du courriel. Le lien expire après 30 minutes pour la sécurité."
      ]
    }
  },
  {
    id: 'offlineUsage',
    question: {
      en: 'Can I use AMB offline?',
      fr: 'Puis-je utiliser AMB hors ligne ?'
    },
    answers: {
      en: [
        'AMB needs an internet connection to sync changes with the backend. You can draft updates offline, but you must reconnect before submitting the data.'
      ],
      fr: [
        "AMB nécessite une connexion Internet pour synchroniser les modifications avec le backend. Vous pouvez préparer vos mises à jour hors ligne, mais vous devez vous reconnecter avant de les envoyer."
      ]
    }
  },
  {
    id: 'fileAccess',
    question: {
      en: 'Who can access my submitted files?',
      fr: 'Qui peut accéder aux fichiers que je soumets ?'
    },
    answers: {
      en: [
        'Only members of your organization with the appropriate dashboard role can open submitted files. Each audit event is logged for compliance.'
      ],
      fr: [
        "Seuls les membres de votre organisation disposant du rôle adéquat dans le tableau de bord peuvent ouvrir les fichiers envoyés. Chaque accès est journalisé pour assurer la conformité."
      ]
    }
  }
];
