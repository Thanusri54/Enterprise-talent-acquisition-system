import React, { useState } from 'react';
import { ArrowRight, History, UserCheck, ChevronRight, Calendar, Sparkles, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import store from '../services/store';
import { useToast } from '../context/ToastContext';

const STAGES = [
  { key: 'APPLIED', label: 'APPLIED', color: 'bg-slate-800 text-slate-300 border-slate-700' },
  { key: 'SCREENING', label: 'SCREENING', color: 'bg-indigo-950/50 text-indigo-300 border-indigo-700/60' },
  { key: 'SHORTLISTED', label: 'SHORTLISTED', color: 'bg-blue-950/50 text-blue-300 border-blue-700/60' },
  { key: 'INTERVIEW', label: 'INTERVIEW', color: 'bg-amber-950/50 text-amber-300 border-amber-700/60' },
  { key: 'SELECTED', label: 'SELECTED', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-600/70' },
  { key: 'REJECTED', label: 'REJECTED', color: 'bg-rose-950/50 text-rose-300 border-rose-700/60' },
  { key: 'ON_HOLD', label: 'ON HOLD', color: 'bg-purple-950/50 text-purple-300 border-purple-700/60' },
];

const STAGE_ORDER = ['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];

const KanbanBoard = ({ kanbanData = {}, onRefresh, searchQuery = '' }) => {
  const toast = useToast();
  const [selectedCard, setSelectedCard] = useState(null);
  const [targetStage, setTargetStage] = useState('');
  const [comments, setComments] = useState('');
  const [historyModalCard, setHistoryModalCard] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [moving, setMoving] = useState(false);

  const handleOpenMoveModal = (card) => {
    setSelectedCard(card);
    setTargetStage(card.currentStage || card.stage || 'APPLIED');
    setComments('');
  };

  const handleQuickAdvance = async (card, e) => {
    e.stopPropagation();
    const current = card.currentStage || card.stage || 'APPLIED';
    const currentIndex = STAGE_ORDER.indexOf(current);
    if (currentIndex >= 0 && currentIndex < STAGE_ORDER.length - 1) {
      const nextStage = STAGE_ORDER[currentIndex + 1];
      await executeStageMove(card, nextStage, `Quick-promoted to ${nextStage} via Kanban pipeline control`);
    } else {
      handleOpenMoveModal(card);
    }
  };

  const executeStageMove = async (card, newStage, note) => {
    setMoving(true);
    const oldStage = card.currentStage || card.stage || 'APPLIED';

    try {
      // 1. Move backend pipeline stage
      await api.post(`/pipeline/${card.id}/move`, {
        toStage: newStage,
        forceMove: true,
        movedByName: 'Talent Acquisition',
        comments: note || `Candidate transitioned from ${oldStage} to ${newStage}`
      });

      // 2. Sync application status in backend
      if (card.applicationId) {
        try {
          await api.patch(`/applications/${card.applicationId}/status`, { status: newStage });
        } catch (appErr) {}
      }

      // 3. Sync candidate status in backend
      if (card.candidateId) {
        try {
          await api.patch(`/candidates/${card.candidateId}/status`, { status: newStage });
        } catch (candErr) {}
      }

      store.logActivity(`${card.candidateName} moved from ${oldStage} to ${newStage}`, 'Recruiter');
      store.logAudit('Recruiter', 'RECRUITER', 'MOVE_STAGE', 'PIPELINE', `PIPE-${card.id}`, `Moved ${card.candidateName} stage to ${newStage}`);

      toast.success(`${card.candidateName} successfully transitioned to ${newStage}`);
    } catch (err) {
      console.error('Stage transition error:', err);
      toast.error(err.response?.data?.message || 'Failed to move candidate stage.');
    } finally {
      setMoving(false);
      setSelectedCard(null);
      if (onRefresh) onRefresh();
    }
  };

  const handleMoveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCard || !targetStage) return;
    await executeStageMove(selectedCard, targetStage, comments || `Manual stage update to ${targetStage}`);
  };

  const handleOpenHistory = async (card) => {
    setHistoryModalCard(card);
    try {
      const res = await api.get(`/pipeline/${card.id}/history`);
      setHistoryLogs(res.data || []);
    } catch (err) {
      setHistoryLogs(card.history || []);
    }
  };

  return (
    <div className="space-y-4">
      {/* Scrollable Stage Columns Container */}
      <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin">
        {STAGES.map((stage) => {
          let cards = kanbanData[stage.key] || [];

          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            cards = cards.filter(c =>
              (c.candidateName && c.candidateName.toLowerCase().includes(q)) ||
              (c.jobTitle && c.jobTitle.toLowerCase().includes(q)) ||
              (c.skills && (Array.isArray(c.skills) ? c.skills.join(', ') : c.skills).toLowerCase().includes(q))
            );
          }

          return (
            <div key={stage.key} className="w-80 shrink-0 bg-slate-900/70 rounded-2xl border border-slate-800 p-3.5 flex flex-col max-h-[780px]">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 px-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${stage.color}`}>
                    {stage.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-800/90 border border-slate-700/60 px-2 py-0.5 rounded-full">
                  {cards.length}
                </span>
              </div>

              {/* Cards List in Stage */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                {cards.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20">
                    No candidates in this stage
                  </div>
                ) : (
                  cards.map((card) => {
                    const initials = (card.candidateName || 'Candidate')
                      .split(' ')
                      .map(p => p[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase();

                    const current = card.currentStage || card.stage || 'APPLIED';
                    const canQuickAdvance = STAGE_ORDER.includes(current) && current !== 'SELECTED';

                    return (
                      <div
                        key={card.id}
                        className="bg-slate-900 border border-slate-800/90 hover:border-cyan-500/50 rounded-xl p-3.5 shadow-sm transition-all hover:shadow-cyan-950/20 group relative"
                      >
                        {/* Top: Avatar, Name, Job, History Button */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-start space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {initials}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                                {card.candidateName}
                              </h4>
                              <p className="text-[11px] text-cyan-400 font-medium line-clamp-1 mt-0.5">
                                {card.jobTitle}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenHistory(card)}
                            title="View Stage Transition Audit History"
                            className="text-slate-500 hover:text-cyan-400 p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Match & Skills */}
                        {card.skills && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {(Array.isArray(card.skills) ? card.skills : card.skills.split(',')).slice(0, 3).map((sk, idx) => (
                              <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
                                {sk.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Metadata row */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center space-x-1">
                            <UserCheck className="w-3 h-3 text-slate-500" />
                            <span className="truncate max-w-[120px]">{card.assignedRecruiterName || 'Talent Lead'}</span>
                          </span>
                          <span className="font-mono text-slate-300">{card.experienceYears ? `${card.experienceYears}y exp` : '3y exp'}</span>
                        </div>

                        {/* Stage Actions */}
                        <div className="mt-3 pt-2 flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenMoveModal(card)}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center space-x-1 border border-slate-700/60"
                          >
                            <span>Move Stage</span>
                          </button>

                          {canQuickAdvance && (
                            <button
                              onClick={(e) => handleQuickAdvance(card, e)}
                              disabled={moving}
                              title="Advance to Next Stage"
                              className="px-2.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-slate-950 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center border border-cyan-500/30"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Move Stage Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 pb-2 border-b border-slate-800">
              <ArrowRight className="w-4 h-4 text-cyan-400" />
              <span>Move Candidate Pipeline Stage</span>
            </h3>

            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-xs font-semibold text-slate-200">{selectedCard.candidateName}</div>
              <div className="text-[11px] text-cyan-400">{selectedCard.jobTitle}</div>
              <div className="text-[10px] text-slate-400 mt-1">
                Current Stage: <span className="text-amber-400 font-mono font-bold">{selectedCard.currentStage || selectedCard.stage}</span>
              </div>
            </div>

            <form onSubmit={handleMoveSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Target Pipeline Stage *</label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Stage Transition Remarks / Notes</label>
                <textarea
                  rows="3"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Reason for candidate stage transition..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedCard(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={moving}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-lg shadow-md transition-all"
                >
                  {moving ? 'Updating...' : 'Confirm Stage Move'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Audit Log Modal */}
      {historyModalCard && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  <span>Candidate Stage History</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{historyModalCard.candidateName} &bull; {historyModalCard.jobTitle}</p>
              </div>
              <button
                onClick={() => setHistoryModalCard(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="mt-4 overflow-y-auto space-y-3 flex-1 pr-1 text-xs scrollbar-thin">
              {(!historyLogs || historyLogs.length === 0) ? (
                <div className="text-center py-8 text-slate-500">No stage history entries recorded yet.</div>
              ) : (
                historyLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between items-center text-slate-400 text-[10px]">
                      <span className="font-semibold text-cyan-400">{log.movedByName || log.movedBy || 'Talent Acquisition'}</span>
                      <span className="font-mono">{log.timestamp ? new Date(log.timestamp).toLocaleString() : (log.date || 'Recently')}</span>
                    </div>
                    <div className="mt-1.5 flex items-center space-x-2 font-mono">
                      <span className="text-slate-400">{log.fromStage || 'INITIAL'}</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                      <span className="text-emerald-400 font-bold">{log.toStage || log.stage}</span>
                    </div>
                    {log.comments && (
                      <div className="mt-2 text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-[11px]">
                        "{log.comments}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
