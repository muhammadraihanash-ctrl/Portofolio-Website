import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  X,
  Save,
  Check,
  Server,
  GraduationCap,
  Copy,
  Key,
  HelpCircle,
  ShieldCheck,
  User,
  Compass,
  Newspaper,
  BookMarked
} from 'lucide-react';
import { academicService } from '../services/academicService';

export type SqlTableName =
  | 'academic_profile'
  | 'teaching_courses'
  | 'digilib_documents'
  | 'research_topics'
  | 'research_projects'
  | 'scopus_publications'
  | 'journals'
  | 'proceedings'
  | 'books'
  | 'patents_hki'
  | 'p2m_activities'
  | 'editorial_roles'
  | 'press_media'
  | 'blog_posts'
  | 'admin_accounts';

export interface TableMeta {
  id: SqlTableName;
  label: string;
  sublabel: string;
  navSection: string;
  icon: any;
  defaultCount: number;
}

export const SQL_TABLES: TableMeta[] = [
  {
    id: 'academic_profile',
    label: 'Profil & Resume Dosen',
    sublabel: 'Biodata, Riwayat Pendidikan, Kontak & CV',
    navSection: 'Home & Resume',
    icon: User,
    defaultCount: 1
  },
  {
    id: 'teaching_courses',
    label: 'Mata Kuliah & Silabus',
    sublabel: 'Perkuliahan, SKS, Semester & Silabus',
    navSection: 'Teaching',
    icon: BookMarked,
    defaultCount: 5
  },
  {
    id: 'digilib_documents',
    label: 'Dokumen Mahasiswa',
    sublabel: 'Arsip Skripsi & Tesis Mahasiswa Bimbingan',
    navSection: 'Graduate Students',
    icon: GraduationCap,
    defaultCount: 74
  },
  {
    id: 'research_topics',
    label: 'Topik Riset Utama',
    sublabel: 'Fokus Bidang Keahlian & Konsep Kunci Riset',
    navSection: 'Current Research',
    icon: Compass,
    defaultCount: 3
  },
  {
    id: 'research_projects',
    label: 'Proyek & Hibah Riset',
    sublabel: 'Pendanaan Hibah Kompetitif Nasional & Internal',
    navSection: 'Current Research',
    icon: Layers,
    defaultCount: 2
  },
  {
    id: 'scopus_publications',
    label: 'Publikasi Scopus',
    sublabel: 'Artikel Terindeks Scopus & ScienceDirect',
    navSection: 'Publications',
    icon: Award,
    defaultCount: 63
  },
  {
    id: 'journals',
    label: 'Jurnal Ilmiah',
    sublabel: 'Artikel Jurnal Nasional & Internasional',
    navSection: 'Publications',
    icon: BookOpen,
    defaultCount: 32
  },
  {
    id: 'proceedings',
    label: 'Prosiding Konferensi',
    sublabel: 'Seminar Nasional & Konferensi Internasional',
    navSection: 'Publications',
    icon: FileText,
    defaultCount: 16
  },
  {
    id: 'books',
    label: 'Buku & Monograf',
    sublabel: 'Buku Ajar, Referensi & Bab Buku Ber-ISBN',
    navSection: 'Publications',
    icon: BookOpen,
    defaultCount: 22
  },
  {
    id: 'patents_hki',
    label: 'Paten & HKI',
    sublabel: 'Paten & Hak Cipta Kemenkumham RI',
    navSection: 'Publications',
    icon: Sparkles,
    defaultCount: 22
  },
  {
    id: 'p2m_activities',
    label: 'Kegiatan P2M',
    sublabel: 'Penelitian & Pengabdian Masyarakat',
    navSection: 'P2M Kegiatan',
    icon: Layers,
    defaultCount: 60
  },
  {
    id: 'editorial_roles',
    label: 'Peran Editor Jurnal',
    sublabel: 'Dewan Redaksi & Reviewer Jurnal Ilmiah',
    navSection: 'Editorial Roles',
    icon: ShieldCheck,
    defaultCount: 2
  },
  {
    id: 'press_media',
    label: 'Liputan Media Massa',
    sublabel: 'Wawancara, Opini Publik & Berita Media',
    navSection: 'Press & Media',
    icon: Newspaper,
    defaultCount: 2
  },
  {
    id: 'blog_posts',
    label: 'Artikel Blog & Esai',
    sublabel: 'Catatan Akademik, Gagasan & Catatan Kuliah',
    navSection: 'Blog',
    icon: FileText,
    defaultCount: 1
  },
  {
    id: 'admin_accounts',
    label: 'Akun Administrator',
    sublabel: 'Pengelola Resmi Sistem Portofolio Akademik',
    navSection: 'Sistem Admin',
    icon: Key,
    defaultCount: 4
  }
];

interface SqlDatabaseTabProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const SqlDatabaseTab: React.FC<SqlDatabaseTabProps> = ({ showToast }) => {
  const [activeTable, setActiveTable] = useState<SqlTableName>('p2m_activities');
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [statusInfo, setStatusInfo] = useState<any>(null);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal delete confirm
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Syncing
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // MySQL Connection Modal & Test State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [configTab, setConfigTab] = useState<'uri' | 'fields' | 'guide'>('uri');
  const [jdbcUrl, setJdbcUrl] = useState<string>('mysql://avnadmin:AVNS_rJ6ZVrNE-zqfjTPFJsh@projekportofolio1-muhammadraihanash-569a.a.aivencloud.com:23220/defaultdb?ssl-mode=REQUIRED');
  const [configFields, setConfigFields] = useState({
    host: 'projekportofolio1-muhammadraihanash-569a.a.aivencloud.com',
    port: 23220,
    user: 'avnadmin',
    password: 'AVNS_rJ6ZVrNE-zqfjTPFJsh',
    database: 'defaultdb',
    ssl: 'REQUIRED'
  });
  const [isTestingConfig, setIsTestingConfig] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    database?: string;
    statusCode?: number;
    errorCode?: string;
  } | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyName: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(null), 2000);
      showToast(`Teks ${keyName} disalin ke clipboard!`, 'success');
    } catch {
      showToast('Gagal menyalin teks.', 'error');
    }
  };

  const handleOpenConfigModal = async () => {
    setIsConfigModalOpen(true);
    setTestResult(null);
    try {
      const data = await academicService.getSqlConfig();
      if (data && data.config) {
        setConfigFields(prev => ({
          ...prev,
          host: data.config.host || prev.host,
          port: data.config.port || prev.port,
          user: data.config.user || prev.user,
          database: data.config.database || prev.database,
          ssl: data.config.ssl || prev.ssl,
          password: prev.password || 'AVNS_rJ6ZVrNE-zqfjTPFJsh'
        }));
      }
    } catch {}
  };

  const handleTestConnection = async (useEnvOnly: boolean = false) => {
    setIsTestingConfig(true);
    setTestResult(null);
    try {
      let payload: any = undefined;
      if (!useEnvOnly) {
        if (configTab === 'uri') {
          const cleanUri = jdbcUrl.trim() || 'mysql://avnadmin:AVNS_rJ6ZVrNE-zqfjTPFJsh@projekportofolio1-muhammadraihanash-569a.a.aivencloud.com:23220/defaultdb?ssl-mode=REQUIRED';
          payload = { jdbcUrl: cleanUri };
        } else {
          payload = {
            ...configFields,
            password: configFields.password.trim() || 'AVNS_rJ6ZVrNE-zqfjTPFJsh'
          };
        }
      }
      const res = await academicService.checkAivenMySqlDiagnostics(payload);
      setTestResult({
        success: res.success,
        message: res.message,
        latencyMs: res.details?.latencyMs,
        database: res.details?.database,
        statusCode: res.statusCode,
        errorCode: res.errorCode
      });
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(`[Status ${res.statusCode}] ${res.message || 'Uji koneksi gagal.'}`, 'error');
      }
    } catch (e: any) {
      setTestResult({ success: false, statusCode: 500, message: e.message || 'Gagal menghubungi server pengujian.' });
    } finally {
      setIsTestingConfig(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const payload = configTab === 'uri'
        ? { jdbcUrl: jdbcUrl.trim() }
        : { ...configFields };
      const res = await academicService.saveSqlConfig(payload);
      if (res.success) {
        showToast(res.message || 'Konfigurasi MySQL berhasil disimpan dan disinkronkan!', 'success');
        setIsConfigModalOpen(false);
        await loadStatus();
        await loadCurrentTable(activeTable);
      } else {
        showToast(res.error || 'Gagal menyimpan konfigurasi MySQL.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Terjadi kesalahan sistem saat menyimpan konfigurasi.', 'error');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleQuickReconnect = async () => {
    setIsReconnecting(true);
    try {
      const res = await academicService.syncSqlDatabase();
      if (res.success) {
        showToast('Koneksi berhasil disinkronkan langsung dari server MySQL pusat Aiven!');
        await loadStatus();
        await loadCurrentTable(activeTable);
      } else {
        showToast(res.error || 'Gagal memperbarui koneksi MySQL.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Gagal menghubungi server.', 'error');
    } finally {
      setIsReconnecting(false);
    }
  };

  // Load Status and Table list
  const loadStatus = async () => {
    try {
      const status = await academicService.getSqlStatus();
      if (status) {
        setStatusInfo(status);
        if (status.tables) {
          setTableCounts(status.tables);
        }
      }
    } catch (e) {
      console.warn('Load SQL status failed:', e);
    }
  };

  // Load table data
  const loadCurrentTable = async (tableName: SqlTableName) => {
    setIsLoading(true);
    try {
      const rows = await academicService.getSqlTableRows(tableName);
      setTableData(rows || []);
      setTableCounts(prev => ({
        ...prev,
        [tableName]: (rows || []).length
      }));
    } catch (err: any) {
      showToast(`Gagal memuat tabel ${tableName}: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    loadCurrentTable(activeTable);
  }, [activeTable]);

  // Handle open add modal
  const handleOpenAdd = () => {
    const currentYear = new Date().getFullYear();
    let initial: Record<string, any> = { tahun: currentYear };
    if (activeTable === 'p2m_activities') {
      initial = {
        tahun: currentYear,
        peran: 'Ketua',
        judul: '',
        skema: 'Penelitian Terapan Unggulan (PTU)',
        sumber_dana: 'Kemdiktisaintek RI',
        kategori: 'Penelitian',
        kelompok_bidang: 'Optimization and Operations Research',
        status_usulan: 'Diterima'
      };
    } else if (activeTable === 'scopus_publications') {
      initial = {
        judul: '',
        tahun: currentYear,
        penulis: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
        authors: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
        nama_jurnal: '',
        penerbit: '',
        kuartil: 'Q1',
        sitasi: 0,
        link_scopus: '',
        doi: '',
        kategori: 'Operations Research & Optimization'
      };
    } else if (activeTable === 'journals') {
      initial = {
        judul: '',
        tahun: currentYear,
        penulis: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
        authors: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
        nama_jurnal: '',
        penerbit: '',
        volume: '1',
        nomor: '1',
        halaman: '1-10',
        url: '',
        kategori: 'Applied Mathematics'
      };
    } else if (activeTable === 'proceedings') {
      initial = {
        judul: '',
        tahun: currentYear,
        penulis: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
        authors: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
        nama_konferensi: '',
        penerbit: '',
        lokasi: 'Surakarta, Indonesia',
        halaman: '1-10',
        url: '',
        kategori: 'Applied Mathematics'
      };
    } else if (activeTable === 'books') {
      initial = {
        judul: '',
        tahun: currentYear,
        penulis: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
        authors: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
        penerbit: 'CV Sintesia',
        isbn: '',
        jumlah_halaman: 120,
        kategori: 'Buku Ajar & Referensi'
      };
    } else if (activeTable === 'patents_hki') {
      initial = {
        judul: '',
        tahun: currentYear,
        penulis: 'Nughthoh Arfawi Kurdhi',
        authors: 'Nughthoh Arfawi Kurdhi',
        inventors: 'Nughthoh Arfawi Kurdhi',
        anggota_tim: 'Universitas Sebelas Maret (UNS)',
        nomor_permohonan: `EC00${currentYear}`,
        jenis: 'Hak Cipta',
        status: 'Terdaftar',
        kategori: 'Karya Tulis / Perangkat Lunak'
      };
    } else if (activeTable === 'digilib_documents') {
      initial = {
        doc_id: '',
        penulis_utama: '',
        nim_nip: '',
        tahun: currentYear,
        judul: '',
        jenis_dokumen: 'Skripsi',
        program_studi: 'Matematika',
        fakultas: 'MIPA',
        pembimbing: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
        penguji: '',
        kata_kunci: '',
        detail_url: '',
        catatan_umum: ''
      };
    } else if (activeTable === 'teaching_courses') {
      initial = {
        code: 'MAT-301',
        name: '',
        level: 'Undergraduate (S1)',
        program: 'Matematika',
        academic_year: `${currentYear}/${currentYear + 1}`,
        semester: 'Ganjil',
        description: '',
        learning_outcomes: '',
        materials_url: '',
        is_active: 1
      };
    } else if (activeTable === 'research_topics') {
      initial = {
        title: '',
        description: '',
        key_concepts: 'Optimization, Mathematical Modeling, Operations Research'
      };
    } else if (activeTable === 'research_projects') {
      initial = {
        title: '',
        period: `${currentYear} - ${currentYear + 1}`,
        funding_source: 'Kemdiktisaintek RI',
        grant_name: 'Penelitian Terapan Unggulan (PTU)',
        role: 'Ketua Peneliti',
        collaborators: 'FMIPA Universitas Sebelas Maret',
        description: '',
        status: 'Ongoing'
      };
    } else if (activeTable === 'editorial_roles') {
      initial = {
        role: 'Editorial Board Member',
        venue: '',
        publisher: '',
        indexing: 'Scopus Q2 / SINTA 1',
        period: `${currentYear} - Sekarang`,
        url: '',
        description: ''
      };
    } else if (activeTable === 'press_media') {
      initial = {
        title: '',
        media_outlet: 'Humas UNS',
        publish_date: new Date().toISOString().split('T')[0],
        category: 'Liputan Penelitian',
        url: '',
        summary: ''
      };
    } else if (activeTable === 'blog_posts') {
      initial = {
        title: '',
        slug: `catatan-riset-${Date.now()}`,
        published_at: new Date().toISOString().split('T')[0],
        read_time: '5 min read',
        tags: 'Riset, Matematika Terapan, Optimasi',
        excerpt: '',
        content: '',
        status: 'Published',
        author: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
        category: 'Wawasan Riset'
      };
    } else if (activeTable === 'academic_profile') {
      initial = {
        name: 'Nughthoh Arfawi Kurdhi',
        title_with_degrees: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
        role: 'Lektor / Dosen & Peneliti',
        department: 'Program Studi Matematika',
        faculty: 'Fakultas MIPA',
        institution: 'Universitas Sebelas Maret (UNS)',
        location: 'Surakarta, Jawa Tengah, Indonesia',
        email: 'arfa@staff.uns.ac.id',
        bio_short: '',
        bio: '',
        research_interests: 'Operations Research, Graph Theory, Optimization'
      };
    } else if (activeTable === 'admin_accounts') {
      initial = {
        nama_lengkap: '',
        email: '',
        role: 'Administrator Resmi (Staff FMIPA UNS)'
      };
    }
    setEditingRow(null);
    setFormData(initial);
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (row: any) => {
    setEditingRow(row);
    setFormData({
      ...row,
      tahun: row.tahun ?? row.year ?? new Date().getFullYear(),
      judul: row.judul ?? row.title ?? row.name ?? row.venue ?? '',
      penulis: row.penulis ?? row.authors ?? row.inventors ?? '',
      authors: row.authors ?? row.penulis ?? '',
      inventors: row.inventors ?? row.authors ?? row.penulis ?? '',
      anggota_tim: row.anggota_tim || '',
      peran: row.peran ?? row.role ?? 'Ketua',
      status_usulan: row.status_usulan ?? row.status ?? 'Diterima',
      kategori: row.kategori ?? row.jenis ?? 'Penelitian',
      skema: row.skema || '',
      sumber_dana: row.sumber_dana ?? row.skema ?? '',
      kelompok_bidang: row.kelompok_bidang ?? row.group_riset ?? '',
      nama_jurnal: row.nama_jurnal ?? row.journal ?? '',
      volume: row.volume || '',
      nomor: row.nomor || row.nomor_permohonan || '',
      halaman: row.halaman || '',
      url: row.url ?? row.link ?? '',
      nama_konferensi: row.nama_konferensi ?? row.seminar_name ?? '',
      lokasi: row.lokasi ?? row.seminar_theme ?? '',
      penerbit: row.penerbit ?? row.publisher ?? '',
      isbn: row.isbn || '',
      jumlah_halaman: row.jumlah_halaman || 120,
      jenis: row.jenis || 'Hak Cipta',
      nomor_permohonan: row.nomor_permohonan ?? row.nomor ?? '',
      status: row.status || 'Terdaftar',
      doc_id: row.doc_id ?? row.id ?? '',
      penulis_utama: row.penulis_utama || '',
      nim_nip: row.nim_nip || '',
      program_studi: row.program_studi || 'Matematika',
      jenis_dokumen: row.jenis_dokumen || 'Skripsi',
      link_scopus: row.link_scopus ?? row.link ?? '',
      doi: row.doi || '',
      kuartil: row.kuartil || 'Scopus',
      sitasi: row.sitasi ?? 0,
      // Remaining tables fields
      code: row.code || '',
      name: row.name || row.nama_lengkap || '',
      level: row.level || 'Undergraduate (S1)',
      program: row.program || '',
      academic_year: row.academic_year || '',
      semester: row.semester || '',
      description: row.description || row.bio || '',
      learning_outcomes: row.learning_outcomes || '',
      materials_url: row.materials_url || '',
      is_active: row.is_active ?? 1,
      key_concepts: row.key_concepts || '',
      period: row.period || '',
      funding_source: row.funding_source || '',
      grant_name: row.grant_name || '',
      collaborators: row.collaborators || '',
      venue: row.venue || '',
      indexing: row.indexing || '',
      media_outlet: row.media_outlet || '',
      publish_date: row.publish_date || '',
      summary: row.summary || '',
      slug: row.slug || '',
      published_at: row.published_at || '',
      read_time: row.read_time || '',
      tags: row.tags || '',
      excerpt: row.excerpt || '',
      content: row.content || '',
      author: row.author || '',
      title_with_degrees: row.title_with_degrees || '',
      department: row.department || '',
      faculty: row.faculty || '',
      institution: row.institution || '',
      location: row.location || '',
      email: row.email || '',
      bio: row.bio || '',
      bio_short: row.bio_short || '',
      research_interests: row.research_interests || '',
      nama_lengkap: row.nama_lengkap || row.name || ''
    });
    setIsModalOpen(true);
  };

  // Submit create or edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const rowId = editingRow ? (editingRow.doc_id ?? editingRow.id) : null;
      if (rowId !== null && rowId !== undefined) {
        const res = await academicService.updateSqlRow(activeTable, rowId, formData);
        if (res.success) {
          showToast(`Berhasil memperbarui data pada tabel ${activeTable} di server MySQL pusat!`);
          setIsModalOpen(false);
          await loadCurrentTable(activeTable);
          await loadStatus();
        } else {
          showToast(res.error || 'Gagal memperbarui data SQL.', 'error');
        }
      } else {
        const res = await academicService.createSqlRow(activeTable, formData);
        if (res.success) {
          showToast(`Berhasil menambahkan baris baru ke tabel ${activeTable} di server MySQL pusat!`);
          setIsModalOpen(false);
          await loadCurrentTable(activeTable);
          await loadStatus();
        } else {
          showToast(res.error || 'Gagal menambahkan data ke SQL.', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete row
  const handleDeleteRow = async () => {
    const targetId = deleteTarget ? (deleteTarget.doc_id ?? deleteTarget.id) : null;
    if (targetId === null || targetId === undefined) return;
    setIsDeleting(true);
    try {
      const res = await academicService.deleteSqlRow(activeTable, targetId);
      if (res.success) {
        showToast(`Baris ID ${targetId} berhasil dihapus dari tabel ${activeTable} di server MySQL pusat!`);
        setDeleteTarget(null);
        await loadCurrentTable(activeTable);
        await loadStatus();
      } else {
        showToast(res.error || 'Gagal menghapus baris SQL.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus baris.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Manual SQL sync
  const handleSyncSql = async () => {
    setIsSyncing(true);
    try {
      const res = await academicService.syncSqlDatabase();
      if (res.success) {
        showToast('Sinkronisasi basis data SQL berhasil diperbarui di seluruh aplikasi dari server MySQL!');
        await loadCurrentTable(activeTable);
        await loadStatus();
      } else {
        showToast(res.error || 'Gagal melakukan sinkronisasi SQL.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Koneksi gagal saat sinkronisasi.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtered rows
  const filteredRows = tableData.filter(row => {
    const rYear = String(row.tahun ?? row.year ?? '');
    if (yearFilter !== 'all' && rYear !== yearFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchJudul = String(row.judul || row.title || '').toLowerCase().includes(q);
      const matchVenue = String(row.nama_jurnal || row.journal || row.nama_konferensi || row.seminar_name || row.penerbit || row.publisher || '').toLowerCase().includes(q);
      const matchRole = String(row.peran || row.role || row.jenis || '').toLowerCase().includes(q);
      const matchSkema = String(row.skema || row.group_riset || row.kategori || '').toLowerCase().includes(q);
      const matchNo = String(row.nomor_permohonan || row.nomor || row.isbn || row.doi || row.nim_nip || '').toLowerCase().includes(q);
      const matchAuthor = String(row.penulis_utama || row.authors || row.pembimbing || row.penguji || row.program_studi || row.kata_kunci || '').toLowerCase().includes(q);
      if (!matchJudul && !matchVenue && !matchRole && !matchSkema && !matchNo && !matchAuthor) {
        return false;
      }
    }
    return true;
  });

  // Extract distinct years
  const availableYears = Array.from(new Set(tableData.map(r => r.tahun ?? r.year).filter(Boolean))).sort(
    (a: any, b: any) => Number(b) - Number(a)
  );

  const totalRowCount = Object.values(tableCounts).reduce((acc, c) => acc + (typeof c === 'number' ? c : 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-100 text-[#004b87] rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="font-serif-academic text-2xl font-bold text-slate-950">
                Pusat Basis Data SQL (portofolio_nught)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Basis data relasional MySQL terintegrasi penuh sebagai sumber data tunggal (single source of truth) untuk seluruh portofolio publikasi, kinerja tahunan, indeks Scopus, kegiatan P2M, dan arsip dokumen skripsi/tesis mahasiswa bimbingan (digilib_documents).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenConfigModal}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-amber-700" />
              <span>Pengaturan &amp; Uji MySQL</span>
            </button>

            <button
              type="button"
              onClick={handleSyncSql}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Basis Data'}</span>
            </button>

            <button
              type="button"
              onClick={() => academicService.downloadSqlDatabase()}
              className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File .SQL Dump</span>
            </button>
          </div>
        </div>

        {/* Live MySQL Connection Alert / Info Banner */}
        {statusInfo && !statusInfo.isConnected ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-amber-900 block">Koneksi Live MySQL Aiven Belum Terhubung</span>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  {statusInfo.error || statusInfo.message || 'Server live MySQL belum terhubung. Seluruh 15 tabel navigasi tetap berfungsi via basis data lokal tersimpan.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleQuickReconnect}
                disabled={isReconnecting}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
                <span>{isReconnecting ? 'Menghubungkan...' : 'Hubungkan Ulang'}</span>
              </button>
              <button
                type="button"
                onClick={handleOpenConfigModal}
                className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                Atur Kredensial &amp; Vercel
              </button>
            </div>
          </div>
        ) : statusInfo?.isConnected ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium text-[11px]">
                Terhubung langsung ke live database Aiven MySQL: <strong>{statusInfo.user}@{statusInfo.host}:{statusInfo.port}/{statusInfo.databaseName}</strong> (SSL Aktif). Setiap penambahan/pengubahan data otomatis tersimpan ke cloud MySQL.
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenConfigModal}
              className="text-[11px] font-semibold text-emerald-800 underline hover:text-emerald-950 shrink-0 cursor-pointer"
            >
              Cek Konfigurasi
            </button>
          </div>
        ) : null}

        {/* Database Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Database Name:</span>
            <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
              {statusInfo?.databaseName || 'defaultdb'}
            </span>
            <span className={`text-[10px] font-semibold flex items-center gap-1 mt-1 ${statusInfo?.isConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo?.isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {statusInfo?.isConnected ? 'Live Aiven MySQL Connected' : 'MySQL In-Memory / File Active'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Total Data Terdaftar:</span>
            <span className="font-mono font-bold text-[#004b87] text-lg mt-0.5 block">
              {totalRowCount > 0 ? totalRowCount : 309} Baris
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Tersebar di 15 Tabel Basis Data MySQL Pusat</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Tabel Aktif:</span>
            <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block truncate">
              {activeTable}
            </span>
            <span className="text-[10px] text-slate-500">
              {tableData.length} baris data ditemukan
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Status Perubahan:</span>
            <span className="font-semibold text-emerald-700 text-xs mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Real-Time Sinkronisasi</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Edit/tambah langsung diperbarui ke MySQL</span>
          </div>
        </div>
      </div>

      {/* 2. Portfolio Navigation Section Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-slate-400 font-semibold px-2 py-1 text-[11px] shrink-0 uppercase tracking-wider font-mono">
          Navigasi:
        </span>
        {[
          { id: 'all', label: `Semua Tabel (${SQL_TABLES.length})` },
          { id: 'Home & Resume', label: 'Home & Resume' },
          { id: 'Teaching', label: 'Teaching' },
          { id: 'Graduate Students', label: 'Graduate Students' },
          { id: 'Current Research', label: 'Current Research' },
          { id: 'Publications', label: 'Publications' },
          { id: 'P2M Kegiatan', label: 'P2M Kegiatan' },
          { id: 'Editorial Roles', label: 'Editorial Roles' },
          { id: 'Press & Media', label: 'Press & Media' },
          { id: 'Blog', label: 'Blog' },
          { id: 'Sistem Admin', label: 'Sistem Admin' }
        ].map(sec => {
          const isCurrentSec = sectionFilter === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setSectionFilter(sec.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer ${
                isCurrentSec
                  ? 'bg-[#004b87] text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* 3. Table Selection Tabs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {SQL_TABLES.filter(tab => sectionFilter === 'all' || tab.navSection === sectionFilter).map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTable === tab.id;
          const count = tableCounts[tab.id] ?? tab.defaultCount;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTable(tab.id);
                setSearchQuery('');
                setYearFilter('all');
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#004b87] border-[#004b87] text-white shadow-sm ring-2 ring-sky-300/40'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-sky-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-200' : 'text-[#004b87]'}`} />
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-sky-950/40 text-sky-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.navSection}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-sky-900 text-sky-100' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {count}
                </span>
              </div>
              <div>
                <div className="font-bold text-xs truncate leading-snug">{tab.label}</div>
                <div className={`text-[10px] truncate ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                  {tab.id}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Search, Filter, and Add Button Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Cari dalam tabel ${activeTable}...`}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#004b87] focus:outline-none"
            />
          </div>

          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
          >
            <option value="all">Semua Tahun</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Data ke {activeTable}</span>
        </button>
      </div>

      {/* 4. Table Records Content */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#004b87]" />
            <p>Memuat data tabel {activeTable}...</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-3">
            <Database className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">Tidak ada baris data yang cocok dengan pencarian.</p>
            <button
              onClick={() => { setSearchQuery(''); setYearFilter('all'); }}
              className="text-[#004b87] font-semibold hover:underline"
            >
              Reset filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold"># ID</th>
                  <th className="py-3 px-4 font-bold">Tahun</th>
                  <th className="py-3 px-4 font-bold">Judul &amp; Informasi Utama</th>
                  {activeTable === 'p2m_activities' && (
                    <>
                      <th className="py-3 px-4 font-bold">Peran</th>
                      <th className="py-3 px-4 font-bold">Jenis / Status</th>
                      <th className="py-3 px-4 font-bold">Skema &amp; Sumber Dana</th>
                    </>
                  )}
                  {activeTable === 'scopus_publications' && (
                    <>
                      <th className="py-3 px-4 font-bold">Kuartil</th>
                      <th className="py-3 px-4 font-bold">Sitasi</th>
                      <th className="py-3 px-4 font-bold">DOI / Link</th>
                    </>
                  )}
                  {activeTable === 'journals' && (
                    <>
                      <th className="py-3 px-4 font-bold">Nama Jurnal</th>
                      <th className="py-3 px-4 font-bold">Volume / Halaman</th>
                      <th className="py-3 px-4 font-bold">Kategori</th>
                    </>
                  )}
                  {activeTable === 'proceedings' && (
                    <>
                      <th className="py-3 px-4 font-bold">Konferensi</th>
                      <th className="py-3 px-4 font-bold">Lokasi</th>
                      <th className="py-3 px-4 font-bold">Halaman</th>
                    </>
                  )}
                  {activeTable === 'books' && (
                    <>
                      <th className="py-3 px-4 font-bold">Penerbit</th>
                      <th className="py-3 px-4 font-bold">ISBN</th>
                      <th className="py-3 px-4 font-bold">Halaman</th>
                    </>
                  )}
                  {activeTable === 'patents_hki' && (
                    <>
                      <th className="py-3 px-4 font-bold">Jenis HKI</th>
                      <th className="py-3 px-4 font-bold">No. Permohonan</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                    </>
                  )}
                  {activeTable === 'digilib_documents' && (
                    <>
                      <th className="py-3 px-4 font-bold">Mahasiswa / Penulis</th>
                      <th className="py-3 px-4 font-bold">Program Studi &amp; Jenis</th>
                      <th className="py-3 px-4 font-bold">Pembimbing &amp; Repositori</th>
                    </>
                  )}
                  {activeTable === 'teaching_courses' && (
                    <>
                      <th className="py-3 px-4 font-bold">Kode Matkul</th>
                      <th className="py-3 px-4 font-bold">Tingkat &amp; Semester</th>
                      <th className="py-3 px-4 font-bold">Status Perkuliahan</th>
                    </>
                  )}
                  {activeTable === 'research_topics' && (
                    <>
                      <th className="py-3 px-4 font-bold">Konsep Kunci</th>
                      <th className="py-3 px-4 font-bold">Fokus Riset</th>
                      <th className="py-3 px-4 font-bold">Domain</th>
                    </>
                  )}
                  {activeTable === 'research_projects' && (
                    <>
                      <th className="py-3 px-4 font-bold">Periode &amp; Hibah</th>
                      <th className="py-3 px-4 font-bold">Peran Peneliti</th>
                      <th className="py-3 px-4 font-bold">Status Proyek</th>
                    </>
                  )}
                  {activeTable === 'editorial_roles' && (
                    <>
                      <th className="py-3 px-4 font-bold">Peran Editorial</th>
                      <th className="py-3 px-4 font-bold">Penerbit &amp; Indexing</th>
                      <th className="py-3 px-4 font-bold">Periode Masa Tugas</th>
                    </>
                  )}
                  {activeTable === 'press_media' && (
                    <>
                      <th className="py-3 px-4 font-bold">Media Outlet</th>
                      <th className="py-3 px-4 font-bold">Tanggal Liputan</th>
                      <th className="py-3 px-4 font-bold">Kategori Berita</th>
                    </>
                  )}
                  {activeTable === 'blog_posts' && (
                    <>
                      <th className="py-3 px-4 font-bold">Slug URL</th>
                      <th className="py-3 px-4 font-bold">Kategori &amp; Baca</th>
                      <th className="py-3 px-4 font-bold">Status Publikasi</th>
                    </>
                  )}
                  {activeTable === 'academic_profile' && (
                    <>
                      <th className="py-3 px-4 font-bold">Gelar &amp; Jabatan</th>
                      <th className="py-3 px-4 font-bold">Email &amp; Unit</th>
                      <th className="py-3 px-4 font-bold">Minat Penelitian</th>
                    </>
                  )}
                  {activeTable === 'admin_accounts' && (
                    <>
                      <th className="py-3 px-4 font-bold">Nama Lengkap</th>
                      <th className="py-3 px-4 font-bold">Email Akun</th>
                      <th className="py-3 px-4 font-bold">Role Akses</th>
                    </>
                  )}
                  <th className="py-3 px-4 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((row, idx) => (
                  <tr key={row.doc_id ?? row.id ?? idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 font-semibold">
                      {row.doc_id ?? row.id}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {row.tahun}
                    </td>

                    <td className="py-3 px-4 max-w-md">
                      <div className="font-semibold text-slate-900 leading-snug line-clamp-2">
                        {row.judul}
                      </div>
                      {(row.authors || row.penulis || row.inventors) && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          <span className="font-semibold text-slate-400">Penulis:</span> {row.authors || row.penulis || row.inventors}
                        </div>
                      )}
                      {(row.kategori || row.kata_kunci) && (
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block truncate">
                          {row.kategori || row.kata_kunci}
                        </span>
                      )}
                    </td>

                    {/* Table Specific Cells */}
                    {activeTable === 'p2m_activities' && (
                      <>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              row.peran === 'Ketua'
                                ? 'bg-sky-100 text-[#004b87]'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {row.peran}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                row.jenis === 'Penelitian'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {row.jenis}
                            </span>
                            <div className="text-[10px] text-slate-500">{row.status_usulan}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="text-xs text-slate-800 line-clamp-1">{row.skema}</div>
                          <div className="text-[10px] text-slate-500">{row.sumber_dana}</div>
                        </td>
                      </>
                    )}

                    {activeTable === 'scopus_publications' && (
                      <>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="bg-amber-100 text-amber-900 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                            {row.kuartil || 'Scopus'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {row.sitasi ?? 0}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate font-mono text-[11px]">
                          {row.doi ? (
                            <a
                              href={`https://doi.org/${row.doi}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#004b87] hover:underline flex items-center gap-1"
                            >
                              <span>{row.doi}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : row.link_scopus ? (
                            <a
                              href={row.link_scopus}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#004b87] hover:underline flex items-center gap-1"
                            >
                              <span>Lihat Scopus</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </>
                    )}

                    {activeTable === 'journals' && (
                      <>
                        <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                          {row.nama_jurnal}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          Vol. {row.volume || '-'} No. {row.nomor || '-'} ({row.halaman || '-'})
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                          {row.kategori || 'Journal Article'}
                        </td>
                      </>
                    )}

                    {activeTable === 'proceedings' && (
                      <>
                        <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                          {row.nama_konferensi}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-600 whitespace-nowrap">
                          {row.lokasi || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {row.halaman || '-'}
                        </td>
                      </>
                    )}

                    {activeTable === 'books' && (
                      <>
                        <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                          {row.penerbit}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {row.isbn || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {row.jumlah_halaman ? `${row.jumlah_halaman} hlm` : '-'}
                        </td>
                      </>
                    )}

                    {activeTable === 'patents_hki' && (
                      <>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="bg-purple-50 text-purple-800 font-semibold text-[10px] px-2 py-0.5 rounded">
                            {row.jenis}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-900 whitespace-nowrap">
                          {row.nomor_permohonan || '-'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="bg-emerald-50 text-emerald-800 font-medium text-[10px] px-2 py-0.5 rounded">
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}

                    {activeTable === 'digilib_documents' && (
                      <>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-xs">{row.penulis_utama}</div>
                          <div className="font-mono text-[10px] text-slate-500 font-semibold">{row.nim_nip || 'NIM -'}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-medium text-slate-800 text-[11px] block">{row.program_studi || 'Matematika'}</span>
                          <span className="text-[10px] text-[#004b87] font-semibold bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100">{row.jenis_dokumen || 'Skripsi'}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="text-[11px] text-slate-700 truncate font-medium">{row.pembimbing || 'Nughthoh Arfawi Kurdhi, Ph.D.'}</div>
                          {row.detail_url ? (
                            <a
                              href={row.detail_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#004b87] hover:underline text-[10px] font-mono flex items-center gap-1 mt-0.5"
                            >
                              <span>Digilib #{row.doc_id || row.id}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">ID #{row.doc_id || row.id}</span>
                          )}
                        </td>
                      </>
                    )}

                    {activeTable === 'teaching_courses' && (
                      <>
                        <td className="py-3 px-4 font-mono font-bold text-[#004b87] whitespace-nowrap">
                          {row.code || 'MAT-301'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-medium text-slate-800 text-[11px] block">{row.level || 'S1'}</span>
                          <span className="text-[10px] text-slate-500">{row.semester || 'Ganjil'} ({row.academic_year || '2024/2025'})</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {row.is_active ? 'Aktif Diajarkan' : 'Arsip Kurikulum'}
                          </span>
                        </td>
                      </>
                    )}

                    {activeTable === 'research_topics' && (
                      <>
                        <td className="py-3 px-4 max-w-xs font-mono text-[11px] text-slate-600">
                          {row.key_concepts || '-'}
                        </td>
                        <td className="py-3 px-4 max-w-sm text-xs text-slate-700 line-clamp-2">
                          {row.description || '-'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-[10px] font-semibold text-[#004b87]">
                          Riset Unggulan UNS
                        </td>
                      </>
                    )}

                    {activeTable === 'research_projects' && (
                      <>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 text-xs">{row.period || '-'}</div>
                          <div className="text-[10px] text-slate-500">{row.funding_source || row.grant_name || 'UNS'}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="bg-sky-50 text-[#004b87] font-semibold text-[10px] px-2 py-0.5 rounded">
                            {row.role || 'Ketua Peneliti'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="bg-emerald-50 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded">
                            {row.status || 'Active'}
                          </span>
                        </td>
                      </>
                    )}

                    {activeTable === 'editorial_roles' && (
                      <>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="bg-purple-50 text-purple-800 font-bold text-[10px] px-2 py-0.5 rounded">
                            {row.role || 'Editorial Board'}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-700">
                          {row.publisher || '-'} | {row.indexing || 'Scopus'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {row.period || 'Sekarang'}
                        </td>
                      </>
                    )}

                    {activeTable === 'press_media' && (
                      <>
                        <td className="py-3 px-4 font-bold text-slate-900 text-xs whitespace-nowrap">
                          {row.media_outlet || 'Media UNS'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {row.publish_date || '-'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                            {row.category || 'Liputan'}
                          </span>
                        </td>
                      </>
                    )}

                    {activeTable === 'blog_posts' && (
                      <>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                          /{row.slug || 'artikel'}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-600 whitespace-nowrap">
                          {row.category || 'Wawasan Riset'} ({row.read_time || '5m'})
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded">
                            {row.status || 'Published'}
                          </span>
                        </td>
                      </>
                    )}

                    {activeTable === 'academic_profile' && (
                      <>
                        <td className="py-3 px-4 text-xs font-medium text-slate-800">
                          {row.title_with_degrees || row.name}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-600 whitespace-nowrap">
                          {row.email || 'arfa@staff.uns.ac.id'}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-600">
                          {row.research_interests || 'Operations Research'}
                        </td>
                      </>
                    )}

                    {activeTable === 'admin_accounts' && (
                      <>
                        <td className="py-3 px-4 font-bold text-slate-900 text-xs whitespace-nowrap">
                          {row.nama_lengkap || row.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {row.email}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="bg-sky-50 text-[#004b87] font-bold text-[10px] px-2 py-0.5 rounded">
                            {row.role || 'Administrator'}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(row)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/70 transition-colors cursor-pointer"
                          title="Edit baris SQL"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(row)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus baris SQL"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL: CREATE / EDIT SQL ROW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#004b87]" />
                <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                  {editingRow ? `Edit Baris pada ${activeTable}` : `Tambah Baris Baru pada ${activeTable}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              {/* Common: Tahun */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tahun *</label>
                  <input
                    type="number"
                    required
                    min={1990}
                    max={2040}
                    value={formData.tahun || new Date().getFullYear()}
                    onChange={e => setFormData({ ...formData, tahun: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                {activeTable === 'p2m_activities' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Peran *</label>
                    <select
                      value={formData.peran || 'Ketua'}
                      onChange={e => setFormData({ ...formData, peran: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
                    >
                      <option value="Ketua">Ketua</option>
                      <option value="Anggota">Anggota</option>
                    </select>
                  </div>
                )}

                {activeTable === 'scopus_publications' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Kuartil Scopus</label>
                    <select
                      value={formData.kuartil || 'Q1'}
                      onChange={e => setFormData({ ...formData, kuartil: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
                    >
                      <option value="Q1">Q1 (Highest Quartile)</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                      <option value="Non-Q">Non-Q / Terindeks Scopus</option>
                    </select>
                  </div>
                )}

                {activeTable === 'patents_hki' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Jenis Kekayaan Intelektual</label>
                    <select
                      value={formData.jenis || 'Hak Cipta'}
                      onChange={e => setFormData({ ...formData, jenis: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
                    >
                      <option value="Hak Cipta">Hak Cipta</option>
                      <option value="Paten Sederhana">Paten Sederhana</option>
                      <option value="Paten Biasa">Paten Biasa</option>
                      <option value="Desain Industri">Desain Industri</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Judul */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Judul / Karya *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.judul || ''}
                  onChange={e => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Masukkan judul lengkap..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Penulis / Authors / Inventor (for Publications & Patents) */}
              {activeTable !== 'p2m_activities' && activeTable !== 'digilib_documents' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {activeTable === 'patents_hki' ? 'Inventor / Penemu *' : 'Penulis / Authors *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.penulis || formData.authors || formData.inventors || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        penulis: e.target.value,
                        authors: e.target.value,
                        inventors: e.target.value
                      })
                    }
                    placeholder={
                      activeTable === 'patents_hki'
                        ? '0617078501 - Nughthoh Arfawi Kurdhi'
                        : '0617078501 - Nughthoh Arfawi Kurdhi - (Author ke-1) | ...'
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Bisa berupa nama lengkap biasa atau format SQL pipa (<code className="bg-slate-100 px-1 py-0.5 rounded">NIDN - Nama - (Peran) | ...</code>).
                  </span>
                </div>
              )}

              {/* Form Specifics per table */}
              {activeTable === 'p2m_activities' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Jenis Kegiatan *</label>
                      <select
                        value={formData.kategori || 'Penelitian'}
                        onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Penelitian">Penelitian</option>
                        <option value="Pengabdian">Pengabdian</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Status Usulan *</label>
                      <select
                        value={formData.status_usulan || 'Diterima'}
                        onChange={e => setFormData({ ...formData, status_usulan: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Diterima">Diterima</option>
                        <option value="Didanai">Didanai</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Skema Usulan</label>
                    <input
                      type="text"
                      value={formData.skema || ''}
                      onChange={e => setFormData({ ...formData, skema: e.target.value })}
                      placeholder="e.g. HIBAH PENELITI UTAMA (PUT-UNS)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Sumber Dana</label>
                      <input
                        type="text"
                        value={formData.sumber_dana || ''}
                        onChange={e => setFormData({ ...formData, sumber_dana: e.target.value })}
                        placeholder="e.g. Dana Hibah Internal UNS / Kemdiktisaintek"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Kelompok Bidang</label>
                      <input
                        type="text"
                        value={formData.kelompok_bidang || ''}
                        onChange={e => setFormData({ ...formData, kelompok_bidang: e.target.value })}
                        placeholder="e.g. Riset Operasi dan Optimasi"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTable === 'scopus_publications' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Nama Jurnal / Publikasi *</label>
                      <input
                        type="text"
                        required
                        value={formData.nama_jurnal || ''}
                        onChange={e => setFormData({ ...formData, nama_jurnal: e.target.value })}
                        placeholder="e.g. International Journal of Production Economics"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Penerbit (Publisher)</label>
                      <input
                        type="text"
                        value={formData.penerbit || ''}
                        onChange={e => setFormData({ ...formData, penerbit: e.target.value })}
                        placeholder="e.g. Elsevier / Springer / IEEE"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Jumlah Sitasi</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.sitasi ?? 0}
                        onChange={e => setFormData({ ...formData, sitasi: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">DOI</label>
                      <input
                        type="text"
                        value={formData.doi || ''}
                        onChange={e => setFormData({ ...formData, doi: e.target.value })}
                        placeholder="10.1016/j...."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Link Scopus / Artikel URL</label>
                    <input
                      type="url"
                      value={formData.link_scopus || ''}
                      onChange={e => setFormData({ ...formData, link_scopus: e.target.value })}
                      placeholder="https://www.scopus.com/..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Kategori Riset</label>
                    <input
                      type="text"
                      value={formData.kategori || ''}
                      onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                      placeholder="e.g. Operations Research, Supply Chain"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTable === 'journals' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nama Jurnal *</label>
                    <input
                      type="text"
                      required
                      value={formData.nama_jurnal || ''}
                      onChange={e => setFormData({ ...formData, nama_jurnal: e.target.value })}
                      placeholder="e.g. International Journal of Logistics Systems..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Volume</label>
                      <input
                        type="text"
                        value={formData.volume || ''}
                        onChange={e => setFormData({ ...formData, volume: e.target.value })}
                        placeholder="12"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Nomor/Issue</label>
                      <input
                        type="text"
                        value={formData.nomor || ''}
                        onChange={e => setFormData({ ...formData, nomor: e.target.value })}
                        placeholder="2"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Halaman</label>
                      <input
                        type="text"
                        value={formData.halaman || ''}
                        onChange={e => setFormData({ ...formData, halaman: e.target.value })}
                        placeholder="123-145"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">URL Jurnal / DOI</label>
                    <input
                      type="text"
                      value={formData.url || ''}
                      onChange={e => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </>
              )}

              {activeTable === 'proceedings' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nama Konferensi *</label>
                    <input
                      type="text"
                      required
                      value={formData.nama_konferensi || ''}
                      onChange={e => setFormData({ ...formData, nama_konferensi: e.target.value })}
                      placeholder="e.g. AIP Conference Proceedings"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Lokasi</label>
                      <input
                        type="text"
                        value={formData.lokasi || ''}
                        onChange={e => setFormData({ ...formData, lokasi: e.target.value })}
                        placeholder="Surakarta, Indonesia"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Halaman</label>
                      <input
                        type="text"
                        value={formData.halaman || ''}
                        onChange={e => setFormData({ ...formData, halaman: e.target.value })}
                        placeholder="1-8"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Penerbit (Publisher)</label>
                      <input
                        type="text"
                        value={formData.penerbit || ''}
                        onChange={e => setFormData({ ...formData, penerbit: e.target.value })}
                        placeholder="e.g. AIP Publishing / IEEE / IOP"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">URL / Link Makalah</label>
                      <input
                        type="text"
                        value={formData.url || ''}
                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://doi.org/..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTable === 'books' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Penerbit *</label>
                      <input
                        type="text"
                        required
                        value={formData.penerbit || ''}
                        onChange={e => setFormData({ ...formData, penerbit: e.target.value })}
                        placeholder="CV Sintesia / UNS Press"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">ISBN</label>
                      <input
                        type="text"
                        value={formData.isbn || ''}
                        onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                        placeholder="978-623-..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Jumlah Halaman</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.jumlah_halaman || 100}
                      onChange={e => setFormData({ ...formData, jumlah_halaman: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </>
              )}

              {activeTable === 'patents_hki' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Nomor Registrasi / Permohonan</label>
                      <input
                        type="text"
                        value={formData.nomor_permohonan || ''}
                        onChange={e => setFormData({ ...formData, nomor_permohonan: e.target.value })}
                        placeholder="EC00202410291"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Status Pendaftaran</label>
                      <select
                        value={formData.status || 'Terdaftar'}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Terdaftar">Terdaftar</option>
                        <option value="Granted / Bersertifikat">Granted / Bersertifikat</option>
                        <option value="Dalam Proses">Dalam Proses</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Anggota Tim / Afiliasi</label>
                    <input
                      type="text"
                      value={formData.anggota_tim || ''}
                      onChange={e => setFormData({ ...formData, anggota_tim: e.target.value })}
                      placeholder="Universitas Sebelas Maret (UNS)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTable === 'digilib_documents' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Doc ID (Digilib UNS)</label>
                      <input
                        type="number"
                        value={formData.doc_id || ''}
                        onChange={e => setFormData({ ...formData, doc_id: Number(e.target.value) })}
                        placeholder="e.g. 28634"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Nama Mahasiswa (Penulis) *</label>
                      <input
                        type="text"
                        required
                        value={formData.penulis_utama || ''}
                        onChange={e => setFormData({ ...formData, penulis_utama: e.target.value })}
                        placeholder="Nama Mahasiswa Bimbingan..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">NIM Mahasiswa</label>
                      <input
                        type="text"
                        value={formData.nim_nip || ''}
                        onChange={e => setFormData({ ...formData, nim_nip: e.target.value })}
                        placeholder="M0117001"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Jenis Dokumen *</label>
                      <select
                        value={formData.jenis_dokumen || 'Skripsi'}
                        onChange={e => setFormData({ ...formData, jenis_dokumen: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Skripsi">Skripsi (S1)</option>
                        <option value="Tesis">Tesis (S2)</option>
                        <option value="Disertasi">Disertasi (S3)</option>
                        <option value="Laporan Tugas Akhir">Laporan Tugas Akhir</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Program Studi</label>
                      <input
                        type="text"
                        value={formData.program_studi || 'Matematika'}
                        onChange={e => setFormData({ ...formData, program_studi: e.target.value })}
                        placeholder="Matematika / Sains Data"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Fakultas</label>
                      <input
                        type="text"
                        value={formData.fakultas || 'MIPA'}
                        onChange={e => setFormData({ ...formData, fakultas: e.target.value })}
                        placeholder="MIPA"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Dosen Pembimbing</label>
                      <input
                        type="text"
                        value={formData.pembimbing || 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.'}
                        onChange={e => setFormData({ ...formData, pembimbing: e.target.value })}
                        placeholder="Nama Dosen Pembimbing"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Dosen Penguji</label>
                      <input
                        type="text"
                        value={formData.penguji || ''}
                        onChange={e => setFormData({ ...formData, penguji: e.target.value })}
                        placeholder="Nama Dosen Penguji"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Kata Kunci (Keywords)</label>
                      <input
                        type="text"
                        value={formData.kata_kunci || ''}
                        onChange={e => setFormData({ ...formData, kata_kunci: e.target.value })}
                        placeholder="Optimization, Graph Theory, Vehicle Routing..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Tautan URL Digilib UNS</label>
                      <input
                        type="url"
                        value={formData.detail_url || ''}
                        onChange={e => setFormData({ ...formData, detail_url: e.target.value })}
                        placeholder="https://digilib.uns.ac.id/dokumen/detail/..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Catatan Umum / Abstrak Ringkas</label>
                    <textarea
                      rows={2}
                      value={formData.catatan_umum || ''}
                      onChange={e => setFormData({ ...formData, catatan_umum: e.target.value })}
                      placeholder="Ringkasan abstrak atau catatan verifikasi naskah tugas akhir mahasiswa..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTable === 'teaching_courses' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Kode Mata Kuliah *</label>
                      <input
                        type="text"
                        required
                        value={formData.code || ''}
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        placeholder="e.g. MAT-301 / MAT-402"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Nama Mata Kuliah *</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Riset Operasi II / Pemodelan Matematika"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Jenjang Pendidikan</label>
                      <select
                        value={formData.level || 'Undergraduate (S1)'}
                        onChange={e => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Undergraduate (S1)">Sarjana (S1)</option>
                        <option value="Master (S2)">Magister (S2)</option>
                        <option value="Doctoral (S3)">Doktor (S3)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Semester</label>
                      <input
                        type="text"
                        value={formData.semester || 'Ganjil'}
                        onChange={e => setFormData({ ...formData, semester: e.target.value })}
                        placeholder="Ganjil / Genap"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Tahun Akademik</label>
                      <input
                        type="text"
                        value={formData.academic_year || '2024/2025'}
                        onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
                        placeholder="2024/2025"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Deskripsi Silabus</label>
                    <textarea
                      rows={2}
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Capaian pembelajaran dan pokok bahasan perkuliahan..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTable === 'research_topics' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Bidang / Topik Riset Utama *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Operations Research & Supply Chain Optimization"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Konsep Kunci (Key Concepts)</label>
                    <input
                      type="text"
                      value={formData.key_concepts || ''}
                      onChange={e => setFormData({ ...formData, key_concepts: e.target.value })}
                      placeholder="Vehicle Routing Problem, Metaheuristics, Antimagic Graph"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Deskripsi Ruang Lingkup</label>
                    <textarea
                      rows={2}
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Deskripsi metodologis dan arah kajian ilmiah riset ini..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTable === 'research_projects' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Judul Proyek / Hibah Riset *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Model Optimasi Rute Distribusi Menggunakan Hybrid Genetic Algorithm"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Periode Riset</label>
                      <input
                        type="text"
                        value={formData.period || ''}
                        onChange={e => setFormData({ ...formData, period: e.target.value })}
                        placeholder="2024 - 2026"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Sumber Dana</label>
                      <input
                        type="text"
                        value={formData.funding_source || ''}
                        onChange={e => setFormData({ ...formData, funding_source: e.target.value })}
                        placeholder="Kemdiktisaintek RI / LPPM UNS"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Status Proyek</label>
                      <select
                        value={formData.status || 'Ongoing'}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Ongoing">Sedang Berjalan (Ongoing)</option>
                        <option value="Completed">Selesai (Completed)</option>
                        <option value="Submitted">Diusulkan (Submitted)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTable === 'editorial_roles' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Peran Editorial *</label>
                      <input
                        type="text"
                        required
                        value={formData.role || ''}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        placeholder="Editorial Board Member / Reviewer"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Nama Jurnal / Lembaga *</label>
                      <input
                        type="text"
                        required
                        value={formData.venue || ''}
                        onChange={e => setFormData({ ...formData, venue: e.target.value })}
                        placeholder="Journal of Applied Mathematics and Computing"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Penerbit &amp; Indexing</label>
                      <input
                        type="text"
                        value={formData.indexing || ''}
                        onChange={e => setFormData({ ...formData, indexing: e.target.value })}
                        placeholder="Scopus Q2 / SINTA 1"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Masa Tugas</label>
                      <input
                        type="text"
                        value={formData.period || ''}
                        onChange={e => setFormData({ ...formData, period: e.target.value })}
                        placeholder="2022 - Sekarang"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTable === 'press_media' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Nama Media Outlet *</label>
                      <input
                        type="text"
                        required
                        value={formData.media_outlet || ''}
                        onChange={e => setFormData({ ...formData, media_outlet: e.target.value })}
                        placeholder="Humas UNS / Kompas / Solopos"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Kategori Liputan</label>
                      <input
                        type="text"
                        value={formData.category || 'Liputan Penelitian'}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Inovasi Matematika / Prestasi Riset"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tautan URL Berita</label>
                    <input
                      type="url"
                      value={formData.url || ''}
                      onChange={e => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://uns.ac.id/id/uns-research/..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </>
              )}

              {activeTable === 'blog_posts' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Slug URL *</label>
                      <input
                        type="text"
                        required
                        value={formData.slug || ''}
                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="optimasi-jaringan-distribusi-logistik"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Kategori Tulisan</label>
                      <input
                        type="text"
                        value={formData.category || 'Wawasan Riset'}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Wawasan Riset / Catatan Kuliah"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Isi Konten Catatan Akademik</label>
                    <textarea
                      rows={3}
                      value={formData.content || ''}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Tulisan catatan, gagasan akademis, atau pengantar riset..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTable === 'academic_profile' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Gelar Lengkap Dosen *</label>
                      <input
                        type="text"
                        required
                        value={formData.title_with_degrees || ''}
                        onChange={e => setFormData({ ...formData, title_with_degrees: e.target.value })}
                        placeholder="Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Email Resmi Akademik *</label>
                      <input
                        type="email"
                        required
                        value={formData.email || ''}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="arfa@staff.uns.ac.id"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Fokus Bidang Keahlian / Riset</label>
                    <input
                      type="text"
                      value={formData.research_interests || ''}
                      onChange={e => setFormData({ ...formData, research_interests: e.target.value })}
                      placeholder="Operations Research, Graph Theory, Combinatorial Optimization"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTable === 'admin_accounts' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Administrator *</label>
                      <input
                        type="text"
                        required
                        value={formData.nama_lengkap || ''}
                        onChange={e => setFormData({ ...formData, nama_lengkap: e.target.value })}
                        placeholder="Nama Pengelola"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Alamat Email Terverifikasi *</label>
                      <input
                        type="email"
                        required
                        value={formData.email || ''}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@gmail.com / staff@uns.ac.id"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Peran Akses (Role)</label>
                    <input
                      type="text"
                      value={formData.role || 'Administrator Resmi (Staff FMIPA UNS)'}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan ke SQL...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan ke Database SQL</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: CONFIRM DELETE */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">
                  Hapus Baris dari Tabel {activeTable}?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus baris ID <strong>{deleteTarget.doc_id ?? deleteTarget.id}</strong> (<em>"{deleteTarget.judul?.slice(0, 50)}..."</em>)? Data yang dihapus dari basis data SQL tidak dapat dikembalikan.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteRow}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus Permanen</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: PENGATURAN KONEKSI MYSQL & PANDUAN VERCEL */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-sky-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/20 text-sky-300 rounded-xl border border-sky-400/20">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-academic text-lg font-bold text-white">
                    Pengaturan Koneksi MySQL Aiven &amp; Vercel
                  </h3>
                  <p className="text-xs text-sky-200/80">
                    Konfigurasi basis data cloud MySQL live untuk sinkronisasi seluruh 15 tabel portofolio
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Status Indicator */}
              <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                statusInfo?.isConnected
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}>
                {statusInfo?.isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">
                      Status Saat Ini: {statusInfo?.isConnected ? 'Terhubung Penuh (Live MySQL)' : 'Belum Terhubung / Mode Cadangan'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      statusInfo?.isConnected ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {statusInfo?.source === 'mysql_live_connection' ? 'AIVEN CLOUD' : 'LOCAL CACHE'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Host: <code className="bg-white/80 px-1 py-0.5 rounded border font-mono">{statusInfo?.host || configFields.host}</code> |{' '}
                    Port: <code className="bg-white/80 px-1 py-0.5 rounded border font-mono">{statusInfo?.port || configFields.port}</code> |{' '}
                    User: <code className="bg-white/80 px-1 py-0.5 rounded border font-mono">{statusInfo?.user || configFields.user}</code> |{' '}
                    Database: <code className="bg-white/80 px-1 py-0.5 rounded border font-mono">{statusInfo?.databaseName || configFields.database}</code>
                  </p>
                  {statusInfo?.error && (
                    <p className="text-[11px] font-mono text-red-600 bg-red-50 p-2 rounded border border-red-200 mt-1">
                      Detail Galat: {statusInfo.error}
                    </p>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 gap-4">
                <button
                  type="button"
                  onClick={() => setConfigTab('uri')}
                  className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    configTab === 'uri'
                      ? 'border-[#004b87] text-[#004b87]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Format 1: URI / Connection String
                </button>
                <button
                  type="button"
                  onClick={() => setConfigTab('fields')}
                  className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    configTab === 'fields'
                      ? 'border-[#004b87] text-[#004b87]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Format 2: Parameter Terpisah
                </button>
                <button
                  type="button"
                  onClick={() => setConfigTab('guide')}
                  className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    configTab === 'guide'
                      ? 'border-[#004b87] text-[#004b87]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Panduan Vercel (Penting)</span>
                </button>
              </div>

              {/* Tab 1: URI */}
              {configTab === 'uri' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      MySQL Connection URI / JDBC String:
                    </label>
                    <textarea
                      rows={3}
                      value={jdbcUrl}
                      onChange={e => setJdbcUrl(e.target.value)}
                      placeholder="mysql://avnadmin:AVNS_rJ6ZVrNE-zqfjTPFJsh@projekportofolio1-muhammadraihanash-569a.a.aivencloud.com:23220/defaultdb?ssl-mode=REQUIRED"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px] focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Bisa langsung tempelkan string koneksi dari dasbor Aiven Console (Service URI). Sistem akan mengekstrak user, kata sandi, host, port, dan nama database secara otomatis.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Fields */}
              {configTab === 'fields' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-semibold mb-1">Host MySQL *</label>
                      <input
                        type="text"
                        value={configFields.host}
                        onChange={e => setConfigFields({ ...configFields, host: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Port *</label>
                      <input
                        type="number"
                        value={configFields.port}
                        onChange={e => setConfigFields({ ...configFields, port: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Username *</label>
                      <input
                        type="text"
                        value={configFields.user}
                        onChange={e => setConfigFields({ ...configFields, user: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Password MySQL *</label>
                      <input
                        type="password"
                        value={configFields.password}
                        onChange={e => setConfigFields({ ...configFields, password: e.target.value })}
                        placeholder="Masukkan kata sandi database..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Nama Database *</label>
                      <input
                        type="text"
                        value={configFields.database}
                        onChange={e => setConfigFields({ ...configFields, database: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">SSL Mode</label>
                      <select
                        value={configFields.ssl}
                        onChange={e => setConfigFields({ ...configFields, ssl: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono text-[11px]"
                      >
                        <option value="REQUIRED">REQUIRED (Wajib untuk Aiven Cloud)</option>
                        <option value="OFF">OFF (Lokal non-SSL)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Panduan Vercel */}
              {configTab === 'guide' && (
                <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-sky-600" />
                      <span>Cara Mengaktifkan Database MySQL di Vercel:</span>
                    </h4>
                    <p className="text-slate-600 text-[11px]">
                      Jika Anda men-deploy aplikasi ini ke Vercel, pastikan langkah-langkah berikut diikuti agar database tersambung:
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <span className="font-bold text-slate-800 block">Langkah 1: Masukkan Environment Variables di Vercel</span>
                      <p className="text-slate-600">
                        Buka Proyek Anda di <strong>Vercel Dashboard &gt; Settings &gt; Environment Variables</strong>, lalu tambahkan variabel berikut:
                      </p>
                      <div className="grid grid-cols-1 gap-1.5 mt-2 font-mono text-[10px]">
                        {[
                          { key: 'MYSQL_HOST', val: 'projekportofolio1-muhammadraihanash-569a.a.aivencloud.com' },
                          { key: 'MYSQL_PORT', val: '23220' },
                          { key: 'MYSQL_USER', val: 'avnadmin' },
                          { key: 'MYSQL_PASSWORD', val: 'AVNS_rJ6ZVrNE-zqfjTPFJsh' },
                          { key: 'MYSQL_DATABASE', val: 'defaultdb' },
                          { key: 'MYSQL_SSL', val: 'REQUIRED' }
                        ].map(item => (
                          <div key={item.key} className="flex items-center justify-between p-1.5 bg-slate-50 border rounded">
                            <span className="text-sky-700 font-bold">{item.key}:</span>
                            <span className="text-slate-700 truncate max-w-xs">{item.val}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.val, item.key)}
                              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === item.key ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === item.key ? 'Disalin' : 'Salin'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] space-y-1">
                      <span className="font-bold text-amber-900 block">
                        ⚠️ Langkah 2 (PENTING): Lakukan Redeploy di Vercel!
                      </span>
                      <p className="text-amber-800 leading-relaxed">
                        Di Vercel, penambahan environment variable <strong>tidak langsung berefek</strong> ke deployment yang sedang tayang. Anda <strong>WAJIB</strong> membuka menu <strong>Deployments</strong> di Vercel, klik tanda titik tiga (<code>...</code>) pada deployment teratas, lalu pilih <strong>Redeploy</strong> (tanpa centang 'Use existing build cache').
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Result Display */}
              {testResult && (
                <div className={`p-3.5 rounded-lg border flex flex-col gap-1.5 text-xs font-medium ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <span className="font-bold">
                        {testResult.success
                          ? `Status: ${testResult.statusCode || 200} OK (SSL Handshake Terverifikasi)`
                          : `Status: ${testResult.statusCode || 500} [${testResult.errorCode || 'HANDSHAKE_ERROR'}]`}
                      </span>
                    </div>
                    {testResult.latencyMs !== undefined && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-white/80 border border-current font-mono">
                        Latency: {testResult.latencyMs}ms
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed opacity-95">{testResult.message}</p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleTestConnection(false)}
                  disabled={isTestingConfig}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 border border-slate-300 cursor-pointer disabled:opacity-50"
                  title="Uji koneksi dengan parameter formulir di atas"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingConfig ? 'animate-spin' : ''}`} />
                  <span>{isTestingConfig ? 'Menguji...' : 'Uji Form'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestConnection(true)}
                  disabled={isTestingConfig}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 border border-blue-200 cursor-pointer disabled:opacity-50"
                  title="Diagnosa langsung menggunakan kredensial .env backend"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Diagnosa Kredensial .env</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold text-xs hover:bg-white transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={isSavingConfig}
                  className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSavingConfig ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan &amp; Hubungkan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
