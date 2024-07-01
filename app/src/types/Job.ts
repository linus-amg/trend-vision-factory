import { Analysis } from './Analysis'

export interface Job {
  id: string
  url: string
  status: number
  type: string
  analysis?: Analysis
  createdAt: string
}
