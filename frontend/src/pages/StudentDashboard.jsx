import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.title = 'Student Dashboard — Skill Nest';
    const stored = localStorage.getItem('userInfo');


    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const displayName = user?.name || 'Student';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-100">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
              Welcome back, <span className="text-indigo-700">{displayName}</span>
            </h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Here you can quickly see your upcoming Kuppi sessions, track your study progress and
              access the most important actions for your learning.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 text-sm">
              Join New Session
            </button>
            <button className="px-4 py-2 rounded-xl border border-indigo-200 text-indigo-700 font-semibold bg-white text-sm">
              View Profile
            </button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3 mb-10">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Overall Progress</p>
            <p className="text-3xl font-extrabold text-indigo-700">72%</p>
            <p className="text-xs text-slate-500 mt-2">Dummy value – later connect to real completion data.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Active Sessions</p>
            <p className="text-3xl font-extrabold text-emerald-600">3</p>
            <p className="text-xs text-slate-500 mt-2">Shows how many study sessions you are currently in.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Badges & Points</p>
            <p className="text-3xl font-extrabold text-amber-500">0 badges · 0 pts</p>
            <p className="text-xs text-slate-500 mt-2">You can map this to the badges / points system later.</p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3 mb-10">
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Upcoming Kuppi Sessions</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center border border-slate-100 rounded-xl px-4 py-3 bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-900">CS101 – Introduction to Programming</p>
                  <p className="text-xs text-slate-500">Next session: Tomorrow · 7.00 PM · via Zoom</p>
                </div>
                <button className="text-indigo-600 text-xs font-semibold hover:text-indigo-800">View details</button>
              </li>
              <li className="flex justify-between items-center border border-slate-100 rounded-xl px-4 py-3 bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-900">IT203 – Data Structures Revision</p>
                  <p className="text-xs text-slate-500">Next session: Friday · 5.30 PM · Lab 3</p>
                </div>
                <button className="text-indigo-600 text-xs font-semibold hover:text-indigo-800">View details</button>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Quick Links</h2>
            <ul className="space-y-2 text-sm">
              <li><span className="text-indigo-700 font-semibold cursor-pointer">Browse all sessions</span></li>
              <li><span className="text-indigo-700 font-semibold cursor-pointer">View my quizzes</span></li>
              <li><span className="text-indigo-700 font-semibold cursor-pointer">Update profile details</span></li>
              <li><span className="text-indigo-700 font-semibold cursor-pointer">Read help center</span></li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
