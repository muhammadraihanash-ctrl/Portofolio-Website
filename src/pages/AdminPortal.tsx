import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  GraduationCap,
  Layers,
  Award,
  FileText,
  Upload,
  ExternalLink,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  Eye,
  Sliders,
  ShieldAlert,
  X,
  Image as ImageIcon,
  Briefcase,
  Building,
  User,
  Users,
  Newspaper,
  BookMarked,
  Tag,
  Calendar,
  Globe,
  DownloadCloud,
  Archive,
  ArchiveRestore,
  CheckSquare,
  Square,
  UserPlus,
  KeyRound,
  Mail,
  ShieldCheck,
  Rocket,
  Link2,
  Database
} from 'lucide-react';
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
  ResearchInfographic,
  ThesisInfographic,
  AuthorItem,
  EducationEntry,
  WorkHistoryEntry,
  AcademicAppointment,
  AwardEntry,
  ResearchGroupEntry,
  AcademicAchievements,
  ScopusHIndexYearEntry,
  AnnualPerformanceIndexEntry,
  P2MActivity
} from '../types';
import {
  academicService,
  safeStorage,
  DeploymentStatusResponse,
  DeploymentReleaseRecord
} from '../services/academicService';
import { InfographicEditorModal } from '../components/InfographicEditorModal';
import { ResearchInfographicModal } from '../components/ResearchInfographicModal';
import { StudentThesisInfographicModal } from '../components/StudentThesisInfographicModal';
import { ImportPublicationsTab } from '../components/ImportPublicationsTab';
import { SqlDatabaseTab } from '../components/SqlDatabaseTab';

interface AdminPortalProps {
  onBackToPublic: () => void;
  isAdminLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

export type AdminTab =
  | 'home'
  | 'resume'
  | 'teaching'
  | 'students'
  | 'research'
  | 'publications'
  | 'import-publications'
  | 'editorial'
  | 'press'
  | 'blog'
  | 'infographics'
  | 'sql-database';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onBackToPublic,
  isAdminLoggedIn,
  onLoginSuccess,
  onLogout
}) => {
  // Authentication Modes: 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'forgot'>('login');
  const [loginEmail, setLoginEmail] = useState(() => {
    return safeStorage.getItem('kurdhi_last_admin_email') || 'arfa@staff.uns.ac.id';
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Registration State
  const [regNama, setRegNama] = useState('Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('Dosen Pemilik Portofolio (Administrator Utama)');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Password Recovery State (OTP via Active Email)
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessNotice, setForgotSuccessNotice] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('home');
  const [filterQuery, setFilterQuery] = useState('');

  // Toast Notification
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  // Profile photo file input ref
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // CV File input ref
  const cvFileInputRef = useRef<HTMLInputElement | null>(null);
  const [cvUploading, setCvUploading] = useState(false);

  // JSON Database restore file input ref
  const restoreJsonInputRef = useRef<HTMLInputElement | null>(null);
  const [isRestoringDb, setIsRestoringDb] = useState(false);

  const handleRestoreJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsRestoringDb(true);
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || !parsed.profile) {
        showToast('Berkas JSON tidak memiliki struktur database portofolio yang valid.', 'error');
        setIsRestoringDb(false);
        return;
      }
      const ok = await academicService.restoreDatabaseFromFile(parsed);
      setIsRestoringDb(false);
      if (ok) {
        showToast('Seluruh basis data berhasil dipulihkan dari berkas cadangan!');
      } else {
        showToast('Gagal memulihkan database dari berkas.', 'error');
      }
    } catch (err: any) {
      setIsRestoringDb(false);
      showToast('Gagal membaca berkas cadangan JSON: ' + (err.message || 'Format tidak valid'), 'error');
    }
  };

  // Auto sync subscriber
  const [, setSyncTick] = useState(0);
  useEffect(() => {
    const unsub = academicService.subscribe(() => {
      setSyncTick(t => t + 1);
    });
    return () => unsub();
  }, []);

  // Modals state for all CRUD modules
  // 1. Publication Modal
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);

  // 2. Student Modal
  const [editingStudent, setEditingStudent] = useState<GraduateStudent | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentPhotoBase64, setStudentPhotoBase64] = useState<string>('');
  const [studentPhotoUrl, setStudentPhotoUrl] = useState<string>('');
  const [studentInfographicImage, setStudentInfographicImage] = useState<string>('');
  const [studentInfographicUrl, setStudentInfographicUrl] = useState<string>('');
  const [adminInfographicStudent, setAdminInfographicStudent] = useState<GraduateStudent | null>(null);

  // 3. Course Modal
  const [editingCourse, setEditingCourse] = useState<TeachingCourse | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // 4. Research Project Modal
  const [editingProject, setEditingProject] = useState<ResearchProject | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // 5. Research Topic Modal
  const [editingTopic, setEditingTopic] = useState<ResearchTopic | null>(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  // 6. Editorial Role Modal
  const [editingEditorial, setEditingEditorial] = useState<EditorialRole | null>(null);
  const [isEditorialModalOpen, setIsEditorialModalOpen] = useState(false);

  // 7. Press & Media Modal
  const [editingPress, setEditingPress] = useState<PressMediaItem | null>(null);
  const [isPressModalOpen, setIsPressModalOpen] = useState(false);

  // 8. Blog Post Modal
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  // 9. Resume Sub-modals (Education, Work History, Appointment, Award)
  const [editingEducation, setEditingEducation] = useState<EducationEntry | null>(null);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);

  const [editingWork, setEditingWork] = useState<WorkHistoryEntry | null>(null);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);

  const [editingAppointment, setEditingAppointment] = useState<AcademicAppointment | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  const [editingAward, setEditingAward] = useState<AwardEntry | null>(null);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);

  // Research Interests management state in Home tab
  const [newInterestInput, setNewInterestInput] = useState('');

  // Professional Memberships management state in Resume tab
  const [newMembershipInput, setNewMembershipInput] = useState('');

  // Infographic editor target & Hub state
  const [infographicEditorTarget, setInfographicEditorTarget] = useState<Publication | null>(null);
  const [previewInfographicPub, setPreviewInfographicPub] = useState<Publication | null>(null);
  const [infographicsSubTab, setInfographicsSubTab] = useState<'publications' | 'students'>('publications');
  const [infographicsFilterStatus, setInfographicsFilterStatus] = useState<'all' | 'has' | 'none'>('all');
  const [infographicsSearchQuery, setInfographicsSearchQuery] = useState('');
  const [uploadingInfographicTargetId, setUploadingInfographicTargetId] = useState<string | null>(null);

  const handleQuickUploadPubInfographic = async (pub: Publication, file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Pilih berkas gambar yang valid (PNG, JPG, WebP).', 'error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast('Ukuran berkas gambar maksimal 8 MB.', 'error');
      return;
    }
    setUploadingInfographicTargetId(pub.id);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const ok = await academicService.saveInfographic(pub.id, {
        ...(pub.infographicData || {
          publicationId: pub.id,
          status: 'Published',
          title: pub.title,
          authorsText: pub.authors.map(a => a.name).join(', '),
          problemStatement: pub.abstract ? pub.abstract.slice(0, 200) : 'Penelitian matematis terapan.',
          objectives: 'Merumuskan solusi optimal dan model matematika teruji.',
          methodology: ['Formulasi model analitis', 'Algoritma komputasi optimasi'],
          dataAndObject: pub.venue,
          keyFindings: ['Hasil empiris dan konvergensi optimal'],
          conclusions: 'Memberikan kontribusi signifikan pada bidang riset operasi.',
          doiOrSource: pub.doi || pub.venue,
          highlightMetric: { label: 'Optimalitas', value: '100%' },
          theme: 'navy',
          layoutDensity: 'comfortable',
          lastUpdated: new Date().toISOString()
        }),
        customImageUrl: base64,
        customImageBase64: base64,
        status: 'Published'
      });
      setUploadingInfographicTargetId(null);
      if (ok) {
        showToast(`Poster infografik untuk "${pub.title.slice(0, 35)}..." berhasil disimpan ke database SQL!`);
      } else {
        showToast('Gagal mengunggah infografik ke server pusat.', 'error');
      }
    };
    reader.onerror = () => {
      setUploadingInfographicTargetId(null);
      showToast('Gagal membaca berkas gambar.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleQuickUploadStudentInfographic = async (std: GraduateStudent, file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Pilih berkas gambar yang valid (PNG, JPG, WebP).', 'error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast('Ukuran berkas gambar maksimal 8 MB.', 'error');
      return;
    }
    setUploadingInfographicTargetId(std.id);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const currentInfo = std.infographic || {
        studentId: std.id,
        studentName: std.name,
        nim: std.nim,
        degree: std.degree,
        pembimbing: std.pembimbing || 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
        penguji: std.penguji || 'Tim Penguji Jurusan Matematika FMIPA UNS',
        programStudi: std.programStudi || 'Matematika',
        fakultas: std.fakultas || 'FMIPA UNS',
        title: std.thesisTitle || std.researchTopic || 'Skripsi Program Studi Matematika',
        problemStatement: std.thesisAbstract ? std.thesisAbstract.slice(0, 200) : 'Tugas akhir mahasiswa jurusan matematika FMIPA UNS.',
        objectives: 'Penyelesaian model analitis dan algoritma optimasi.',
        methodology: ['Perumusan model matematis', 'Simulasi numerik dan validasi'],
        dataAndObject: 'Data tugas akhir mahasiswa FMIPA UNS.',
        keyFindings: ['Performa komputasi optimal dan tervalidasi'],
        conclusions: 'Kontribusi ilmiah bagi riset operasi dan sains data.',
        highlightMetric: { label: 'Capaian Riset', value: 'Optimal & Tervalidasi' },
        keywords: ['Optimasi', 'Matematika', 'UNS'],
        theme: 'navy' as const,
        status: 'Published' as const,
        lastUpdated: new Date().toISOString()
      };
      const updatedInfo = {
        ...currentInfo,
        customImageUrl: base64,
        customImageBase64: base64,
        lastUpdated: new Date().toISOString()
      };
      const ok = await academicService.saveStudentInfographic(std.id, updatedInfo);
      setUploadingInfographicTargetId(null);
      if (ok) {
        showToast(`Poster infografik skripsi "${std.name}" (${std.nim}) berhasil disimpan ke database SQL!`);
      } else {
        showToast('Gagal mengunggah infografik skripsi.', 'error');
      }
    };
    reader.onerror = () => {
      setUploadingInfographicTargetId(null);
      showToast('Gagal membaca berkas gambar.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Home tab research groups & annual performance state
  const [editingResearchGroup, setEditingResearchGroup] = useState<ResearchGroupEntry | null>(null);
  const [isResearchGroupModalOpen, setIsResearchGroupModalOpen] = useState(false);
  const [annualPerformanceYear, setAnnualPerformanceYear] = useState<number>(2026);
  const [irisEditorCategory, setIrisEditorCategory] = useState<'scopus' | 'jurnal' | 'prosiding' | 'buku' | 'paten' | 'hki' | 'p2m'>('scopus');
  const [editingP2M, setEditingP2M] = useState<P2MActivity | null>(null);
  const [isP2MModalOpen, setIsP2MModalOpen] = useState(false);
  const [p2mModalMode, setP2MModalMode] = useState<'manual' | 'sync_pub'>('manual');
  const [p2mPubSearchQuery, setP2MPubSearchQuery] = useState('');
  const [p2mPubYearFilter, setP2MPubYearFilter] = useState<string>('all');
  const [p2mPubTypeFilter, setP2MPubTypeFilter] = useState<string>('all');
  const [selectedLinkedPub, setSelectedLinkedPub] = useState<Publication | null>(null);
  const [syncToIrisCat, setSyncToIrisCat] = useState<boolean>(true);

  // Controlled form states for P2M modal
  const [p2mFormTitle, setP2MFormTitle] = useState('');
  const [p2mFormYear, setP2MFormYear] = useState<number>(2026);
  const [p2mFormRole, setP2MFormRole] = useState<'Ketua' | 'Anggota'>('Ketua');
  const [p2mFormStatus, setP2MFormStatus] = useState('Diterima');
  const [p2mFormJenis, setP2MFormJenis] = useState<'Penelitian' | 'Pengabdian'>('Penelitian');
  const [p2mFormGroupRiset, setP2MFormGroupRiset] = useState('Optimization and Operations Research');
  const [p2mFormSkema, setP2MFormSkema] = useState('Penelitian Fundamental Reguler (PFR)');
  const [p2mFormDana, setP2MFormDana] = useState('');

  const handleOpenP2MModal = (
    activity?: P2MActivity | null,
    initialMode: 'manual' | 'sync_pub' = 'manual'
  ) => {
    if (activity) {
      setEditingP2M(activity);
      setP2MFormTitle(activity.title || '');
      setP2MFormYear(activity.year || annualPerformanceYear || 2026);
      setP2MFormRole(activity.role || 'Ketua');
      setP2MFormStatus(activity.status || 'Diterima');
      setP2MFormJenis(activity.jenis || 'Penelitian');
      setP2MFormGroupRiset(activity.groupRiset || 'Optimization and Operations Research');
      setP2MFormSkema(activity.skema || 'Penelitian Fundamental Reguler (PFR)');
      setP2MFormDana(activity.dana || '');
      setSyncToIrisCat(activity.syncIrisCategory !== false);
      if (activity.linkedPublicationId) {
        const found = publications.find(p => p.id === activity.linkedPublicationId);
        setSelectedLinkedPub(found || null);
        setP2MModalMode('sync_pub');
      } else {
        setSelectedLinkedPub(null);
        setP2MModalMode(initialMode);
      }
    } else {
      setEditingP2M(null);
      setP2MFormTitle('');
      setP2MFormYear(annualPerformanceYear || 2026);
      setP2MFormRole('Ketua');
      setP2MFormStatus('Diterima');
      setP2MFormJenis('Penelitian');
      setP2MFormGroupRiset('Optimization and Operations Research');
      setP2MFormSkema(initialMode === 'sync_pub' ? 'Publikasi Hasil Riset & Pengabdian' : 'Penelitian Fundamental Reguler (PFR)');
      setP2MFormDana('');
      setSelectedLinkedPub(null);
      setSyncToIrisCat(true);
      setP2MModalMode(initialMode);
    }
    setP2MPubSearchQuery('');
    setP2MPubYearFilter('all');
    setP2MPubTypeFilter('all');
    setIsP2MModalOpen(true);
  };

  const handleSelectPubForP2M = (pub: Publication) => {
    setSelectedLinkedPub(pub);
    setP2MFormTitle(pub.title);
    setP2MFormYear(pub.year);
    const isKurdhiFirst = pub.authors.some(a =>
      (a.name.toLowerCase().includes('kurdhi') || a.name.toLowerCase().includes('nughthoh')) &&
      (a.order === 1 || a.isMainAuthor || a.role === 'First Author' || a.role === 'Corresponding Author')
    );
    setP2MFormRole(isKurdhiFirst ? 'Ketua' : 'Anggota');
    const isService = pub.type?.toLowerCase().includes('community') || pub.type?.toLowerCase().includes('p2m');
    setP2MFormJenis(isService ? 'Pengabdian' : 'Penelitian');
    setP2MFormGroupRiset('Optimization and Operations Research');
    setP2MFormSkema(`Publikasi Hasil Riset & Pengabdian (${pub.type})`);
  };
  const [isLinkPubIrisModalOpen, setIsLinkPubIrisModalOpen] = useState(false);
  const [linkPubSearchQuery, setLinkPubSearchQuery] = useState('');
  const [adminPubTypeFilter, setAdminPubTypeFilter] = useState<string>('all');
  const [adminKurdhiOnly, setAdminKurdhiOnly] = useState<boolean>(false);

  // Publications management states (Batch actions, Archive & Clear All)
  const [selectedPubIds, setSelectedPubIds] = useState<Set<string>>(new Set());
  const [adminPubArchiveFilter, setAdminPubArchiveFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState<boolean>(false);
  const [isBatchActionLoading, setIsBatchActionLoading] = useState<boolean>(false);

  const handleToggleSelectPub = (id: string) => {
    setSelectedPubIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllVisible = (visiblePubs: Publication[]) => {
    if (visiblePubs.length === 0) return;
    const allSelected = visiblePubs.every(p => selectedPubIds.has(p.id));
    setSelectedPubIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        visiblePubs.forEach(p => next.delete(p.id));
      } else {
        visiblePubs.forEach(p => next.add(p.id));
      }
      return next;
    });
  };

  // Central in-app action/delete confirmation modal (eliminates window.confirm blocked by iframes)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const askConfirmation = (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void> | void;
  }) => {
    setConfirmDialog({
      isOpen: true,
      confirmText: options.confirmText || 'Hapus',
      cancelText: options.cancelText || 'Batal',
      isDestructive: options.isDestructive !== false,
      ...options
    });
  };

  const handleDialogConfirm = async () => {
    if (!confirmDialog) return;
    setIsConfirmLoading(true);
    try {
      await confirmDialog.onConfirm();
    } catch (err: any) {
      showToast(err?.message || 'Gagal memproses aksi.', 'error');
    } finally {
      setIsConfirmLoading(false);
      setConfirmDialog(null);
    }
  };

  const handleBatchDelete = () => {
    if (selectedPubIds.size === 0) return;
    const count = selectedPubIds.size;
    askConfirmation({
      title: `Hapus ${count} Publikasi Terpilih`,
      message: `Hapus permanen ${count} publikasi terpilih dari database? Data yang dihapus tidak dapat dikembalikan.`,
      confirmText: `Hapus ${count} Publikasi`,
      isDestructive: true,
      onConfirm: async () => {
        setIsBatchActionLoading(true);
        try {
          const res = await academicService.batchDeletePublications(Array.from(selectedPubIds));
          if (res.success) {
            setSelectedPubIds(new Set());
            showToast(`Berhasil menghapus ${res.count} publikasi terpilih.`);
          } else {
            showToast('Gagal menghapus publikasi terpilih.', 'error');
          }
        } catch (e: any) {
          showToast(e?.message || 'Terjadi kesalahan saat menghapus publikasi.', 'error');
        } finally {
          setIsBatchActionLoading(false);
        }
      }
    });
  };

  const handleBatchArchive = async (shouldArchive: boolean) => {
    if (selectedPubIds.size === 0) return;
    setIsBatchActionLoading(true);
    try {
      const res = await academicService.batchArchivePublications(Array.from(selectedPubIds), shouldArchive);
      if (res.success) {
        setSelectedPubIds(new Set());
        showToast(shouldArchive ? `Berhasil mengarsipkan ${res.count} publikasi (disembunyikan dari web publik).` : `Berhasil membatalkan arsip ${res.count} publikasi (ditampilkan kembali ke publik).`);
      } else {
        showToast('Gagal memperbarui status arsip.', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Terjadi kesalahan saat memperbarui status arsip.', 'error');
    } finally {
      setIsBatchActionLoading(false);
    }
  };

  const handleToggleSingleArchive = async (pub: Publication) => {
    const nextStatus = !pub.isArchived;
    const ok = await academicService.toggleArchivePublication(pub.id, nextStatus);
    if (ok) {
      showToast(nextStatus ? `Publikasi "${pub.title.slice(0, 30)}..." diarsipkan (disembunyikan dari web).` : `Publikasi "${pub.title.slice(0, 30)}..." diaktifkan kembali.`);
    } else {
      showToast('Gagal mengubah status arsip publikasi.', 'error');
    }
  };

  const handleClearAllPublications = () => {
    setIsClearAllModalOpen(false);
    askConfirmation({
      title: 'Hapus Seluruh Publikasi Secara Permanen',
      message: `PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA publikasi (${publications.length} karya) secara permanen? Seluruh data publikasi di database pusat akan dikosongkan.`,
      confirmText: 'Ya, Hapus Semua',
      isDestructive: true,
      onConfirm: async () => {
        setIsBatchActionLoading(true);
        try {
          const res = await academicService.clearAllPublications();
          setSelectedPubIds(new Set());
          if (res.success) {
            showToast(`Seluruh publikasi (${res.count} data) berhasil dihapus.`);
          } else {
            showToast('Gagal mengosongkan arsip publikasi.', 'error');
          }
        } catch (e: any) {
          showToast(e?.message || 'Terjadi kesalahan saat mengosongkan arsip.', 'error');
        } finally {
          setIsBatchActionLoading(false);
        }
      }
    });
  };

  const handleArchiveAllPublications = async (shouldArchive: boolean) => {
    setIsBatchActionLoading(true);
    try {
      const res = await academicService.batchArchivePublications([], shouldArchive, true);
      setIsClearAllModalOpen(false);
      setSelectedPubIds(new Set());
      if (res.success) {
        showToast(shouldArchive ? `Seluruh publikasi (${res.count} data) berhasil diarsipkan.` : `Seluruh publikasi (${res.count} data) berhasil diaktifkan kembali.`);
      } else {
        showToast('Gagal mengubah status arsip publikasi.', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Terjadi kesalahan saat mengubah status arsip.', 'error');
    } finally {
      setIsBatchActionLoading(false);
    }
  };

  const handleResetSeedPublications = () => {
    askConfirmation({
      title: 'Pulihkan Publikasi Bawaan Resmi',
      message: 'Pulihkan data publikasi bawaan resmi (200 publikasi terverifikasi Nughthoh Arfawi Kurdhi)? Data bawaan akan disinkronkan ke database.',
      confirmText: 'Pulihkan Sekarang',
      isDestructive: false,
      onConfirm: async () => {
        setIsBatchActionLoading(true);
        const res = await academicService.resetSeedPublications();
        setIsBatchActionLoading(false);
        setIsClearAllModalOpen(false);
        setSelectedPubIds(new Set());
        if (res.success) {
          showToast(`Berhasil memulihkan ${res.count} publikasi bawaan resmi.`);
        } else {
          showToast('Gagal memulihkan publikasi bawaan.', 'error');
        }
      }
    });
  };

  // Central confirmation dialog state for Admin writes (Requirement 4)
  const [pendingSave, setPendingSave] = useState<{
    action: () => Promise<boolean | any>;
    onSuccess?: () => void;
  } | null>(null);
  const [isSavingInProgress, setIsSavingInProgress] = useState<boolean>(false);

  const confirmAndSave = async (action: () => Promise<boolean | any>, onSuccess?: () => void) => {
    setIsSavingInProgress(true);
    try {
      const res = await action();
      if (res) {
        showToast('Update tersimpan dan website publik telah diperbarui');
        if (onSuccess) onSuccess();
        setPendingSave(null);
      } else {
        showToast('Gagal menyimpan perubahan ke database pusat. Silakan coba kembali.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Terjadi kesalahan saat menyimpan perubahan ke database pusat.', 'error');
    } finally {
      setIsSavingInProgress(false);
    }
  };

  const handleExecuteSave = async () => {
    if (!pendingSave) return;
    await confirmAndSave(pendingSave.action, pendingSave.onSuccess);
  };

  // Deployment Approval & Permanent Release state
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatusResponse | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isDeployHistoryOpen, setIsDeployHistoryOpen] = useState(false);
  const [deployNotes, setDeployNotes] = useState('');
  const [confirmPermanentCheck, setConfirmPermanentCheck] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn) {
      academicService.getDeploymentStatus().then(status => {
        if (status) setDeploymentStatus(status);
      });
    }
  }, [isAdminLoggedIn]);

  const handleTriggerDeployApproval = async () => {
    if (!confirmPermanentCheck) {
      showToast('Wajib mencentang konfirmasi persetujuan rilis permanen.', 'error');
      return;
    }
    setIsDeploying(true);
    try {
      const res = await academicService.requestDeploymentApproval(deployNotes, confirmPermanentCheck);
      setIsDeploying(false);
      if (res.success && res.release) {
        showToast(`✅ Deployment ulang permanen BERHASIL DISETUJUI! Versi: ${res.release.version}`);
        setIsDeployModalOpen(false);
        setDeployNotes('');
        const updated = await academicService.getDeploymentStatus();
        if (updated) setDeploymentStatus(updated);
      } else {
        showToast(res.error || 'Gagal memproses persetujuan deployment.', 'error');
      }
    } catch {
      setIsDeploying(false);
      showToast('Terjadi kesalahan saat memproses deployment.', 'error');
    }
  };

  // Current live state from academicService
  const profile = academicService.getProfile();
  const publications = academicService.getPublications();
  const students = academicService.getStudents();
  const teaching = academicService.getTeaching();
  const researchTopics = academicService.getResearchTopics();
  const researchProjects = academicService.getResearchProjects();
  const editorial = academicService.getEditorial();
  const pressMedia = academicService.getPressMedia();
  const blogPosts = academicService.getBlogPosts(false); // include drafts

  // --- AUTHENTICATION HANDLERS ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const res = await academicService.adminLogin(loginEmail, loginPassword);
    setLoginLoading(false);
    if (res.success) {
      safeStorage.setItem('kurdhi_last_admin_email', loginEmail);
      onLoginSuccess();
      showToast('Selamat datang kembali! Dashboard admin aktif.');
    } else {
      setLoginError(res.error || 'Email atau kata sandi tidak sesuai.');
    }
  };

  const handleGoogleLoginSubmit = async () => {
    setLoginLoading(true);
    setLoginError('');
    const res = await academicService.adminLoginWithGoogle();
    setLoginLoading(false);
    if (res.success) {
      onLoginSuccess();
      showToast('Selamat datang! Login Google via Firebase Auth terverifikasi.');
    } else {
      setLoginError(res.error || 'Gagal login via Google.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regEmail || !regEmail.includes('@')) {
      setRegError('Masukkan alamat email yang valid.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Kata sandi minimal 6 karakter demi keamanan akun.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setRegLoading(true);
    const res = await academicService.adminRegister(regNama, regEmail, regPassword);
    setRegLoading(false);
    if (res.success) {
      safeStorage.setItem('kurdhi_last_admin_email', regEmail);
      onLoginSuccess();
      showToast('Akun pengelola berhasil didaftarkan dan tersimpan permanen di database server!');
    } else {
      setRegError(res.error || 'Pendaftaran akun gagal.');
    }
  };

  const handleForgotRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccessNotice(null);
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Alamat email aktif wajib diisi.');
      return;
    }
    setForgotLoading(true);
    const res = await academicService.forgotPassword(forgotEmail);
    setForgotLoading(false);
    if (res.success) {
      setForgotStep(2);
      setForgotSuccessNotice(
        `Kode autentifikasi 6-digit berhasil dikirimkan ke ${forgotEmail}.${res.debugOtpCode ? ` (Kode Otentikasi: ${res.debugOtpCode})` : ''}`
      );
      if (res.debugOtpCode) {
        setForgotCode(res.debugOtpCode);
      }
    } else {
      setForgotError(res.error || 'Gagal mengirim kode autentifikasi.');
    }
  };

  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotCode || forgotCode.trim().length !== 6) {
      setForgotError('Masukkan 6 digit kode autentifikasi yang dikirimkan.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Konfirmasi kata sandi baru tidak sesuai.');
      return;
    }
    setForgotLoading(true);
    const res = await academicService.resetPassword(forgotEmail, forgotCode.trim(), forgotNewPassword);
    setForgotLoading(false);
    if (res.success) {
      showToast('Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru.');
      setLoginEmail(forgotEmail);
      setLoginPassword('');
      setAuthMode('login');
      setForgotStep(1);
      setForgotCode('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setForgotSuccessNotice(null);
    } else {
      setForgotError(res.error || 'Gagal mereset kata sandi.');
    }
  };

  // If not logged in, render authentication screen
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#004b87] text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-serif-academic text-2xl font-bold text-slate-900">
              Portal Administrasi Akademik
            </h1>
            <p className="text-xs text-slate-500">
              Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D. • FMIPA Universitas Sebelas Maret
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setLoginError('');
                setRegError('');
                setForgotError('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                authMode === 'register'
                  ? 'bg-white text-[#004b87] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError('');
                setRegError('');
                setForgotError('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                authMode === 'login'
                  ? 'bg-white text-[#004b87] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Masuk / Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('forgot');
                setLoginError('');
                setRegError('');
                setForgotError('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                authMode === 'forgot'
                  ? 'bg-white text-[#004b87] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Lupa Password</span>
            </button>
          </div>

          {/* TAB 1: DAFTAR AKUN BARU (REGISTER) */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                <span className="font-semibold text-[#004b87] block mb-0.5">Pendaftaran Akun Pengelola:</span>
                Daftarkan akun admin Anda. Seluruh akun disimpan permanen di basis data pusat server sehingga Anda dapat mengelola portofolio dari berbagai perangkat tanpa kehilangan akses.
              </div>

              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Lengkap &amp; Gelar
                </label>
                <input
                  type="text"
                  required
                  value={regNama}
                  onChange={e => setRegNama(e.target.value)}
                  placeholder="Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Alamat Email Aktif / Institusi
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="arfa@staff.uns.ac.id atau email Anda"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Kata Sandi (min. 6 karakter)
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Konfirmasi Kata Sandi
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-2.5 bg-[#004b87] hover:bg-[#003865] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {regLoading ? (
                  <span>Mendaftarkan akun ke database...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Daftarkan Akun &amp; Buka Dashboard</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-slate-500">
                Sudah memiliki akun pengelola?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-[#004b87] font-semibold hover:underline"
                >
                  Masuk di sini
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MASUK / LOGIN */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs sm:text-sm">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email Terdaftar
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="arfa@staff.uns.ac.id"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setAuthMode('forgot');
                    }}
                    className="text-xs text-[#004b87] hover:underline"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 bg-[#004b87] hover:bg-[#003865] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {loginLoading ? (
                  <span>Memverifikasi akun...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Masuk ke Dashboard Admin</span>
                  </>
                )}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="bg-white px-2 text-slate-400">Atau masuk dengan</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLoginSubmit}
                disabled={loginLoading}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-2.5 shadow-2xs disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Masuk dengan Google (Firebase Auth)</span>
              </button>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Terhubung ke Firebase Cloud Firestore (Data Permanen Aktif)</span>
              </div>

              <div className="text-center pt-2 text-xs text-slate-500">
                Belum memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-[#004b87] font-semibold hover:underline"
                >
                  Daftarkan akun baru
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: LUPA PASSWORD & PEMULIHAN VIA EMAIL DENGAN OTP */}
          {authMode === 'forgot' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <span className="font-semibold block mb-0.5">Pemulihan Akun via Email:</span>
                Masukkan email aktif Anda untuk menerima kode autentifikasi 6-digit pemulihan kata sandi.
              </div>

              {forgotError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccessNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Kode Autentifikasi Terkirim</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{forgotSuccessNotice}</p>
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Alamat Email Terdaftar
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="arfa@staff.uns.ac.id"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 bg-[#004b87] hover:bg-[#003865] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {forgotLoading ? (
                      <span>Mengirimkan kode autentifikasi...</span>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Kirim Kode Autentifikasi ke Email</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Kode Autentifikasi 6-Digit (Email)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={forgotCode}
                      onChange={e => setForgotCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Contoh: 123456"
                      className="w-full px-3 py-2 border-2 border-[#004b87] rounded-lg font-mono text-center tracking-widest text-base font-bold focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Kata Sandi Baru (min. 6)
                      </label>
                      <input
                        type="password"
                        required
                        value={forgotNewPassword}
                        onChange={e => setForgotNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Konfirmasi Sandi Baru
                      </label>
                      <input
                        type="password"
                        required
                        value={forgotConfirmPassword}
                        onChange={e => setForgotConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Kirim Ulang Kode
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 bg-[#004b87] hover:bg-[#003865] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                      {forgotLoading ? (
                        <span>Menyimpan kata sandi baru...</span>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Verifikasi Kode &amp; Simpan Sandi Baru</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center pt-2 text-xs text-slate-500">
                Sudah ingat kata sandi Anda?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-[#004b87] font-semibold hover:underline"
                >
                  Kembali ke Login
                </button>
              </div>
            </div>
          )}

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              onClick={onBackToPublic}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Website Publik</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- PHOTO UPLOAD & MANAGEMENT LOGIC ---
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (PNG, JPEG, WEBP).', 'error');
      return;
    }

    setPhotoUploading(true);
    const uploadedUrl = await academicService.uploadProfilePhoto(file);
    setPhotoUploading(false);

    if (uploadedUrl) {
      showToast('Profile photo successfully updated and saved permanently!');
    } else {
      showToast('Failed to upload photo.', 'error');
    }
  };

  const handleApplyCustomPhotoUrl = async () => {
    if (!customPhotoUrl.trim()) return;
    const ok = await academicService.updateProfile({ photoUrl: customPhotoUrl.trim() });
    if (ok) {
      showToast('Profile photo URL updated permanently!');
      setCustomPhotoUrl('');
    } else {
      showToast('Failed to update photo URL.', 'error');
    }
  };

  const handleLockCurrentPhotoAsPermanent = async () => {
    const ok = await academicService.lockCurrentPhotoAsPermanent();
    if (ok) {
      showToast('Foto profil saat ini berhasil dikunci dan ditetapkan sebagai standar permanen database & web.');
    } else {
      showToast('Gagal menetapkan foto permanen.', 'error');
    }
  };

  const handleResetToOfficialPhoto = async () => {
    askConfirmation({
      title: 'Kembalikan Foto Resmi FMIPA UNS',
      message: 'Kembalikan foto profil ke potret resmi akademik Dr. Nughthoh Arfawi Kurdhi (/nughthoh_photo.webp)? Pengaturan akan disimpan permanen.',
      confirmText: 'Ya, Kembalikan Foto Resmi',
      isDestructive: false,
      onConfirm: async () => {
        const ok = await academicService.updateProfile({
          photoUrl: '/nughthoh_photo.webp',
          photoBase64: undefined
        });
        if (ok) {
          showToast('Foto profil resmi FMIPA UNS berhasil dipulihkan secara permanen.');
        } else {
          showToast('Gagal memulihkan foto resmi.', 'error');
        }
      }
    });
  };

  // --- CV UPLOAD LOGIC ---
  const handleCvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvUploading(true);
    const uploaded = await academicService.uploadManuscriptFile(file);
    setCvUploading(false);

    if (uploaded) {
      await academicService.updateProfile({
        cvPdfUrl: uploaded.fileUrl,
        cvPdfFileName: file.name
      });
      showToast('Custom Curriculum Vitae PDF successfully uploaded!');
    } else {
      showToast('Failed to upload CV document.', 'error');
    }
  };

  // Navigation Items
  const adminNavItems: Array<{ id: AdminTab; label: string; count?: number; icon: any }> = [
    { id: 'home', label: 'Home & Profile', icon: Globe },
    { id: 'resume', label: 'Resume & History', count: profile.education.length + profile.workHistory.length, icon: FileText },
    { id: 'teaching', label: 'Teaching', count: teaching.length, icon: BookOpen },
    { id: 'students', label: 'Graduate Students', count: students.length, icon: GraduationCap },
    { id: 'research', label: 'Current Research', count: researchProjects.length, icon: Layers },
    { id: 'publications', label: 'Publications', count: publications.length, icon: BookMarked },
    { id: 'sql-database', label: 'SQL Database (MySQL)', icon: Database },
    { id: 'import-publications', label: 'Import Publikasi', icon: DownloadCloud },
    { id: 'editorial', label: 'Editorial Roles', count: editorial.length, icon: Award },
    { id: 'press', label: 'Press & Media', count: pressMedia.length, icon: Newspaper },
    { id: 'blog', label: 'Blog & Essays', count: blogPosts.length, icon: Tag },
    { id: 'infographics', label: 'Infographics Studio', icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-semibold transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-800 text-white border border-emerald-700'
              : 'bg-red-800 text-white border border-red-700'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublic}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Public Website</span>
            </button>
            <div className="h-5 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="font-serif-academic text-lg font-bold tracking-tight text-white">
                Faculty Administration
              </span>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-sky-400/30">
                UNS Verified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-sky-400 shrink-0">
                <img
                  src={profile.photoBase64 || profile.photoUrl || '/api/profile/photo'}
                  alt={profile.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.src.includes('/api/profile/photo')) {
                      img.src = '/api/profile/photo';
                    }
                  }}
                />
              </div>
              <span className="font-semibold text-xs text-white">Nughthoh Kurdhi</span>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================= */}
      {/* DEPLOYMENT APPROVAL & PERMANENT RELEASE BANNER */}
      {/* ======================================================= */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {deploymentStatus?.currentRelease?.version || 'v2.5.0'} • RILIS PERMANEN PRODUKSI
            </span>
            <span className="text-slate-300 hidden sm:inline">
              ID Rilis:{' '}
              <span className="font-mono text-sky-300">
                {deploymentStatus?.currentRelease?.releaseId || 'REL-20261012-PROD-V1'}
              </span>
            </span>
            {deploymentStatus?.hasPendingChanges ? (
              <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Pembaruan konten aktif di web • Menunggu persetujuan deployment ulang permanen</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tampilan &amp; Build Produksi Terkunci Permanen</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsDeployHistoryOpen(true)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-[11px] font-medium transition-colors"
            >
              Riwayat Rilis
            </button>
            <button
              type="button"
              onClick={() => setIsDeployModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Persetujuan Deployment Ulang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 shrink-0 space-y-1">
          <div className="p-3 bg-white border border-slate-200 rounded-xl mb-3 shadow-2xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Active Administrator
            </div>
            <div className="font-bold text-xs text-slate-900 truncate">{profile.name}</div>
            <div className="text-[11px] text-slate-500 truncate">{profile.email}</div>
          </div>

          <div className="space-y-1">
            {adminNavItems.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setFilterQuery('');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-[#004b87] text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-sky-900 text-sky-100' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <input
              type="file"
              ref={restoreJsonInputRef}
              onChange={handleRestoreJsonFile}
              accept=".json"
              className="hidden"
            />
            <div className="px-3 py-2 rounded-xl text-[11px] bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="leading-tight font-medium">Pusat Data: Terhubung &amp; Tersimpan Permanen</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => academicService.downloadDatabaseBackup()}
                className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                title="Unduh seluruh database saat ini sebagai cadangan JSON ke perangkat Anda"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-[#004b87]" />
                <span>Unduh Cadangan</span>
              </button>

              <button
                type="button"
                disabled={isRestoringDb}
                onClick={() => restoreJsonInputRef.current?.click()}
                className="px-2 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#004b87] border border-sky-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50 shadow-2xs"
                title="Pulihkan database dari berkas cadangan JSON"
              >
                <Upload className="w-3.5 h-3.5 text-[#004b87]" />
                <span>{isRestoringDb ? 'Memulihkan...' : 'Pulihkan JSON'}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs overflow-x-auto space-y-6">
          {/* ======================================================= */}
          {/* MODULE 1: HOME & PROFILE MANAGEMENT */}
          {/* ======================================================= */}
          {activeTab === 'home' && (
            <div className="space-y-8">
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-academic text-2xl font-bold text-slate-950">
                    Home & Profile Management
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update profile picture, academic bio, affiliations, research interests, and official CV export link.
                  </p>
                </div>
              </div>

              {/* CARD: PUSAT PERSETUJUAN & MANAJEMEN DEPLOYMENT PRODUKSI */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm border border-slate-700 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Rocket className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">
                        Pusat Persetujuan Deployment Ulang Produksi (Permanent Release)
                      </h3>
                      <p className="text-[11px] text-slate-300">
                        Konten tersimpan otomatis di web, namun mintalah persetujuan deployment ini untuk membekukan versi rilis permanen.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setIsDeployHistoryOpen(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-600 transition-colors cursor-pointer"
                    >
                      Riwayat Rilis
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeployModalOpen(true)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>Persetujuan Deployment Ulang</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-[11px] text-slate-400">Versi Rilis Terverifikasi:</div>
                    <div className="font-mono font-bold text-sm text-emerald-400 mt-0.5">
                      {deploymentStatus?.currentRelease?.version || 'v2.5.0'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {deploymentStatus?.currentRelease?.releaseId || 'REL-20261012-PROD-V1'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-[11px] text-slate-400">Disetujui Terakhir Oleh:</div>
                    <div className="font-semibold text-xs text-white truncate mt-0.5">
                      {deploymentStatus?.currentRelease?.approvedBy || 'Administrator Utama UNS'}
                    </div>
                    <div className="text-[10px] text-sky-400 font-mono">
                      {deploymentStatus?.currentRelease?.approvedAt
                        ? new Date(deploymentStatus.currentRelease.approvedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '12 Okt 2026'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-[11px] text-slate-400">Status Sinkronisasi Produksi:</div>
                    <div className="mt-0.5">
                      {deploymentStatus?.hasPendingChanges ? (
                        <span className="inline-flex items-center gap-1 text-amber-300 font-medium text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Pembaruan baru menunggu persetujuan deployment</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Build dan data tersimpan permanen</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      Shared App: ais-pre-pfyleimsq765mq...run.app
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD: PROFILE PHOTO MANAGEMENT (PERMANENT) */}
              <div className="p-5 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#004b87]" />
                    <h3 className="font-bold text-sm text-slate-900">
                      Profile Photo (Displayed in Header & Home Hero)
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Permanent Storage
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Photo Previews */}
                  <div className="md:col-span-4 flex items-center gap-4 justify-center md:justify-start">
                    {/* Square hero preview */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-[#004b87] shadow-sm bg-white shrink-0">
                      <img
                        src={profile.photoBase64 || profile.photoUrl || '/nughthoh_photo.webp'}
                        alt={profile.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (!img.src.includes('/nughthoh_photo.webp') && !img.src.includes('/nughthoh_photo.jpg')) {
                            img.src = '/nughthoh_photo.webp';
                          } else if (!img.src.includes('/nughthoh_photo.jpg')) {
                            img.src = '/nughthoh_photo.jpg';
                          }
                        }}
                      />
                    </div>
                    {/* Circular navbar avatar preview */}
                    <div className="space-y-1 text-center">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#004b87] shadow-xs bg-white mx-auto ring-2 ring-sky-100">
                        <img
                          src={profile.photoBase64 || profile.photoUrl || '/nughthoh_photo.webp'}
                          alt={profile.name}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (!img.src.includes('/nughthoh_photo.webp') && !img.src.includes('/nughthoh_photo.jpg')) {
                              img.src = '/nughthoh_photo.webp';
                            } else if (!img.src.includes('/nughthoh_photo.jpg')) {
                              img.src = '/nughthoh_photo.jpg';
                            }
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Header Avatar</span>
                    </div>
                  </div>

                  {/* Actions & Upload */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <input
                        type="file"
                        ref={photoInputRef}
                        onChange={handlePhotoFileChange}
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={photoUploading}
                        className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{photoUploading ? 'Mengunggah & Menyimpan...' : 'Unggah Foto Baru dari Perangkat'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleLockCurrentPhotoAsPermanent}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Tetapkan foto aktif saat ini sebagai standar permanen"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Tetapkan Sebagai Standar Permanen</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetToOfficialPhoto}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Pulihkan potret resmi dosen FMIPA UNS"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                        <span>Kembalikan Foto Resmi UNS</span>
                      </button>
                    </div>

                    {/* Direct URL input alternative */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customPhotoUrl}
                        onChange={e => setCustomPhotoUrl(e.target.value)}
                        placeholder="Or paste image URL (e.g. https://... or /nughthoh_photo.jpg)"
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004b87]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCustomPhotoUrl}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Apply URL
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Current Active Image: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{profile.photoUrl}</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD: CURRICULUM VITAE CONFIGURATION */}
              <div className="p-5 bg-sky-50/40 border border-sky-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#004b87]" />
                    <h3 className="font-bold text-sm text-slate-900">
                      Curriculum Vitae (CV) Link & Document
                    </h3>
                  </div>
                  <a
                    href={profile.cvPdfUrl || 'https://expert.uns.ac.id/researcher/1091?export=cv'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#004b87] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Test CV Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 font-semibold">
                      Curriculum Vitae Direct Link (UNS Expert Export or Document URL)
                    </label>
                    <input
                      type="text"
                      defaultValue={profile.cvPdfUrl || 'https://expert.uns.ac.id/researcher/1091?export=cv'}
                      onBlur={async e => {
                        const val = e.target.value.trim();
                        if (val && val !== profile.cvPdfUrl) {
                          await academicService.updateProfile({ cvPdfUrl: val });
                          showToast('CV link updated successfully!');
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004b87]"
                    />
                    <span className="text-[11px] text-slate-500">
                      Default authentic UNS expert link: <code>https://expert.uns.ac.id/researcher/1091?export=cv</code>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-700 font-semibold">
                      Upload Custom CV PDF File (Optional)
                    </label>
                    <input
                      type="file"
                      ref={cvFileInputRef}
                      onChange={handleCvFileChange}
                      accept="application/pdf"
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => cvFileInputRef.current?.click()}
                        disabled={cvUploading}
                        className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#004b87]" />
                        <span>{cvUploading ? 'Uploading PDF...' : 'Upload PDF Document'}</span>
                      </button>
                      <span className="text-[11px] text-slate-500 truncate">
                        File: {profile.cvPdfFileName || 'CV_Nughthoh_Arfawi_Kurdhi_UNS.pdf'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FORM: CORE PROFILE INFO & BIO */}
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const updated: Partial<ProfessorProfile> = {
                    name: String(fd.get('name') || '').trim(),
                    titleWithDegrees: String(fd.get('titleWithDegrees') || '').trim(),
                    role: String(fd.get('role') || '').trim(),
                    department: String(fd.get('department') || '').trim(),
                    faculty: String(fd.get('faculty') || '').trim(),
                    institution: String(fd.get('institution') || '').trim(),
                    programStudi: String(fd.get('programStudi') || '').trim(),
                    email: String(fd.get('email') || '').trim(),
                    office: String(fd.get('office') || '').trim(),
                    location: String(fd.get('location') || '').trim(),
                    bioShort: String(fd.get('bioShort') || '').trim(),
                    bio: String(fd.get('bio') || '').trim(),
                    googleScholarUrl: String(fd.get('googleScholarUrl') || '').trim(),
                    scopusUrl: String(fd.get('scopusUrl') || '').trim(),
                    orcidUrl: String(fd.get('orcidUrl') || '').trim(),
                    sintaUrl: String(fd.get('sintaUrl') || '').trim(),
                    researchGateUrl: String(fd.get('researchGateUrl') || '').trim() || undefined,
                    linkedinUrl: String(fd.get('linkedinUrl') || '').trim() || undefined,
                    consultationHours: String(fd.get('consultationHours') || '').trim() || undefined,
                    labLocation: String(fd.get('labLocation') || '').trim() || undefined
                  };
                  confirmAndSave(async () => {
                    return await academicService.updateProfile(updated);
                  });
                }}
                className="space-y-4 text-xs sm:text-sm"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Full Name with Academic Degrees</label>
                    <input
                      name="name"
                      defaultValue={profile.name}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004b87]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Faculty Role / Functional Title</label>
                    <input
                      name="role"
                      defaultValue={profile.role}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004b87]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Department</label>
                    <input
                      name="department"
                      defaultValue={profile.department}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Faculty</label>
                    <input
                      name="faculty"
                      defaultValue={profile.faculty}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Institution</label>
                    <input
                      name="institution"
                      defaultValue={profile.institution}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Email</label>
                    <input
                      name="email"
                      defaultValue={profile.email}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Study Program (Program Studi)</label>
                    <input
                      name="programStudi"
                      defaultValue={profile.programStudi}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Office Room & Location</label>
                    <input
                      name="office"
                      defaultValue={profile.office}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Short Bio (Hero Preview)</label>
                  <input
                    name="bioShort"
                    defaultValue={profile.bioShort}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Academic Biography</label>
                  <textarea
                    name="bio"
                    rows={5}
                    defaultValue={profile.bio}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-sans leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Google Scholar URL</label>
                    <input
                      name="googleScholarUrl"
                      defaultValue={profile.googleScholarUrl}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Scopus Author URL</label>
                    <input
                      name="scopusUrl"
                      defaultValue={profile.scopusUrl}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">ORCID URL</label>
                    <input
                      name="orcidUrl"
                      defaultValue={profile.orcidUrl}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">SINTA ID URL</label>
                    <input
                      name="sintaUrl"
                      defaultValue={profile.sintaUrl}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">ResearchGate Profile URL</label>
                    <input
                      name="researchGateUrl"
                      defaultValue={profile.researchGateUrl || ''}
                      placeholder="https://www.researchgate.net/profile/..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">LinkedIn Profile URL</label>
                    <input
                      name="linkedinUrl"
                      defaultValue={profile.linkedinUrl || ''}
                      placeholder="https://www.linkedin.com/in/..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Consultation Hours</label>
                    <input
                      name="consultationHours"
                      defaultValue={profile.consultationHours || 'Monday & Friday: 08:00 - 15:00 WIB'}
                      placeholder="e.g. Mon & Fri: 08:00 - 15:00 WIB"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Laboratory / Research Room</label>
                    <input
                      name="labLocation"
                      defaultValue={profile.labLocation || 'Lab of Applied Mathematics & Computing, FMIPA'}
                      placeholder="e.g. Lab of Applied Mathematics"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile Information</span>
                  </button>
                </div>
              </form>

              {/* CARD: RESEARCH INTERESTS TAGS */}
              <div className="p-5 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">
                    Research Interests & Specializations
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {profile.researchInterests.length} topics
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.researchInterests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-sky-200 text-[#004b87] font-semibold text-xs rounded-lg shadow-2xs"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          const updated = profile.researchInterests.filter((_, i) => i !== idx);
                          await academicService.updateProfile({ researchInterests: updated });
                          showToast(`Removed "${interest}"`);
                        }}
                        className="text-slate-400 hover:text-red-600 ml-1"
                        title="Remove interest"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1 max-w-md">
                  <input
                    type="text"
                    value={newInterestInput}
                    onChange={e => setNewInterestInput(e.target.value)}
                    placeholder="Add new research interest (e.g. Metaheuristics)"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    onKeyDown={async e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newInterestInput.trim()) {
                          const updated = [...profile.researchInterests, newInterestInput.trim()];
                          await academicService.updateProfile({ researchInterests: updated });
                          setNewInterestInput('');
                          showToast('Added research interest!');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (newInterestInput.trim()) {
                        const updated = [...profile.researchInterests, newInterestInput.trim()];
                        await academicService.updateProfile({ researchInterests: updated });
                        setNewInterestInput('');
                        showToast('Added research interest!');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* ======================================================= */}
              {/* CARD: ACADEMIC ACHIEVEMENTS & RESEARCH METRICS (EDITABLE) */}
              {/* ======================================================= */}
              <div className="p-5 border border-sky-200 rounded-2xl bg-white shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#004b87] uppercase tracking-wider font-mono">
                      Official Performance Metrics (IRIS 1103)
                    </span>
                    <h3 className="font-serif-academic text-base sm:text-lg font-bold text-slate-900">
                      Academic Achievements & Research Metrics
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-mono bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                    Recorded since 2014
                  </span>
                </div>

                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const updatedAchievements: AcademicAchievements = {
                      penelitian: Number(fd.get('penelitian') || 0),
                      p2m: Number(fd.get('p2m') || 0),
                      scopus: Number(fd.get('scopus') || 0),
                      nonScopus: Number(fd.get('nonScopus') || 0),
                      prosiding: Number(fd.get('prosiding') || 0),
                      buku: Number(fd.get('buku') || 0),
                      paten: Number(fd.get('paten') || 0),
                      hki: Number(fd.get('hki') || 0),
                      notes: String(fd.get('notes') || '').trim()
                    };
                    confirmAndSave(async () => {
                      return await academicService.updateAchievements(updatedAchievements);
                    });
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-1">
                      <label className="block text-slate-700 font-bold">Research Projects</label>
                      <input
                        type="number"
                        name="penelitian"
                        defaultValue={profile.achievements.penelitian}
                        min={0}
                        required
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-[#004b87]"
                      />
                      <span className="text-[10px] text-slate-500">Funded / competitive research</span>
                    </div>

                    <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-1">
                      <label className="block text-slate-700 font-bold">Community Service (P2M)</label>
                      <input
                        type="number"
                        name="p2m"
                        defaultValue={profile.achievements.p2m}
                        min={0}
                        required
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-[#004b87]"
                      />
                      <span className="text-[10px] text-slate-500">Outreach & applied service</span>
                    </div>

                    <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-1">
                      <label className="block text-slate-700 font-bold">Scopus Publications</label>
                      <input
                        type="number"
                        name="scopus"
                        defaultValue={profile.achievements.scopus}
                        min={0}
                        required
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-[#004b87]"
                      />
                      <span className="text-[10px] text-slate-500">Indexed journal articles</span>
                    </div>

                    <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-1">
                      <label className="block text-slate-700 font-bold">Peer-Reviewed Journals</label>
                      <input
                        type="number"
                        name="nonScopus"
                        defaultValue={profile.achievements.nonScopus}
                        min={0}
                        required
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-[#004b87]"
                      />
                      <span className="text-[10px] text-slate-500">Accredited national journals</span>
                    </div>

                    <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-1">
                      <label className="block text-slate-700 font-bold">Conference Proceedings</label>
                      <input
                        type="number"
                        name="prosiding"
                        defaultValue={profile.achievements.prosiding}
                        min={0}
                        required
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-[#004b87]"
                      />
                      <span className="text-[10px] text-slate-500">International proceedings</span>
                    </div>

                    <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-1">
                      <label className="block text-slate-700 font-bold">Academic Books</label>
                      <input
                        type="number"
                        name="buku"
                        defaultValue={profile.achievements.buku}
                        min={0}
                        required
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-[#004b87]"
                      />
                      <span className="text-[10px] text-slate-500">Textbooks & monographs</span>
                    </div>

                    <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-1">
                      <label className="block text-slate-700 font-bold">Patents</label>
                      <input
                        type="number"
                        name="paten"
                        defaultValue={profile.achievements.paten}
                        min={0}
                        required
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-[#004b87]"
                      />
                      <span className="text-[10px] text-slate-500">Registered patents</span>
                    </div>

                    <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-1">
                      <label className="block text-slate-700 font-bold">Copyrights (HKI / IPR)</label>
                      <input
                        type="number"
                        name="hki"
                        defaultValue={profile.achievements.hki}
                        min={0}
                        required
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-[#004b87]"
                      />
                      <span className="text-[10px] text-slate-500">Intellectual property rights</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Performance Calculation Notes</label>
                    <input
                      name="notes"
                      defaultValue={profile.achievements.notes}
                      placeholder="e.g. Faculty academic performance records calculated since 2014."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold flex items-center gap-2 shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Achievements & Metrics</span>
                  </button>
                </form>
              </div>

              {/* ======================================================= */}
              {/* CARD: SCOPUS CITATION INDEX & H-INDEX HISTORY (EDITABLE) */}
              {/* ======================================================= */}
              <div className="p-5 border border-sky-200 rounded-2xl bg-white shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#004b87] uppercase tracking-wider font-mono">
                      Citation Metrics Tracking
                    </span>
                    <h3 className="font-serif-academic text-base sm:text-lg font-bold text-slate-900">
                      Scopus Citation Index & H-Index History (2014 – 2026)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    13 Annual Data Points
                  </span>
                </div>

                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const years = Array.from({ length: 13 }, (_, i) => 2014 + i);
                    const updatedHistory: ScopusHIndexYearEntry[] = years.map(y => {
                      const val = fd.get(`hindex_${y}`);
                      return {
                        year: y,
                        hIndex: val !== '' && val !== null ? Number(val) : null
                      };
                    });
                    confirmAndSave(async () => {
                      return await academicService.updateHIndexHistory(updatedHistory);
                    });
                  }}
                  className="space-y-4 text-xs"
                >
                  <p className="text-slate-500 text-xs">
                    Enter the official Scopus H-Index for each year, or leave blank (-) if no index was recorded.
                  </p>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                    {Array.from({ length: 13 }, (_, i) => 2014 + i).map(y => {
                      const currentVal = profile.hIndexHistory.find(h => h.year === y)?.hIndex;
                      return (
                        <div key={y} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                          <span className="font-mono font-bold text-[11px] text-slate-700 block">{y}</span>
                          <input
                            type="number"
                            name={`hindex_${y}`}
                            defaultValue={currentVal !== null && currentVal !== undefined ? currentVal : ''}
                            min={0}
                            placeholder="-"
                            className="w-full text-center px-2 py-1 bg-white border border-slate-300 rounded-md font-mono text-xs font-bold text-[#004b87] focus:ring-1 focus:ring-[#004b87]"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold flex items-center gap-2 shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Scopus H-Index History</span>
                  </button>
                </form>
              </div>

              {/* ======================================================= */}
              {/* CARD: OFFICIAL IRIS1103 PERFORMANCE INDEX & P2M ACTIVITIES MANAGER (EDITABLE) */}
              {/* ======================================================= */}
              <div className="p-5 border-2 border-sky-300 rounded-2xl bg-white shadow-xs space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-sky-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-[#004b87] uppercase tracking-wider font-mono bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-[#004b87]" />
                        Official IRIS1103 Performance Index References Explorer
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Portal Editor
                      </span>
                    </div>
                    <h3 className="font-serif-academic text-base sm:text-lg font-bold text-slate-900">
                      Kelola Indeks Kinerja Tahunan &amp; Referensi Kegiatan P2M
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Kelola rincian resmi data Scopus, usulan P2M (Ketua/Anggota), publikasi ilmiah terhubung, atau kosongkan semua data untuk pengisian manual.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Reset Button */}
                    <button
                      type="button"
                      onClick={() => {
                        askConfirmation({
                          title: 'Kosongkan Semua Data IRIS1103',
                          message: 'Apakah Anda yakin ingin mengosongkan semua data capaian tahunan, aktivitas P2M, dan tautan publikasi IRIS1103? Data akan dimulai bersih (0) untuk pengisian manual sesuai kebutuhan Anda.',
                          confirmText: 'Ya, Kosongkan',
                          isDestructive: true,
                          onConfirm: async () => {
                            const ok = await academicService.resetAllIrisPerformanceData();
                            if (ok) {
                              showToast('Semua data IRIS1103 explorer berhasil dikosongkan untuk input manual.');
                            } else {
                              showToast('Gagal mengosongkan data IRIS1103.', 'error');
                            }
                          }
                        });
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold text-xs border border-rose-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Kosongkan seluruh data capaian tahunan dan P2M agar bisa diinput manual bersih"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Kosongkan Semua Data IRIS1103</span>
                    </button>

                    {/* Auto Sync Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await academicService.autoSyncAnnualPerformanceFromPublications();
                        if (ok) showToast('Berhasil sinkronisasi otomatis indeks kinerja dari data publikasi & P2M terhubung!');
                        else showToast('Gagal sinkronisasi indeks kinerja.', 'error');
                      }}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-[#004b87] text-[#004b87] hover:text-white rounded-lg font-semibold text-xs border border-sky-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                      title="Hitung otomatis angka capaian tahunan dari publikasi dan P2M yang terhubung"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Auto-Hitung dari Data</span>
                    </button>

                    {/* Add P2M Activity Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenP2MModal(null, 'manual')}
                      className="px-3.5 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah Usulan P2M</span>
                    </button>

                    {/* Year Selector */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      <span className="text-xs text-slate-700 font-bold">Pilih Tahun:</span>
                      <select
                        value={annualPerformanceYear}
                        onChange={e => setAnnualPerformanceYear(Number(e.target.value))}
                        className="bg-white px-2 py-0.5 border border-slate-300 rounded font-mono text-xs font-bold text-[#004b87]"
                      >
                        {Array.from({ length: 13 }, (_, i) => 2026 - i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* --- 1. FORM MANUAL ANGKA INDEKS KINERJA TAHUNAN --- */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#004b87]"></span>
                      1. Angka Indeks Capaian Resmi Tahun {annualPerformanceYear} (Manual Entry)
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Nilai kosong (-) menandakan belum ada capaian tercatat.
                    </span>
                  </div>

                  <form
                    key={`perf-form-${annualPerformanceYear}`}
                    onSubmit={async e => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const parseVal = (name: string) => {
                        const v = fd.get(name);
                        return v !== '' && v !== null && !isNaN(Number(v)) ? Number(v) : null;
                      };

                      const yearEntry: AnnualPerformanceIndexEntry = {
                        year: annualPerformanceYear,
                        p2m: parseVal('p2m'),
                        scopus: parseVal('scopus'),
                        jurnal: parseVal('jurnal'),
                        prosiding: parseVal('prosiding'),
                        paten: parseVal('paten'),
                        buku: parseVal('buku'),
                        hki: parseVal('hki')
                      };

                      const existing = [...profile.annualPerformance];
                      const idx = existing.findIndex(p => p.year === annualPerformanceYear);
                      if (idx !== -1) {
                        existing[idx] = yearEntry;
                      } else {
                        existing.push(yearEntry);
                      }
                      existing.sort((a, b) => b.year - a.year);

                      confirmAndSave(
                        async () => {
                          return await academicService.updateAnnualPerformance(existing);
                        },
                        () => showToast(`Capaian indeks resmi tahun ${annualPerformanceYear} berhasil disimpan!`)
                      );
                    }}
                    className="space-y-3 text-xs"
                  >
                    {(() => {
                      const currentYearData = profile.annualPerformance.find(p => p.year === annualPerformanceYear);
                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/80 space-y-1">
                            <label className="block text-slate-800 font-bold truncate">P2M (Community)</label>
                            <input
                              type="number"
                              name="p2m"
                              defaultValue={currentYearData?.p2m !== null && currentYearData?.p2m !== undefined ? currentYearData.p2m : ''}
                              min={0}
                              placeholder="-"
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                            />
                            <span className="text-[10px] text-slate-500 block truncate">Pengabdian &amp; Riset</span>
                          </div>

                          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/80 space-y-1">
                            <label className="block text-slate-800 font-bold truncate">Scopus</label>
                            <input
                              type="number"
                              name="scopus"
                              defaultValue={currentYearData?.scopus !== null && currentYearData?.scopus !== undefined ? currentYearData.scopus : ''}
                              min={0}
                              placeholder="-"
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                            />
                            <span className="text-[10px] text-slate-500 block truncate">Jurnal Terindeks</span>
                          </div>

                          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/80 space-y-1">
                            <label className="block text-slate-800 font-bold truncate">Journals (Jurnal)</label>
                            <input
                              type="number"
                              name="jurnal"
                              defaultValue={currentYearData?.jurnal !== null && currentYearData?.jurnal !== undefined ? currentYearData.jurnal : ''}
                              min={0}
                              placeholder="-"
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                            />
                            <span className="text-[10px] text-slate-500 block truncate">Nasional/Internasional</span>
                          </div>

                          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/80 space-y-1">
                            <label className="block text-slate-800 font-bold truncate">Proceedings</label>
                            <input
                              type="number"
                              name="prosiding"
                              defaultValue={currentYearData?.prosiding !== null && currentYearData?.prosiding !== undefined ? currentYearData.prosiding : ''}
                              min={0}
                              placeholder="-"
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                            />
                            <span className="text-[10px] text-slate-500 block truncate">Prosiding Seminar</span>
                          </div>

                          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/80 space-y-1">
                            <label className="block text-slate-800 font-bold truncate">Patents (Paten)</label>
                            <input
                              type="number"
                              name="paten"
                              defaultValue={currentYearData?.paten !== null && currentYearData?.paten !== undefined ? currentYearData.paten : ''}
                              min={0}
                              placeholder="-"
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                            />
                            <span className="text-[10px] text-slate-500 block truncate">Paten Terdaftar/Granted</span>
                          </div>

                          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/80 space-y-1">
                            <label className="block text-slate-800 font-bold truncate">Books (Buku)</label>
                            <input
                              type="number"
                              name="buku"
                              defaultValue={currentYearData?.buku !== null && currentYearData?.buku !== undefined ? currentYearData.buku : ''}
                              min={0}
                              placeholder="-"
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                            />
                            <span className="text-[10px] text-slate-500 block truncate">Buku / Monograf</span>
                          </div>

                          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/80 space-y-1">
                            <label className="block text-slate-800 font-bold truncate">Copyrights (HKI)</label>
                            <input
                              type="number"
                              name="hki"
                              defaultValue={currentYearData?.hki !== null && currentYearData?.hki !== undefined ? currentYearData.hki : ''}
                              min={0}
                              placeholder="-"
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                            />
                            <span className="text-[10px] text-slate-500 block truncate">Hak Cipta Tercatat</span>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold flex items-center gap-2 shadow-2xs transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Indeks Tahun {annualPerformanceYear}</span>
                      </button>

                      <span className="text-[11px] text-slate-500 font-medium">
                        Capaian tahunan akan langsung diperbarui di bagian publik beranda.
                      </span>
                    </div>
                  </form>
                </div>

                {/* --- 2. DAFTAR USULAN & AKTIVITAS P2M (PENGABDIAN & PENELITIAN) --- */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        2. Aktivitas P2M Resmi (Penelitian &amp; Pengabdian)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Data ini muncul saat pengunjung memilih indikator &quot;Community Service (P2M)&quot; di IRIS1103 Explorer.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                        Total P2M: {(profile.p2mActivities || []).length} kegiatan ({
                          (profile.p2mActivities || []).filter(a => a.year === annualPerformanceYear).length
                        } di {annualPerformanceYear})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenP2MModal(null, 'manual')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-xs flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        title="Tambah usulan P2M secara manual"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Tambah Usulan P2M</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenP2MModal(null, 'sync_pub')}
                        className="px-3 py-1 bg-[#004b87] hover:bg-[#003865] text-white rounded-md font-semibold text-xs flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        title="Pilih publikasi yang sudah ada di database untuk disinkronkan ke usulan P2M"
                      >
                        <RefreshCw className="w-3 h-3 text-sky-200" />
                        <span>🔗 Sinkronkan ke Publikasi</span>
                      </button>
                    </div>
                  </div>

                  {(profile.p2mActivities || []).length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                        <BookMarked className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                          Belum ada aktivitas P2M terdaftar (Data kosong siap diisi manual atau disinkronkan).
                        </div>
                        <p className="text-[11px] text-slate-500 max-w-lg mx-auto">
                          Klik tombol <strong>&quot;+ Tambah Usulan P2M&quot;</strong> untuk memilih antara <strong>input data manual</strong> atau <strong>mensinkronisasi langsung ke karya publikasi yang ada di database</strong>.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenP2MModal(null, 'manual')}
                          className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>+ Input Usulan Manual</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenP2MModal(null, 'sync_pub')}
                          className="px-3.5 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-sky-200" />
                          <span>🔗 Sinkronkan dari Publikasi Database</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {(profile.p2mActivities || [])
                        .filter(a => a.year === annualPerformanceYear || annualPerformanceYear === null)
                        .map(act => (
                          <div
                            key={act.id}
                            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-[#004b87] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-mono font-bold text-xs text-[#004b87] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                  {act.year}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  act.role === 'Ketua'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                  Peran: {act.role}
                                </span>
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                  {act.status}
                                </span>
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium font-mono">
                                  {act.jenis}
                                </span>
                                {act.linkedPublicationId ? (
                                  <span className="bg-sky-50 text-[#004b87] border border-sky-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                    <Link2 className="w-3 h-3 text-[#004b87]" />
                                    <span>Tersinkron Database</span>
                                  </span>
                                ) : (
                                  <span className="bg-slate-50 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                    Manual
                                  </span>
                                )}
                              </div>
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                                {act.title}
                              </h5>
                              <div className="text-[11px] text-slate-500 font-mono flex flex-wrap items-center gap-2">
                                <span>Skema: <strong className="text-slate-700">{act.skema}</strong></span>
                                <span>•</span>
                                <span>Grup: {act.groupRiset}</span>
                                {act.dana && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-700 font-semibold">{act.dana}</span>
                                  </>
                                )}
                              </div>
                              {act.linkedPublicationTitle && (
                                <div className="text-[11px] text-sky-900 bg-sky-50/80 border border-sky-200 px-2 py-1 rounded-md flex items-center gap-1.5 font-sans">
                                  <Link2 className="w-3 h-3 text-[#004b87] shrink-0" />
                                  <span className="font-semibold text-slate-600">Publikasi:</span>
                                  <span className="italic truncate">{act.linkedPublicationTitle}</span>
                                  {act.linkedPublicationVenue && (
                                    <span className="text-slate-500 truncate">({act.linkedPublicationVenue})</span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleOpenP2MModal(act)}
                                className="p-1.5 text-slate-600 hover:text-[#004b87] hover:bg-sky-50 rounded-lg border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Edit Usulan P2M"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  askConfirmation({
                                    title: 'Hapus Usulan P2M',
                                    message: `Hapus usulan P2M "${act.title}"?`,
                                    confirmText: 'Ya, Hapus',
                                    isDestructive: true,
                                    onConfirm: async () => {
                                      const ok = await academicService.deleteP2MActivity(act.id);
                                      if (ok) showToast('Aktivitas P2M berhasil dihapus.');
                                      else showToast('Gagal menghapus aktivitas P2M.', 'error');
                                    }
                                  });
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Hapus Usulan P2M"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Hapus</span>
                              </button>
                            </div>
                          </div>
                        ))}

                      {(profile.p2mActivities || []).filter(a => a.year === annualPerformanceYear).length === 0 &&
                        (profile.p2mActivities || []).length > 0 && (
                          <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                            Tidak ada aktivitas P2M tercatat untuk tahun {annualPerformanceYear}. (Tersedia {(profile.p2mActivities || []).length} kegiatan di tahun lain).
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* --- 3. PUBLIKASI TERHUBUNG KE IRIS 1103 EXPLORER --- */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                        3. Publikasi Terhubung IRIS1103 Tahun {annualPerformanceYear}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Publikasi di bawah ini tercentang &quot;Hubungkan ke IRIS 1103&quot; dan muncul di rincian inquiry publik saat memilih kategori (Scopus, Community Service (P2M), Jurnal, Prosiding, Buku, Paten).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPublication(null);
                          setIsPubModalOpen(true);
                        }}
                        className="px-3 py-1 bg-[#004b87] hover:bg-[#003865] text-white rounded-md font-semibold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Tambah Publikasi Baru</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsLinkPubIrisModalOpen(true)}
                        className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#004b87] rounded-md font-semibold text-xs border border-sky-200 flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Tautkan Publikasi yang Ada</span>
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const connectedPubs = publications.filter(
                      p => p.year === annualPerformanceYear && p.connectToAnnual === true
                    );

                    if (connectedPubs.length === 0) {
                      return (
                        <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
                          <div className="font-semibold text-slate-700 text-xs">
                            Belum ada publikasi terhubung ke IRIS1103 untuk tahun {annualPerformanceYear}.
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Klik &quot;Tautkan Publikasi yang Ada&quot; atau &quot;+ Tambah Publikasi Baru&quot; untuk menghubungkan publikasi ke kategori Scopus, Community Service (P2M), Jurnal, Prosiding, Buku, atau Paten.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {connectedPubs.map(p => (
                          <div
                            key={p.id}
                            className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs hover:border-[#004b87]"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#004b87] font-mono text-xs uppercase bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                  [{p.annualCategory === 'p2m' ? 'P2M / COMMUNITY SERVICE' : p.annualCategory || 'scopus'}]
                                </span>
                                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                  {p.type}
                                </span>
                                {p.doi && (
                                  <span className="text-[10px] text-slate-500 font-mono truncate">
                                    DOI: {p.doi}
                                  </span>
                                )}
                              </div>
                              <h5 className="text-slate-900 font-bold leading-snug line-clamp-1">{p.title}</h5>
                              <p className="text-[11px] text-slate-500 truncate">{p.venue}</p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPublication(p);
                                  setIsPubModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-slate-600 hover:text-[#004b87] hover:bg-sky-50 rounded border border-slate-200 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  confirmAndSave(
                                    async () => academicService.togglePublicationIrisLink(p.id, false),
                                    () => showToast('Publikasi berhasil dilepas dari IRIS1103.')
                                  );
                                }}
                                className="px-2.5 py-1 text-rose-600 hover:text-white hover:bg-rose-600 rounded border border-rose-200 text-[11px] font-semibold transition-colors flex items-center gap-1"
                                title="Lepas tautan dari IRIS1103 (Publikasi tetap ada di menu publications)"
                              >
                                <X className="w-3 h-3" />
                                <span>Lepas Tautan</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ======================================================= */}
              {/* CARD: RESEARCH GROUPS & LABS (EDITABLE) */}
              {/* ======================================================= */}
              <div className="p-5 border border-sky-200 rounded-2xl bg-white shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#004b87] uppercase tracking-wider font-mono">
                      Laboratory & Group Affiliations
                    </span>
                    <h3 className="font-serif-academic text-base sm:text-lg font-bold text-slate-900">
                      Research Groups & Labs (Active & Historical)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingResearchGroup(null);
                      setIsResearchGroupModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Research Group</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {profile.researchGroups.map((rg, idx) => (
                    <div key={rg.id || idx} className="p-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {rg.code}
                          </span>
                          <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                            rg.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {rg.isActive ? 'Current Active' : 'Historical'} ({rg.period})
                          </span>
                        </div>
                        <div className="font-semibold text-xs sm:text-sm text-slate-900">
                          {rg.name}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={async () => {
                            const updated = profile.researchGroups.map((g, i) => i === idx ? { ...g, isActive: !g.isActive } : g);
                            await academicService.updateResearchGroups(updated);
                            showToast(`Toggled status for "${rg.name}"`);
                          }}
                          className={`px-2 py-1 rounded text-[11px] font-medium border ${
                            rg.isActive ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {rg.isActive ? 'Set Inactive' : 'Set Active'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingResearchGroup(rg);
                            setIsResearchGroupModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            askConfirmation({
                              title: 'Hapus Kelompok Riset',
                              message: `Hapus kelompok riset "${rg.name}"?`,
                              confirmText: 'Ya, Hapus',
                              isDestructive: true,
                              onConfirm: async () => {
                                const updated = profile.researchGroups.filter((_, i) => i !== idx);
                                await academicService.updateResearchGroups(updated);
                                showToast('Kelompok riset berhasil dihapus.');
                              }
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Hapus kelompok riset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ======================================================= */}
              {/* CARD: PROFESSIONAL ACADEMIC MEMBERSHIPS (EDITABLE) */}
              {/* ======================================================= */}
              <div className="p-5 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">
                    Professional Academic Memberships & Societies
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {profile.memberships.length} memberships
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.memberships.map((membership, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-sky-200 text-[#004b87] font-semibold text-xs rounded-lg shadow-2xs"
                    >
                      <span>{membership}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          const updated = profile.memberships.filter((_, i) => i !== idx);
                          await academicService.updateProfile({ memberships: updated });
                          showToast(`Removed "${membership}"`);
                        }}
                        className="text-slate-400 hover:text-red-600 ml-1"
                        title="Remove membership"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1 max-w-md">
                  <input
                    type="text"
                    value={newMembershipInput}
                    onChange={e => setNewMembershipInput(e.target.value)}
                    placeholder="Add membership (e.g. Indonesian Mathematical Society)"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    onKeyDown={async e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newMembershipInput.trim()) {
                          const updated = [...profile.memberships, newMembershipInput.trim()];
                          await academicService.updateProfile({ memberships: updated });
                          setNewMembershipInput('');
                          showToast('Added professional membership!');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (newMembershipInput.trim()) {
                        const updated = [...profile.memberships, newMembershipInput.trim()];
                        await academicService.updateProfile({ memberships: updated });
                        setNewMembershipInput('');
                        showToast('Added professional membership!');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MODULE 2: RESUME & EXPERIENCE (EDUCATION, WORK, AWARDS) */}
          {/* ======================================================= */}
          {activeTab === 'resume' && (
            <div className="space-y-8">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="font-serif-academic text-2xl font-bold text-slate-950">
                  Resume, Education & Professional Experience
                </h2>
                <p className="text-xs text-slate-500">
                  Manage academic degrees, doctoral & master dissertations, visiting researcher positions, and awards.
                </p>
              </div>

              {/* 1. Education History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#004b87]" />
                    <span>Education Degrees & University History</span>
                  </h3>
                  <button
                    onClick={() => {
                      setEditingEducation(null);
                      setIsEducationModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Degree</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {profile.education.map((edu, idx) => (
                    <div key={edu.id || idx} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900 text-sm font-sans">{edu.degree}</span>
                          <span className="bg-sky-50 text-[#004b87] font-semibold px-2 py-0.5 rounded font-mono">
                            Year {edu.year}
                          </span>
                          <span className="text-slate-500">• {edu.field}</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700">{edu.institution}</div>
                        {edu.thesisTitle && (
                          <div className="text-xs text-slate-500 italic">Thesis: "{edu.thesisTitle}"</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingEducation(edu);
                            setIsEducationModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            askConfirmation({
                              title: 'Hapus Riwayat Pendidikan',
                              message: `Hapus riwayat pendidikan "${edu.degree}"?`,
                              confirmText: 'Ya, Hapus',
                              isDestructive: true,
                              onConfirm: async () => {
                                const updated = profile.education.filter((_, i) => i !== idx);
                                await academicService.updateProfile({ education: updated });
                                showToast('Riwayat pendidikan berhasil dihapus.');
                              }
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Hapus riwayat pendidikan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Work & Research Experience */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#004b87]" />
                    <span>Work & Research Experience</span>
                  </h3>
                  <button
                    onClick={() => {
                      setEditingWork(null);
                      setIsWorkModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Experience</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {profile.workHistory.map((work, idx) => (
                    <div key={work.id || idx} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900 text-sm font-sans">{work.role}</span>
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded font-mono">
                            {work.period}
                          </span>
                        </div>
                        <div className="text-xs text-[#004b87] font-medium">{work.institution}</div>
                        {work.description && <p className="text-xs text-slate-600">{work.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingWork(work);
                            setIsWorkModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            askConfirmation({
                              title: 'Hapus Riwayat Pengalaman',
                              message: `Hapus pengalaman "${work.role}"?`,
                              confirmText: 'Ya, Hapus',
                              isDestructive: true,
                              onConfirm: async () => {
                                const updated = profile.workHistory.filter((_, i) => i !== idx);
                                await academicService.updateProfile({ workHistory: updated });
                                showToast('Riwayat pengalaman berhasil dihapus.');
                              }
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Hapus riwayat pengalaman"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Academic Appointments */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#004b87]" />
                    <span>Academic Appointments & Responsibilities</span>
                  </h3>
                  <button
                    onClick={() => {
                      setEditingAppointment(null);
                      setIsAppointmentModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Appointment</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {profile.appointments.map((app, idx) => (
                    <div key={app.id || idx} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900 text-sm font-sans">{app.role}</span>
                          <span className="bg-sky-50 text-[#004b87] font-semibold px-2 py-0.5 rounded font-mono">
                            {app.period}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700">{app.department}, {app.institution}</div>
                        {app.description && <p className="text-xs text-slate-600">{app.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingAppointment(app);
                            setIsAppointmentModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            askConfirmation({
                              title: 'Hapus Jabatan Akademik',
                              message: `Hapus jabatan "${app.role}"?`,
                              confirmText: 'Ya, Hapus',
                              isDestructive: true,
                              onConfirm: async () => {
                                const updated = profile.appointments.filter((_, i) => i !== idx);
                                await academicService.updateProfile({ appointments: updated });
                                showToast('Jabatan berhasil dihapus.');
                              }
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Hapus jabatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Professional Memberships */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#004b87]" />
                    <span>Professional Memberships & Scientific Societies</span>
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.memberships.map((mem, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg"
                    >
                      <span>{mem}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          const updated = profile.memberships.filter((_, i) => i !== idx);
                          await academicService.updateProfile({ memberships: updated });
                          showToast(`Removed "${mem}"`);
                        }}
                        className="text-slate-400 hover:text-red-600 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1 max-w-md">
                  <input
                    type="text"
                    value={newMembershipInput}
                    onChange={e => setNewMembershipInput(e.target.value)}
                    placeholder="Add scientific organization (e.g. IEEE, SIAM)"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    onKeyDown={async e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newMembershipInput.trim()) {
                          const updated = [...profile.memberships, newMembershipInput.trim()];
                          await academicService.updateProfile({ memberships: updated });
                          setNewMembershipInput('');
                          showToast('Added membership!');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (newMembershipInput.trim()) {
                        const updated = [...profile.memberships, newMembershipInput.trim()];
                        await academicService.updateProfile({ memberships: updated });
                        setNewMembershipInput('');
                        showToast('Added membership!');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MODULE 3: TEACHING & COURSES */}
          {/* ======================================================= */}
          {activeTab === 'teaching' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-serif-academic text-2xl font-bold text-slate-950">
                    Teaching & Course Management
                  </h2>
                  <p className="text-xs text-slate-500">
                    Create, edit, or remove courses, syllabi, learning outcomes, and SPADA UNS learning links.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setIsCourseModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Course</span>
                </button>
              </div>

              {/* Course Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={e => setFilterQuery(e.target.value)}
                  placeholder="Search course name, code, level..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004b87]"
                />
              </div>

              {/* Course List */}
              <div className="space-y-3">
                {teaching
                  .filter(c => !filterQuery || c.name.toLowerCase().includes(filterQuery.toLowerCase()) || c.code.toLowerCase().includes(filterQuery.toLowerCase()))
                  .map(course => (
                    <div
                      key={course.id}
                      className="p-4 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-[#004b87] bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                            {course.code}
                          </span>
                          <span className="text-slate-600 font-medium">{course.level}</span>
                          <span>•</span>
                          <span className="text-slate-500 font-mono">Semester {course.semester} ({course.academicYear})</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm font-sans">{course.name}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2">{course.description}</p>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => {
                            setEditingCourse(course);
                            setIsCourseModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                          title="Edit course"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            askConfirmation({
                              title: 'Hapus Mata Kuliah',
                              message: `Hapus mata kuliah "${course.name}" (${course.code})?`,
                              confirmText: 'Ya, Hapus',
                              isDestructive: true,
                              onConfirm: async () => {
                                const ok = await academicService.deleteTeaching(course.id);
                                if (ok) showToast('Mata kuliah berhasil dihapus.');
                                else showToast('Gagal menghapus mata kuliah.', 'error');
                              }
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Hapus mata kuliah"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MODULE 4: GRADUATE & UNDERGRADUATE STUDENTS */}
          {/* ======================================================= */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-serif-academic text-2xl font-bold text-slate-950">
                    Graduate & Undergraduate Student Advising
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add and update supervised students, thesis topics, career positions, and graduation statuses.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingStudent(null);
                    setStudentPhotoBase64('');
                    setStudentPhotoUrl('');
                    setStudentInfographicImage('');
                    setStudentInfographicUrl('');
                    setIsStudentModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Student</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={e => setFilterQuery(e.target.value)}
                  placeholder="Search student name, NIM, thesis topic..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004b87]"
                />
              </div>

              {/* Student List */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {students
                  .filter(s => !filterQuery || s.name.toLowerCase().includes(filterQuery.toLowerCase()) || s.nim.toLowerCase().includes(filterQuery.toLowerCase()))
                  .map(std => {
                    const sPhoto = std.photoBase64 || std.photoUrl;
                    const hasInfo = Boolean(std.hasInfographic || std.infographic);

                    return (
                      <div
                        key={std.id}
                        className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5 max-w-2xl">
                          {/* Student Profile Photo Thumbnail */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-sky-200 bg-sky-50 shadow-2xs shrink-0 flex items-center justify-center">
                            {sPhoto ? (
                              <img
                                src={sPhoto}
                                alt={std.name}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#004b87] to-sky-700 text-white flex flex-col items-center justify-center text-center p-0.5">
                                <span className="font-bold text-xs font-serif-academic tracking-wider">
                                  {std.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('')}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-bold text-slate-900 text-sm">{std.name}</span>
                              <span className="font-mono text-slate-500">({std.nim})</span>
                              <span>•</span>
                              <span className="text-slate-600">{std.degree}</span>
                              <span
                                className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                                  std.status === 'Active'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {std.status}
                              </span>

                              {hasInfo ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-[#004b87] border border-sky-200 flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3 text-[#004b87]" />
                                  <span>Poster Infografik SQL</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                                  Belum Ada Poster
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-700">
                              Thesis: "{std.thesisTitle || std.researchTopic}"
                            </p>
                            {std.currentAffiliation && (
                              <p className="text-[11px] text-slate-500">
                                Career: {std.currentAffiliation}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          {/* Infografik Skripsi Poster Action Button */}
                          <button
                            type="button"
                            onClick={() => setAdminInfographicStudent(std)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              hasInfo
                                ? 'bg-sky-50 hover:bg-sky-100 text-[#004b87] border border-sky-200 shadow-2xs'
                                : 'bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#004b87] border border-slate-200'
                            }`}
                            title="Kelola & Upload Gambar Infografik Skripsi (Terkoneksi ke MySQL digilib_documents)"
                          >
                            {hasInfo ? <ImageIcon className="w-3.5 h-3.5 text-[#004b87]" /> : <Upload className="w-3.5 h-3.5 text-slate-500" />}
                            <span className="hidden sm:inline">{hasInfo ? 'Poster Infografik' : 'Upload Poster'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAdminInfographicStudent(std)}
                            className="p-1.5 text-[#004b87] hover:text-sky-900 rounded-lg hover:bg-sky-50"
                            title="Buka Informasi Lengkap Mahasiswa & Poster Infografik"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingStudent(std);
                              setStudentPhotoBase64(std.photoBase64 || '');
                              setStudentPhotoUrl(std.photoUrl || '');
                              setStudentInfographicImage(std.infographic?.customImageBase64 || std.infographic?.customImageUrl || '');
                              setStudentInfographicUrl(std.infographic?.customImageUrl?.startsWith('http') ? std.infographic.customImageUrl : '');
                              setIsStudentModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            title="Edit data mahasiswa, foto, dan infografik"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              askConfirmation({
                                title: 'Hapus Data Mahasiswa',
                                message: `Hapus data mahasiswa bimbingan "${std.name}" (${std.nim})?`,
                                confirmText: 'Ya, Hapus',
                                isDestructive: true,
                                onConfirm: async () => {
                                  const ok = await academicService.deleteStudent(std.id);
                                  if (ok) showToast('Data mahasiswa berhasil dihapus.');
                                  else showToast('Gagal menghapus data mahasiswa.', 'error');
                                }
                              });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Hapus data mahasiswa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MODULE 5: CURRENT RESEARCH & GRANTS */}
          {/* ======================================================= */}
          {activeTab === 'research' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-serif-academic text-2xl font-bold text-slate-950">
                    Current Research Programs & Competitive Grants
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage funded research projects, collaborator networks, and core research topics.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingTopic(null);
                      setIsTopicModalOpen(true);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Research Topic</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingProject(null);
                      setIsProjectModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Funded Project</span>
                  </button>
                </div>
              </div>

              {/* Research Projects */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#004b87]" />
                  <span>Funded Projects & Research Grants</span>
                </h3>

                <div className="space-y-3">
                  {researchProjects.map(proj => (
                    <div key={proj.id} className="p-4 border border-slate-200 rounded-xl bg-white space-y-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900 text-sm">{proj.title}</span>
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{proj.period}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-[#004b87]">{proj.role}</span>
                        </div>
                        <p className="text-xs text-slate-600">{proj.description}</p>
                        <div className="text-[11px] text-slate-500">
                          Funding: <strong>{proj.fundingSource}</strong> | Team: {proj.collaborators.join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => {
                            setEditingProject(proj);
                            setIsProjectModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            askConfirmation({
                              title: 'Hapus Proyek Penelitian',
                              message: `Hapus proyek penelitian "${proj.title}"?`,
                              confirmText: 'Ya, Hapus',
                              isDestructive: true,
                              onConfirm: async () => {
                                const ok = await academicService.deleteResearchProject(proj.id);
                                if (ok) showToast('Proyek penelitian berhasil dihapus.');
                                else showToast('Gagal menghapus proyek penelitian.', 'error');
                              }
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Hapus proyek penelitian"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Focus Topics */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h3 className="font-bold text-sm text-slate-900">
                  Research Specialization Cards
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {researchTopics.map(topic => (
                    <div key={topic.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900">{topic.title}</h4>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingTopic(topic);
                                setIsTopicModalOpen(true);
                              }}
                              className="p-1 text-slate-500 hover:text-slate-900"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                askConfirmation({
                                  title: 'Hapus Topik Riset',
                                  message: `Hapus topik riset "${topic.title}"?`,
                                  confirmText: 'Ya, Hapus',
                                  isDestructive: true,
                                  onConfirm: async () => {
                                    const ok = await academicService.deleteResearchTopic(topic.id);
                                    if (ok) showToast('Topik riset berhasil dihapus.');
                                    else showToast('Gagal menghapus topik riset.', 'error');
                                  }
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                              title="Hapus topik riset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600">{topic.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-2">
                        {topic.keyConcepts.map((c, i) => (
                          <span key={i} className="text-[10px] bg-white border border-sky-200 text-[#004b87] px-2 py-0.5 rounded font-mono">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MODULE 6: PUBLICATIONS MANAGEMENT & INFOGRAPHICS */}
          {/* ======================================================= */}
          {activeTab === 'publications' && (() => {
            const visiblePubs = publications
              .filter(p => {
                if (adminKurdhiOnly) {
                  const isK = p.authors && p.authors.some(a => {
                    const n = (a.name || '').toLowerCase();
                    return n.includes('kurdhi') || n.includes('nughthoh') || n.includes('arfawi');
                  });
                  if (!isK) return false;
                }
                if (adminPubArchiveFilter === 'active' && p.isArchived) return false;
                if (adminPubArchiveFilter === 'archived' && !p.isArchived) return false;
                if (adminPubTypeFilter !== 'all' && p.type !== adminPubTypeFilter) return false;
                if (!filterQuery) return true;
                const q = filterQuery.toLowerCase();
                return (
                  p.title.toLowerCase().includes(q) ||
                  p.venue.toLowerCase().includes(q) ||
                  (p.authors && p.authors.some(a => a.name.toLowerCase().includes(q))) ||
                  (p.doi && p.doi.toLowerCase().includes(q))
                );
              });

            const allVisibleSelected = visiblePubs.length > 0 && visiblePubs.every(p => selectedPubIds.has(p.id));
            const activeCount = publications.filter(p => !p.isArchived).length;
            const archivedCount = publications.filter(p => p.isArchived).length;

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="font-serif-academic text-2xl font-bold text-slate-950">
                      Scientific Publications Archive
                    </h2>
                    <p className="text-xs text-slate-500">
                      Kelola makalah ilmiah, tautkan DOI, hapus data tak penting, arsipkan karya, atau sintesis infografik AI.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdminKurdhiOnly(!adminKurdhiOnly)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                        adminKurdhiOnly
                          ? 'bg-[#004b87] text-white border-[#004b87]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{adminKurdhiOnly ? 'Hanya Karya Kurdhi' : 'Semua Penulis'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        askConfirmation({
                          title: 'Filter Karya Bukan Milik Kurdhi',
                          message: 'Saring publikasi dan bersihkan karya yang bukan ditulis oleh Nughthoh Arfawi Kurdhi? Perubahan akan disimpan permanen ke database pusat.',
                          confirmText: 'Saring Sekarang',
                          isDestructive: false,
                          onConfirm: async () => {
                            const res = await academicService.filterPublicationsByAuthor();
                            if (res.success) {
                              showToast(`Selesai: ${res.count} karya Kurdhi dipertahankan (${res.removed} karya luar dibersihkan).`);
                            } else {
                              showToast('Gagal memfilter karya publikasi.', 'error');
                            }
                          }
                        });
                      }}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Bersihkan karya di luar penulisan Kurdhi"
                    >
                      <Filter className="w-3.5 h-3.5 text-amber-700" />
                      <span>Filter Karya Bukan Milik Kurdhi</span>
                    </button>

                    {/* HAPUS SEMUA & KELOLA ARSIP BUTTON */}
                    <button
                      type="button"
                      onClick={() => setIsClearAllModalOpen(true)}
                      className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="Hapus semua publikasi, kosongkan data, atau arsipkan publikasi tak penting"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Hapus Semua / Kelola Data</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('import-publications')}
                      className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-[#004b87] border border-sky-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="Import Publikasi dari Digilib UNS & Scopus"
                    >
                      <DownloadCloud className="w-3.5 h-3.5 text-[#004b87]" />
                      <span>Import Publikasi</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingPublication(null);
                        setIsPubModalOpen(true);
                      }}
                      className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Publication</span>
                    </button>
                  </div>
                </div>

                {/* Status Tabs & Type Filter */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setAdminPubArchiveFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          adminPubArchiveFilter === 'all'
                            ? 'bg-[#004b87] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        Semua ({publications.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminPubArchiveFilter('active')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          adminPubArchiveFilter === 'active'
                            ? 'bg-[#004b87] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        Aktif ({activeCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminPubArchiveFilter('archived')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          adminPubArchiveFilter === 'archived'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Diarsipkan ({archivedCount})</span>
                      </button>
                    </div>

                    <div className="h-4 w-px bg-slate-300 hidden sm:block" />

                    <div className="flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                      <label className="text-xs text-slate-700 font-semibold">Tipe:</label>
                      <select
                        value={adminPubTypeFilter}
                        onChange={e => setAdminPubTypeFilter(e.target.value)}
                        className="bg-white px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-[#004b87]"
                      >
                        <option value="all">Semua Tipe (6 Kategori)</option>
                        <option value="Scopus Publications">Scopus Publications</option>
                        <option value="Community Service (P2M) & Research">Community Service (P2M) &amp; Research</option>
                        <option value="Journals (Jurnal)">Journals (Jurnal)</option>
                        <option value="Proceedings (Prosiding)">Proceedings (Prosiding)</option>
                        <option value="Books (Buku)">Books (Buku)</option>
                        <option value="Patents & Copyrights (Paten & HKI)">Patents &amp; Copyrights (Paten &amp; HKI)</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 font-medium px-2">
                    {visiblePubs.length} publikasi ditampilkan
                  </div>
                </div>

                {/* Publications Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={e => setFilterQuery(e.target.value)}
                    placeholder="Cari judul artikel, nama penulis, nama jurnal, atau DOI..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004b87]"
                  />
                  {filterQuery && (
                    <button
                      onClick={() => setFilterQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* BATCH ACTION BAR (Shown when items are selected or available to select) */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectAllVisible(visiblePubs)}
                      className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-[#004b87] transition-colors"
                    >
                      {allVisibleSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#004b87]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span>
                        {allVisibleSelected
                          ? 'Batalkan Pilih Semua'
                          : `Pilih Semua (${visiblePubs.length} item)`}
                      </span>
                    </button>

                    {selectedPubIds.size > 0 && (
                      <span className="bg-[#004b87] text-white px-2 py-0.5 rounded-full font-bold text-[11px]">
                        {selectedPubIds.size} terpilih
                      </span>
                    )}
                  </div>

                  {selectedPubIds.size > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isBatchActionLoading}
                        onClick={() => handleBatchArchive(true)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="Sembunyikan karya terpilih dari web publik tanpa menghapus"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Arsipkan Terpilih ({selectedPubIds.size})</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBatchActionLoading}
                        onClick={() => handleBatchArchive(false)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="Tampilkan kembali karya terpilih ke web publik"
                      >
                        <ArchiveRestore className="w-3.5 h-3.5" />
                        <span>Batal Arsip ({selectedPubIds.size})</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBatchActionLoading}
                        onClick={handleBatchDelete}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="Hapus permanen karya terpilih dari basis data"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Terpilih ({selectedPubIds.size})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPubIds(new Set())}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic text-[11px]">
                      Centang kotak pada publikasi untuk melakukan tindakan massal (Hapus atau Arsip).
                    </div>
                  )}
                </div>

                {/* Publications List */}
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                  {visiblePubs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 space-y-2">
                      <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold">Tidak ada publikasi yang sesuai filter.</p>
                      <p className="text-xs text-slate-400">
                        Ubah kata kunci pencarian atau ganti filter status di atas.
                      </p>
                    </div>
                  ) : (
                    visiblePubs.map(pub => {
                      const isSelected = selectedPubIds.has(pub.id);
                      return (
                        <div
                          key={pub.id}
                          className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            pub.isArchived
                              ? 'bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500'
                              : isSelected
                              ? 'bg-sky-50/60 hover:bg-sky-50/80 border-l-4 border-l-[#004b87]'
                              : 'hover:bg-slate-50/70 border-l-4 border-l-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-3 max-w-2xl">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectPub(pub.id)}
                              className="mt-1 rounded border-slate-300 text-[#004b87] focus:ring-[#004b87] w-4 h-4 cursor-pointer shrink-0"
                              title="Pilih publikasi"
                            />

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs flex-wrap">
                                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                  {pub.year}
                                </span>
                                <span className="text-slate-600 font-medium">{pub.type}</span>
                                <span className="text-slate-300">•</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    pub.status === 'Published'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {pub.status}
                                </span>

                                {pub.isArchived ? (
                                  <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                    <Archive className="w-2.5 h-2.5 text-amber-700" />
                                    <span>Diarsipkan (Disembunyikan dari Publik)</span>
                                  </span>
                                ) : (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                    Aktif di Web
                                  </span>
                                )}

                                {pub.hasInfographic && (
                                  <span className="bg-sky-50 text-[#004b87] border border-sky-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 text-sky-600" />
                                    <span>Infographic Active</span>
                                  </span>
                                )}
                              </div>

                              <h3 className="font-semibold text-slate-900 text-sm">{pub.title}</h3>

                              <div className="text-xs text-slate-600 line-clamp-1">
                                {pub.authors.map(a => a.name).join(', ')} —{' '}
                                <em className="text-slate-500">{pub.venue}</em>
                              </div>

                              {pub.doi && (
                                <div className="text-[11px] text-slate-400 font-mono">
                                  DOI: {pub.doi}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                            {/* Infographic button */}
                            <button
                              onClick={() => setInfographicEditorTarget(pub)}
                              className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#004b87] border border-sky-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              title="Generate or edit infographic"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                              <span>{pub.hasInfographic ? 'Edit Infographic' : 'Create Infographic'}</span>
                            </button>

                            {/* Archive / Unarchive single toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleSingleArchive(pub)}
                              className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-xs font-medium ${
                                pub.isArchived
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              }`}
                              title={
                                pub.isArchived
                                  ? 'Kembalikan publikasi ke website publik'
                                  : 'Arsipkan publikasi (sembunyikan dari website publik)'
                              }
                            >
                              {pub.isArchived ? (
                                <>
                                  <ArchiveRestore className="w-4 h-4 text-emerald-600" />
                                  <span className="hidden sm:inline">Batal Arsip</span>
                                </>
                              ) : (
                                <>
                                  <Archive className="w-4 h-4 text-amber-700" />
                                  <span className="hidden sm:inline">Arsipkan</span>
                                </>
                              )}
                            </button>

                            {/* Edit button */}
                            <button
                              onClick={() => {
                                setEditingPublication(pub);
                                setIsPubModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200"
                              title="Edit metadata publikasi"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete single button */}
                            <button
                              type="button"
                              onClick={() => {
                                askConfirmation({
                                  title: 'Hapus Publikasi Permanen',
                                  message: `Hapus permanen publikasi "${pub.title}" dari database? Data yang dihapus tidak dapat dikembalikan.`,
                                  confirmText: 'Ya, Hapus Permanen',
                                  isDestructive: true,
                                  onConfirm: async () => {
                                    const ok = await academicService.deletePublication(pub.id);
                                    if (ok) {
                                      setSelectedPubIds(prev => {
                                        const next = new Set(prev);
                                        next.delete(pub.id);
                                        return next;
                                      });
                                      showToast('Publikasi berhasil dihapus dari database.');
                                    } else {
                                      showToast('Gagal menghapus publikasi.', 'error');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 cursor-pointer"
                              title="Hapus permanen publikasi ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}

          {/* ======================================================= */}
          {/* MODULE 7: EDITORIAL ROLES */}
          {/* ======================================================= */}
          {activeTab === 'editorial' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-serif-academic text-2xl font-bold text-slate-950">
                    Editorial Board & Peer Review Roles
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage journals, peer reviewer responsibilities, and advisory board appointments.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingEditorial(null);
                    setIsEditorialModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Editorial Role</span>
                </button>
              </div>

              <div className="space-y-3">
                {editorial.map(ed => (
                  <div key={ed.id} className="p-4 border border-slate-200 rounded-xl bg-white space-y-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 text-sm">{ed.role}</span>
                        <span className="font-mono text-slate-500">{ed.period}</span>
                        {ed.indexing && <span className="bg-sky-50 text-[#004b87] px-2 py-0.5 rounded font-mono text-[10px]">{ed.indexing}</span>}
                      </div>
                      <div className="text-xs italic text-slate-700">{ed.venue} {ed.publisher ? `(${ed.publisher})` : ''}</div>
                      {ed.description && <p className="text-xs text-slate-600">{ed.description}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => {
                          setEditingEditorial(ed);
                          setIsEditorialModalOpen(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          askConfirmation({
                            title: 'Hapus Peran Editorial',
                            message: `Hapus peran editorial "${ed.role} - ${ed.venue}"?`,
                            confirmText: 'Ya, Hapus',
                            isDestructive: true,
                            onConfirm: async () => {
                              const ok = await academicService.deleteEditorial(ed.id);
                              if (ok) showToast('Peran editorial berhasil dihapus.');
                              else showToast('Gagal menghapus peran editorial.', 'error');
                            }
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Hapus peran editorial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MODULE 8: PRESS & MEDIA COVERAGE */}
          {/* ======================================================= */}
          {activeTab === 'press' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-serif-academic text-2xl font-bold text-slate-950">
                    Press, Media & Public Coverage
                  </h2>
                  <p className="text-xs text-slate-500">
                    Document interviews, university articles, media features, and public outreach.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingPress(null);
                    setIsPressModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Media Item</span>
                </button>
              </div>

              <div className="space-y-3">
                {pressMedia.map(item => (
                  <div key={item.id} className="p-4 border border-slate-200 rounded-xl bg-white space-y-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{item.mediaOutlet}</span>
                        <span>{item.publishDate}</span>
                        <span className="text-[#004b87] font-sans font-medium">• {item.category}</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{item.summary}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => {
                          setEditingPress(item);
                          setIsPressModalOpen(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          askConfirmation({
                            title: 'Hapus Liputan Media',
                            message: `Hapus liputan media "${item.title}"?`,
                            confirmText: 'Ya, Hapus',
                            isDestructive: true,
                            onConfirm: async () => {
                              const ok = await academicService.deletePressMedia(item.id);
                              if (ok) showToast('Liputan media berhasil dihapus.');
                              else showToast('Gagal menghapus liputan media.', 'error');
                            }
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Hapus liputan media"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MODULE 9: BLOG & ESSAYS */}
          {/* ======================================================= */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-serif-academic text-2xl font-bold text-slate-950">
                    Academic Blog & Essay Management
                  </h2>
                  <p className="text-xs text-slate-500">
                    Write, edit, and publish essays on mathematical modeling, operations research, and pedagogy.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingBlog(null);
                    setIsBlogModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write New Blog Post</span>
                </button>
              </div>

              <div className="space-y-3">
                {blogPosts.map(post => (
                  <div key={post.id} className="p-4 border border-slate-200 rounded-xl bg-white space-y-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span>{post.publishedAt}</span>
                        <span className={`px-2 py-0.2 rounded font-sans font-bold text-[10px] ${
                          post.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {post.status}
                        </span>
                        <span>• {post.readTime}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{post.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{post.excerpt}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => {
                          setEditingBlog(post);
                          setIsBlogModalOpen(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          askConfirmation({
                            title: 'Hapus Artikel Blog',
                            message: `Hapus artikel blog "${post.title}"?`,
                            confirmText: 'Ya, Hapus',
                            isDestructive: true,
                            onConfirm: async () => {
                              const ok = await academicService.deleteBlogPost(post.id);
                              if (ok) showToast('Artikel blog berhasil dihapus.');
                              else showToast('Gagal menghapus artikel blog.', 'error');
                            }
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Hapus artikel blog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 10: PUSAT UPLOAD & MANAJEMEN INFOGRAFIK RESMI (SQL) */}
          {/* ======================================================= */}
          {activeTab === 'infographics' && (() => {
            const pubWithInfoCount = publications.filter(
              p => p.hasInfographic || p.infographicImageUrl || p.infographicData?.customImageUrl || p.infographicData?.customImageBase64
            ).length;
            const studentWithInfoCount = students.filter(
              s => s.hasInfographic || s.infographic?.customImageUrl || s.infographic?.customImageBase64
            ).length;

            const filteredPubs = publications.filter(p => {
              const hasInfo = Boolean(
                p.hasInfographic || p.infographicImageUrl || p.infographicData?.customImageUrl || p.infographicData?.customImageBase64
              );
              if (infographicsFilterStatus === 'has' && !hasInfo) return false;
              if (infographicsFilterStatus === 'none' && hasInfo) return false;
              if (!infographicsSearchQuery.trim()) return true;
              const q = infographicsSearchQuery.toLowerCase();
              return (
                p.title.toLowerCase().includes(q) ||
                (p.venue || '').toLowerCase().includes(q) ||
                (p.doi || '').toLowerCase().includes(q) ||
                (p.authors || []).some(a => a.name.toLowerCase().includes(q))
              );
            });

            const filteredStudents = students.filter(s => {
              const hasInfo = Boolean(
                s.hasInfographic || s.infographic?.customImageUrl || s.infographic?.customImageBase64
              );
              if (infographicsFilterStatus === 'has' && !hasInfo) return false;
              if (infographicsFilterStatus === 'none' && hasInfo) return false;
              if (!infographicsSearchQuery.trim()) return true;
              const q = infographicsSearchQuery.toLowerCase();
              return (
                s.name.toLowerCase().includes(q) ||
                s.nim.toLowerCase().includes(q) ||
                (s.thesisTitle || '').toLowerCase().includes(q) ||
                (s.researchTopic || '').toLowerCase().includes(q) ||
                (s.degree || '').toLowerCase().includes(q)
              );
            });

            return (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif-academic text-2xl font-bold text-slate-950 flex items-center gap-2.5">
                      <ImageIcon className="w-6 h-6 text-[#004b87]" />
                      <span>Pusat Manajemen &amp; Upload Infografik Resmi</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Unggah dan kelola desain poster infografik riset dosen dan skripsi mahasiswa. Terkoneksi langsung ke database pusat SQL (tabel kegiatan_p2m &amp; digilib_documents).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Database SQL: Live Sync Aktif</span>
                  </div>
                </div>

                {/* Sub-tab Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInfographicsSubTab('publications')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        infographicsSubTab === 'publications'
                          ? 'bg-[#004b87] text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>1. Publikasi Riset Dosen</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        infographicsSubTab === 'publications'
                          ? 'bg-sky-400/25 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {pubWithInfoCount}/{publications.length} Ada Poster
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInfographicsSubTab('students')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        infographicsSubTab === 'students'
                          ? 'bg-[#004b87] text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>2. Skripsi Mahasiswa (digilib_documents)</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        infographicsSubTab === 'students'
                          ? 'bg-sky-400/25 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {studentWithInfoCount}/{students.length} Ada Poster
                      </span>
                    </button>
                  </div>
                </div>

                {/* Search & Status Filter Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={infographicsSearchQuery}
                      onChange={e => setInfographicsSearchQuery(e.target.value)}
                      placeholder={
                        infographicsSubTab === 'publications'
                          ? 'Cari judul karya publikasi, nama penulis, jurnal, DOI...'
                          : 'Cari nama mahasiswa, NIM, judul skripsi...'
                      }
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Filter Status:</span>
                    <select
                      value={infographicsFilterStatus}
                      onChange={e => setInfographicsFilterStatus(e.target.value as any)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#004b87]"
                    >
                      <option value="all">Semua Data</option>
                      <option value="has">Sudah Ada Poster Infografik</option>
                      <option value="none">Belum Ada Infografik</option>
                    </select>
                  </div>
                </div>

                {/* SubTab 1: Publikasi Riset Dosen */}
                {infographicsSubTab === 'publications' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-500 font-medium">
                      Menampilkan <strong>{filteredPubs.length}</strong> karya publikasi ilmiah:
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredPubs.map(pub => {
                        const imagePoster =
                          pub.infographicImageUrl ||
                          pub.infographicImageBase64 ||
                          pub.infographicData?.customImageUrl ||
                          pub.infographicData?.customImageBase64 ||
                          '';
                        const hasInfographic = Boolean(pub.hasInfographic || imagePoster);
                        const isUploadingThis = uploadingInfographicTargetId === pub.id;

                        return (
                          <div
                            key={pub.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                              hasInfographic
                                ? 'bg-white border-emerald-300 shadow-2xs'
                                : 'bg-slate-50/60 border-slate-200'
                            }`}
                          >
                            <div className="space-y-2">
                              {/* Top Bar Badges */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-sky-50 text-[#004b87] border border-sky-200">
                                    {pub.year}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 truncate max-w-[140px]">
                                    {pub.type}
                                  </span>
                                </div>

                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                                    hasInfographic
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {hasInfographic ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Poster Tersedia</span>
                                    </>
                                  ) : (
                                    <span>Belum Ada Poster</span>
                                  )}
                                </span>
                              </div>

                              {/* Title & Venue */}
                              <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                                {pub.title}
                              </h3>

                              <div className="text-[11px] text-slate-500 font-mono truncate">
                                {pub.venue} {pub.doi ? `• DOI: ${pub.doi}` : ''}
                              </div>

                              {/* Thumbnail preview if poster exists */}
                              {imagePoster && (
                                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="w-16 h-16 rounded overflow-hidden border border-slate-200 bg-white shrink-0 flex items-center justify-center">
                                    <img
                                      src={imagePoster}
                                      alt="Thumbnail"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="text-xs space-y-0.5">
                                    <span className="font-bold text-slate-800 text-[11px] block">
                                      Desain Poster Resmi
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono block">
                                      Tersimpan di database &amp; dapat dilihat publik
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                              {/* Quick Upload Button */}
                              <label
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                  hasInfographic
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                    : 'bg-[#004b87] hover:bg-[#003865] text-white'
                                }`}
                              >
                                {isUploadingThis ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menyimpan ke SQL...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>{hasInfographic ? 'Ganti Poster' : 'Upload Poster (PNG/JPG)'}</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={isUploadingThis}
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) handleQuickUploadPubInfographic(pub, file);
                                  }}
                                  className="hidden"
                                />
                              </label>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setInfographicEditorTarget(pub)}
                                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                  title="Buka form editor detail infografik"
                                >
                                  <Edit2 className="w-3 h-3 text-slate-500" />
                                  <span>Editor Rinci</span>
                                </button>

                                {hasInfographic && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (pub.infographicData) {
                                          setPreviewInfographicPub(pub);
                                        } else {
                                          setInfographicEditorTarget(pub);
                                        }
                                      }}
                                      className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#004b87] border border-sky-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                      title="Pratinjau infografik"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Lihat</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        askConfirmation({
                                          title: 'Hapus Infografik Publikasi',
                                          message: `Hapus poster dan data infografik untuk karya "${pub.title}"? Perubahan akan disimpan permanen ke database SQL.`,
                                          confirmText: 'Ya, Hapus Infografik',
                                          isDestructive: true,
                                          onConfirm: async () => {
                                            const ok = await academicService.deleteInfographic(pub.id);
                                            if (ok) {
                                              showToast('Infografik publikasi berhasil dihapus dari database.');
                                            } else {
                                              showToast('Gagal menghapus infografik.', 'error');
                                            }
                                          }
                                        });
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Hapus infografik ini"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SubTab 2: Skripsi Mahasiswa */}
                {infographicsSubTab === 'students' && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-500 font-medium">
                      Menampilkan <strong>{filteredStudents.length}</strong> mahasiswa skripsi (tabel <code>digilib_documents</code>):
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredStudents.map(std => {
                        const imagePoster = std.infographic?.customImageUrl || std.infographic?.customImageBase64 || '';
                        const hasInfographic = Boolean(std.hasInfographic || imagePoster);
                        const isUploadingThis = uploadingInfographicTargetId === std.id;

                        return (
                          <div
                            key={std.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                              hasInfographic
                                ? 'bg-white border-emerald-300 shadow-2xs'
                                : 'bg-slate-50/60 border-slate-200'
                            }`}
                          >
                            <div className="space-y-2">
                              {/* Top Bar Badges */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#004b87] text-white">
                                    {std.nim}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                    {std.degree}
                                  </span>
                                </div>

                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                                    hasInfographic
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {hasInfographic ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Poster Skripsi Aktif</span>
                                    </>
                                  ) : (
                                    <span>Belum Ada Poster</span>
                                  )}
                                </span>
                              </div>

                              {/* Student Name & Thesis Title */}
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">{std.name}</h4>
                                <p className="text-xs text-slate-700 font-serif-academic italic leading-snug line-clamp-2 mt-0.5">
                                  "{std.thesisTitle || std.researchTopic || 'Skripsi Jurusan Matematika FMIPA UNS'}"
                                </p>
                              </div>

                              <div className="text-[11px] text-slate-500">
                                Pembimbing: <strong>{std.pembimbing || 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.'}</strong>
                              </div>

                              {/* Thumbnail preview if poster exists */}
                              {imagePoster && (
                                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="w-16 h-16 rounded overflow-hidden border border-slate-200 bg-white shrink-0 flex items-center justify-center">
                                    <img
                                      src={imagePoster}
                                      alt="Thumbnail Skripsi"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="text-xs space-y-0.5">
                                    <span className="font-bold text-slate-800 text-[11px] block">
                                      Poster Infografik Skripsi
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono block">
                                      Tersimpan di tabel digilib_documents
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                              {/* Quick Upload Button */}
                              <label
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                  hasInfographic
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                    : 'bg-[#004b87] hover:bg-[#003865] text-white'
                                }`}
                              >
                                {isUploadingThis ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menyimpan ke SQL...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>{hasInfographic ? 'Ganti Poster' : 'Upload Poster Skripsi'}</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={isUploadingThis}
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) handleQuickUploadStudentInfographic(std, file);
                                  }}
                                  className="hidden"
                                />
                              </label>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setAdminInfographicStudent(std)}
                                  className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#004b87] border border-sky-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                  title="Buka modal infografik skripsi"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Kelola Infografik</span>
                                </button>

                                {hasInfographic && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      askConfirmation({
                                        title: 'Hapus Infografik Skripsi',
                                        message: `Hapus infografik skripsi mahasiswa "${std.name}" (${std.nim})? Perubahan akan disimpan permanen ke database SQL.`,
                                        confirmText: 'Ya, Hapus Infografik',
                                        isDestructive: true,
                                        onConfirm: async () => {
                                          const ok = await academicService.deleteStudentInfographic(std.id);
                                          if (ok) {
                                            showToast('Infografik skripsi berhasil dihapus dari database.');
                                          } else {
                                            showToast('Gagal menghapus infografik skripsi.', 'error');
                                          }
                                        }
                                      });
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus infografik skripsi ini"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ======================================================= */}
          {/* TAB: IMPORT PUBLIKASI DARI SINTA & DIGILIB UNS */}
          {/* ======================================================= */}
          {activeTab === 'import-publications' && (
            <ImportPublicationsTab
              showToast={showToast}
              onImportComplete={() => academicService.syncFromBackend()}
            />
          )}

          {/* ======================================================= */}
          {/* TAB: PUSAT BASIS DATA SQL (MYSQL 6 TABEL RESMI) */}
          {/* ======================================================= */}
          {activeTab === 'sql-database' && (
            <SqlDatabaseTab
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* ======================================================= */}
      {/* MODAL 0: HAPUS SEMUA & KELOLA ARSIP PUBLIKASI */}
      {/* ======================================================= */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 my-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                    Hapus Semua &amp; Bersihkan Arsip Publikasi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih opsi pembersihan data arsip publikasi ilmiah ({publications.length} karya saat ini tersimpan):
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Option 1: Hapus Semua Permanen */}
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-red-950 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span>Hapus Seluruh Publikasi Secara Permanen</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Menghapus seluruh {publications.length} data publikasi dari database. Publikasi yang tidak penting akan dibersihkan total.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isBatchActionLoading || publications.length === 0}
                  onClick={handleClearAllPublications}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-semibold shrink-0 transition-colors shadow-2xs"
                >
                  {isBatchActionLoading ? 'Memproses...' : 'Hapus Semua'}
                </button>
              </div>

              {/* Option 2: Arsipkan Semua */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Archive className="w-4 h-4 text-amber-700" />
                    <span>Arsipkan Seluruh Publikasi</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Sembunyikan semua karya aktif ({publications.filter(p => !p.isArchived).length} karya) dari website publik tanpa menghapus datanya.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isBatchActionLoading || publications.length === 0}
                  onClick={() => handleArchiveAllPublications(true)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-semibold shrink-0 transition-colors shadow-2xs"
                >
                  Arsipkan Semua
                </button>
              </div>

              {/* Option 3: Pulihkan Data Bawaan */}
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-[#004b87] flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-[#004b87]" />
                    <span>Pulihkan Publikasi Bawaan Resmi (200 Karya)</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Mengembalikan 200 arsip publikasi resmi terverifikasi Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isBatchActionLoading}
                  onClick={handleResetSeedPublications}
                  className="px-3.5 py-2 bg-[#004b87] hover:bg-[#003865] disabled:opacity-50 text-white rounded-lg font-semibold shrink-0 transition-colors shadow-2xs"
                >
                  Pulihkan Bawaan
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 1: PUBLICATION FORM (CREATE / EDIT) */}
      {/* ======================================================= */}
      {isPubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                {editingPublication ? 'Edit Publication' : 'Add New Publication'}
              </h3>
              <button
                onClick={() => {
                  setIsPubModalOpen(false);
                  setEditingPublication(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const title = String(fd.get('title') || '').trim();
                const venue = String(fd.get('venue') || '').trim();
                const year = Number(fd.get('year')) || new Date().getFullYear();
                const category = String(fd.get('category') || 'Optimization & Operations Research').trim();
                const type = String(fd.get('type') || 'Journal Article') as any;
                const status = String(fd.get('status') || 'Published') as any;
                const doi = String(fd.get('doi') || '').trim();
                const volume = String(fd.get('volume') || '').trim();
                const issue = String(fd.get('issue') || '').trim();
                const pages = String(fd.get('pages') || '').trim();
                const abstract = String(fd.get('abstract') || '').trim();
                const keywordsStr = String(fd.get('keywords') || '').trim();
                const isFeatured = fd.get('isFeatured') === 'on';
                const connectToAnnual = fd.get('connectToAnnual') === 'on';
                const annualCategory = (String(fd.get('annualCategory') || 'scopus')) as any;

                const rawAuthors = String(fd.get('authors') || '').split('\n').filter(Boolean);
                const parsedAuthors: AuthorItem[] = rawAuthors.map((line, idx) => {
                  const parts = line.split('|').map(s => s.trim());
                  const name = parts[0] || 'Author';
                  const isStudent = parts[1]?.toLowerCase().includes('student');
                  const isMain = idx === 0 || name.toLowerCase().includes('kurdhi');
                  return {
                    name,
                    isMainAuthor: isMain,
                    isStudent,
                    order: idx + 1,
                    affiliation: 'Universitas Sebelas Maret'
                  };
                });

                if (parsedAuthors.length === 0) {
                  parsedAuthors.push({
                    name: 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
                    isMainAuthor: true,
                    order: 1,
                    affiliation: 'Universitas Sebelas Maret'
                  });
                }

                const payload = {
                  title,
                  venue,
                  year,
                  category,
                  type,
                  status,
                  doi,
                  volume,
                  issue,
                  pages,
                  abstract,
                  keywords: keywordsStr.split(',').map(s => s.trim()).filter(Boolean),
                  authors: parsedAuthors,
                  isFeatured,
                  connectToAnnual,
                  annualCategory
                };

                if (editingPublication) {
                  confirmAndSave(
                    async () => {
                      return await academicService.updatePublication(editingPublication.id, payload);
                    },
                    () => setIsPubModalOpen(false)
                  );
                } else {
                  confirmAndSave(
                    async () => {
                      return await academicService.createPublication(payload);
                    },
                    () => setIsPubModalOpen(false)
                  );
                }
              }}
              className="space-y-4 text-xs sm:text-sm"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Paper Title</label>
                <input
                  name="title"
                  defaultValue={editingPublication?.title || ''}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004b87]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Authors (One author per line. Add "| student" for student co-authors)
                </label>
                <textarea
                  name="authors"
                  rows={3}
                  defaultValue={
                    editingPublication
                      ? editingPublication.authors.map(a => `${a.name}${a.isStudent ? ' | student' : ''}`).join('\n')
                      : 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.\nStudent Name | student'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Venue (Journal / Conference)</label>
                  <input
                    name="venue"
                    defaultValue={editingPublication?.venue || ''}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Year</label>
                  <input
                    name="year"
                    type="number"
                    defaultValue={editingPublication?.year || new Date().getFullYear()}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Type</label>
                  <select
                    name="type"
                    defaultValue={editingPublication?.type || 'Scopus Publications'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Scopus Publications">Scopus Publications</option>
                    <option value="Community Service (P2M) & Research">Community Service (P2M) & Research</option>
                    <option value="Journals (Jurnal)">Journals (Jurnal)</option>
                    <option value="Proceedings (Prosiding)">Proceedings (Prosiding)</option>
                    <option value="Books (Buku)">Books (Buku)</option>
                    <option value="Patents & Copyrights (Paten & HKI)">Patents & Copyrights (Paten & HKI)</option>
                    <option value="Journal Article">Journal Article</option>
                    <option value="Conference Paper">Conference Paper</option>
                    <option value="Book Chapter">Book Chapter</option>
                    <option value="Student Thesis">Student Thesis</option>
                    <option value="Preprint">Preprint</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingPublication?.status || 'Published'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Published">Published</option>
                    <option value="In Press">In Press</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">DOI / Link</label>
                  <input
                    name="doi"
                    defaultValue={editingPublication?.doi || ''}
                    placeholder="10.1016/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Abstract</label>
                <textarea
                  name="abstract"
                  rows={4}
                  defaultValue={editingPublication?.abstract || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Keywords (Comma separated)</label>
                <input
                  name="keywords"
                  defaultValue={editingPublication?.keywords.join(', ') || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Connected to Annual Personal Performance Index (IRIS 1103) */}
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="connectToAnnual"
                    id="connectToAnnual"
                    defaultChecked={editingPublication ? editingPublication.connectToAnnual === true : false}
                    className="w-4 h-4 rounded text-[#004b87]"
                  />
                  <label htmlFor="connectToAnnual" className="text-xs text-slate-800 font-bold">
                    Hubungkan Otomatis ke Annual Personal Performance Index (IRIS 1103 Tracking)
                  </label>
                </div>
                <p className="text-[11px] text-slate-600 pl-6">
                  Publikasi ini akan langsung dihitung dan tampil di tabel capaian tahunan & inquiry resmi IRIS 1103 tanpa perlu input 2x.
                </p>
                <div className="pl-6 flex items-center gap-2">
                  <label className="text-xs text-slate-700 font-semibold">Kategori IRIS:</label>
                  <select
                    name="annualCategory"
                    defaultValue={editingPublication?.annualCategory || 'scopus'}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-[#004b87]"
                  >
                    <option value="scopus">Scopus Publications (Jurnal Terindeks Scopus)</option>
                    <option value="p2m">Community Service (P2M) &amp; Research</option>
                    <option value="jurnal">Journals (Jurnal Nasional / Internasional)</option>
                    <option value="prosiding">Proceedings (Prosiding Seminar)</option>
                    <option value="buku">Books (Buku / Monograf)</option>
                    <option value="paten">Patents (Paten)</option>
                    <option value="hki">Copyrights / IPR (HKI Hak Cipta)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  id="isFeatured"
                  defaultChecked={editingPublication?.isFeatured || false}
                  className="w-4 h-4 rounded text-[#004b87]"
                />
                <label htmlFor="isFeatured" className="text-xs text-slate-700 font-medium">
                  Feature on Home Hero section
                </label>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {editingPublication ? (
                  <button
                    type="button"
                    onClick={() => {
                      const pubToDelete = editingPublication;
                      setIsPubModalOpen(false);
                      askConfirmation({
                        title: 'Hapus Publikasi Permanen',
                        message: `Hapus permanen publikasi "${pubToDelete.title}" dari database? Tindakan ini tidak dapat dibatalkan.`,
                        confirmText: 'Ya, Hapus Permanen',
                        isDestructive: true,
                        onConfirm: async () => {
                          const ok = await academicService.deletePublication(pubToDelete.id);
                          if (ok) {
                            setSelectedPubIds(prev => {
                              const next = new Set(prev);
                              next.delete(pubToDelete.id);
                              return next;
                            });
                            showToast('Publikasi berhasil dihapus.');
                          } else {
                            showToast('Gagal menghapus publikasi.', 'error');
                          }
                        }
                      });
                    }}
                    className="px-3.5 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Publikasi Ini</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPubModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold cursor-pointer"
                  >
                    Save Publication
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 2: STUDENT FORM (CREATE / EDIT) */}
      {/* ======================================================= */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                {editingStudent ? 'Edit Student' : 'Add Supervised Student'}
              </h3>
              <button onClick={() => setIsStudentModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const digilibUrl = String(fd.get('digilibUrl') || '').trim() || undefined;
                const thesisAbstract = String(fd.get('thesisAbstract') || '').trim() || undefined;
                const photoUrl = studentPhotoUrl || String(fd.get('photoUrl') || '').trim() || undefined;
                const photoBase64 = studentPhotoBase64 || undefined;
                const effectiveInfographicImage = studentInfographicImage || studentInfographicUrl || undefined;
                const baseInfo = editingStudent?.infographic;
                const infographicPayload: ThesisInfographic | undefined = effectiveInfographicImage ? {
                  studentId: editingStudent?.id || '',
                  studentName: String(fd.get('name') || '').trim(),
                  nim: String(fd.get('nim') || '').trim(),
                  degree: String(fd.get('degree') || 'S1 Matematika').trim(),
                  title: String(fd.get('thesisTitle') || fd.get('researchTopic') || 'Skripsi').trim(),
                  problemStatement: thesisAbstract || baseInfo?.problemStatement || 'Penelitian tugas akhir mahasiswa bimbingan.',
                  objectives: baseInfo?.objectives || 'Formulasi pemodelan matematis dan solusi komputasi terverifikasi.',
                  methodology: baseInfo?.methodology || ['Formulasi model matematis', 'Pencarian solusi komputasi', 'Validasi empiris'],
                  dataAndObject: baseInfo?.dataAndObject || 'Arsip data tugas akhir terverifikasi.',
                  keyFindings: baseInfo?.keyFindings || ['Hasil optimal dan teruji'],
                  conclusions: baseInfo?.conclusions || 'Kontribusi bagi matematika terapan dan sains data.',
                  keywords: baseInfo?.keywords || [String(fd.get('researchTopic') || 'Optimasi')],
                  pembimbing: baseInfo?.pembimbing || 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
                  penguji: baseInfo?.penguji,
                  programStudi: baseInfo?.programStudi || String(fd.get('degree') || 'Matematika'),
                  fakultas: baseInfo?.fakultas || 'FMIPA UNS',
                  status: 'Published',
                  customImageUrl: effectiveInfographicImage,
                  customImageBase64: effectiveInfographicImage,
                  generatedByAi: false,
                  lastUpdated: new Date().toISOString()
                } : editingStudent?.infographic;

                const payload = {
                  name: String(fd.get('name') || '').trim(),
                  nim: String(fd.get('nim') || '').trim(),
                  degree: String(fd.get('degree') || 'S1 Matematika').trim(),
                  researchTopic: String(fd.get('researchTopic') || '').trim(),
                  thesisTitle: String(fd.get('thesisTitle') || '').trim(),
                  startYear: Number(fd.get('startYear')) || new Date().getFullYear(),
                  graduationYear: fd.get('graduationYear') ? Number(fd.get('graduationYear')) : undefined,
                  status: String(fd.get('status') || 'Active') as any,
                  currentAffiliation: String(fd.get('currentAffiliation') || '').trim(),
                  notes: String(fd.get('notes') || '').trim(),
                  digilibUrl: digilibUrl || editingStudent?.digilibUrl,
                  thesisAbstract,
                  photoUrl,
                  photoBase64,
                  infographic: infographicPayload,
                  hasInfographic: Boolean(effectiveInfographicImage || editingStudent?.hasInfographic)
                };

                if (editingStudent) {
                  confirmAndSave(
                    async () => {
                      return await academicService.updateStudent(editingStudent.id, payload);
                    },
                    () => setIsStudentModalOpen(false)
                  );
                } else {
                  confirmAndSave(
                    async () => {
                      return await academicService.createStudent(payload as any);
                    },
                    () => setIsStudentModalOpen(false)
                  );
                }
              }}
              className="space-y-4 text-xs sm:text-sm"
            >
              {/* Foto Profil Mahasiswa (Profile Photo Upload & Preview) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#004b87]" />
                    <span>Foto Profil Mahasiswa</span>
                  </span>
                  {(studentPhotoBase64 || studentPhotoUrl) && (
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Foto Terpasang
                    </span>
                  )}
                </label>

                <div className="flex items-center gap-4">
                  {/* Photo Preview Avatar */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-sky-200 bg-white shadow-xs shrink-0 flex items-center justify-center">
                    {(studentPhotoBase64 || studentPhotoUrl) ? (
                      <img
                        src={studentPhotoBase64 || studentPhotoUrl}
                        alt="Preview Foto Mahasiswa"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 text-center p-1">
                        <User className="w-6 h-6 mb-0.5 text-slate-300" />
                        <span className="text-[9px] font-mono leading-none">No Photo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-white border border-sky-300 hover:border-[#004b87] text-[#004b87] rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Foto (.jpg / .png / .webp)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (!file.type.startsWith('image/')) {
                                showToast('Pilih file gambar yang valid (.jpg, .png, .webp)', 'error');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                const base64 = reader.result as string;
                                setStudentPhotoBase64(base64);
                                showToast(`Foto profil "${file.name}" siap disimpan.`);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {(studentPhotoBase64 || studentPhotoUrl) && (
                        <button
                          type="button"
                          onClick={() => {
                            setStudentPhotoBase64('');
                            setStudentPhotoUrl('');
                            showToast('Foto profil dibersihkan.');
                          }}
                          className="px-2.5 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium border border-slate-200 cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>

                    <input
                      name="photoUrl"
                      value={studentPhotoUrl}
                      onChange={e => setStudentPhotoUrl(e.target.value)}
                      placeholder="Atau tautan URL foto: https://..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Data Identitas Mahasiswa */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student Full Name</label>
                <input
                  name="name"
                  defaultValue={editingStudent?.name || ''}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Student ID (NIM)</label>
                  <input
                    name="nim"
                    defaultValue={editingStudent?.nim || ''}
                    required
                    placeholder="M0521..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Degree Program</label>
                  <input
                    name="degree"
                    defaultValue={editingStudent?.degree || 'S1 Matematika'}
                    required
                    placeholder="e.g. S1 Matematika / S2 Sains Data"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Thesis Title (Judul Skripsi)</label>
                <input
                  name="thesisTitle"
                  defaultValue={editingStudent?.thesisTitle || ''}
                  placeholder="Thesis title (Indonesian or English)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Research Topic</label>
                <input
                  name="researchTopic"
                  defaultValue={editingStudent?.researchTopic || ''}
                  required
                  placeholder="Optimization, EVRP, Graph Theory, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Year</label>
                  <input
                    name="startYear"
                    type="number"
                    defaultValue={editingStudent?.startYear || 2023}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Graduation</label>
                  <input
                    name="graduationYear"
                    type="number"
                    defaultValue={editingStudent?.graduationYear || ''}
                    placeholder="2025"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingStudent?.status || 'Active'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Current Position / Career</label>
                <input
                  name="currentAffiliation"
                  defaultValue={editingStudent?.currentAffiliation || ''}
                  placeholder="Data Analyst / Postgraduate Scholar..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Poster Infografik Skripsi Mahasiswa (Upload Gambar & Terhubung ke MySQL) */}
              <div className="p-3.5 bg-sky-50/70 rounded-xl border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#004b87]" />
                    <span>Poster Infografik Skripsi (Upload Gambar)</span>
                  </label>
                  {(studentInfographicImage || studentInfographicUrl || editingStudent?.infographic?.customImageUrl) ? (
                    <span className="text-[10px] font-bold text-[#004b87] bg-white px-2 py-0.5 rounded border border-sky-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Poster Terpasang</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Belum Diunggah
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Unggah gambar poster infografik skripsi mahasiswa resmi buatan Anda/mahasiswa (.png, .jpg, .webp). Gambar langsung terhubung dan tersimpan ke basis data MySQL (tabel <code>digilib_documents</code>).
                </p>

                {/* Preview Thumbnail if image uploaded */}
                <div className="flex items-start gap-3 bg-white p-2.5 rounded-lg border border-sky-100">
                  <div className="w-20 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                    {(studentInfographicImage || studentInfographicUrl) ? (
                      <img
                        src={studentInfographicImage || studentInfographicUrl}
                        alt="Preview Infografik"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-1 text-slate-400">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                        <span className="text-[9px] font-mono leading-none block">No Poster</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="px-3 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors">
                        <Upload className="w-3.5 h-3.5 text-sky-200" />
                        <span>Pilih Gambar (.png/.jpg/.webp)</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (!file.type.startsWith('image/')) {
                                showToast('Pilih berkas gambar yang valid (.png, .jpg, .webp)', 'error');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                const base64 = reader.result as string;
                                setStudentInfographicImage(base64);
                                showToast(`Poster infografik "${file.name}" siap disimpan.`);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {(studentInfographicImage || studentInfographicUrl) && (
                        <button
                          type="button"
                          onClick={() => {
                            setStudentInfographicImage('');
                            setStudentInfographicUrl('');
                            showToast('Poster infografik dibersihkan.');
                          }}
                          className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium border border-rose-200 cursor-pointer transition-colors"
                        >
                          Hapus Poster
                        </button>
                      )}
                    </div>

                    <input
                      value={studentInfographicUrl}
                      onChange={e => {
                        setStudentInfographicUrl(e.target.value);
                        if (!studentInfographicImage) setStudentInfographicImage(e.target.value);
                      }}
                      placeholder="Atau tautan URL langsung poster: https://..."
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                    />

                    {editingStudent && (
                      <button
                        type="button"
                        onClick={() => {
                          setAdminInfographicStudent(editingStudent);
                        }}
                        className="text-xs text-[#004b87] hover:underline flex items-center gap-1 font-semibold pt-0.5 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Buka / Kelola Pratinjau Penuh Infografik</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Ringkasan Abstrak Skripsi & Tautan Digilib UNS */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#004b87]" />
                  <span>Abstrak &amp; Arsip Digilib UNS</span>
                </label>

                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">
                    Ringkasan / Abstrak Skripsi Mahasiswa:
                  </label>
                  <textarea
                    name="thesisAbstract"
                    rows={3}
                    defaultValue={editingStudent?.thesisAbstract || ''}
                    placeholder="Tuliskan rumusan masalah, metodologi, dan ringkasan temuan tugas akhir..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">
                    Tautan Halaman Resmi Digilib UNS (Opsional):
                  </label>
                  <input
                    name="digilibUrl"
                    defaultValue={editingStudent?.digilibUrl || ''}
                    placeholder="https://digilib.uns.ac.id/dokumen/detail/..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {editingStudent ? (
                  <button
                    type="button"
                    onClick={() => {
                      const stdToDelete = editingStudent;
                      setIsStudentModalOpen(false);
                      askConfirmation({
                        title: 'Hapus Data Mahasiswa',
                        message: `Hapus permanen data mahasiswa bimbingan "${stdToDelete.name}" (${stdToDelete.nim})?`,
                        confirmText: 'Ya, Hapus Mahasiswa',
                        isDestructive: true,
                        onConfirm: async () => {
                          const ok = await academicService.deleteStudent(stdToDelete.id);
                          if (ok) showToast('Data mahasiswa berhasil dihapus.');
                          else showToast('Gagal menghapus data mahasiswa.', 'error');
                        }
                      });
                    }}
                    className="px-3.5 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Mahasiswa</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStudentModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold cursor-pointer"
                  >
                    Save Student
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 3: TEACHING COURSE (CREATE / EDIT) */}
      {/* ======================================================= */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button onClick={() => setIsCourseModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const payload = {
                  name: String(fd.get('name') || '').trim(),
                  code: String(fd.get('code') || '').trim(),
                  level: String(fd.get('level') || 'Undergraduate (S1)') as any,
                  program: String(fd.get('program') || 'S1 Matematika').trim(),
                  academicYear: String(fd.get('academicYear') || '2025/2026').trim(),
                  semester: String(fd.get('semester') || 'Ganjil') as any,
                  description: String(fd.get('description') || '').trim(),
                  materialsUrl: String(fd.get('materialsUrl') || '').trim(),
                  isActive: true
                };

                if (editingCourse) {
                  confirmAndSave(
                    async () => {
                      return await academicService.updateTeaching(editingCourse.id, payload);
                    },
                    () => setIsCourseModalOpen(false)
                  );
                } else {
                  confirmAndSave(
                    async () => {
                      return await academicService.createTeaching(payload);
                    },
                    () => setIsCourseModalOpen(false)
                  );
                }
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Course Name</label>
                <input
                  name="name"
                  defaultValue={editingCourse?.name || ''}
                  required
                  placeholder="e.g. Riset Operasi / Operations Research"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Course Code</label>
                  <input
                    name="code"
                    defaultValue={editingCourse?.code || ''}
                    required
                    placeholder="MAT401"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Academic Year</label>
                  <input
                    name="academicYear"
                    defaultValue={editingCourse?.academicYear || '2025/2026'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Level</label>
                  <select
                    name="level"
                    defaultValue={editingCourse?.level || 'Undergraduate (S1)'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Undergraduate (S1)">Undergraduate (S1)</option>
                    <option value="Graduate (S2)">Graduate (S2)</option>
                    <option value="Postgraduate (S3)">Postgraduate (S3)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Semester</label>
                  <select
                    name="semester"
                    defaultValue={editingCourse?.semester || 'Ganjil'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Ganjil">Ganjil (Odd)</option>
                    <option value="Genap">Genap (Even)</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Course Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingCourse?.description || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">SPADA UNS / Syllabus URL</label>
                <input
                  name="materialsUrl"
                  defaultValue={editingCourse?.materialsUrl || ''}
                  placeholder="https://spada.uns.ac.id/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {editingCourse ? (
                  <button
                    type="button"
                    onClick={() => {
                      const courseToDelete = editingCourse;
                      setIsCourseModalOpen(false);
                      askConfirmation({
                        title: 'Hapus Mata Kuliah',
                        message: `Hapus mata kuliah "${courseToDelete.name}" (${courseToDelete.code})?`,
                        confirmText: 'Ya, Hapus Mata Kuliah',
                        isDestructive: true,
                        onConfirm: async () => {
                          const ok = await academicService.deleteCourse(courseToDelete.id);
                          if (ok) showToast('Mata kuliah berhasil dihapus.');
                          else showToast('Gagal menghapus mata kuliah.', 'error');
                        }
                      });
                    }}
                    className="px-3.5 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Mata Kuliah</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold cursor-pointer">Save Course</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 4: RESEARCH PROJECT (CREATE / EDIT) */}
      {/* ======================================================= */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                {editingProject ? 'Edit Project' : 'Add Funded Research Project'}
              </h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const colabStr = String(fd.get('collaborators') || '');
                const payload = {
                  title: String(fd.get('title') || '').trim(),
                  period: String(fd.get('period') || '').trim(),
                  fundingSource: String(fd.get('fundingSource') || '').trim(),
                  grantName: String(fd.get('grantName') || '').trim(),
                  role: String(fd.get('role') || 'Principal Investigator').trim(),
                  description: String(fd.get('description') || '').trim(),
                  collaborators: colabStr.split(',').map(s => s.trim()).filter(Boolean),
                  status: String(fd.get('status') || 'Ongoing') as any
                };

                if (editingProject) {
                  confirmAndSave(
                    async () => {
                      return await academicService.updateResearchProject(editingProject.id, payload);
                    },
                    () => setIsProjectModalOpen(false)
                  );
                } else {
                  confirmAndSave(
                    async () => {
                      return await academicService.createResearchProject(payload);
                    },
                    () => setIsProjectModalOpen(false)
                  );
                }
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project Title</label>
                <input
                  name="title"
                  defaultValue={editingProject?.title || ''}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Period (Years)</label>
                  <input
                    name="period"
                    defaultValue={editingProject?.period || '2024–2026'}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingProject?.status || 'Ongoing'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Funding Source</label>
                  <input
                    name="fundingSource"
                    defaultValue={editingProject?.fundingSource || 'Kemdiktisaintek RI'}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Faculty Role</label>
                  <input
                    name="role"
                    defaultValue={editingProject?.role || 'Principal Investigator (Ketua Peneliti)'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Collaborators (Comma separated)</label>
                <input
                  name="collaborators"
                  defaultValue={editingProject?.collaborators.join(', ') || ''}
                  placeholder="Prof. A, Peneliti B, M.Sc., etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingProject?.description || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {editingProject ? (
                  <button
                    type="button"
                    onClick={() => {
                      const projToDelete = editingProject;
                      setIsProjectModalOpen(false);
                      askConfirmation({
                        title: 'Hapus Proyek Penelitian',
                        message: `Hapus proyek penelitian "${projToDelete.title}"?`,
                        confirmText: 'Ya, Hapus Proyek',
                        isDestructive: true,
                        onConfirm: async () => {
                          const ok = await academicService.deleteResearchProject(projToDelete.id);
                          if (ok) showToast('Proyek penelitian berhasil dihapus.');
                          else showToast('Gagal menghapus proyek penelitian.', 'error');
                        }
                      });
                    }}
                    className="px-3.5 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Proyek</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold cursor-pointer">Save Project</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 5: RESEARCH TOPIC (CREATE / EDIT) */}
      {/* ======================================================= */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                {editingTopic ? 'Edit Topic' : 'Add Research Topic'}
              </h3>
              <button onClick={() => setIsTopicModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const conceptsStr = String(fd.get('keyConcepts') || '');
                const payload = {
                  title: String(fd.get('title') || '').trim(),
                  description: String(fd.get('description') || '').trim(),
                  keyConcepts: conceptsStr.split(',').map(s => s.trim()).filter(Boolean)
                };

                if (editingTopic) {
                  confirmAndSave(
                    async () => {
                      return await academicService.updateResearchTopic(editingTopic.id, payload);
                    },
                    () => setIsTopicModalOpen(false)
                  );
                } else {
                  confirmAndSave(
                    async () => {
                      return await academicService.createResearchTopic(payload);
                    },
                    () => setIsTopicModalOpen(false)
                  );
                }
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Topic Name</label>
                <input
                  name="title"
                  defaultValue={editingTopic?.title || ''}
                  required
                  placeholder="e.g. Electric Vehicle Routing Problem"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingTopic?.description || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Key Concepts (Comma separated)</label>
                <input
                  name="keyConcepts"
                  defaultValue={editingTopic?.keyConcepts.join(', ') || ''}
                  placeholder="EVRP, Metaheuristics, MILP"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {editingTopic ? (
                  <button
                    type="button"
                    onClick={() => {
                      const topicToDelete = editingTopic;
                      setIsTopicModalOpen(false);
                      askConfirmation({
                        title: 'Hapus Topik Riset',
                        message: `Hapus topik riset "${topicToDelete.title}"?`,
                        confirmText: 'Ya, Hapus Topik',
                        isDestructive: true,
                        onConfirm: async () => {
                          const ok = await academicService.deleteResearchTopic(topicToDelete.id);
                          if (ok) showToast('Topik riset berhasil dihapus.');
                          else showToast('Gagal menghapus topik riset.', 'error');
                        }
                      });
                    }}
                    className="px-3.5 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Topik</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setIsTopicModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold cursor-pointer">Save Topic</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 6: EDITORIAL ROLE (CREATE / EDIT) */}
      {/* ======================================================= */}
      {isEditorialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                {editingEditorial ? 'Edit Editorial Role' : 'Add Editorial Role'}
              </h3>
              <button onClick={() => setIsEditorialModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const payload = {
                  role: String(fd.get('role') || 'Editorial Board Member') as any,
                  venue: String(fd.get('venue') || '').trim(),
                  publisher: String(fd.get('publisher') || '').trim(),
                  indexing: String(fd.get('indexing') || '').trim(),
                  period: String(fd.get('period') || '').trim(),
                  url: String(fd.get('url') || '').trim(),
                  description: String(fd.get('description') || '').trim()
                };

                if (editingEditorial) {
                  confirmAndSave(
                    async () => {
                      return await academicService.updateEditorial(editingEditorial.id, payload);
                    },
                    () => setIsEditorialModalOpen(false)
                  );
                } else {
                  confirmAndSave(
                    async () => {
                      return await academicService.createEditorial(payload);
                    },
                    () => setIsEditorialModalOpen(false)
                  );
                }
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Role</label>
                <select
                  name="role"
                  defaultValue={editingEditorial?.role || 'Associate Editor'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="Editor-in-Chief">Editor-in-Chief</option>
                  <option value="Associate Editor">Associate Editor</option>
                  <option value="Editorial Board Member">Editorial Board Member</option>
                  <option value="Guest Editor">Guest Editor</option>
                  <option value="Reviewer">Reviewer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Journal / Conference Name</label>
                <input
                  name="venue"
                  defaultValue={editingEditorial?.venue || ''}
                  required
                  placeholder="Journal of Applied Optimization"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Publisher</label>
                  <input
                    name="publisher"
                    defaultValue={editingEditorial?.publisher || 'Elsevier / Springer'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Period</label>
                  <input
                    name="period"
                    defaultValue={editingEditorial?.period || '2022 – Present'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Portal URL / Link</label>
                <input
                  name="url"
                  defaultValue={editingEditorial?.url || ''}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditorialModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold">Save Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 7: PRESS & MEDIA ITEM (CREATE / EDIT) */}
      {/* ======================================================= */}
      {isPressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                {editingPress ? 'Edit Press Item' : 'Add Press & Media Coverage'}
              </h3>
              <button onClick={() => setIsPressModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const payload = {
                  title: String(fd.get('title') || '').trim(),
                  mediaOutlet: String(fd.get('mediaOutlet') || '').trim(),
                  publishDate: String(fd.get('publishDate') || '').trim(),
                  category: String(fd.get('category') || 'News Coverage') as any,
                  url: String(fd.get('url') || '').trim(),
                  summary: String(fd.get('summary') || '').trim()
                };

                if (editingPress) {
                  confirmAndSave(
                    async () => {
                      return await academicService.updatePressMedia(editingPress.id, payload);
                    },
                    () => setIsPressModalOpen(false)
                  );
                } else {
                  confirmAndSave(
                    async () => {
                      return await academicService.createPressMedia(payload);
                    },
                    () => setIsPressModalOpen(false)
                  );
                }
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Headline Title</label>
                <input
                  name="title"
                  defaultValue={editingPress?.title || ''}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Media Outlet</label>
                  <input
                    name="mediaOutlet"
                    defaultValue={editingPress?.mediaOutlet || 'UNS Official News / Kompas'}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date</label>
                  <input
                    name="publishDate"
                    defaultValue={editingPress?.publishDate || new Date().toISOString().slice(0, 10)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <select
                  name="category"
                  defaultValue={editingPress?.category || 'News Coverage'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="News Coverage">News Coverage</option>
                  <option value="Interview">Interview</option>
                  <option value="Public Lecture / Keynote">Public Lecture / Keynote</option>
                  <option value="Academic Event">Academic Event</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Summary / Excerpt</label>
                <textarea
                  name="summary"
                  rows={3}
                  defaultValue={editingPress?.summary || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Article URL</label>
                <input
                  name="url"
                  defaultValue={editingPress?.url || ''}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsPressModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold">Save Media Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 8: BLOG POST (CREATE / EDIT) */}
      {/* ======================================================= */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                {editingBlog ? 'Edit Blog Post' : 'Write New Academic Post'}
              </h3>
              <button onClick={() => setIsBlogModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const tagsStr = String(fd.get('tags') || '');
                const title = String(fd.get('title') || '').trim();
                const slug = String(fd.get('slug') || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();

                const payload = {
                  title,
                  slug,
                  author: profile.name,
                  authorRole: profile.role,
                  publishedAt: String(fd.get('publishedAt') || new Date().toISOString().slice(0, 10)).trim(),
                  status: String(fd.get('status') || 'Published') as any,
                  category: String(fd.get('category') || 'Applied Mathematics').trim(),
                  readTime: String(fd.get('readTime') || '5 min read').trim(),
                  excerpt: String(fd.get('excerpt') || '').trim(),
                  content: String(fd.get('content') || '').trim(),
                  tags: tagsStr.split(',').map(s => s.trim()).filter(Boolean)
                };

                if (editingBlog) {
                  confirmAndSave(
                    async () => {
                      return await academicService.updateBlogPost(editingBlog.id, payload);
                    },
                    () => setIsBlogModalOpen(false)
                  );
                } else {
                  confirmAndSave(
                    async () => {
                      return await academicService.createBlogPost(payload);
                    },
                    () => setIsBlogModalOpen(false)
                  );
                }
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Post Title</label>
                <input
                  name="title"
                  defaultValue={editingBlog?.title || ''}
                  required
                  placeholder="e.g. Modern Applications of Operations Research in Clean Logistics"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <input
                    name="category"
                    defaultValue={editingBlog?.category || 'Applied Mathematics'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date</label>
                  <input
                    name="publishedAt"
                    defaultValue={editingBlog?.publishedAt || new Date().toISOString().slice(0, 10)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingBlog?.status || 'Published'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Short Excerpt</label>
                <input
                  name="excerpt"
                  defaultValue={editingBlog?.excerpt || ''}
                  placeholder="Brief summary shown in the cards list..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Content (Markdown or Essays)</label>
                <textarea
                  name="content"
                  rows={8}
                  defaultValue={editingBlog?.content || ''}
                  required
                  placeholder="Write the full academic essay or thought leadership piece..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-sans leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tags (Comma separated)</label>
                <input
                  name="tags"
                  defaultValue={editingBlog?.tags.join(', ') || ''}
                  placeholder="Operations Research, EVRP, Optimization"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsBlogModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold">Publish Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 9A: EDUCATION DEGREE (CREATE / EDIT) */}
      {/* ======================================================= */}
      {isEducationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                {editingEducation ? 'Edit Education Degree' : 'Add Education Degree'}
              </h3>
              <button onClick={() => setIsEducationModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const newEntry: EducationEntry = {
                  id: editingEducation?.id || `edu-${Date.now()}`,
                  degree: String(fd.get('degree') || '').trim(),
                  institution: String(fd.get('institution') || '').trim(),
                  year: String(fd.get('year') || '').trim(),
                  field: String(fd.get('field') || '').trim(),
                  thesisTitle: String(fd.get('thesisTitle') || '').trim() || undefined
                };

                let updatedList: EducationEntry[];
                if (editingEducation) {
                  updatedList = profile.education.map(ed => ed.id === editingEducation.id ? newEntry : ed);
                } else {
                  updatedList = [...profile.education, newEntry];
                }

                confirmAndSave(
                  async () => {
                    return await academicService.updateProfile({ education: updatedList });
                  },
                  () => setIsEducationModalOpen(false)
                );
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Degree Title</label>
                <input
                  name="degree"
                  defaultValue={editingEducation?.degree || ''}
                  required
                  placeholder="e.g. Ph.D. in Applied Mathematics"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Institution / University</label>
                <input
                  name="institution"
                  defaultValue={editingEducation?.institution || ''}
                  required
                  placeholder="Eindhoven University of Technology, Netherlands"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Year</label>
                  <input
                    name="year"
                    defaultValue={editingEducation?.year || '2021'}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Field of Study</label>
                  <input
                    name="field"
                    defaultValue={editingEducation?.field || ''}
                    placeholder="Industrial Engineering"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Thesis / Dissertation Title (Optional)</label>
                <input
                  name="thesisTitle"
                  defaultValue={editingEducation?.thesisTitle || ''}
                  placeholder="Dissertation title..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsEducationModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold">Save Degree</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 9B: WORK HISTORY (CREATE / EDIT) */}
      {/* ======================================================= */}
      {isWorkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                {editingWork ? 'Edit Experience' : 'Add Experience Entry'}
              </h3>
              <button onClick={() => setIsWorkModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const newEntry: WorkHistoryEntry = {
                  id: editingWork?.id || `work-${Date.now()}`,
                  role: String(fd.get('role') || '').trim(),
                  institution: String(fd.get('institution') || '').trim(),
                  period: String(fd.get('period') || '').trim(),
                  description: String(fd.get('description') || '').trim() || undefined
                };

                let updatedList: WorkHistoryEntry[];
                if (editingWork) {
                  updatedList = profile.workHistory.map(w => w.id === editingWork.id ? newEntry : w);
                } else {
                  updatedList = [...profile.workHistory, newEntry];
                }

                confirmAndSave(
                  async () => {
                    return await academicService.updateProfile({ workHistory: updatedList });
                  },
                  () => setIsWorkModalOpen(false)
                );
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Position / Role</label>
                <input
                  name="role"
                  defaultValue={editingWork?.role || ''}
                  required
                  placeholder="Visiting Researcher / University Researcher"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Institution</label>
                <input
                  name="institution"
                  defaultValue={editingWork?.institution || ''}
                  required
                  placeholder="Tilburg University / TU Eindhoven"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Period (Years)</label>
                <input
                  name="period"
                  defaultValue={editingWork?.period || '2022–2024'}
                  required
                  placeholder="2022–2024"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingWork?.description || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsWorkModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold">Save Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 9C: APPOINTMENT (CREATE / EDIT) */}
      {/* ======================================================= */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                {editingAppointment ? 'Edit Appointment' : 'Add Academic Appointment'}
              </h3>
              <button onClick={() => setIsAppointmentModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const newEntry: AcademicAppointment = {
                  id: editingAppointment?.id || `app-${Date.now()}`,
                  role: String(fd.get('role') || '').trim(),
                  department: String(fd.get('department') || '').trim(),
                  institution: String(fd.get('institution') || '').trim(),
                  period: String(fd.get('period') || '').trim(),
                  description: String(fd.get('description') || '').trim() || undefined
                };

                let updatedList: AcademicAppointment[];
                if (editingAppointment) {
                  updatedList = profile.appointments.map(a => a.id === editingAppointment.id ? newEntry : a);
                } else {
                  updatedList = [...profile.appointments, newEntry];
                }

                confirmAndSave(
                  async () => {
                    return await academicService.updateProfile({ appointments: updatedList });
                  },
                  () => setIsAppointmentModalOpen(false)
                );
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Appointment Role</label>
                <input
                  name="role"
                  defaultValue={editingAppointment?.role || ''}
                  required
                  placeholder="Head of Research Group / Senior Lecturer"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <input
                  name="department"
                  defaultValue={editingAppointment?.department || 'Department of Mathematics'}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Institution</label>
                  <input
                    name="institution"
                    defaultValue={editingAppointment?.institution || 'Sebelas Maret University'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Period</label>
                  <input
                    name="period"
                    defaultValue={editingAppointment?.period || '2016 – Present'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingAppointment?.description || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsAppointmentModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold">Save Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: RESEARCH GROUP (CREATE / EDIT) */}
      {/* ======================================================= */}
      {isResearchGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                {editingResearchGroup ? 'Edit Research Group' : 'Add Research Group'}
              </h3>
              <button onClick={() => setIsResearchGroupModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const newEntry: ResearchGroupEntry = {
                  id: editingResearchGroup?.id || `rg-${Date.now()}`,
                  code: String(fd.get('code') || '').trim(),
                  name: String(fd.get('name') || '').trim(),
                  period: String(fd.get('period') || '').trim(),
                  isActive: fd.get('isActive') === 'true'
                };

                let updatedList: ResearchGroupEntry[];
                if (editingResearchGroup) {
                  updatedList = profile.researchGroups.map(g => g.id === editingResearchGroup.id ? newEntry : g);
                } else {
                  updatedList = [...profile.researchGroups, newEntry];
                }

                confirmAndSave(
                  async () => {
                    return await academicService.updateResearchGroups(updatedList);
                  },
                  () => setIsResearchGroupModalOpen(false)
                );
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Group Code</label>
                <input
                  name="code"
                  defaultValue={editingResearchGroup?.code || 'M12144414'}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Research Group Name</label>
                <input
                  name="name"
                  defaultValue={editingResearchGroup?.name || ''}
                  required
                  placeholder="e.g. Mathematical Modelling, Data Science..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Period</label>
                  <input
                    name="period"
                    defaultValue={editingResearchGroup?.period || '2016–Present'}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    name="isActive"
                    defaultValue={editingResearchGroup ? String(editingResearchGroup.isActive) : 'false'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="true">Current Active</option>
                    <option value="false">Historical</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsResearchGroupModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold">Save Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: P2M ACTIVITY (CREATE / EDIT / SYNC) */}
      {/* ======================================================= */}
      {isP2MModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#004b87] font-mono">
                  IRIS1103 Official Reference Activity
                </span>
                <h3 className="font-serif-academic text-lg sm:text-xl font-bold text-slate-950">
                  {editingP2M?.id ? 'Edit Aktivitas P2M' : 'Tambah Usulan P2M'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsP2MModalOpen(false);
                  setEditingP2M(null);
                  setSelectedLinkedPub(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher: Input Manual vs Sinkronisasi Publikasi Database */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setP2MModalMode('manual');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  p2mModalMode === 'manual'
                    ? 'bg-white text-[#004b87] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>1. Input Usulan Manual</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setP2MModalMode('sync_pub');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  p2mModalMode === 'sync_pub'
                    ? 'bg-white text-[#004b87] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>2. Sinkronkan dari Publikasi Database</span>
              </button>
            </div>

            {/* Mode 2: Publication Selector from Database */}
            {p2mModalMode === 'sync_pub' && (
              <div className="space-y-3 p-4 bg-sky-50/70 rounded-xl border border-sky-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-sky-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#004b87]"></span>
                    <h4 className="text-xs font-bold text-slate-900">
                      Pilih Karya Publikasi dari Database ({publications.length} karya tersedia)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Data judul, tahun, peran, dan skema akan diisi otomatis.
                  </span>
                </div>

                {selectedLinkedPub ? (
                  <div className="p-3 bg-white rounded-xl border-2 border-emerald-400 shadow-2xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Publikasi Terpilih &amp; Tersinkron</span>
                          </span>
                          <span className="bg-sky-50 text-[#004b87] border border-sky-200 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                            {selectedLinkedPub.year}
                          </span>
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            {selectedLinkedPub.type}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                          {selectedLinkedPub.title}
                        </h5>
                        <div className="text-[11px] text-slate-600 font-mono">
                          {selectedLinkedPub.venue} {selectedLinkedPub.doi ? `• DOI: ${selectedLinkedPub.doi}` : ''}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedLinkedPub(null)}
                          className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold transition-colors cursor-pointer"
                        >
                          Ganti Publikasi
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="syncIrisCatCheck"
                        checked={syncToIrisCat}
                        onChange={e => setSyncToIrisCat(e.target.checked)}
                        className="rounded border-slate-300 text-[#004b87] focus:ring-[#004b87]"
                      />
                      <label htmlFor="syncIrisCatCheck" className="text-[11px] text-slate-700 font-medium cursor-pointer">
                        Hubungkan juga publikasi ini ke IRIS1103 kategori <strong className="text-[#004b87]">Community Service (P2M)</strong> di halaman publik beranda.
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={p2mPubSearchQuery}
                          onChange={e => setP2MPubSearchQuery(e.target.value)}
                          placeholder="Cari judul publikasi, venue, nama penulis, DOI..."
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={p2mPubYearFilter}
                          onChange={e => setP2MPubYearFilter(e.target.value)}
                          className="bg-white px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                        >
                          <option value="all">Semua Tahun</option>
                          {Array.from(new Set(publications.map(p => p.year)))
                            .sort((a, b) => b - a)
                            .map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                        </select>

                        <select
                          value={p2mPubTypeFilter}
                          onChange={e => setP2MPubTypeFilter(e.target.value)}
                          className="bg-white px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 max-w-[150px] truncate"
                        >
                          <option value="all">Semua Jenis</option>
                          <option value="Scopus">Scopus</option>
                          <option value="Community Service">Community Service (P2M)</option>
                          <option value="Journal">Journals</option>
                          <option value="Proceedings">Proceedings</option>
                          <option value="Books">Books</option>
                          <option value="Patents">Patents &amp; HKI</option>
                        </select>
                      </div>
                    </div>

                    {/* Scrollable Publication List */}
                    <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-white">
                      {(() => {
                        const filtered = publications.filter(p => {
                          if (p2mPubYearFilter !== 'all' && p.year !== Number(p2mPubYearFilter)) {
                            return false;
                          }
                          if (p2mPubTypeFilter !== 'all') {
                            const t = (p.type || '').toLowerCase();
                            const tf = p2mPubTypeFilter.toLowerCase();
                            if (!t.includes(tf)) return false;
                          }
                          if (p2mPubSearchQuery.trim()) {
                            const q = p2mPubSearchQuery.toLowerCase();
                            const inTitle = p.title.toLowerCase().includes(q);
                            const inVenue = (p.venue || '').toLowerCase().includes(q);
                            const inDoi = (p.doi || '').toLowerCase().includes(q);
                            const inAuthors = (p.authors || []).some(a => a.name.toLowerCase().includes(q));
                            if (!inTitle && !inVenue && !inDoi && !inAuthors) return false;
                          }
                          return true;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="py-6 text-center text-xs text-slate-500">
                              Tidak ada publikasi yang cocok dengan pencarian &quot;{p2mPubSearchQuery}&quot;.
                            </div>
                          );
                        }

                        return filtered.map(pub => (
                          <div
                            key={pub.id}
                            className="p-2.5 rounded-lg border border-slate-200 hover:border-[#004b87] hover:bg-sky-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-mono text-[10px] font-bold text-[#004b87] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                                  {pub.year}
                                </span>
                                <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[200px]">
                                  {pub.type}
                                </span>
                                {pub.connectToAnnual && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    IRIS Terhubung
                                  </span>
                                )}
                              </div>
                              <h5 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                                {pub.title}
                              </h5>
                              <p className="text-[11px] text-slate-500 font-mono truncate">
                                {pub.venue} {pub.doi ? `• DOI: ${pub.doi}` : ''}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectPubForP2M(pub)}
                              className="px-3 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer self-end sm:self-center"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-200" />
                              <span>Pilih &amp; Sinkronkan</span>
                            </button>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Main Form Fields (Filled manually or auto-filled from selected publication) */}
            <form
              onSubmit={async e => {
                e.preventDefault();
                const item: P2MActivity = {
                  id: editingP2M?.id || `p2m-${Date.now()}`,
                  title: p2mFormTitle.trim(),
                  year: Number(p2mFormYear) || annualPerformanceYear || new Date().getFullYear(),
                  role: p2mFormRole,
                  status: p2mFormStatus,
                  jenis: p2mFormJenis,
                  groupRiset: p2mFormGroupRiset.trim() || 'Optimization and Operations Research',
                  skema: p2mFormSkema.trim() || 'Penelitian Fundamental Reguler (PFR)',
                  dana: p2mFormDana.trim() || undefined,
                  sourceType: p2mModalMode === 'sync_pub' && selectedLinkedPub ? 'synced_publication' : 'manual',
                  linkedPublicationId: p2mModalMode === 'sync_pub' && selectedLinkedPub ? selectedLinkedPub.id : undefined,
                  linkedPublicationTitle: p2mModalMode === 'sync_pub' && selectedLinkedPub ? selectedLinkedPub.title : undefined,
                  linkedPublicationVenue: p2mModalMode === 'sync_pub' && selectedLinkedPub ? selectedLinkedPub.venue : undefined,
                  linkedPublicationDoi: p2mModalMode === 'sync_pub' && selectedLinkedPub ? selectedLinkedPub.doi : undefined,
                  syncIrisCategory: p2mModalMode === 'sync_pub' && Boolean(selectedLinkedPub) && syncToIrisCat
                };

                confirmAndSave(
                  async () => {
                    if (editingP2M?.id) {
                      return await academicService.editP2MActivity(item);
                    } else {
                      return await academicService.addP2MActivity(item);
                    }
                  },
                  () => {
                    setIsP2MModalOpen(false);
                    setEditingP2M(null);
                    setSelectedLinkedPub(null);
                    showToast(
                      p2mModalMode === 'sync_pub' && selectedLinkedPub
                        ? 'Usulan P2M berhasil disinkronisasi dengan publikasi database.'
                        : 'Aktivitas P2M berhasil disimpan.'
                    );
                  }
                );
              }}
              className="space-y-4 text-xs sm:text-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-semibold">
                    Judul Usulan / Kegiatan P2M *
                  </label>
                  {p2mModalMode === 'sync_pub' && selectedLinkedPub && (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Terisi otomatis dari publikasi</span>
                    </span>
                  )}
                </div>
                <textarea
                  name="title"
                  value={p2mFormTitle}
                  onChange={e => setP2MFormTitle(e.target.value)}
                  required
                  rows={2}
                  placeholder="e.g. Strategic Decision Making in Sustainable Supply Chain Network Design..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-xs focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tahun Usulan *</label>
                  <input
                    type="number"
                    name="year"
                    value={p2mFormYear}
                    onChange={e => setP2MFormYear(Number(e.target.value))}
                    required
                    min={2000}
                    max={2030}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-xs focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Peran Usulan *</label>
                  <select
                    name="role"
                    value={p2mFormRole}
                    onChange={e => setP2MFormRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                  >
                    <option value="Ketua">Ketua</option>
                    <option value="Anggota">Anggota</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Kegiatan *</label>
                  <select
                    name="jenis"
                    value={p2mFormJenis}
                    onChange={e => setP2MFormJenis(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                  >
                    <option value="Penelitian">Penelitian</option>
                    <option value="Pengabdian">Pengabdian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status Usulan *</label>
                  <select
                    name="status"
                    value={p2mFormStatus}
                    onChange={e => setP2MFormStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                  >
                    <option value="Diterima">Diterima</option>
                    <option value="Didanai">Didanai</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dalam Proses">Dalam Proses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Group Riset *</label>
                  <input
                    name="groupRiset"
                    value={p2mFormGroupRiset}
                    onChange={e => setP2MFormGroupRiset(e.target.value)}
                    required
                    placeholder="e.g. Optimization and Operations Research"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Skema Penelitian / P2M *</label>
                <input
                  name="skema"
                  value={p2mFormSkema}
                  onChange={e => setP2MFormSkema(e.target.value)}
                  required
                  placeholder="e.g. Penelitian Fundamental Reguler (PFR) / Hibah Riset Unggulan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pendanaan (Opsional)</label>
                <input
                  name="dana"
                  value={p2mFormDana}
                  onChange={e => setP2MFormDana(e.target.value)}
                  placeholder="e.g. PNBP UNS Rp 50.000.000 / Kemdiktisaintek"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#004b87] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsP2MModalOpen(false);
                    setEditingP2M(null);
                    setSelectedLinkedPub(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>
                    {p2mModalMode === 'sync_pub' && selectedLinkedPub
                      ? 'Simpan Usulan Tersinkron'
                      : 'Simpan Aktivitas P2M'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: LINK EXISTING PUBLICATION TO IRIS1103 */}
      {/* ======================================================= */}
      {isLinkPubIrisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#004b87] font-mono">
                  IRIS1103 Explorer Linker
                </span>
                <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                  Tautkan Publikasi ke IRIS1103 Tahun {annualPerformanceYear}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkPubIrisModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={linkPubSearchQuery}
                    onChange={e => setLinkPubSearchQuery(e.target.value)}
                    placeholder="Cari judul publikasi atau jurnal..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#004b87]"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Kategori IRIS:</span>
                  <select
                    value={irisEditorCategory}
                    onChange={e => setIrisEditorCategory(e.target.value as any)}
                    className="px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#004b87]"
                  >
                    <option value="scopus">Scopus Publications</option>
                    <option value="p2m">Community Service (P2M)</option>
                    <option value="jurnal">Journals (Jurnal)</option>
                    <option value="prosiding">Proceedings (Prosiding)</option>
                    <option value="buku">Books (Buku)</option>
                    <option value="paten">Patents &amp; HKI</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Pilih publikasi di bawah ini untuk ditautkan ke kategori <strong className="text-[#004b87]">[{irisEditorCategory.toUpperCase()}]</strong> tahun <strong className="text-[#004b87]">{annualPerformanceYear}</strong>:
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 divide-y divide-slate-100 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                {publications
                  .filter(p => {
                    if (p.year !== annualPerformanceYear) return false;
                    if (linkPubSearchQuery.trim()) {
                      const q = linkPubSearchQuery.toLowerCase();
                      return p.title.toLowerCase().includes(q) || p.venue.toLowerCase().includes(q);
                    }
                    return true;
                  })
                  .map(pub => {
                    const isConnected = pub.connectToAnnual === true;
                    return (
                      <div
                        key={pub.id}
                        className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-200/70 px-1.5 py-0.2 rounded">
                              {pub.type}
                            </span>
                            {isConnected && (
                              <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                Terhubung [{pub.annualCategory === 'p2m' ? 'P2M' : pub.annualCategory || 'scopus'}]
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-1">{pub.title}</div>
                          <div className="text-[11px] text-slate-500 truncate">{pub.venue} ({pub.year})</div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          {isConnected ? (
                            <button
                              type="button"
                              onClick={() => {
                                confirmAndSave(
                                  async () => academicService.togglePublicationIrisLink(pub.id, false),
                                  () => showToast(`Tautan publikasi ${pub.title.slice(0, 30)}... dilepas.`)
                                );
                              }}
                              className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded text-xs font-semibold"
                            >
                              Lepas Tautan
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                confirmAndSave(
                                  async () => academicService.togglePublicationIrisLink(pub.id, true, irisEditorCategory),
                                  () => showToast(`Berhasil menautkan publikasi ke IRIS category: ${irisEditorCategory}`)
                                );
                              }}
                              className="px-2.5 py-1 bg-[#004b87] hover:bg-[#003865] text-white rounded text-xs font-semibold shadow-2xs"
                            >
                              + Tautkan ({irisEditorCategory})
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {publications.filter(p => p.year === annualPerformanceYear).length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Belum ada publikasi terdaftar untuk tahun {annualPerformanceYear}. Tambahkan publikasi baru terlebih dahulu di menu Publications.
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLinkPubIrisModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* INFOGRAPHIC EDITOR MODAL INTEGRATION */}
      {/* ======================================================= */}
      {infographicEditorTarget && (
        <InfographicEditorModal
          isOpen={true}
          publication={infographicEditorTarget}
          onClose={() => setInfographicEditorTarget(null)}
          onSave={async (infoData) => {
            return new Promise((resolve) => {
              confirmAndSave(
                async () => {
                  const ok = await academicService.saveInfographic(infographicEditorTarget.id, infoData);
                  return ok;
                },
                () => {
                  setInfographicEditorTarget(null);
                  resolve(true);
                }
              );
            });
          }}
        />
      )}

      {/* ======================================================= */}
      {/* RESEARCH INFOGRAPHIC PREVIEW MODAL */}
      {/* ======================================================= */}
      {previewInfographicPub && previewInfographicPub.infographicData && (
        <ResearchInfographicModal
          isOpen={true}
          onClose={() => setPreviewInfographicPub(null)}
          infographic={previewInfographicPub.infographicData}
          publication={previewInfographicPub}
        />
      )}


      {/* ======================================================= */}
      {/* STUDENT THESIS INFOGRAPHIC MODAL IN ADMIN PORTAL */}
      {/* ======================================================= */}
      <StudentThesisInfographicModal
        isOpen={!!adminInfographicStudent}
        onClose={() => setAdminInfographicStudent(null)}
        student={adminInfographicStudent}
        onStudentUpdated={(updated) => {
          setAdminInfographicStudent(updated);
          showToast(`Infografik skripsi "${updated.name}" berhasil diperbarui.`);
        }}
      />

      {/* ======================================================= */}
      {/* IN-APP CONFIRMATION MODAL (DELETIONS & DESTRUCTIVE ACTIONS) */}
      {/* ======================================================= */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 relative z-[10000]">
            <div className="flex items-start gap-4 mb-5">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  confirmDialog.isDestructive
                    ? 'bg-red-100 text-red-600 ring-4 ring-red-50'
                    : 'bg-sky-100 text-[#004b87] ring-4 ring-sky-50'
                }`}
              >
                {confirmDialog.isDestructive ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {confirmDialog.message}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                disabled={isConfirmLoading}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {confirmDialog.cancelText || 'Batal'}
              </button>
              <button
                type="button"
                onClick={handleDialogConfirm}
                disabled={isConfirmLoading}
                className={`px-5 py-2 text-xs sm:text-sm font-semibold text-white rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer ${
                  confirmDialog.isDestructive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#004b87] hover:bg-[#003865]'
                }`}
              >
                {isConfirmLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>{confirmDialog.confirmText || 'Konfirmasi'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* CONFIRMATION SAVE DIALOG (SYNCHRONIZE TO CENTRAL DB & PUBLIC) */}
      {/* ======================================================= */}
      {pendingSave && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 rounded-full bg-sky-100 text-[#004b87] flex items-center justify-center shrink-0 mt-0.5">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Simpan dan perbarui website publik?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Perubahan akan disimpan langsung ke database pusat terpadu dan disinkronkan ke website publik agar dapat dilihat oleh seluruh pengunjung di semua perangkat.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPendingSave(null)}
                disabled={isSavingInProgress}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteSave}
                disabled={isSavingInProgress}
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#004b87] hover:bg-[#003865] rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {isSavingInProgress ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Ya, Simpan dan Perbarui</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: PERSETUJUAN DEPLOYMENT ULANG PERMANEN */}
      {/* ======================================================= */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                    Persetujuan Deployment Ulang Produksi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kunci versi tampilan dan basis data ini sebagai rilis produksi permanen
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDeployModalOpen(false)}
                disabled={isDeploying}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Penjelasan Transparan */}
            <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-sky-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pembaruan Langsung Aktif di Web Publik</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Setiap perubahan yang Anda simpan di Admin Dashboard sudah otomatis tampil di website publik melalui basis data pusat terpadu.
              </p>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium pt-1 border-t border-sky-200/60">
                Persetujuan deployment ini berfungsi untuk <strong>mengompilasi ulang aset produksi (production bundle build)</strong> serta mencatat <strong>checkpoint snapshot permanen</strong> agar tampilan website tidak pernah kembali ke default bahkan setelah server container dimulai ulang.
              </p>
            </div>

            {/* Ringkasan Snapshot Data Terkini */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Ringkasan Konten Rilis Terkini
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-medium">Publikasi</div>
                  <div className="text-lg font-bold font-mono text-[#004b87]">{publications.length}</div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-medium">Pengajaran</div>
                  <div className="text-lg font-bold font-mono text-[#004b87]">{teaching.length}</div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-medium">Bimbingan</div>
                  <div className="text-lg font-bold font-mono text-[#004b87]">{students.length}</div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-medium">Proyek Riset</div>
                  <div className="text-lg font-bold font-mono text-[#004b87]">{researchProjects.length}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Profil &amp; Gelar:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[280px]">{profile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Penyetuju Resmi:</span>
                  <span className="font-mono text-sky-800 font-semibold">{profile.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Firebase Firestore:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Aktif &amp; Tersinkronisasi
                  </span>
                </div>
              </div>
            </div>

            {/* Release Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Catatan Rilis Deployment (Opsional)
              </label>
              <textarea
                value={deployNotes}
                onChange={e => setDeployNotes(e.target.value)}
                placeholder="Contoh: Pembaruan publikasi 2026, profil resmi, dan foto institusional permanen."
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004b87]"
              />
            </div>

            {/* Mandatory Approval Checkbox */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmPermanentCheck}
                  onChange={e => setConfirmPermanentCheck(e.target.checked)}
                  className="mt-0.5 rounded border-slate-400 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-amber-950 font-medium leading-relaxed">
                  <strong>Saya menyetujui deployment ulang produksi ini</strong> dan mengonfirmasi bahwa seluruh konten telah diverifikasi untuk dipatenkan secara permanen di server dan website publik.
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsDeployModalOpen(false)}
                disabled={isDeploying}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleTriggerDeployApproval}
                disabled={isDeploying || !confirmPermanentCheck}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 rounded-lg transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengompilasi &amp; Menerapkan Deployment...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Setujui &amp; Terapkan Deployment Permanen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: RIWAYAT PERSETUJUAN DEPLOYMENT */}
      {/* ======================================================= */}
      {isDeployHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif-academic text-lg font-bold text-slate-950">
                  Riwayat Persetujuan Deployment Produksi
                </h3>
              </div>
              <button
                onClick={() => setIsDeployHistoryOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Setiap rilis di bawah ini merupakan titik balik (immutable checkpoint) yang telah disetujui secara resmi oleh administrator dan dikompilasi secara permanen.
            </p>

            <div className="space-y-3">
              {deploymentStatus?.history?.map((rel, idx) => (
                <div
                  key={rel.releaseId}
                  className={`p-4 rounded-xl border transition-all ${
                    idx === 0
                      ? 'border-emerald-300 bg-emerald-50/50 shadow-2xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                        {rel.version}
                      </span>
                      <span className="font-mono text-xs text-slate-600">{rel.releaseId}</span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                          Rilis Aktif
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(rel.approvedAt).toLocaleString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium mb-2 italic">
                    "{rel.notes}"
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-slate-200/50">
                    <div>
                      <span className="text-slate-400">Disetujui:</span> {rel.approvedBy}
                    </div>
                    <div>
                      <span className="text-slate-400">Publikasi:</span> {rel.snapshotSummary?.publicationsCount ?? 0}
                    </div>
                    <div>
                      <span className="text-slate-400">Pengajaran:</span> {rel.snapshotSummary?.teachingCount ?? 0}
                    </div>
                    <div>
                      <span className="text-slate-400">Bimbingan:</span> {rel.snapshotSummary?.studentsCount ?? 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsDeployHistoryOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
