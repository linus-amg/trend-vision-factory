import { Analysis } from './Analysis'

export interface Screenshot {
  id: string
  job_id: string
  analysis?: Analysis
  file_path: string
  status: number
  title: string
}
