import { seed } from '@/api/jobs/seed'
import { NextResponse } from 'next/server'

export const GET = async () => {
  await seed()

  return NextResponse.json({
    message: 'Hello, World!',
  })
}
