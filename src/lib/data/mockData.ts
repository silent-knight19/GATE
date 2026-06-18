import type { TopicStatus } from './syllabus'

// Backward compatibility aliases
export type MockTestEntry = typeof sampleMockTests[0]
export type ErrorAnalysisEntry = MockTestEntry['errorAnalysis'][0]

export interface SampleUser {
  name: string
  category: string
  working: boolean
  studyHoursPerDay: number
  targetRank: number
  streak: number
  totalStudyHours: number
}

export const sampleUser: SampleUser = {
  name: 'Demo User',
  category: 'General',
  working: false,
  studyHoursPerDay: 6,
  targetRank: 500,
  streak: 12,
  totalStudyHours: 156,
}

export const sampleStudyLogs: Array<{
  date: string
  subject: string
  topic: string
  hours: number
  activityType: 'study' | 'revision' | 'practice' | 'mock'
}> = [
  { date: '2026-05-18', subject: 'Engineering Mathematics', topic: 'Linear Algebra', hours: 2, activityType: 'study' },
  { date: '2026-05-18', subject: 'Digital Logic', topic: 'Boolean Algebra', hours: 1.5, activityType: 'study' },
  { date: '2026-05-19', subject: 'Programming & Data Structures', topic: 'Arrays & Pointers', hours: 2.5, activityType: 'study' },
  { date: '2026-05-19', subject: 'Engineering Mathematics', topic: 'Probability', hours: 1, activityType: 'practice' },
  { date: '2026-05-20', subject: 'Computer Networks', topic: 'IP Addressing', hours: 2, activityType: 'study' },
  { date: '2026-05-20', subject: 'Operating Systems', topic: 'Process Scheduling', hours: 1.5, activityType: 'revision' },
  { date: '2026-05-21', subject: 'Algorithms', topic: 'Sorting', hours: 2, activityType: 'study' },
  { date: '2026-05-21', subject: 'General Aptitude', topic: 'Numerical Reasoning', hours: 1, activityType: 'practice' },
  { date: '2026-05-22', subject: 'Theory of Computation', topic: 'DFA & NFA', hours: 2, activityType: 'study' },
  { date: '2026-05-22', subject: 'Databases', topic: 'SQL Queries', hours: 1.5, activityType: 'practice' },
  { date: '2026-05-23', subject: 'Compiler Design', topic: 'Lexical Analysis', hours: 1.5, activityType: 'study' },
  { date: '2026-05-23', subject: 'COA', topic: 'Cache Memory', hours: 2, activityType: 'study' },
  { date: '2026-05-24', subject: 'Programming & Data Structures', topic: 'Trees', hours: 2, activityType: 'study' },
  { date: '2026-05-24', subject: 'General Aptitude', topic: 'Spatial Reasoning', hours: 1, activityType: 'revision' },
  { date: '2026-05-25', subject: 'Digital Logic', topic: 'Combinational Circuits', hours: 2.5, activityType: 'study' },
  { date: '2026-05-25', subject: 'Engineering Mathematics', topic: 'Discrete Math', hours: 1.5, activityType: 'study' },
  { date: '2026-05-26', subject: 'Databases', topic: 'Normalization', hours: 2, activityType: 'study' },
  { date: '2026-05-27', subject: 'COA', topic: 'Pipelining', hours: 2, activityType: 'study' },
  { date: '2026-05-27', subject: 'Algorithms', topic: 'Dynamic Programming', hours: 1.5, activityType: 'study' },
  { date: '2026-05-28', subject: 'Operating Systems', topic: 'Memory Management', hours: 2, activityType: 'study' },
  { date: '2026-05-28', subject: 'Computer Networks', topic: 'Data Link Layer', hours: 1.5, activityType: 'revision' },
  { date: '2026-05-29', subject: 'Theory of Computation', topic: 'CFG & PDA', hours: 2, activityType: 'study' },
  { date: '2026-05-30', subject: 'Compiler Design', topic: 'Parsing', hours: 3, activityType: 'study' },
  { date: '2026-05-30', subject: 'Programming & Data Structures', topic: 'Linked Lists', hours: 2, activityType: 'practice' },
  { date: '2026-05-31', subject: 'Engineering Mathematics', topic: 'Calculus', hours: 3, activityType: 'study' },
  { date: '2026-05-31', subject: 'General Aptitude', topic: 'Verbal Reasoning', hours: 1.5, activityType: 'practice' },
  { date: '2026-06-01', subject: 'Operating Systems', topic: 'Synchronization', hours: 2, activityType: 'study' },
  { date: '2026-06-02', subject: 'Databases', topic: 'Transactions', hours: 1.5, activityType: 'study' },
  { date: '2026-06-02', subject: 'Algorithms', topic: 'Graph Algorithms', hours: 2, activityType: 'study' },
  { date: '2026-06-03', subject: 'Computer Networks', topic: 'Routing Algorithms', hours: 2, activityType: 'study' },
  { date: '2026-06-04', subject: 'COA', topic: 'ALU Design', hours: 2, activityType: 'revision' },
  { date: '2026-06-05', subject: 'Theory of Computation', topic: 'Turing Machines', hours: 2, activityType: 'study' },
  { date: '2026-06-06', subject: 'Programming & Data Structures', topic: 'Graphs', hours: 3, activityType: 'study' },
  { date: '2026-06-06', subject: 'Digital Logic', topic: 'Sequential Circuits', hours: 2, activityType: 'practice' },
  { date: '2026-06-07', subject: 'Engineering Mathematics', topic: 'Combinatorics', hours: 2.5, activityType: 'study' },
  { date: '2026-06-07', subject: 'General Aptitude', topic: 'Numerical Reasoning', hours: 1, activityType: 'mock' },
  { date: '2026-06-08', subject: 'Databases', topic: 'SQL Queries', hours: 2, activityType: 'revision' },
  { date: '2026-06-09', subject: 'Operating Systems', topic: 'Deadlocks', hours: 1.5, activityType: 'study' },
  { date: '2026-06-09', subject: 'Compiler Design', topic: 'Code Optimization', hours: 1, activityType: 'study' },
  { date: '2026-06-10', subject: 'Computer Networks', topic: 'Transport Layer', hours: 2, activityType: 'study' },
  { date: '2026-06-11', subject: 'Algorithms', topic: 'Sorting', hours: 2, activityType: 'revision' },
  { date: '2026-06-12', subject: 'COA', topic: 'Memory Hierarchy', hours: 2, activityType: 'study' },
  { date: '2026-06-13', subject: 'Theory of Computation', topic: 'Decidability', hours: 2, activityType: 'study' },
  { date: '2026-06-14', subject: 'COA', topic: 'ALU Design', hours: 1.5, activityType: 'revision' },
]

export const sampleMockTests: Array<{
  id: string
  source: string
  date: string
  totalMarks: number
  marksObtained: number
  subjectBreakdown: Record<string, number>
  errorAnalysis: Array<{ subject: string; topic: string; errorType: string; count: number }>
}> = [
  {
    id: 'mt_001',
    source: 'Made Easy',
    date: '2026-03-15',
    totalMarks: 100,
    marksObtained: 34,
    subjectBreakdown: { 'General Aptitude': 6, 'Engineering Mathematics': 4, 'Digital Logic': 3, 'COA': 3, 'Programming & Data Structures': 5, 'Algorithms': 2, 'Theory of Computation': 3, 'Compiler Design': 2, 'Operating Systems': 3, 'Databases': 2, 'Computer Networks': 1 },
    errorAnalysis: [
      { subject: 'Engineering Mathematics', topic: 'Linear Algebra', errorType: 'conceptual', count: 3 },
      { subject: 'Algorithms', topic: 'Sorting', errorType: 'calculation', count: 2 },
    ],
  },
  {
    id: 'mt_002',
    source: 'Ace Academy',
    date: '2026-04-01',
    totalMarks: 100,
    marksObtained: 38,
    subjectBreakdown: { 'General Aptitude': 7, 'Engineering Mathematics': 5, 'Digital Logic': 3, 'COA': 3, 'Programming & Data Structures': 5, 'Algorithms': 3, 'Theory of Computation': 2, 'Compiler Design': 2, 'Operating Systems': 4, 'Databases': 2, 'Computer Networks': 2 },
    errorAnalysis: [
      { subject: 'Theory of Computation', topic: 'DFA', errorType: 'conceptual', count: 2 },
      { subject: 'Operating Systems', topic: 'Process Scheduling', errorType: 'calculation', count: 2 },
    ],
  },
  {
    id: 'mt_003',
    source: 'Made Easy',
    date: '2026-04-15',
    totalMarks: 100,
    marksObtained: 42,
    subjectBreakdown: { 'General Aptitude': 7, 'Engineering Mathematics': 5, 'Digital Logic': 3, 'COA': 4, 'Programming & Data Structures': 6, 'Algorithms': 3, 'Theory of Computation': 3, 'Compiler Design': 2, 'Operating Systems': 4, 'Databases': 3, 'Computer Networks': 2 },
    errorAnalysis: [
      { subject: 'COA', topic: 'Memory Hierarchy', errorType: 'conceptual', count: 2 },
      { subject: 'Computer Networks', topic: 'Data Link Layer', errorType: 'calculation', count: 2 },
    ],
  },
  {
    id: 'mt_004',
    source: 'Gate Overflow',
    date: '2026-05-01',
    totalMarks: 100,
    marksObtained: 47,
    subjectBreakdown: { 'General Aptitude': 8, 'Engineering Mathematics': 6, 'Digital Logic': 4, 'COA': 4, 'Programming & Data Structures': 7, 'Algorithms': 3, 'Theory of Computation': 3, 'Compiler Design': 2, 'Operating Systems': 4, 'Databases': 3, 'Computer Networks': 3 },
    errorAnalysis: [
      { subject: 'Compiler Design', topic: 'Parsing', errorType: 'conceptual', count: 2 },
      { subject: 'Algorithms', topic: 'Dynamic Programming', errorType: 'time', count: 1 },
    ],
  },
  {
    id: 'mt_005',
    source: 'Ace Academy',
    date: '2026-05-15',
    totalMarks: 100,
    marksObtained: 51,
    subjectBreakdown: { 'General Aptitude': 8, 'Engineering Mathematics': 7, 'Digital Logic': 4, 'COA': 5, 'Programming & Data Structures': 7, 'Algorithms': 3, 'Theory of Computation': 3, 'Compiler Design': 3, 'Operating Systems': 4, 'Databases': 4, 'Computer Networks': 3 },
    errorAnalysis: [
      { subject: 'Algorithms', topic: 'Graph Algorithms', errorType: 'conceptual', count: 2 },
      { subject: 'Theory of Computation', topic: 'CFG', errorType: 'calculation', count: 1 },
    ],
  },
  {
    id: 'mt_006',
    source: 'Made Easy',
    date: '2026-05-30',
    totalMarks: 100,
    marksObtained: 55,
    subjectBreakdown: { 'General Aptitude': 9, 'Engineering Mathematics': 7, 'Digital Logic': 4, 'COA': 5, 'Programming & Data Structures': 8, 'Algorithms': 4, 'Theory of Computation': 3, 'Compiler Design': 3, 'Operating Systems': 5, 'Databases': 4, 'Computer Networks': 3 },
    errorAnalysis: [
      { subject: 'COA', topic: 'Pipelining', errorType: 'calculation', count: 2 },
      { subject: 'Operating Systems', topic: 'Virtual Memory', errorType: 'conceptual', count: 1 },
    ],
  },
  {
    id: 'mt_007',
    source: 'Gate Overflow',
    date: '2026-06-10',
    totalMarks: 100,
    marksObtained: 58,
    subjectBreakdown: { 'General Aptitude': 9, 'Engineering Mathematics': 8, 'Digital Logic': 4, 'COA': 5, 'Programming & Data Structures': 8, 'Algorithms': 4, 'Theory of Computation': 4, 'Compiler Design': 3, 'Operating Systems': 5, 'Databases': 4, 'Computer Networks': 4 },
    errorAnalysis: [
      { subject: 'Databases', topic: 'Normalization', errorType: 'conceptual', count: 1 },
      { subject: 'Computer Networks', topic: 'Routing', errorType: 'calculation', count: 1 },
    ],
  },
  {
    id: 'mt_008',
    source: 'Made Easy',
    date: '2026-06-20',
    totalMarks: 100,
    marksObtained: 62,
    subjectBreakdown: { 'General Aptitude': 10, 'Engineering Mathematics': 8, 'Digital Logic': 4, 'COA': 6, 'Programming & Data Structures': 9, 'Algorithms': 4, 'Theory of Computation': 4, 'Compiler Design': 3, 'Operating Systems': 5, 'Databases': 5, 'Computer Networks': 4 },
    errorAnalysis: [
      { subject: 'Compiler Design', topic: 'Intermediate Code', errorType: 'conceptual', count: 1 },
      { subject: 'Algorithms', topic: 'NP-Complete', errorType: 'conceptual', count: 1 },
    ],
  },
]

export const sampleSyllabusProgress: Record<string, TopicStatus> = {
  'ga_verbal_aptitude': 'completed',
  'ga_numerical_reasoning': 'in_progress',
  'ga_analytical_spatial': 'not_started',
  'em_discrete_math': 'completed',
  'em_combinatorics_graph': 'in_progress',
  'em_linear_algebra': 'completed',
  'em_calculus': 'completed',
  'em_probability_stats': 'in_progress',
  'dl_boolean_algebra': 'mastered',
  'dl_combinational': 'completed',
  'dl_sequential': 'in_progress',
  'dl_number_systems': 'mastered',
  'coa_machine_instructions': 'completed',
  'coa_alu_datapath': 'completed',
  'coa_pipelining': 'in_progress',
  'coa_memory_hierarchy': 'completed',
  'coa_io_dma': 'not_started',
  'coa_control_unit': 'not_started',
  'pds_c_basics': 'mastered',
  'pds_arrays_pointers': 'mastered',
  'pds_recursion': 'completed',
  'pds_stacks_queues': 'completed',
  'pds_linked_lists': 'completed',
  'pds_trees_bst': 'in_progress',
  'pds_heaps': 'not_started',
  'pds_graphs': 'not_started',
  'algo_asymptotic': 'mastered',
  'algo_sorting': 'completed',
  'algo_searching': 'mastered',
  'algo_greedy': 'completed',
  'algo_dp': 'in_progress',
  'algo_graph_algorithms': 'in_progress',
  'algo_np_complete': 'not_started',
  'toc_regular': 'completed',
  'toc_cfl': 'in_progress',
  'toc_turing_machines': 'in_progress',
  'toc_decidability': 'not_started',
  'toc_complexity': 'not_started',
  'cd_lexical': 'completed',
  'cd_parsing': 'in_progress',
  'cd_semantic_sdt': 'not_started',
  'cd_intermediate_code': 'not_started',
  'cd_code_optimization': 'not_started',
  'cd_code_generation': 'not_started',
  'os_processes_threads': 'completed',
  'os_cpu_scheduling': 'completed',
  'os_process_sync': 'in_progress',
  'os_deadlock': 'in_progress',
  'os_memory_mgmt': 'completed',
  'os_virtual_memory': 'completed',
  'os_file_systems': 'not_started',
  'os_disk_io': 'not_started',
  'db_er_relational': 'completed',
  'db_sql': 'completed',
  'db_normalization': 'in_progress',
  'db_transactions': 'in_progress',
  'db_indexing': 'not_started',
  'db_recovery': 'not_started',
  'cn_osi_tcpip': 'completed',
  'cn_data_link': 'in_progress',
  'cn_mac_protocols': 'not_started',
  'cn_ip_addressing': 'in_progress',
  'cn_routing': 'not_started',
  'cn_transport_layer': 'in_progress',
  'cn_application_layer': 'not_started',
}
