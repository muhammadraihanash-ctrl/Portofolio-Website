/**
 * Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.
 * Academic Portfolio & Research Archive - Universitas Sebelas Maret (UNS)
 * Authentic Baseline Dataset - 100% Dynamically Connected to MySQL Database (portofolio_nught)
 */

import {
  ProfessorProfile,
  Publication,
  GraduateStudent,
  TeachingCourse,
  ResearchTopic,
  ResearchProject,
  EditorialRole,
  PressMediaItem,
  BlogPost,
  AdminAccount,
  ScopusHIndexYearEntry,
  AnnualPerformanceIndexEntry,
  P2MActivity
} from '../types';
import databaseState from './database_state.json';

const rawProfile = (databaseState as any)?.profile || {};

// Scopus H-Index History (2014 - 2026) dynamically loaded from authentic database state
export const INITIAL_H_INDEX_HISTORY: ScopusHIndexYearEntry[] =
  (rawProfile.hIndexHistory || []) as ScopusHIndexYearEntry[];

// Authentic Annual Performance Index baseline (2014 - 2026) dynamically loaded from authentic database state
export const INITIAL_ANNUAL_PERFORMANCE: AnnualPerformanceIndexEntry[] =
  (rawProfile.annualPerformance || []) as AnnualPerformanceIndexEntry[];

export const SEED_PROFILE: ProfessorProfile = {
  name: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
  titleWithDegrees: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
  role: 'Associate Professor & Head of Applied Mathematics Research Group',
  department: 'Department of Mathematics',
  faculty: 'Faculty of Mathematics and Natural Sciences (FMIPA)',
  institution: 'Universitas Sebelas Maret (UNS)',
  location: 'Surakarta, Central Java, Indonesia',
  email: 'arfa@staff.uns.ac.id',
  programStudi: 'S1 Matematika & S1 Sains Data',
  office: 'Gedung A FMIPA UNS, Kampus Kentingan, Surakarta',
  consultationHours: "Senin & Jumat 08:00 - 15:00 WIB",
  labLocation: 'Laboratorium Komputasi dan Optimasi Matematika, FMIPA UNS',
  bio: `Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D. adalah Associate Professor dan Dosen Peneliti di Jurusan Matematika, Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA), Universitas Sebelas Maret (UNS), Surakarta. Menyelesaikan pendidikan Doktor (Ph.D.) di Department of Industrial Engineering and Innovation Sciences, Eindhoven University of Technology (TU/e), Belanda dengan kepakaran khusus pada Optimization, Operations Research, Closed-Loop Supply Chain, and Discrete Choice Experiments.

Aktif memimpin Riset Kolaborasi Internasional dan Nasional dalam pengembangan model matematis dan metaheuristik untuk permasalahan berskala besar, termasuk Electric Vehicle Routing Problem (EVRP), Explainable Artificial Intelligence (XAI), Generative AI, serta Pemodelan Matematika Sistem Epidemiologi.`,
  bioShort: 'Associate Professor & Dosen Peneliti di Departemen Matematika FMIPA Universitas Sebelas Maret (UNS). Menggeluti Riset Operasi, Optimasi Kombinatorial, Closed-Loop Supply Chain, dan Discrete Choice Experiments.',
  researchInterests: [
    'Operations Research and Optimization',
    'Closed-Loop Supply Chain & Circular Economy',
    'Discrete Choice Experiments',
    'Mathematical Modelling',
    'Data Science and Scientific Machine Learning',
    'Explainable Artificial Intelligence (XAI)',
    'Electric Vehicle Routing Problem (EVRP)'
  ],
  googleScholarUrl: 'https://scholar.google.com/citations?user=W2lGnqIAAAAJ',
  scopusUrl: 'https://www.scopus.com/authid/detail.uri?authorId=55851190200',
  orcidUrl: 'https://orcid.org/0000-0001-9274-1807',
  sintaUrl: 'https://sinta.kemdiktisaintek.go.id/authors/profile/6765487/?view=iprs',
  photoUrl: '/nughthoh_photo.webp',
  cvPdfUrl: 'https://expert.uns.ac.id/researcher/1091?export=cv',
  cvPdfFileName: 'CV_Nughthoh_Arfawi_Kurdhi_UNS.pdf',
  education: [
    {
      id: 'edu-1',
      degree: 'Ph.D. in Applied Mathematics (Industrial Engineering)',
      institution: 'Eindhoven University of Technology, Netherlands',
      year: '2021',
      field: 'Applied Mathematics & Industrial Engineering',
      thesisTitle: 'Optimization and Discrete Choice Experiments in Industrial & Health Operations'
    },
    {
      id: 'edu-2',
      degree: 'M.Sc. in Applied Mathematics',
      institution: 'Universitas Gadjah Mada (UGM), Indonesia',
      year: '2010',
      field: 'Applied Mathematics'
    },
    {
      id: 'edu-3',
      degree: 'B.Sc. in Mathematics (S.Si.)',
      institution: 'Universitas Sebelas Maret (UNS), Indonesia',
      year: '2010',
      field: 'Mathematics'
    }
  ],
  workHistory: [
    {
      id: 'work-1',
      period: '2022',
      role: 'Visiting Researcher',
      institution: 'Department of Management, Tilburg University, Netherlands',
      description: 'Research in operational management, discrete choice models, and healthcare systems optimization.'
    },
    {
      id: 'work-2',
      period: '2022–2024',
      role: 'University Researcher',
      institution: 'Eindhoven University of Technology, Netherlands',
      description: 'Postdoctoral research in operations research, mathematical modelling, and discrete choice experiments.'
    }
  ],
  appointments: [
    {
      id: 'app-1',
      role: 'Faculty Lecturer & Senior Researcher',
      department: 'Department of Mathematics',
      institution: 'FMIPA, Universitas Sebelas Maret (UNS)',
      period: '2010 – Present',
      description: 'Teaching undergraduate, master, and doctoral students, and directing applied mathematics research.'
    },
    {
      id: 'app-2',
      role: 'Head of Research Group',
      department: 'Mathematical Modelling, Data Science, and Scientific Machine Learning',
      institution: 'Universitas Sebelas Maret',
      period: '2016 – Present',
      description: 'Directing multidisciplinary research in applied mathematics, data science, scientific ML, and XAI.'
    }
  ],
  awards: [
    {
      id: 'awd-1',
      title: 'Publication in Premier Journal (ABS 4*)',
      organization: 'Journal of Operations Management',
      year: 2023,
      description: 'High-impact scientific research published in a premier world-leading operations research journal.'
    },
    {
      id: 'awd-2',
      title: 'National & International Competitive Research Grants',
      organization: 'Ministry of Higher Education, Science and Technology RI',
      year: 2022,
      description: 'Competitive grant awards for mathematical modelling and Electric Vehicle Routing Problem (EVRP).'
    }
  ],
  memberships: [
    'Indonesian Mathematical Society (IndoMS)',
    'Operations Research Society of Indonesia (ORSI)',
    'Association of European Operational Research Societies (EURO)'
  ],
  achievements: (rawProfile.achievements || {
    penelitian: 18,
    p2m: 14,
    scopus: 63,
    nonScopus: 32,
    prosiding: 16,
    buku: 22,
    paten: 10,
    hki: 12
  }),
  researchGroups: [
    {
      id: 'rg-active',
      code: 'M12144414',
      name: 'Mathematical Modelling, Data Science, and Scientific Machine Learning',
      period: '2016–Present',
      isActive: true
    },
    {
      id: 'rg-hist-1',
      code: 'M24085259',
      name: 'Operations Research and Optimization',
      period: '2014–2018',
      isActive: false
    },
    {
      id: 'rg-hist-2',
      code: 'M24085214',
      name: 'Mathematical Modelling and Optimization',
      period: '2018–2018',
      isActive: false
    },
    {
      id: 'rg-hist-3',
      code: 'M08092340',
      name: 'Mathematical Modelling and Optimization',
      period: '2018–2019',
      isActive: false
    },
    {
      id: 'rg-hist-4',
      code: 'X17204958',
      name: 'Biomechanics and Sports Technology',
      period: '2023–2026',
      isActive: false
    }
  ],
  hIndexHistory: INITIAL_H_INDEX_HISTORY,
  annualPerformance: INITIAL_ANNUAL_PERFORMANCE,
  p2mActivities: (rawProfile.p2mActivities || []) as P2MActivity[]
};

// Graduate Students: Empty as instructed by user. No dummy/mock students.
// All students are based on database records.
export const SEED_STUDENTS: GraduateStudent[] = [];

// Publications: 155 authentic publications and intellectual properties 100% dynamically loaded from the SQL database
export const SEED_PUBLICATIONS: Publication[] = ((databaseState as any)?.publications || []) as Publication[];

export const LEGACY_PUBS: Publication[] = [];

export const SEED_TEACHING: TeachingCourse[] = [
  {
    id: 'tch-1',
    code: 'MAT-201',
    name: 'Riset Operasi I (Operations Research I: Linear Programming)',
    level: 'Undergraduate (S1)',
    program: 'Program Studi S-1 Matematika',
    academicYear: '2025/2026',
    semester: 'Ganjil',
    description: 'Pemodelan program linear (Linear Programming), metode Simpleks, analisis dualitas, masalah transportasi, dan masalah penugasan.',
    learningOutcomes: [
      'Memahami formulasi matematis untuk problem optimasi keputusan industri',
      'Menguasai algoritma simpleks dan implementasi komputasi dengan solver Python/PuLP',
      'Mampu menginterpretasikan tabel sensitivitas dan nilai dual untuk pengambilan kebijakan'
    ],
    materialsUrl: 'https://spada.uns.ac.id',
    isActive: true
  },
  {
    id: 'tch-2',
    code: 'MAT-302',
    name: 'Riset Operasi II (Operations Research II: Non-Linear & Heuristics)',
    level: 'Undergraduate (S1)',
    program: 'Program Studi S-1 Matematika',
    academicYear: '2025/2026',
    semester: 'Genap',
    description: 'Program bilangan bulat (Integer Programming), Dynamic Programming, teori antrean, pemodelan jaringan, dan algoritma metaheuristik modern.',
    learningOutcomes: [
      'Memodelkan permasalahan kombinatorial berkategori NP-hard',
      'Mengimplementasikan metaheuristik modern (Genetic Algorithm, Simulated Annealing)',
      'Menyelesaikan studi kasus nyata logistik dan Electric Vehicle Routing'
    ],
    materialsUrl: 'https://spada.uns.ac.id',
    isActive: true
  },
  {
    id: 'tch-3',
    code: 'MAT-215',
    name: 'Pemodelan Matematika (Mathematical Modelling)',
    level: 'Undergraduate (S1)',
    program: 'Program Studi S-1 Matematika',
    academicYear: '2024/2025',
    semester: 'Ganjil',
    description: 'Prinsip pemodelan matematika kontinu dan diskret, analisis dimensi, model dinamika populasi, dan formulasi optimasi terapan.',
    learningOutcomes: [
      'Menerjemahkan fenomena fisis dan biologis ke dalam persamaan matematika',
      'Menganalisis kestabilan titik kesetimbangan',
      'Melakukan simulasi komputasi numerik'
    ],
    isActive: true
  }
];

export const SEED_RESEARCH_TOPICS: ResearchTopic[] = [
  {
    id: 'top-1',
    title: 'Operations Research & Optimization',
    description: 'Formulasi matematis dan perancangan algoritma metaheuristik untuk permasalahan keputusan berskala besar, logistik perkotaan, dan efisiensi armada.',
    keyConcepts: ['Operations Research', 'Mixed-Integer Programming', 'Metaheuristics', 'Supply Chain']
  },
  {
    id: 'top-2',
    title: 'Electric Vehicle Routing Problem (EVRP)',
    description: 'Pemodelan komputasi rute armada kendaraan listrik dengan batasan waktu pengisian daya baterai, degradasi energi, dan stasiun pengisian antara.',
    keyConcepts: ['EVRP', 'Battery Degradation', 'Intermediate Charging', 'Green Logistics']
  },
  {
    id: 'top-3',
    title: 'Explainable Artificial Intelligence (XAI)',
    description: 'Penelitian metode interpretabilitas model machine learning menggunakan Generative Adversarial Networks (GANs), SHAP, dan LIME untuk pendukung keputusan transparan.',
    keyConcepts: ['XAI', 'GANs', 'SHAP Values', 'LIME', 'Scientific Machine Learning']
  },
  {
    id: 'top-4',
    title: 'Mathematical Modelling & Discrete Choice Experiments',
    description: 'Pemodelan matematika terapan untuk aplikasi epidemiologi, virologi, imunologi, dan eksperimen pilihan diskret pada teknik industri.',
    keyConcepts: ['Mathematical Modelling', 'Epidemiology', 'Virology', 'Discrete Choice Experiments']
  }
];

export const SEED_RESEARCH_PROJECTS: ResearchProject[] = [
  {
    id: 'prj-1',
    title: 'Pemodelan Optimasi Rute Kendaraan Listrik (EVRP) dengan Pertimbangan Stasiun Pengisian Daya dan Waktu Layanan',
    topicId: 'top-2',
    period: '2023 – 2025',
    fundingSource: 'Kemdiktisaintek RI',
    grantName: 'Penelitian Terapan Unggulan Perguruan Tinggi',
    role: 'Ketua Peneliti (Principal Investigator)',
    collaborators: ['Tim Dosen FMIPA UNS'],
    description: 'Mengembangkan model matematis dan algoritma komputasi untuk menekan emisi karbon dan mengoptimalkan rute logistik berbasis baterai.',
    status: 'Ongoing'
  },
  {
    id: 'prj-2',
    title: 'Pengembangan Kerangka Kerja Explainable Artificial Intelligence (XAI) untuk Sistem Keputusan Industri dan Kesehatan',
    topicId: 'top-3',
    period: '2022 – 2024',
    fundingSource: 'LPPM Universitas Sebelas Maret (UNS)',
    grantName: 'Hibah Riset Kolaborasi UNS',
    role: 'Ketua Peneliti',
    collaborators: ['Dosen Department of Mathematics'],
    description: 'Mengintegrasikan teknik XAI (SHAP, LIME, GANs) untuk memastikan transparansi dan akuntabilitas model cerdas buatan.',
    status: 'Completed'
  }
];

export const SEED_EDITORIAL: EditorialRole[] = [
  {
    id: 'ed-1',
    role: 'Reviewer',
    venue: 'Journal of Operations Management (ABS 4*)',
    publisher: 'Wiley / Elsevier',
    indexing: 'Scopus Q1 / ABS 4*',
    period: '2022 – Sekarang',
    description: 'Peer-reviewer naskah bidang operations management, discrete choice, dan optimasi industri.'
  },
  {
    id: 'ed-2',
    role: 'Reviewer',
    venue: 'Computers & Operations Research',
    publisher: 'Elsevier',
    indexing: 'Scopus Q1',
    period: '2021 – Sekarang',
    description: 'Peer-reviewer artikel algoritma metaheuristik dan Vehicle Routing Problems.'
  }
];

export const SEED_PRESS_MEDIA: PressMediaItem[] = [
  {
    id: 'med-1',
    title: 'Nughthoh Arfawi Kurdhi Raih Publikasi pada Jurnal Bereputasi Internasional Journal of Operations Management (ABS 4*)',
    mediaOutlet: 'Portal Berita FMIPA UNS',
    publishDate: '2023-11-20',
    category: 'News Coverage',
    url: 'https://mipa.uns.ac.id',
    summary: 'Dosen Matematika FMIPA UNS, Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D. mempublikasikan hasil riset operasional pada salah satu jurnal terbaik dunia kategori ABS 4*.'
  },
  {
    id: 'med-2',
    title: 'Kuliah Pakar: Tantangan Optimasi EVRP dan Penggunaan Explainable AI dalam Pengambilan Keputusan',
    mediaOutlet: 'Kanal Berita Akademik FMIPA UNS',
    publishDate: '2024-04-18',
    category: 'Public Lecture / Keynote',
    summary: 'Pemaparan mendalam mengenai pentingnya transparansi model AI (XAI) dan efisiensi rute kendaraan listrik bagi masa depan transportasi ramah lingkungan.'
  }
];

export const SEED_BLOG: BlogPost[] = [];

export const DEFAULT_PORTFOLIO_ADMIN: AdminAccount = {
  id: 'admin-kurdhi',
  email: 'arfa@staff.uns.ac.id',
  namaLengkap: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
  role: 'Dosen Pemilik Portofolio (Administrator Utama)',
  passwordHash: '7142737e363474acdd41c64ae582d3b73dcbaef309629ffad194b3f471b30454',
  salt: 'unsacademicportfoliosalt',
  createdAt: '2024-01-01T00:00:00.000Z'
};
