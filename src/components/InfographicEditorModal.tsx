import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Plus,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Send,
  Upload,
  ImageIcon
} from 'lucide-react';
import { Publication, ResearchInfographic } from '../types';
import { aiInfographicService } from '../services/aiInfographicService';

interface InfographicEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  publication: Publication;
  onSave: (infoData: ResearchInfographic) => Promise<boolean>;
}

export const InfographicEditorModal: React.FC<InfographicEditorModalProps> = ({
  isOpen,
  onClose,
  publication,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [authorsText, setAuthorsText] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [objectives, setObjectives] = useState('');
  const [methodology, setMethodology] = useState<string[]>(['']);
  const [dataAndObject, setDataAndObject] = useState('');
  const [keyFindings, setKeyFindings] = useState<string[]>(['']);
  const [conclusions, setConclusions] = useState('');
  const [doiOrSource, setDoiOrSource] = useState('');
  const [metricLabel, setMetricLabel] = useState('Efficiency Improvement');
  const [metricValue, setMetricValue] = useState('Optimal');
  const [status, setStatus] = useState<'Draft' | 'Published'>('Draft');
  const [theme, setTheme] = useState<'navy' | 'slate' | 'editorial' | 'teal'>('navy');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [customImageBase64, setCustomImageBase64] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Initialize from publication or existing infographic
  useEffect(() => {
    if (publication) {
      if (publication.infographicData) {
        const d = publication.infographicData;
        setTitle(d.title || publication.title);
        setAuthorsText(d.authorsText || publication.authors.map(a => a.name).join(', '));
        setProblemStatement(d.problemStatement || '');
        setObjectives(d.objectives || '');
        setMethodology(d.methodology?.length ? d.methodology : ['Mathematical model formulation']);
        setDataAndObject(d.dataAndObject || '');
        setKeyFindings(d.keyFindings?.length ? d.keyFindings : ['Validated empirical results']);
        setConclusions(d.conclusions || '');
        setDoiOrSource(d.doiOrSource || publication.doi || publication.venue);
        setMetricLabel(d.highlightMetric?.label || 'Research Result');
        setMetricValue(d.highlightMetric?.value || 'Optimal');
        setStatus(d.status || 'Draft');
        setTheme(d.theme || 'navy');
        setCustomImageUrl(d.customImageUrl || publication.infographicImageUrl || '');
        setCustomImageBase64(d.customImageBase64 || publication.infographicImageBase64 || '');
      } else {
        // Defaults
        setTitle(publication.title);
        setAuthorsText(publication.authors.map(a => a.name).join(', '));
        setProblemStatement('');
        setObjectives('');
        setMethodology(['Stage 1: Empirical data collection & mathematical formulation', 'Stage 2: Computational optimization algorithms']);
        setDataAndObject('');
        setKeyFindings(['Optimal solution achievement & convergence']);
        setConclusions('');
        setDoiOrSource(publication.doi ? `DOI: ${publication.doi}` : `${publication.venue} (${publication.year})`);
        setMetricLabel('Efficiency / Accuracy');
        setMetricValue('Optimal');
        setStatus('Draft');
        setTheme('navy');
        setCustomImageUrl(publication.infographicImageUrl || '');
        setCustomImageBase64(publication.infographicImageBase64 || '');
      }
    }
  }, [publication, isOpen]);

  if (!isOpen) return null;

  // Handle direct file upload for infographic
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ text: 'Pilih berkas gambar yang valid (PNG, JPG, atau WebP).', type: 'error' });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setStatusMessage({ text: 'Ukuran berkas gambar maksimal 8 MB.', type: 'error' });
      return;
    }

    try {
      setIsUploadingImage(true);
      setStatusMessage(null);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setCustomImageBase64(base64);
        setCustomImageUrl(base64);
        setStatusMessage({ text: `Gambar infografik "${file.name}" berhasil dimuat & siap disimpan ke database!`, type: 'success' });
        setIsUploadingImage(false);
      };
      reader.onerror = () => {
        setStatusMessage({ text: 'Gagal membaca berkas gambar.', type: 'error' });
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploadingImage(false);
      setStatusMessage({ text: 'Gagal memproses gambar: ' + (err.message || 'Error'), type: 'error' });
    }
  };

  // Generate via LLM Gemini (Optional helper)
  const handleGenerateLLM = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const generated = await aiInfographicService.generateInfographic({
        title: publication.title,
        authors: publication.authors,
        abstract: publication.abstract,
        venue: publication.venue,
        year: publication.year,
        keywords: publication.keywords,
        doi: publication.doi
      });

      if (generated) {
        setTitle(generated.title || publication.title);
        setAuthorsText(generated.authorsText || publication.authors.map(a => a.name).join(', '));
        setProblemStatement(generated.problemStatement || '');
        setObjectives(generated.objectives || '');
        setMethodology(generated.methodology?.length ? generated.methodology : ['']);
        setDataAndObject(generated.dataAndObject || '');
        setKeyFindings(generated.keyFindings?.length ? generated.keyFindings : ['']);
        setConclusions(generated.conclusions || '');
        setDoiOrSource(generated.doiOrSource || '');
        if (generated.highlightMetric) {
          setMetricLabel(generated.highlightMetric.label);
          setMetricValue(generated.highlightMetric.value);
        }
        setStatusMessage({ text: 'Teks infografik berhasil dirangkum otomatis!', type: 'success' });
      }
    } catch (err: any) {
      setStatusMessage({ text: 'Gagal merangkum teks otomatis: ' + err.message, type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (targetStatus?: 'Draft' | 'Published') => {
    setIsSaving(true);
    setStatusMessage(null);
    const chosenStatus = targetStatus || status;

    const payload: ResearchInfographic = {
      publicationId: publication.id,
      status: chosenStatus,
      title: title.trim() || publication.title,
      authorsText: authorsText.trim(),
      problemStatement: problemStatement.trim(),
      objectives: objectives.trim(),
      methodology: methodology.map(m => m.trim()).filter(Boolean),
      dataAndObject: dataAndObject.trim(),
      keyFindings: keyFindings.map(k => k.trim()).filter(Boolean),
      conclusions: conclusions.trim(),
      doiOrSource: doiOrSource.trim(),
      customImageUrl: customImageUrl.trim() || undefined,
      customImageBase64: customImageBase64.trim() || undefined,
      highlightMetric: {
        label: metricLabel.trim(),
        value: metricValue.trim()
      },
      theme,
      layoutDensity: 'comfortable',
      lastUpdated: new Date().toISOString()
    };

    const success = await onSave(payload);
    setIsSaving(false);
    if (success) {
      setStatus(chosenStatus);
      setStatusMessage({
        text: `Infographic saved successfully with status: ${chosenStatus === 'Published' ? 'PUBLISHED' : 'DRAFT'}!`,
        type: 'success'
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMessage({ text: 'Failed to save to backend server.', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-400 text-stone-950 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Research Infographics Studio
              </h3>
              <p className="text-xs text-stone-300 truncate max-w-md">
                Paper: {publication.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center bg-stone-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'edit' ? 'bg-white text-stone-900' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'preview' ? 'bg-white text-stone-900' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Infographic Upload & Database Sync Banner */}
        <div className="bg-sky-50 border-b border-sky-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              <strong>Pusat Infografik Riset Resmi:</strong> Terkoneksi langsung ke database SQL dan website publik.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-3 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{customImageUrl ? 'Ganti Poster Infografik' : 'Upload Poster (PNG/JPG/WebP)'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleGenerateLLM}
              disabled={isGenerating}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 text-[11px]"
              title="Opsional: Rangkum teks abstrak secara otomatis"
            >
              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Meringkas...' : 'Bantu Rangkum Teks'}</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-red-50 text-red-800 border-b border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'edit' ? (
            <div className="space-y-5 text-xs sm:text-sm">
              {/* Image Upload Card (Official Poster) */}
              <div className="p-4 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50/50 to-blue-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#004b87]" />
                    <span className="font-bold text-slate-900 text-xs">
                      Poster Gambar Infografik (Upload Resmi)
                    </span>
                  </div>
                  {customImageUrl ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Poster Siap Ditampilkan
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">Belum ada gambar poster diupload</span>
                  )}
                </div>

                {customImageUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
                    <div className="w-32 h-32 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                      <img
                        src={customImageUrl}
                        alt="Preview Infografik"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2 text-xs">
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Poster gambar ini akan ditampilkan kepada pembaca di publikasi karya ilmiah serta dapat diunduh langsung dalam format resolusi tinggi.
                      </p>
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer border border-slate-300 flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Ganti Gambar</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomImageUrl('');
                            setCustomImageBase64('');
                            setStatusMessage({ text: 'Gambar infografik dibersihkan.', type: 'success' });
                          }}
                          className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Gambar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-sky-300 rounded-xl p-5 text-center space-y-2 bg-white/70 hover:bg-white transition-colors">
                    <ImageIcon className="w-8 h-8 text-sky-400 mx-auto" />
                    <div className="text-xs font-bold text-slate-800">
                      Upload Poster Desain Infografik Karya Ini
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      Dukung format PNG, JPG, JPEG, atau WebP (Maksimal 8 MB). Infografik otomatis terhubung ke sistem basis data SQL.
                    </p>
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-4 h-4" />
                      <span>Pilih Berkas dari Komputer</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                <div className="pt-2">
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                    Atau gunakan tautan URL gambar eksternal (opsional):
                  </label>
                  <input
                    type="text"
                    value={customImageUrl}
                    onChange={e => {
                      setCustomImageUrl(e.target.value);
                      setCustomImageBase64(e.target.value);
                    }}
                    placeholder="https://.../infographic.png"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#004b87]"
                  />
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Infographic Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Authors List
                  </label>
                  <input
                    type="text"
                    value={authorsText}
                    onChange={e => setAuthorsText(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Problem & Objectives */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  1. Research Background & Problem Statement
                </label>
                <textarea
                  rows={3}
                  value={problemStatement}
                  onChange={e => setProblemStatement(e.target.value)}
                  placeholder="Outline the core academic problem addressed by this research..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  2. Research Objectives
                </label>
                <textarea
                  rows={2}
                  value={objectives}
                  onChange={e => setObjectives(e.target.value)}
                  placeholder="Specific scientific aims and objectives..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              {/* Methodology list */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-stone-700 font-semibold">
                    3. Research Methodology & Algorithmic Stages
                  </label>
                  <button
                    type="button"
                    onClick={() => setMethodology([...methodology, ''])}
                    className="text-stone-600 hover:text-stone-900 font-medium text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Stage</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {methodology.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-stone-100 text-stone-600 font-mono text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={m}
                        onChange={e => {
                          const next = [...methodology];
                          next[idx] = e.target.value;
                          setMethodology(next);
                        }}
                        className="flex-1 px-3 py-1.5 border border-stone-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-stone-900 focus:outline-none"
                      />
                      {methodology.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setMethodology(methodology.filter((_, i) => i !== idx))}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Data & Object */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  4. Research Data & Empirical Object
                </label>
                <input
                  type="text"
                  value={dataAndObject}
                  onChange={e => setDataAndObject(e.target.value)}
                  placeholder="Benchmark datasets, road graph network, or vehicle fleet..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              {/* Key findings list */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-stone-700 font-semibold">
                    5. Key Scientific Findings & Results
                  </label>
                  <button
                    type="button"
                    onClick={() => setKeyFindings([...keyFindings, ''])}
                    className="text-stone-600 hover:text-stone-900 font-medium text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Finding</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {keyFindings.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-stone-100 text-stone-600 font-mono text-xs flex items-center justify-center shrink-0">
                        •
                      </span>
                      <input
                        type="text"
                        value={f}
                        onChange={e => {
                          const next = [...keyFindings];
                          next[idx] = e.target.value;
                          setKeyFindings(next);
                        }}
                        className="flex-1 px-3 py-1.5 border border-stone-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-stone-900 focus:outline-none"
                      />
                      {keyFindings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setKeyFindings(keyFindings.filter((_, i) => i !== idx))}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlight Metric */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 border border-stone-200 rounded-xl">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Key Highlight Metric Label
                  </label>
                  <input
                    type="text"
                    value={metricLabel}
                    onChange={e => setMetricLabel(e.target.value)}
                    placeholder="e.g. Fuel Consumption Reduction / Accuracy Gain"
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-stone-900 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Metric Achievement / Value
                  </label>
                  <input
                    type="text"
                    value={metricValue}
                    onChange={e => setMetricValue(e.target.value)}
                    placeholder="e.g. 14.8% / 100% / Optimal"
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-stone-900 focus:outline-none bg-white font-bold text-stone-900"
                  />
                </div>
              </div>

              {/* Conclusions & Source */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  6. Conclusions & Scientific Contribution
                </label>
                <textarea
                  rows={2}
                  value={conclusions}
                  onChange={e => setConclusions(e.target.value)}
                  placeholder="Summary of research conclusions, takeaways, and practical impact..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  DOI / Original Publication Source
                </label>
                <input
                  type="text"
                  value={doiOrSource}
                  onChange={e => setDoiOrSource(e.target.value)}
                  placeholder="DOI: 10.1016/... or Journal of Operations Management"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              {/* Publish Status & Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Infographic Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-stone-900 bg-white"
                  >
                    <option value="Draft">Draft (Visible to Admin Only)</option>
                    <option value="Published">Published (Visible on Public Website)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Academic Color Theme
                  </label>
                  <select
                    value={theme}
                    onChange={e => setTheme(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-stone-900 bg-white"
                  >
                    <option value="navy">Classic Navy & White</option>
                    <option value="slate">Editorial Slate Gray</option>
                    <option value="teal">Academic Teal</option>
                    <option value="editorial">Modern Monochrome</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Live Preview inside editor */
            <div className="border border-stone-200 rounded-xl p-6 bg-stone-50/50 space-y-6">
              {customImageUrl && (
                <div className="p-4 bg-white rounded-xl border border-sky-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#004b87] flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      <span>Poster Gambar Infografik Resmi (Tersimpan di SQL)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Aktif
                    </span>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center p-2">
                    <img
                      src={customImageUrl}
                      alt={title || 'Infografik'}
                      className="max-h-96 w-auto object-contain rounded shadow-2xs"
                    />
                  </div>
                </div>
              )}

              <div className="border-b-2 border-stone-900 pb-4 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#004b87]">
                  Sebelas Maret University • FMIPA • Department of Mathematics
                </span>
                <h3 className="font-serif-academic text-2xl font-bold text-slate-900">
                  {title || 'Untitled Infographic'}
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  Authors: {authorsText || 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-stone-200">
                    <span className="font-bold text-stone-900 text-xs block mb-1">1. Research Background & Problem</span>
                    <p className="text-stone-700 text-justify">{problemStatement || '-'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-stone-200">
                    <span className="font-bold text-stone-900 text-xs block mb-1">2. Research Objectives</span>
                    <p className="text-stone-700 text-justify">{objectives || '-'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-stone-200">
                    <span className="font-bold text-stone-900 text-xs block mb-1">3. Data & Object</span>
                    <p className="text-stone-700 text-justify">{dataAndObject || '-'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-stone-200">
                    <span className="font-bold text-stone-900 text-xs block mb-1">4. Methodology & Algorithms</span>
                    <ul className="space-y-1 text-stone-700">
                      {methodology.map((m, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-semibold text-stone-900">{i + 1}.</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-stone-200">
                    <span className="font-bold text-stone-900 text-xs block mb-1">5. Key Findings</span>
                    <ul className="space-y-1 text-stone-700">
                      {keyFindings.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    {metricValue && (
                      <div className="mt-3 p-2.5 bg-stone-900 text-white rounded-md flex items-center justify-between">
                        <span className="text-xs text-stone-300">{metricLabel}:</span>
                        <span className="text-sm font-bold text-amber-300">{metricValue}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-stone-100 p-4 rounded-lg border border-stone-300 text-xs sm:text-sm">
                <span className="font-bold text-stone-900 text-xs block mb-1">6. Conclusions</span>
                <p className="text-stone-800 text-justify">{conclusions || '-'}</p>
              </div>

              <div className="text-xs text-stone-500 font-mono">
                Source: {doiOrSource || '-'}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-stone-50 border-t border-stone-200 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                status === 'Published'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              Status: {status === 'Published' ? 'Published (Public)' : 'Draft (Admin Only)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSave('Draft')}
              disabled={isSaving}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave('Published')}
              disabled={isSaving}
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Approve & Publish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
