import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Footer from '../components/Footer';
import axios from 'axios';

const initialRole = "Student";
const STUDENT_KEY = "registeredStudents";

export default function Register() {
  useEffect(() => { document.title = 'Create Account — Skill Nest'; }, []);

  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({ name: "", id: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastUser, setLastUser] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "Student") {
      const saved = localStorage.getItem(STUDENT_KEY);
      setStudentList(saved ? JSON.parse(saved) : []);
    } else {
      setStudentList([]);
    }
  }, [role]);

  const handleRole = (r) => {
    setRole(r);
    setForm((f) => ({ ...f, id: "" }));
    setErrors({});
    setApiError('');
    if (r === "Student") setShowStudentPopup(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setApiError('');
  };

  const validate = () => {
    let valid = true;
    let err = {};
    if (!form.name.trim()) {
      err.name = "Full name is required."; valid = false;
    } else if (form.name.length < 3) {
      err.name = "Name must be at least 3 characters."; valid = false;
    } else if (!/^[a-zA-Z\s.'-]+$/.test(form.name)) {
      err.name = "Name can only contain letters and spaces."; valid = false;
    }
    if (role === "Student") {
      if (!form.id.trim()) {
        err.id = "Student ID is required."; valid = false;
      } else if (!/^IT\d{8}$/i.test(form.id)) {
        err.id = "Student ID must be in format IT21234567."; valid = false;
      }
    } else if (role === "Lecturer") {
      if (!form.id.trim()) {
        err.id = "Lecturer ID is required."; valid = false;
      } else if (!/^LE\d{4}$/i.test(form.id)) {
        err.id = "Lecturer ID must be in format LE0012."; valid = false;
      }
    }
    if (!form.email.trim()) {
      err.email = "Email address is required."; valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      err.email = "Please enter a valid email address."; valid = false;
    }
    if (!form.password) {
      err.password = "Password is required."; valid = false;
    } else if (form.password.length < 8) {
      err.password = "Password must be at least 8 characters."; valid = false;
    } else if (!/[A-Z]/.test(form.password)) {
      err.password = "Must include at least one uppercase letter."; valid = false;
    } else if (!/[0-9]/.test(form.password)) {
      err.password = "Must include at least one number."; valid = false;
    }
    if (!form.confirm) {
      err.confirm = "Please confirm your password."; valid = false;
    } else if (form.confirm !== form.password) {
      err.confirm = "Passwords do not match."; valid = false;
    }
    setErrors(err);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');
    try {
      const backendUrl = "http://localhost:5001";                    // change port
      let endpoint = `${backendUrl}/api/auth/register`;
      //if (role === "Lecturer") endpoint = `${backendUrl}/api/lecturers/register`;
      //if (role === "Student")  endpoint = `${backendUrl}/api/students/register`;

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: role.toUpperCase(),
        ...(role === "Student" && { studentId: form.id }),
        ...(role === "Lecturer" && { lecturerId: form.id }),
        ...(role === "Admin" && { role: "ADMIN" }),
      };

      await axios.post(endpoint, payload);
      setSuccess(true);
      setLastUser({ name: form.name, email: form.email, id: form.id, role });

      if (role === "Student") {
        const saved = localStorage.getItem(STUDENT_KEY);
        let students = saved ? JSON.parse(saved) : [];
        if (!students.some(s => s.id === form.id || s.email === form.email)) {
          students.push({ name: form.name, id: form.id, email: form.email });
          localStorage.setItem(STUDENT_KEY, JSON.stringify(students));
          setStudentList(students);
        }
      }

      setTimeout(() => { navigate("/signin"); }, 2000);

    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed. Please try again.";
      setErrors({ api: msg });
      setApiError(msg);                                             //  show in banner
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-50">
      <nav className="bg-slate-900 border-b border-white/10 px-6 flex items-center justify-between h-16 shadow-md">
        <a className="flex items-center gap-2 text-white font-extrabold text-lg no-underline" href="/">
          <svg className="w-8 h-8" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="22" r="20.5" fill="#1a3d28" stroke="#2e7d52" strokeWidth="1.3" />
            <path d="M11 17 Q22 13.5 22 13.5 L22 24 Q22 24 11 28 Z" fill="#3da066" opacity=".6" />
            <path d="M33 17 Q22 13.5 22 13.5 L22 24 Q22 24 33 28 Z" fill="#3da066" />
            <line x1="22" y1="13.5" x2="22" y2="24" stroke="#2e7d52" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="22" cy="10" r="2.8" fill="#f5a623" />
            <line x1="22" y1="7.2" x2="22" y2="5" stroke="#f5a623" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="20.2" y1="7.8" x2="18.5" y2="6.2" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="23.8" y1="7.8" x2="25.5" y2="6.2" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M13 30 Q22 34 31 30" stroke="#3da066" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </svg>
          <span>Skill <span className="text-amber-500">Nest</span></span>
        </a>
        <div className="flex items-center gap-2">
          <a className="hidden sm:inline nav-a text-white/60 hover:text-white px-3 py-1 rounded transition" href="/">Home</a>
          <a className="hidden sm:inline nav-a text-white/60 hover:text-white px-3 py-1 rounded transition" href="/resources">Resources</a>   {/* ✅ real route */}
          <a className="hidden sm:inline nav-a text-white/60 hover:text-white px-3 py-1 rounded transition" href="/sessions">Sessions</a>       {/* ✅ real route */}
          <a className="hidden sm:inline nav-a text-white/60 hover:text-white px-3 py-1 rounded transition" href="#">Help Center</a>
          <a className="ml-2 nav-btn bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-lg hover:bg-amber-500 transition" href="/signin">Sign In</a>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center py-10 px-2">
        <div className="reg-card bg-white rounded-3xl p-8 max-w-lg w-full shadow-xl animate-fadeUp">
          <div className="flex items-center gap-2 justify-center mb-6">
            <svg style={{ width: 32, height: 32 }} viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="20.5" fill="#eff6ff" stroke="#1e40af" strokeWidth="1.3" />
              <path d="M11 17 Q22 13.5 22 13.5 L22 24 Q22 24 11 28 Z" fill="#1e40af" opacity=".4" />
              <path d="M33 17 Q22 13.5 22 13.5 L22 24 Q22 24 33 28 Z" fill="#1e40af" opacity=".9" />
              <line x1="22" y1="13.5" x2="22" y2="24" stroke="#1e40af" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="22" cy="10" r="2.8" fill="#f5a623" />
              <line x1="22" y1="7.2" x2="22" y2="5" stroke="#f5a623" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="20.2" y1="7.8" x2="18.5" y2="6.2" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="23.8" y1="7.8" x2="25.5" y2="6.2" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 30 Q22 34 31 30" stroke="#1e40af" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </svg>
            <span className="font-extrabold text-slate-900 text-lg">Skill <span className="text-amber-500">Nest</span></span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 text-center mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 text-center mb-7">
            Or <a href="/signin" className="text-blue-700 font-semibold hover:underline">sign in to your existing account</a>
          </p>

          {/* Role selector */}
          <div className="mb-6">
            <div className="text-center mb-1 font-bold text-sm text-slate-800">Choose your account type:</div>
            <div className="text-xs text-blue-700 flex items-center justify-center gap-1 mb-2">💡 Select the role that best describes you</div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['Student', 'Lecturer', 'Admin'].map((r) => (
                <button type="button" key={r} onClick={() => handleRole(r)}
                  className={`role-tab flex flex-col items-center gap-2 px-3 py-4 rounded-xl border-2 font-semibold text-xs transition ${role === r ? 'border-blue-700 bg-blue-50 text-blue-700 shadow' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ API error banner */}
          {apiError && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-2 mb-3 text-center font-semibold text-sm">
              ❌ {apiError}
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div className="success-banner bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-2 mb-3 text-center font-semibold">
              ✓ Account created successfully! Redirecting to Sign In...
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="fields-group border border-slate-200 rounded-xl overflow-hidden mb-5">

              <div className="field-wrap border-b border-slate-200 relative">
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Full Name"
                  className="block w-full px-6 py-5 text-lg text-slate-900 bg-white outline-none" />
                {role === "Student" && showStudentPopup && studentList.length > 0 && (
                  <div className="absolute left-0 top-full z-20 w-full bg-white border border-blue-200 rounded-xl shadow-lg mt-1 max-h-56 overflow-y-auto">
                    {studentList.map((stud) => (
                      <div key={stud.id + stud.email}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-800"
                        onClick={() => { setForm(f => ({ ...f, name: stud.name, id: stud.id, email: stud.email })); setShowStudentPopup(false); }}>
                        <b>Name:</b> {stud.name} <span className="mx-2">|</span> <b>ID:</b> {stud.id} <span className="mx-2">|</span> <b>Email:</b> {stud.email}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.name && <div className="field-error-wrap px-4 py-2"><span className="err-msg text-red-600 text-base">{errors.name}</span></div>}

              {(role === "Student" || role === "Lecturer") && <>
                <div className="field-wrap border-b border-slate-200">
                  <input type="text" name="id" value={form.id} onChange={handleChange}
                    placeholder={role === "Student" ? "Student ID (e.g. IT21234567)" : "Lecturer ID (e.g. LE0012)"}
                    className="block w-full px-6 py-5 text-lg text-slate-900 bg-white outline-none" />
                </div>
                {errors.id && <div className="field-error-wrap px-4 py-2"><span className="err-msg text-red-600 text-base">{errors.id}</span></div>}
              </>}

              <div className="field-wrap border-b border-slate-200">
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder={role === "Student" ? "Email (e.g. student@gmail.com)" : role === "Lecturer" ? "Email (e.g. lecturer@gmail.com)" : "Email (e.g. admin@gmail.com)"}
                  className="block w-full px-6 py-5 text-lg text-slate-900 bg-white outline-none" />
              </div>
              {errors.email && <div className="field-error-wrap px-4 py-2"><span className="err-msg text-red-600 text-base">{errors.email}</span></div>}

              <div className="field-wrap border-b border-slate-200 relative">
                <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                  placeholder="Password (min 8 characters)"
                  className="block w-full px-6 py-5 text-lg text-slate-900 bg-white outline-none pr-12" />
                <button type="button" tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none"
                  onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {errors.password && <div className="field-error-wrap px-4 py-2"><span className="err-msg text-red-600 text-base">{errors.password}</span></div>}

              <div className="field-wrap relative">
                <input type={showConfirm ? "text" : "password"} name="confirm" value={form.confirm} onChange={handleChange}
                  placeholder="Confirm Password"
                  className="block w-full px-6 py-5 text-lg text-slate-900 bg-white outline-none pr-12" />
                <button type="button" tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none"
                  onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {errors.confirm && <div className="field-error-wrap px-4 py-2"><span className="err-msg text-red-600 text-base">{errors.confirm}</span></div>}
            </div>

            <button type="submit"
              className="btn-signup w-full bg-gradient-to-r from-blue-800 to-blue-600 text-white font-bold rounded-xl py-3 shadow-lg hover:opacity-90 transition mb-2"
              disabled={success}>
              {success ? "✓ Account Created!" : "Sign up"}
            </button>
          </form>

          {lastUser && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="font-bold text-blue-900 mb-2">Last Registered User</div>
              <div className="text-sm text-slate-800"><b>Name:</b> {lastUser.name}</div>
              <div className="text-sm text-slate-800"><b>Email:</b> {lastUser.email}</div>
              <div className="text-sm text-slate-800"><b>ID:</b> {lastUser.id}</div>
              <div className="text-sm text-slate-800"><b>Role:</b> {lastUser.role}</div>
            </div>
          )}

          <p className="terms text-xs text-slate-400 text-center mt-3 leading-relaxed">
            By signing up you agree to our <span className="text-blue-700 font-bold">Terms of Service</span> and <span className="text-blue-700 font-bold">Privacy Policy</span>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
