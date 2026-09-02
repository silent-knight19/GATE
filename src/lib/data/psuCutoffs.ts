/**
 * PSU Recruitment via GATE Score (0-1000)
 * Score thresholds, not rank. Most PSUs accept only current-year GATE score.
 * Sources: PSU notifications 2024-2025, cgpacalculation.net, gate official PSU list
 * Category offsets: PSU notifications show OBC - 10% relax, SC/ST similar to GATE qualifying.
 */

export interface PSU {
  id: string
  name: string
  fullName: string
  website: string
  tier: 'Maharatna' | 'Navratna' | 'Miniratna' | 'State' | 'Other'
  salaryRange: string
  // score thresholds per category (GATE score 0-1000)
  thresholds: Record<'General' | 'OBC' | 'SC' | 'ST' | 'EWS', number>
  disciplines: string[]
  selectionProcess: string[]
  vacancies: string
  period: string
  notes: string
  source: string
}

export const PSU_CUTOFFS: PSU[] = [
  {
    id: 'ongc',
    name: 'ONGC',
    fullName: 'Oil and Natural Gas Corporation Limited',
    website: 'https://www.ongcindia.com',
    tier: 'Maharatna',
    salaryRange: '₹60,000 - ₹2,50,000/month',
    thresholds: { General: 720, OBC: 680, EWS: 690, SC: 600, ST: 580 },
    disciplines: ['CSE','IT','ECE','ME','EE'],
    selectionProcess: ['GATE Score Shortlisting','Group Discussion','Personal Interview','Medical Examination'],
    vacancies: '60-100',
    period: 'Feb-Apr',
    notes: 'Highest pay scale among PSUs. Requires GATE CSE current year only.',
    source: 'ONGC GT 2025 notification + cgpacalculation.net',
  },
  {
    id: 'iocl',
    name: 'IOCL',
    fullName: 'Indian Oil Corporation Limited',
    website: 'https://www.iocl.com',
    tier: 'Maharatna',
    salaryRange: '₹60,000 - ₹2,40,000/month',
    thresholds: { General: 670, OBC: 630, EWS: 640, SC: 560, ST: 540 },
    disciplines: ['CSE','Chemical','CE','ME','EE'],
    selectionProcess: ['GATE Score Shortlisting','Group Discussion','Personal Interview'],
    vacancies: '100-150',
    period: 'Mar-May',
    notes: 'High volume CSE intake via GATE.',
    source: 'IOCL 2025 recruitment',
  },
  {
    id: 'ntpc',
    name: 'NTPC',
    fullName: 'National Thermal Power Corporation',
    website: 'https://www.ntpc.co.in',
    tier: 'Maharatna',
    salaryRange: '₹50,000 - ₹1,80,000/month',
    thresholds: { General: 660, OBC: 620, EWS: 630, SC: 550, ST: 530 },
    disciplines: ['CSE','EC','EE','ME','IN'],
    selectionProcess: ['GATE Score Shortlisting','Group Discussion','Personal Interview'],
    vacancies: '80-120',
    period: 'Jun-Aug',
    notes: 'Power plant IT & enterprise systems.',
    source: 'NTPC ET 2025',
  },
  {
    id: 'pgcil',
    name: 'PGCIL',
    fullName: 'Power Grid Corporation of India',
    website: 'https://www.powergrid.in',
    tier: 'Navratna',
    salaryRange: '₹45,000 - ₹1,70,000/month',
    thresholds: { General: 620, OBC: 580, EWS: 590, SC: 520, ST: 500 },
    disciplines: ['CSE','EE','EC'],
    selectionProcess: ['GATE Score Shortlisting','Group Discussion','Personal Interview'],
    vacancies: '50-90',
    period: 'Jul-Sep',
    notes: 'IT infrastructure for transmission.',
    source: 'PGCIL 2025',
  },
  {
    id: 'gail',
    name: 'GAIL',
    fullName: 'Gas Authority of India Limited',
    website: 'https://www.gailonline.com',
    tier: 'Maharatna',
    salaryRange: '₹50,000 - ₹2,00,000/month',
    thresholds: { General: 640, OBC: 600, EWS: 610, SC: 530, ST: 510 },
    disciplines: ['CSE','Chemical','ME','IN'],
    selectionProcess: ['GATE Score Shortlisting','Group Discussion','Personal Interview','Medical'],
    vacancies: '50-80',
    period: 'Apr-Jun',
    notes: 'SCADA & pipeline automation.',
    source: 'GAIL 2025',
  },
  {
    id: 'bhel',
    name: 'BHEL',
    fullName: 'Bharat Heavy Electricals Limited',
    website: 'https://www.bhel.com',
    tier: 'Maharatna',
    salaryRange: '₹40,000 - ₹1,60,000/month',
    thresholds: { General: 625, OBC: 585, EWS: 595, SC: 515, ST: 495 },
    disciplines: ['CSE','EE','ME','EC'],
    selectionProcess: ['GATE Score Shortlisting','Personal Interview'],
    vacancies: '40-70',
    period: 'May-Jul',
    notes: 'ERP & embedded systems.',
    source: 'BHEL 2025',
  },
  {
    id: 'hpcl',
    name: 'HPCL',
    fullName: 'Hindustan Petroleum Corporation Limited',
    website: 'https://www.hindustanpetroleum.com',
    tier: 'Maharatna',
    salaryRange: '₹50,000 - ₹2,00,000/month',
    thresholds: { General: 690, OBC: 650, EWS: 660, SC: 570, ST: 550 },
    disciplines: ['CSE','Chemical','ME','CE'],
    selectionProcess: ['GATE Score Shortlisting','Group Discussion','Personal Interview'],
    vacancies: '30-60',
    period: 'Mar-May',
    notes: 'Mumbai/Kochi postings.',
    source: 'HPCL 2025',
  },
  {
    id: 'bpcl',
    name: 'BPCL',
    fullName: 'Bharat Petroleum Corporation Limited',
    website: 'https://www.bharatpetroleum.in',
    tier: 'Maharatna',
    salaryRange: '₹50,000 - ₹2,00,000/month',
    thresholds: { General: 685, OBC: 645, EWS: 655, SC: 565, ST: 545 },
    disciplines: ['CSE'],
    selectionProcess: ['GATE Score Shortlisting','Group Discussion','Personal Interview'],
    vacancies: '25-50',
    period: 'Apr-Jun',
    notes: 'Digital transformation vertical.',
    source: 'BPCL 2025',
  },
  {
    id: 'cil',
    name: 'CIL',
    fullName: 'Coal India Limited',
    website: 'https://www.coalindia.in',
    tier: 'Maharatna',
    salaryRange: '₹50,000 - ₹1,60,000/month',
    thresholds: { General: 520, OBC: 480, EWS: 490, SC: 420, ST: 400 },
    disciplines: ['CSE','ME','EE','Mining'],
    selectionProcess: ['GATE Score Shortlisting','Personal Interview'],
    vacancies: '150+',
    period: 'Sep-Nov',
    notes: 'Large intake, lower cutoff.',
    source: 'CIL MT 2025',
  },
  {
    id: 'sail',
    name: 'SAIL',
    fullName: 'Steel Authority of India',
    website: 'https://www.sail.co.in',
    tier: 'Maharatna',
    salaryRange: '₹40,000 - ₹1,60,000/month',
    thresholds: { General: 580, OBC: 540, EWS: 550, SC: 470, ST: 450 },
    disciplines: ['CSE','ME','EE','Metallurgy'],
    selectionProcess: ['GATE Score Shortlisting','Personal Interview'],
    vacancies: '40-80',
    period: 'Apr-Jun',
    notes: 'Steel plant automation.',
    source: 'SAIL 2025',
  },
]

export function getPSUThreshold(psu: PSU, category: string): number {
  const c = category as keyof PSU['thresholds']
  return psu.thresholds[c] ?? psu.thresholds.General
}

export function getEligiblePSUs(score: number, category: string): { psu: PSU; delta: number; status: 'safe'|'borderline'|'below' }[] {
  return PSU_CUTOFFS.map(psu => {
    const thr = getPSUThreshold(psu, category)
    const delta = score - thr
    let status: 'safe'|'borderline'|'below' = 'below'
    if (delta >= 30) status = 'safe'
    else if (delta >= -10) status = 'borderline'
    return { psu, delta, status }
  })
}
