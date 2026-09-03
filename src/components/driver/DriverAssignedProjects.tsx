import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Phone, 
  ChevronRight, 
  ArrowRight, 
  AlertCircle, 
  CheckSquare, 
  Square, 
  Truck, 
  Layers, 
  Navigation, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../services/LanguageContext';
import { DriverAssignedProject } from '../../types';

interface DriverAssignedProjectsProps {
  projects: DriverAssignedProject[];
  onToggleTask: (projectId: string, taskId: string) => void;
  onNavigateToProject: (project: DriverAssignedProject) => void;
}

export default function DriverAssignedProjects({
  projects,
  onToggleTask,
  onNavigateToProject
}: DriverAssignedProjectsProps) {
  const { language, dir } = useLanguage();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Calculate task completion percentage
  const getProjectProgress = (p: DriverAssignedProject) => {
    if (!p.tasks || p.tasks.length === 0) return 0;
    const completed = p.tasks.filter(t => t.completed).length;
    return Math.round((completed / p.tasks.length) * 100);
  };

  return (
    <div className="space-y-6" dir={dir}>
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0f1422] p-5 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Building2 size={22} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              {language === 'ar' ? 'المشاريع اللوجستية المسندة وأوامر العمل' : 'Assigned Projects & Field Work Orders'}
            </h2>
            <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">
              {language === 'ar' ? 'استعرض المشاريع الإنشائية والتوريدية المخصصة لمركبتك مع تفاصيل مهام كل موقع' : 'View active construction & supply projects allocated to your vehicle'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black">
            {projects.length} {language === 'ar' ? 'مشاريع نشطة' : 'Active Projects'}
          </span>
        </div>
      </div>

      {/* Projects Split View (Left: Project List Cards, Right: Selected Project Deep Dive) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Project Selector Cards */}
        <div className="lg:col-span-5 space-y-3">
          {projects.map((project) => {
            const isSelected = project.id === selectedProjectId;
            const progress = getProjectProgress(project);
            const completedCount = project.tasks.filter(t => t.completed).length;

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`p-4.5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-white dark:bg-[#0f1422] border-purple-500/80 shadow-md ring-2 ring-purple-500/20'
                    : 'bg-white dark:bg-[#0f1422] border-slate-100 dark:border-slate-850/80 hover:border-purple-300 dark:hover:border-purple-900/50 shadow-2xs'
                }`}
              >
                {/* Priority Ribbon */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md font-mono text-[9px] font-black">
                    {project.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                    project.priority === 'high' 
                      ? 'bg-rose-500/10 text-rose-600' 
                      : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    {project.priority === 'high' ? (language === 'ar' ? 'أولوية قصوى' : 'High Priority') : (language === 'ar' ? 'أولوية اعتيادية' : 'Normal Priority')}
                  </span>
                </div>

                <h3 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                  {language === 'ar' ? project.name : project.nameEn}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                  <MapPin size={11} className="text-rose-500 shrink-0" />
                  <span className="line-clamp-1">{language === 'ar' ? project.location : project.locationEn}</span>
                </p>

                {/* Task Progress Mini Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                    <span>{language === 'ar' ? 'المهام المنجزة' : 'Tasks'}</span>
                    <span>{completedCount} / {project.tasks.length} ({progress}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Project Full Details & Driver Task List */}
        <div className="lg:col-span-7">
          {selectedProject ? (
            <div className="bg-white dark:bg-[#0f1422] p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-850 shadow-md space-y-5">
              
              {/* Project Hero Header */}
              <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl font-mono text-[10px] font-black">
                    {selectedProject.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{selectedProject.startDate} ➔ {selectedProject.endDate}</span>
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? selectedProject.name : selectedProject.nameEn}
                </h3>

                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  {language === 'ar' ? selectedProject.description : selectedProject.descriptionEn}
                </p>
              </div>

              {/* Project Manager & Location Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400">{language === 'ar' ? 'العميل والموقع الميداني:' : 'Client & Site:'}</span>
                  <p className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1">
                    <Building2 size={13} className="text-indigo-500" />
                    <span>{language === 'ar' ? selectedProject.client : selectedProject.clientEn}</span>
                  </p>
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? selectedProject.location : selectedProject.locationEn}</span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-400">{language === 'ar' ? 'مدير الموقع / المهندس:' : 'Site Manager:'}</span>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white">{selectedProject.projectManagerName}</h4>
                    <span className="text-[9.5px] text-slate-400 font-mono">{selectedProject.projectManagerPhone}</span>
                  </div>

                  <a
                    href={`tel:${selectedProject.projectManagerPhone}`}
                    className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all cursor-pointer shadow-sm"
                    title={language === 'ar' ? 'اتصال بمدير المشروع' : 'Call Project Manager'}
                  >
                    <Phone size={14} />
                  </a>
                </div>
              </div>

              {/* Driver's Operational Checklist in this Project */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <CheckSquare size={14} className="text-emerald-500" />
                    <span>{language === 'ar' ? 'مهام وأوامر العمل الموكلة للسائق:' : 'Driver Assigned Tasks & Milestones:'}</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    {getProjectProgress(selectedProject)}% {language === 'ar' ? 'مكتمل' : 'Done'}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedProject.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onToggleTask(selectedProject.id, task.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        task.completed 
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30' 
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-lg ${task.completed ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {task.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>
                        <div>
                          <p className={`text-xs font-black ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-white'}`}>
                            {language === 'ar' ? task.title : task.titleEn}
                          </p>
                          <span className="text-[9px] text-slate-400 font-semibold">
                            {language === 'ar' ? `تاريخ الاستحقاق: ${task.dueDate}` : `Due: ${task.dueDate}`}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-black ${
                        task.completed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {task.completed ? (language === 'ar' ? 'تم الإنجاز ✓' : 'Done ✓') : (language === 'ar' ? 'مطلوب التنفيذ' : 'Pending')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button: Navigate / Launch Trip on Map */}
              <div className="pt-2">
                <button
                  onClick={() => onNavigateToProject(selectedProject)}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 hover:from-purple-500 hover:via-indigo-500 hover:to-violet-600 active:scale-95 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation size={15} />
                  <span>{language === 'ar' ? 'بدء الملاحة الميدانية إلى موقع المشروع 🗺️' : 'Navigate to Project Site on Map 🗺️'}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-[#0f1422] p-8 rounded-3xl border border-slate-100 dark:border-slate-850 text-center text-slate-400">
              {language === 'ar' ? 'اختر مشروعاً من القائمة لعرض تفاصيله' : 'Select a project from the left'}
            </div>
          )}
        </div>

      </div>

      {/* Centralized Dispatch Live Sync Notice */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 dark:from-[#0d1224] dark:via-[#14122d] dark:to-[#0d1224] rounded-3xl p-4.5 border-2 border-indigo-200/90 dark:border-indigo-800/60 shadow-md shadow-indigo-100/60 dark:shadow-none flex flex-col sm:flex-row items-center justify-between gap-4 text-xs transition-all">
        <div className="flex items-center gap-3.5 text-slate-900 dark:text-white w-full sm:w-auto">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
            <Sparkles size={20} className="text-amber-300" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm block">
                {language === 'ar' ? 'المهام والمشاريع تصدر وتُسند مركزياً من الإدارة' : 'Tasks and Projects are centrally assigned by Management'}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white dark:bg-indigo-500/30 dark:text-indigo-300 text-[10px] font-black shadow-xs">
                {language === 'ar' ? 'توصية وتوجيه ذكي' : 'Smart Dispatch'}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-indigo-200 font-semibold leading-relaxed">
              {language === 'ar' ? 'تظهر أي مشاريع أو مهام ميدانية جديدة تسندها الإدارة في حسابك فوراً مع تفاصيل أوامر العمل والملاحة.' : 'Any dispatched projects or field tasks appear here immediately with work orders and navigation.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-600 dark:border-emerald-500/40 rounded-full text-xs font-black shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white dark:bg-emerald-400"></span>
            </span>
            <span>{language === 'ar' ? 'متزامن لحظياً ✓' : 'Live Synced ✓'}</span>
          </span>
        </div>
      </div>

    </div>
  );
}
