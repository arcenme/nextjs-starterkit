export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    TERMS: '/terms',
    PRIVACY_POLICY: '/privacy-policy',
  },
  AUTH: {
    SIGN_IN: '/login',
    SIGN_UP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    EMAIL_VERIFIED: '/email-verified',
    TWO_FACTOR: '/2fa',
    MAGIC_LINK: '/magic-link',
  },
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    SETTINGS: {
      ROOT: '/admin/settings',
      PROFILE: '/admin/settings/profile',
      SECURITY: '/admin/settings/security',
      SESSION_MANAGEMENT: '/admin/settings/session-management',
      APPEARANCE: '/admin/settings/appearance',
    },
  },
  GITHUB_REPO: 'https://github.com/arcenme/nextjs-starterkit',
  REDIRECT_AFTER_SIGN_IN: '/admin/dashboard',
  REDIRECT_AFTER_SIGN_OUT: '/',
}

export type RouteKey = typeof ROUTES
