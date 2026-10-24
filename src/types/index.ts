/**
 * Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.
 * Academic Portfolio & Research Archive - Universitas Sebelas Maret (UNS)
 * Domain Types & Schemas
 */

export type PublicationType =
  | 'Scopus Publications'
  | 'Journals (Jurnal)'
  | 'Proceedings (Prosiding)'
  | 'Books (Buku)'
  | 'Patents & Copyrights (Paten & HKI)'
  | 'Journal Article'
  | 'Conference Paper'
  | 'Book Chapter'
  | 'Student Thesis'
  | 'Preprint';

export type PublicationStatus = 'Published' | 'In Press' | 'Under Review' | 'Draft';

export interface AuthorItem {
  id?: string;
  nidn?: string; // NIDN or AUTH ID (e.g., '0617078501', '0001078705', 'AUTH00000042361')
  name: string;
  role?: 'First Author' | 'Corresponding Author' | 'Co-Author';
  affiliation?: string;
  isMainAuthor?: boolean;
  isStudent?: boolean;
  studentId?: string;
  order: number;
}

export interface P2MActivity {
  id: string;
  year: number;
  title: string;
  role: 'Ketua' | 'Anggota';
  status: string; // 'Diterima' | 'Didanai' | 'Selesai' | 'Dalam Proses'
  jenis: 'Penelitian' | 'Pengabdian';
  groupRiset: string;
  skema: string;
  dana?: string;
  sourceType?: 'manual' | 'synced_publication';
  linkedPublicationId?: string;
  linkedPublicationTitle?: string;
  linkedPublicationVenue?: string;
  linkedPublicationDoi?: string;
  syncIrisCategory?: boolean;
}

export interface ResearchInfographic {
  id?: string;
  publicationId: string;
  status: 'Draft' | 'Published';
  title: string;
  authorsText: string;
  problemStatement: string;
  objectives: string;
  methodology: string[];
  dataAndObject: string;
  keyFindings: string[];
  conclusions: string;
  doiOrSource: string;
  highlightMetric?: {
    label: string;
    value: string;
  };
  theme: 'navy' | 'slate' | 'editorial' | 'teal';
  layoutDensity: 'comfortable' | 'compact';
  notesOrDisclaimer?: string;
  customImageUrl?: string;
  customImageBase64?: string;
  generatedByAi?: boolean;
  lastUpdated: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: AuthorItem[];
  year: number;
  venue: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  pdfFileId?: string;
  pdfFileName?: string;
  pdfUrl?: string;
  abstract: string;
  keywords: string[];
  category: string;
  type: PublicationType;
  status: PublicationStatus;
  isFeatured?: boolean;
  isArchived?: boolean;
  archivedAt?: string;
  hasInfographic?: boolean;
  infographicData?: ResearchInfographic;
  infographicImageUrl?: string;
  infographicImageBase64?: string;
  connectToAnnual?: boolean;
  annualCategory?: 'scopus' | 'jurnal' | 'prosiding' | 'buku' | 'paten' | 'hki' | 'p2m';
  irisPerformanceRef?: string;
  scopusEid?: string;
  scopusCitations?: number;
  scopusIndexed?: boolean;
  elsevierVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ThesisInfographic {
  id?: string;
  studentId: string;
  studentName: string;
  nim: string;
  degree?: string;
  pembimbing?: string;
  penguji?: string;
  programStudi?: string;
  fakultas?: string;
  title: string;
  problemStatement: string;
  objectives: string;
  methodology: string[];
  dataAndObject: string;
  keyFindings: string[];
  conclusions: string;
  highlightMetric?: {
    label: string;
    value: string;
  };
  keywords?: string[];
  customImageUrl?: string;
  customImageBase64?: string;
  theme?: 'navy' | 'slate' | 'editorial' | 'teal' | 'emerald';
  status?: 'Draft' | 'Published';
  generatedByAi?: boolean;
  lastUpdated: string;
}

export interface GraduateStudent {
  id: string;
  name: string;
  nim: string;
  degree: string;
  researchTopic: string;
  thesisTitle?: string;
  thesisAbstract?: string;
  startYear: number;
  graduationYear?: number;
  status: 'Active' | 'Graduated';
  currentAffiliation?: string;
  linkedPublicationIds?: string[];
  photoUrl?: string;
  photoBase64?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfFileId?: string;
  notes?: string;
  docId?: number;
  digilibUrl?: string;
  pembimbing?: string;
  penguji?: string;
  kataKunci?: string;
  programStudi?: string;
  fakultas?: string;
  jenisDokumen?: string;
  imprint?: string;
  infographic?: ThesisInfographic;
  hasInfographic?: boolean;
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  year: string;
  field: string;
  thesisTitle?: string;
}

export interface WorkHistoryEntry {
  id: string;
  period: string; // e.g. "2022–2022", "2022–2024"
  role: string; // "Peneliti", "University Researcher"
  institution: string; // "Department of Management at Tilburg University", "University of Technology, the Netherlands"
  description?: string;
}

export interface AcademicAppointment {
  id: string;
  role: string;
  department: string;
  institution: string;
  period: string;
  description?: string;
}

export interface AwardEntry {
  id: string;
  title: string;
  organization: string;
  year: number;
  description?: string;
}

export interface AcademicAchievements {
  penelitian: number; // 47
  p2m: number; // 13
  scopus: number; // 64
  nonScopus: number; // 33
  prosiding: number; // 18
  buku: number; // 22
  paten: number; // 1
  hki: number; // 21
  notes: string; // "data capaian kinerja dosen terhitung mulai tahun 2014"
}

export interface ResearchGroupEntry {
  id: string;
  code: string; // e.g. "M12144414"
  name: string; // "Mathematical Modelling, Data Science, and Scientific Machine Learning"
  period: string; // "2016–sekarang"
  isActive: boolean;
}

export interface ScopusHIndexYearEntry {
  year: number; // 2014 to 2026
  hIndex: number | null; // null until entered
}

export interface AnnualPerformanceIndexEntry {
  year: number; // 2014 to 2026
  p2m: number | null;
  scopus: number | null;
  jurnal: number | null;
  prosiding: number | null;
  paten: number | null;
  buku: number | null;
  hki: number | null;
}

export interface ProfessorProfile {
  name: string;
  titleWithDegrees: string;
  role: string;
  department: string;
  faculty: string;
  institution: string;
  location: string;
  email: string;
  programStudi: string;
  office: string;
  bio: string;
  bioShort: string;
  researchInterests: string[];
  googleScholarUrl: string;
  scopusUrl: string;
  orcidUrl: string;
  sintaUrl: string;
  linkedinUrl?: string;
  researchGateUrl?: string;
  consultationHours?: string;
  labLocation?: string;
  photoUrl: string;
  photoBase64?: string;
  cvPdfUrl?: string;
  cvPdfFileName?: string;
  education: EducationEntry[];
  workHistory: WorkHistoryEntry[];
  appointments: AcademicAppointment[];
  awards: AwardEntry[];
  memberships: string[];
  achievements: AcademicAchievements;
  researchGroups: ResearchGroupEntry[];
  hIndexHistory: ScopusHIndexYearEntry[];
  annualPerformance: AnnualPerformanceIndexEntry[];
  p2mActivities?: P2MActivity[];
}

export interface TeachingCourse {
  id: string;
  code: string;
  name: string;
  level: 'Undergraduate (S1)' | 'Graduate (S2)' | 'Postgraduate (S3)';
  program: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap' | 'Both';
  description: string;
  learningOutcomes?: string[];
  materialsUrl?: string;
  syllabusFileId?: string;
  isActive: boolean;
}

export interface ResearchTopic {
  id: string;
  title: string;
  description: string;
  keyConcepts: string[];
}

export interface ResearchProject {
  id: string;
  title: string;
  topicId?: string;
  period: string;
  fundingSource?: string;
  grantName?: string;
  role: string;
  collaborators: string[];
  description: string;
  status: 'Ongoing' | 'Completed';
}

export interface EditorialRole {
  id: string;
  role: 'Editor-in-Chief' | 'Associate Editor' | 'Editorial Board Member' | 'Guest Editor' | 'Reviewer';
  venue: string;
  publisher?: string;
  indexing?: string;
  period: string;
  url?: string;
  description?: string;
}

export interface PressMediaItem {
  id: string;
  title: string;
  mediaOutlet: string;
  publishDate: string;
  category: 'News Coverage' | 'Interview' | 'Public Lecture / Keynote' | 'Academic Event';
  url?: string;
  summary: string;
  imageUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  excerpt: string;
  content: string;
  status: 'Published' | 'Draft';
  author: string;
  category?: string;
}

export interface AdminAccount {
  id: string;
  email: string;
  namaLengkap: string;
  role: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  adminEmail: string;
  adminNama: string;
  action: string;
  details: string;
  targetId?: string;
  targetTitle?: string;
  timestamp: string;
}

export interface AcademicDatabaseSchema {
  version: number;
  updatedAt: string;
  profile: ProfessorProfile;
  publications: Publication[];
  students: GraduateStudent[];
  teaching: TeachingCourse[];
  researchTopics: ResearchTopic[];
  researchProjects: ResearchProject[];
  editorialRoles: EditorialRole[];
  pressMedia: PressMediaItem[];
  blogPosts: BlogPost[];
  adminAccounts: AdminAccount[];
  auditLogs: AuditLogEntry[];
  importHistory?: ImportBatchRecord[];
}

export interface ElsevierConfigStatus {
  isConfigured: boolean;
  hasApiKey: boolean;
  hasInstToken: boolean;
  institutionName: string;
  authorId: string;
  authorName: string;
  authorProfileUrl: string;
  mode: 'live' | 'institutional_cached' | 'standby';
  lastSyncTime: string | null;
  totalScopusDocs: number;
  totalCitations: number;
  hIndex: number;
  rateLimit?: {
    quota: string;
    remaining: string;
    resetTime?: string;
  };
  notes: string;
}

export interface ScopusAuthorMetrics {
  authorId: string;
  name: string;
  affiliation: {
    id?: string;
    name: string;
    city: string;
    country: string;
  };
  documentCount: number;
  citationCount: number;
  hIndex: number;
  subjectAreas: Array<{ code: string; name: string }>;
  coAuthorsCount?: number;
  scopusUrl: string;
  source: 'live_elsevier_api' | 'cached_institutional_record';
}

export interface ScopusPublicationItem {
  scopusEid: string;
  title: string;
  doi?: string;
  journal: string;
  year: number;
  coverDate?: string;
  citationCount: number;
  authors: string[];
  openAccess?: boolean;
  url: string;
  alreadyInDatabase?: boolean;
}

export interface ElsevierSyncResult {
  success: boolean;
  message: string;
  timestamp: string;
  syncedDocsCount: number;
  totalScopusCount: number;
  citationsUpdated: number;
  hIndexUpdated: number;
  newPublicationsAdded: number;
  existingPublicationsUpdated: number;
  mode: 'live' | 'institutional_cached';
}

export interface ElsevierTestResult {
  success: boolean;
  statusCode: number;
  latencyMs: number;
  message: string;
  rateLimitRemaining?: string;
  rateLimitQuota?: string;
  hasInstToken: boolean;
  institution: string;
  authenticatedAs?: string;
}

// ========================================================
// SINTA & DIGILIB UNS IMPORT & SCRAPING TYPES
// ========================================================

export type ImportSourceType = 'sinta' | 'digilib' | 'custom_html' | 'file_upload';

export interface ScrapedPublicationItem {
  tempId: string;
  source: 'SINTA' | 'Digilib UNS' | 'File Upload' | 'Manual HTML';
  title: string;
  authors: AuthorItem[];
  authorsText: string;
  isKurdhiVerified: boolean;
  year: number;
  venue: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  pdfUrl?: string;
  abstract: string;
  keywords: string[];
  type: PublicationType;
  status: PublicationStatus;
  documentTypeOriginal?: string;
  repositoryName?: string;
  // Validation status
  completeness: 'complete' | 'moderate' | 'minimal';
  completenessScore: number; // 0 - 100%
  missingFields: string[];
  isDuplicate: boolean;
  duplicateOfId?: string;
  duplicateMatchReason?: string;
  selected?: boolean;
}

export interface ImportBatchRecord {
  id: string;
  source: string;
  sourceUrl?: string;
  timestamp: string;
  adminEmail: string;
  totalFound: number;
  totalImported: number;
  totalFailed: number;
  status: 'Completed' | 'Partial' | 'Failed';
  importedPublicationIds: string[];
  notes?: string;
}

export interface ScraperFetchParams {
  source: ImportSourceType;
  url?: string;
  rawHtml?: string;
  page?: number;
  sintaView?: 'iprs' | 'scopus' | 'garuda' | 'googlescholar' | 'researches' | 'pkm';
  searchQuery?: string;
}

export interface ScraperFetchResult {
  success: boolean;
  source: string;
  sourceUrl?: string;
  message: string;
  totalFound: number;
  extractedCount: number;
  failedCount: number;
  duplicatesCount: number;
  items: ScrapedPublicationItem[];
  warning?: string;
  mode: 'live_network' | 'institutional_snapshot' | 'raw_html_parsed' | 'file_parsed';
  timestamp: string;
}

export interface AivenMySqlDiagnosticResult {
  success: boolean;
  statusCode: number;
  errorCode?: string;
  statusText: string;
  message: string;
  details?: {
    host?: string;
    port?: number;
    user?: string;
    database?: string;
    sslRequired?: boolean;
    sslMode?: string;
    latencyMs?: number;
    protocol?: string;
    serverVersion?: string;
    cipher?: string;
    threadId?: number;
    rawError?: string;
    rawCode?: string | number;
  };
  timestamp: string;
}


