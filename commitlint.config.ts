import type { UserConfig } from '@commitlint/types'

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Code style (formatting, semicolons, etc)
        'ui', // UI/UX changes
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Tests
        'build', // Build system
        'ci', // CI/CD
        'chore', // Maintenance
        'revert', // Revert commit
      ],
    ],
  },
}

export default Configuration
