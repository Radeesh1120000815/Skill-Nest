import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useResource } from '../components/context/ResourceContext.jsx';

const SEMESTERS = ['SEMESTER_1', 'SEMESTER_2', 'FULL_YEAR'];
const TYPES     = ['NOTES', 'SLIDES', 'PAST_PAPER', 'LINK', 'OTHER'];

const ALLOWED_FORMATS = 'PDF, DOCX, PPTX, XLSX, TXT, PNG, JPG (max 25 MB)';

export default function UploadResource() {
  const { createResource, loading } = useResource();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [form, setForm] = useState({
    title: '', moduleCode: '', moduleName: '', academicYear: '',
    semester: '', type: '', description: '', tags: '',
    storageType: 'FILE', externalUrl: '', changeNote: '',
  });
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitMsg, setSubmitMsg] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.size > 25 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: 'File size must be under 25 MB' }));
      return;
    }
    setFile(selectedFile);
    setErrors((prev) => ({ ...prev, file: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())        errs.title        = 'Title is required';
    if (!form.moduleCode.trim())   errs.moduleCode   = 'Module code is required';
    if (!form.moduleName.trim())   errs.moduleName   = 'Module name is required';
    if (!form.academicYear.trim()) errs.academicYear = 'Academic year is required';
    if (!form.semester)            errs.semester     = 'Semester is required';
    if (!form.type)                errs.type         = 'Resource type is required';
    if (form.storageType === 'FILE'  && !file)                 errs.file        = 'Please select a file to upload';
    if (form.storageType === 'LINK'  && !form.externalUrl.trim()) errs.externalUrl = 'External URL is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });
    if (file) formData.append('file', file);

    const result = await createResource(formData);
    if (result.success) {
      setSubmitMsg({ type: 'success', text: result.message });
      setTimeout(() => navigate('/resources/my-uploads'), 1800);
    } else {
      setSubmitMsg({ type: 'error', text: result.message });
    }
  };

  const isLecturer = user?.role === 'LECTURER' || user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Link to="/resources" className="inline-flex items-center gap-2 text-indigo-200 hover:text-white text-sm mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Hub
          </Link>
          <h1 className="text-3xl font-bold mb-2">📤 Upload a Resource</h1>
          <p className="text-indigo-200 text-sm">
            {isLecturer
              ? '✅ As a Lecturer, your resource will be published immediately.'
              : '⏳ Student uploads are reviewed by an admin before going live.'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Status message */}
        {submitMsg.text && (
          <div className={`mb-5 flex items-start gap-3 px-5 py-4 rounded-xl text-sm font-medium ${
            submitMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <span className="text-lg">{submitMsg.type === 'success' ? '✅' : '❌'}</span>
            {submitMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Section: Basic Info ──────────────────────────────────── */}
          <FormSection title="📌 Resource Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Title *" error={errors.title} fullWidth>
                <input
                  name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. Data Structures Mid-Term Notes"
                  className={inputClass(errors.title)}
                  maxLength={200}
                />
              </FormField>

              <FormField label="Resource Type *" error={errors.type}>
                <select name="type" value={form.type} onChange={handleChange} className={inputClass(errors.type)}>
                  <option value="">Select type...</option>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Module Code *" error={errors.moduleCode}>
                <input
                  name="moduleCode" value={form.moduleCode} onChange={handleChange}
                  placeholder="e.g. CS301"
                  className={inputClass(errors.moduleCode)}
                  style={{ textTransform: 'uppercase' }}
                />
              </FormField>

              <FormField label="Module Name *" error={errors.moduleName}>
                <input
                  name="moduleName" value={form.moduleName} onChange={handleChange}
                  placeholder="e.g. Data Structures & Algorithms"
                  className={inputClass(errors.moduleName)}
                />
              </FormField>

              <FormField label="Academic Year *" error={errors.academicYear}>
                <input
                  name="academicYear" value={form.academicYear} onChange={handleChange}
                  placeholder="e.g. 2023/2024"
                  className={inputClass(errors.academicYear)}
                />
              </FormField>

              <FormField label="Semester *" error={errors.semester}>
                <select name="semester" value={form.semester} onChange={handleChange} className={inputClass(errors.semester)}>
                  <option value="">Select semester...</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Description" fullWidth>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                rows={3}
                placeholder="Brief description of what this resource covers..."
                className={inputClass()}
                maxLength={1000}
              />
            </FormField>

            <FormField label="Tags (comma-separated)" fullWidth>
              <input
                name="tags" value={form.tags} onChange={handleChange}
                placeholder="e.g. algorithms, sorting, trees"
                className={inputClass()}
              />
            </FormField>
          </FormSection>

          {/* ── Section: File or Link ─────────────────────────────── */}
          <FormSection title="📎 File or Link">
            {/* Storage type toggle */}
            <div className="flex gap-2 mb-4">
              {['FILE', 'LINK'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, storageType: st }))}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    form.storageType === st
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {st === 'FILE' ? '📄 Upload File' : '🔗 External Link'}
                </button>
              ))}
            </div>

            {form.storageType === 'FILE' ? (
              <div>
                {/* Drag-and-drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                  } ${errors.file ? 'border-red-300 bg-red-50' : ''}`}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <input
                    id="fileInput" type="file" className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">📄</div>
                      <p className="font-semibold text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-xs text-red-500 hover:text-red-700 mt-1"
                      >
                        Remove file ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">📤</div>
                      <p className="font-semibold text-gray-700">Drop file here or click to browse</p>
                      <p className="text-xs text-gray-400">{ALLOWED_FORMATS}</p>
                    </div>
                  )}
                </div>
                {errors.file && <p className="mt-1.5 text-xs text-red-500">{errors.file}</p>}
              </div>
            ) : (
              <FormField label="External URL *" error={errors.externalUrl} fullWidth>
                <input
                  name="externalUrl" value={form.externalUrl} onChange={handleChange}
                  type="url" placeholder="https://drive.google.com/..."
                  className={inputClass(errors.externalUrl)}
                />
              </FormField>
            )}

            <FormField label="Change Note" fullWidth>
              <input
                name="changeNote" value={form.changeNote} onChange={handleChange}
                placeholder="Brief note about this upload (optional)"
                className={inputClass()}
              />
            </FormField>
          </FormSection>

          {/* ── Submit ───────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <Link
              to="/resources"
              className="flex-1 text-center py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-2 flex items-center justify-center gap-2 flex-1 py-3 px-8 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>📤 {isLecturer ? 'Publish Resource' : 'Submit for Review'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Small helper components ──────────────────────────────────────────────────
const FormSection = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h3 className="font-bold text-gray-800 mb-4 text-base">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormField = ({ label, error, children, fullWidth }) => (
  <div className={fullWidth ? 'col-span-2' : ''}>
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const inputClass = (error) =>
  `w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
    error
      ? 'border-red-300 focus:ring-red-300 bg-red-50'
      : 'border-gray-200 focus:ring-indigo-400 focus:border-indigo-400 bg-gray-50 focus:bg-white'
  }`;
