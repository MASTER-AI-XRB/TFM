import { describe, expect, it } from 'vitest'
import { withPrismaConnectionLimit } from '@/lib/prisma-url'

describe('withPrismaConnectionLimit', () => {
  it('afegeix connection_limit si no hi és', () => {
    expect(
      withPrismaConnectionLimit('postgresql://u:p@localhost:5432/db', 1)
    ).toBe('postgresql://u:p@localhost:5432/db?connection_limit=1')
  })

  it('no pisa un connection_limit ja present', () => {
    expect(
      withPrismaConnectionLimit(
        'postgresql://u:p@localhost:5432/db?sslmode=require&connection_limit=3',
        1
      )
    ).toBe('postgresql://u:p@localhost:5432/db?sslmode=require&connection_limit=3')
  })
})
