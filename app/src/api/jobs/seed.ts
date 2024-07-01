import { sql } from '@vercel/postgres'

export async function seed() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id VARCHAR(255) PRIMARY KEY,
        url VARCHAR(255) NOT NULL,
        status INTEGER NOT NULL DEFAULT 0,
        type VARCHAR(255) NOT NULL,
        analysis JSONB,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`

    await sql`CREATE TABLE IF NOT EXISTS screenshots (
      id VARCHAR(255) PRIMARY KEY,
      job_id VARCHAR(255) REFERENCES jobs(id),
      title VARCHAR(255) NOT NULL,
      status INTEGER NOT NULL DEFAULT 0,
      file_path VARCHAR(255),
      analysis JSONB,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`
  } catch (error) {
    console.error(error)
  }
}
