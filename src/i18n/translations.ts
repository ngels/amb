export type Language = 'en' | 'fr';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    submit: 'Submit',
    submitting: 'Submitting...',
    or: 'or',

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
    'identification.voirTout':'see All',
    'dashboard.welcome':'Welcome to your dashboard.',
    'dashboard.title':'Dashboard',

    // sign out
    'auth.signout_confirm': 'Are you sure you want to sign out?',
    'auth.signout': 'Sign out'
  },
  fr: {
    // General
    submit: 'Soumettre',
    submitting: 'Envoi en cours...',
    or: 'ou',

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
    'identification.voirTout':'Voir tout',
    'dashboard.welcome':'Bienvenue sur votre tableau de bord.',
    'dashboard.title':'Tableau de bord',

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
