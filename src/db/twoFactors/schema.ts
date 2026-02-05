import { relations } from 'drizzle-orm'
import { index, pgTable, text } from 'drizzle-orm/pg-core'
import { users } from '@/db/schemas'

export const twoFactors = pgTable(
  'two_factors',
  {
    id: text('id').primaryKey(),
    secret: text('secret').notNull(),
    backupCodes: text('backup_codes').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('twoFactors_secret_idx').on(table.secret),
    index('twoFactors_userId_idx').on(table.userId),
  ]
)

export const twoFactorsRelations = relations(twoFactors, ({ one }) => ({
  users: one(users, {
    fields: [twoFactors.userId],
    references: [users.id],
  }),
}))
