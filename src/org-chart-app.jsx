import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Users, Network, Plus, Pencil, Trash2, X, Search, Building2, Upload, Image as ImageIcon, MapPin, Filter, Maximize2, Minimize2 } from 'lucide-react';

// Color palette for known teams. When a new team is added that isn't in this map,
// extraTeamColors are cycled to assign one.
const baseTeamColors = {
  Executive:                { bg: '#1a1a1a', text: '#fafaf7' },
  Finance:                  { bg: '#3d5a3d', text: '#fafaf7' },
  Engineering:              { bg: '#1e3a5f', text: '#fafaf7' },
  Impact:                   { bg: '#2563a3', text: '#fafaf7' },
  Genesis:                  { bg: '#5b8ec7', text: '#fafaf7' },
  Nexus:                    { bg: '#3b7a8c', text: '#fafaf7' },
  'Professional Services':  { bg: '#7a3b5f', text: '#fafaf7' },
  Support:                  { bg: '#a8642e', text: '#fafaf7' },
  Consulting:               { bg: '#8a6d3b', text: '#fafaf7' },
  Customizations:           { bg: '#5a3b8a', text: '#fafaf7' },
  Growth:                   { bg: '#b5894d', text: '#fafaf7' },
  Marketing:                { bg: '#a04060', text: '#fafaf7' },
  Product:                  { bg: '#4a7a4a', text: '#fafaf7' },
  IT:                       { bg: '#4a4a6a', text: '#fafaf7' },
  HR:                       { bg: '#a86a8a', text: '#fafaf7' },
  Karpa:                    { bg: '#2d5d4f', text: '#fafaf7' },
  Unassigned:               { bg: '#888', text: '#fafaf7' },
};

const extraTeamColors = [
  { bg: '#8c4a2d', text: '#fafaf7' },
  { bg: '#4a3b6a', text: '#fafaf7' },
  { bg: '#7a5a2d', text: '#fafaf7' },
  { bg: '#5a7a3d', text: '#fafaf7' },
  { bg: '#3d6a8a', text: '#fafaf7' },
  { bg: '#8a3d5a', text: '#fafaf7' },
  { bg: '#6a4a3b', text: '#fafaf7' },
];

const makeGetTeamColor = (palette) => (team) => palette[team] || baseTeamColors[team] || { bg: '#888', text: '#fafaf7' };
const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export default function OrgChartApp() {
  // No seed data — empty until Cosmos responds. Loading state gates the UI.
  const [employees, setEmployees] = useState([]);
  const [teamPalette, setTeamPalette] = useState({});
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meRes = await fetch('/.auth/me');
        if (meRes.ok) {
          const me = await meRes.json();
          if (!cancelled && me.clientPrincipal) setCurrentUser(me.clientPrincipal);
        }
      } catch (e) { /* unauthenticated dev mode is fine */ }

      try {
        const [empRes, teamRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/teams'),
        ]);
        if (cancelled) return;
        if (!empRes.ok || !teamRes.ok) {
          setLoadError(`Failed to load data (${empRes.status}/${teamRes.status})`);
        } else {
          const empData = await empRes.json();
          const teamData = await teamRes.json();
          // Always set from API, even if empty - this is the source of truth
          if (Array.isArray(empData)) setEmployees(empData);
          if (teamData && typeof teamData === 'object') setTeamPalette(teamData);
        }
      } catch (e) {
        console.warn('Failed to load from API:', e);
        setLoadError(e.message || 'Network error');
      } finally {
        if (!cancelled) setStorageLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Debounced save - only runs after the initial load completes so we never
  // overwrite real data with stale state mid-load.
  useEffect(() => {
    if (!storageLoaded) return;
    if (loadError) return; // don't save over an error state
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const [empRes, teamRes] = await Promise.all([
          fetch('/api/employees', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employees),
          }),
          fetch('/api/teams', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teamPalette),
          }),
        ]);
        if (empRes.ok && teamRes.ok) {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(s => s === 'saved' ? 'idle' : s), 1800);
        } else {
          setSaveStatus('error');
        }
      } catch (e) {
        console.warn('Save failed:', e);
        setSaveStatus('error');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [employees, teamPalette, storageLoaded, loadError]);

  const [view, setView] = useState('tree');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTeams, setActiveTeams] = useState(new Set());
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [toast, setToast] = useState(null);
  const [displayMode, setDisplayMode] = useState(false);
  const appRootRef = useRef(null);

  const enterDisplayMode = async () => {
    setDisplayMode(true);
    if (appRootRef.current && typeof appRootRef.current.requestFullscreen === 'function') {
      try { await appRootRef.current.requestFullscreen(); } catch (e) { /* ignore */ }
    }
  };
  const exitDisplayMode = async () => {
    setDisplayMode(false);
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch (e) { /* ignore */ }
    }
  };

  useEffect(() => {
    if (!displayMode) return;
    const onKey = (e) => { if (e.key === 'Escape') exitDisplayMode(); };
    const onFsChange = () => {
      if (!document.fullscreenElement) setDisplayMode(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  }, [displayMode]);

  const getTeamColor = useMemo(() => makeGetTeamColor(teamPalette), [teamPalette]);

  const ensureTeamColor = (teamName) => {
    if (!teamName) return;
    if (teamPalette[teamName] || baseTeamColors[teamName]) return;
    setTeamPalette(prev => {
      if (prev[teamName]) return prev;
      const used = new Set([...Object.values(prev), ...Object.values(baseTeamColors)].map(c => c.bg));
      const next = extraTeamColors.find(c => !used.has(c.bg))
        || extraTeamColors[Object.keys(prev).length % extraTeamColors.length];
      return { ...prev, [teamName]: next };
    });
  };

  const teamStats = useMemo(() => {
    const stats = {};
    employees.forEach(e => { stats[e.team] = (stats[e.team] || 0) + 1; });
    return stats;
  }, [employees]);

  const teamsByCount = useMemo(
    () => Object.entries(teamStats).sort((a, b) => b[1] - a[1]).map(([t]) => t),
    [teamStats]
  );

  const isTeamFilterActive = activeTeams.size > 0;

  const visibleIds = useMemo(() => {
    if (!isTeamFilterActive) return null;
    const idSet = new Set();
    employees.forEach(e => {
      if (activeTeams.has(e.team)) {
        idSet.add(e.id);
        let cursor = e.managerId;
        while (cursor != null) {
          if (idSet.has(cursor)) break;
          idSet.add(cursor);
          const mgr = employees.find(x => x.id === cursor);
          cursor = mgr ? mgr.managerId : null;
        }
      }
    });
    return idSet;
  }, [employees, activeTeams, isTeamFilterActive]);

  const filteredTable = useMemo(() => {
    const q = search.toLowerCase().trim();
    return employees.filter(e => {
      if (visibleIds && !visibleIds.has(e.id)) return false;
      if (!q) return true;
      return e.name.toLowerCase().includes(q)
        || e.title.toLowerCase().includes(q)
        || e.team.toLowerCase().includes(q)
        || (e.location || '').toLowerCase().includes(q);
    });
  }, [employees, search, visibleIds]);

  const searchMatchIds = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return null;
    const ids = new Set();
    employees.forEach(e => {
      if (visibleIds && !visibleIds.has(e.id)) return;
      const hit = e.name.toLowerCase().includes(q)
        || e.title.toLowerCase().includes(q)
        || e.team.toLowerCase().includes(q)
        || (e.location || '').toLowerCase().includes(q);
      if (hit) ids.add(e.id);
    });
    return ids;
  }, [employees, search, visibleIds]);

  const tree = useMemo(() => {
    const map = new Map();
    employees.forEach(e => {
      if (visibleIds && !visibleIds.has(e.id)) return;
      map.set(e.id, { ...e, children: [] });
    });
    const roots = [];
    map.forEach(node => {
      if (node.managerId && map.has(node.managerId)) {
        map.get(node.managerId).children.push(node);
      } else {
        roots.push(node);
      }
    });
    const sortChildren = (n) => {
      n.children.sort((a, b) => {
        const aHas = a.children.length > 0;
        const bHas = b.children.length > 0;
        if (aHas !== bHas) return aHas ? -1 : 1;
        if (a.team !== b.team) return a.team.localeCompare(b.team);
        return a.name.localeCompare(b.name);
      });
      n.children.forEach(sortChildren);
    };
    roots.forEach(sortChildren);
    return roots;
  }, [employees, visibleIds]);

  const getDescendantIds = (id) => {
    const result = new Set([id]);
    const queue = [id];
    while (queue.length) {
      const cur = queue.shift();
      employees.forEach(e => {
        if (e.managerId === cur && !result.has(e.id)) {
          result.add(e.id);
          queue.push(e.id);
        }
      });
    }
    return result;
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2400);
  };

  const handleSave = (data) => {
    ensureTeamColor(data.team);
    if (editing) {
      setEmployees(employees.map(e => e.id === editing.id ? { ...data, id: editing.id } : e));
    } else {
      const newId = Math.max(0, ...employees.map(e => e.id)) + 1;
      setEmployees([...employees, { ...data, id: newId }]);
    }
    setEditing(null);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setEmployees(employees.map(e => e.managerId === id ? { ...e, managerId: null } : e).filter(e => e.id !== id));
    setEditing(null);
    setShowForm(false);
  };

  const handleReparent = (draggedEmpId, newManagerId) => {
    if (draggedEmpId === newManagerId) return;
    const dragged = employees.find(e => e.id === draggedEmpId);
    if (!dragged) return;
    if (dragged.managerId === newManagerId) return;
    if (newManagerId !== null && getDescendantIds(draggedEmpId).has(newManagerId)) {
      showToast(`Can't move ${dragged.name} under their own report`, 'error');
      return;
    }
    const newMgr = newManagerId != null ? employees.find(e => e.id === newManagerId) : null;
    setEmployees(employees.map(e => e.id === draggedEmpId ? { ...e, managerId: newManagerId } : e));
    showToast(newMgr ? `${dragged.name} now reports to ${newMgr.name}` : `${dragged.name} is now at the top level`);
  };

  const toggleTeam = (team) => {
    const next = new Set(activeTeams);
    if (next.has(team)) next.delete(team);
    else next.add(team);
    setActiveTeams(next);
  };

  const clearFilters = () => setActiveTeams(new Set());

  // Loading screen — shown until the API responds (success or failure)
  if (!storageLoaded) {
    return (
      <div style={{
        height: '100vh', background: '#fafaf7',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif", color: '#1a1a1a',
        gap: 14
      }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid #e5e4dc', borderTopColor: '#1a1a1a',
          animation: 'spin 0.9s linear infinite'
        }} />
        <div style={{ fontSize: 12, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Loading Atlas
        </div>
      </div>
    );
  }

  // Error screen if the API couldn't be reached
  if (loadError) {
    return (
      <div style={{
        height: '100vh', background: '#fafaf7',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif", color: '#1a1a1a',
        gap: 12, padding: 32
      }}>
        <h2 className="display-font" style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Unable to load directory</h2>
        <div style={{ fontSize: 13, color: '#666' }}>{loadError}</div>
        <button onClick={() => window.location.reload()}
          style={{ marginTop: 12, background: '#1a1a1a', color: '#fafaf7', border: 'none', padding: '10px 18px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div ref={appRootRef} style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#fafaf7', fontFamily: "'Inter', system-ui, sans-serif", color: '#1a1a1a', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .display-font { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
        button { font-family: inherit; cursor: pointer; }
        input, select { font-family: inherit; }
        .row-hover:hover { background: #f0efe8 !important; }
        .btn-primary:hover { background: #2a2a2a !important; }
        .btn-ghost:hover { background: #efeee5 !important; }
        .card-hover:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .stat-chip { transition: all 0.18s cubic-bezier(.2,.7,.2,1); }
        .stat-chip:hover { transform: translateY(-1px); }
        .top-drop-zone { transition: all 0.15s; }
        .top-drop-zone.active { background: #f5f4ec !important; border-color: #1a1a1a !important; color: #1a1a1a !important; }
        @keyframes ghostInH { from { width: 0; opacity: 0; } to { width: 220px; opacity: 1; } }
        @keyframes ghostInV { from { height: 0; opacity: 0; } to { height: 56px; opacity: 1; } }
        @keyframes ghostFlash { 0%,100% { border-color: #1a1a1a; } 50% { border-color: #7eb3d9; } }
        .ghost-card { animation: ghostFlash 1.2s ease-in-out infinite; }
        @keyframes searchMatchPulse {
          0%, 100% { box-shadow: 0 0 0 2px #d4a017, 0 4px 14px rgba(212, 160, 23, 0.25); }
          50%      { box-shadow: 0 0 0 3px #d4a017, 0 6px 20px rgba(212, 160, 23, 0.45); }
        }
        .search-match-pulse { animation: searchMatchPulse 1.8s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .fade-in { animation: fadeIn 0.3s ease-out; }
      `}</style>

      {!displayMode && (
        <header style={{ borderBottom: '1px solid #e5e4dc', background: '#fafaf7', flexShrink: 0 }}>
          <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, background: '#1a1a1a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} color="#fafaf7" />
              </div>
              <div>
                <h1 className="display-font" style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Atlas</h1>
                <p style={{ margin: 0, fontSize: 11, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase' }}>People Directory</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{
                fontSize: 11, color: saveStatus === 'error' ? '#a04040' : '#888',
                letterSpacing: '0.04em',
                display: 'flex', alignItems: 'center', gap: 5,
                opacity: saveStatus === 'idle' ? 0 : 1,
                transition: 'opacity 0.3s',
                minWidth: 60,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: saveStatus === 'saving' ? '#d4a017'
                    : saveStatus === 'saved' ? '#4a7a4a'
                    : saveStatus === 'error' ? '#a04040' : 'transparent',
                  animation: saveStatus === 'saving' ? 'pulse 1s ease-in-out infinite' : 'none',
                }} />
                {saveStatus === 'saving' ? 'Saving…'
                  : saveStatus === 'saved' ? 'Saved'
                  : saveStatus === 'error' ? 'Save failed' : ''}
              </span>
              {currentUser && (
                <span style={{ fontSize: 12, color: '#666' }}>
                  {currentUser.userDetails}
                </span>
              )}
              <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary"
                style={{ background: '#1a1a1a', color: '#fafaf7', border: 'none', padding: '10px 18px', borderRadius: 6, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={15} /> Add employee
              </button>
            </div>
          </div>
        </header>
      )}

      <main style={{ flex: 1, minHeight: 0, padding: displayMode ? 0 : '24px 32px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!displayMode && (
        <>
        <div style={{ marginBottom: 20, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>
              <Filter size={12} /> Filter by team
              {isTeamFilterActive && (
                <span style={{ background: '#1a1a1a', color: '#fafaf7', padding: '2px 8px', borderRadius: 10, fontSize: 10, letterSpacing: '0.04em' }}>
                  {activeTeams.size} active
                </span>
              )}
            </div>
            {isTeamFilterActive && (
              <button onClick={clearFilters} className="btn-ghost"
                style={{ background: 'transparent', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 11, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                <X size={11} /> Clear
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTeams(new Set())} className="stat-chip"
              style={{
                background: !isTeamFilterActive ? '#1a1a1a' : '#fff',
                color: !isTeamFilterActive ? '#fafaf7' : '#1a1a1a',
                border: !isTeamFilterActive ? '1px solid #1a1a1a' : '1px solid #e5e4dc',
                padding: '12px 18px', borderRadius: 10, minWidth: 110, textAlign: 'left'
              }}>
              <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 6 }}>All teams</div>
              <div className="display-font" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>{employees.length}</div>
            </button>
            {teamsByCount.map(team => {
              const c = getTeamColor(team);
              const active = activeTeams.has(team);
              return (
                <button key={team} onClick={() => toggleTeam(team)} className="stat-chip"
                  style={{
                    background: active ? c.bg : '#fff',
                    color: active ? c.text : '#1a1a1a',
                    border: `1px solid ${active ? c.bg : '#e5e4dc'}`,
                    padding: '12px 18px', borderRadius: 10, minWidth: 110, textAlign: 'left'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: active ? c.text : c.bg, opacity: active ? 0.8 : 1 }} />
                    <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>{team}</span>
                  </div>
                  <div className="display-font" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>{teamStats[team]}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 16, flexWrap: 'wrap', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: '#fff', border: '1px solid #e5e4dc', borderRadius: 8, padding: 3 }}>
              <button onClick={() => setView('table')}
                style={{
                  background: view === 'table' ? '#1a1a1a' : 'transparent',
                  color: view === 'table' ? '#fafaf7' : '#555',
                  border: 'none', padding: '8px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                <Users size={14} /> Table
              </button>
              <button onClick={() => setView('tree')}
                style={{
                  background: view === 'tree' ? '#1a1a1a' : 'transparent',
                  color: view === 'tree' ? '#fafaf7' : '#555',
                  border: 'none', padding: '8px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                <Network size={14} /> Org tree
              </button>
            </div>
            {view === 'tree' && (
              <button onClick={enterDisplayMode} className="btn-ghost"
                style={{
                  background: '#fff', color: '#1a1a1a', border: '1px solid #e5e4dc',
                  padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 6
                }}
                title="Display mode (chart fills the screen). Press Esc to exit.">
                <Maximize2 size={14} /> Display
              </button>
            )}
          </div>

          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 360 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, title, team, location..."
              style={{ width: '100%', padding: '10px 12px 10px 36px', paddingRight: searchMatchIds ? 64 : 12, border: '1px solid #e5e4dc', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
              onBlur={(e) => e.target.style.borderColor = '#e5e4dc'} />
            {searchMatchIds && (
              <span style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                color: searchMatchIds.size === 0 ? '#a04040' : '#666',
                background: searchMatchIds.size === 0 ? '#fdf0f0' : '#f5f4ec',
                padding: '3px 8px', borderRadius: 10
              }}>
                {searchMatchIds.size === 0 ? 'No matches' : `${searchMatchIds.size} ${searchMatchIds.size === 1 ? 'match' : 'matches'}`}
              </span>
            )}
          </div>
        </div>
        </>
        )}

        {view === 'table' ? (
          <TableView
            employees={filteredTable}
            allEmployees={employees}
            onEdit={(emp) => { setEditing(emp); setShowForm(true); }}
            getTeamColor={getTeamColor}
          />
        ) : (
          <TreeView
            tree={tree}
            draggedId={draggedId}
            dragOverId={dragOverId}
            setDraggedId={setDraggedId}
            setDragOverId={setDragOverId}
            onReparent={handleReparent}
            getDescendantIds={getDescendantIds}
            onEdit={(emp) => { setEditing(emp); setShowForm(true); }}
            searchMatchIds={searchMatchIds}
            getTeamColor={getTeamColor}
            displayMode={displayMode}
            onExitDisplayMode={exitDisplayMode}
          />
        )}
      </main>

      {toast && (
        <div className="fade-in" style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#5a2020' : '#1a1a1a',
          color: '#fafaf7', padding: '12px 20px', borderRadius: 8,
          fontSize: 13, fontWeight: 500, zIndex: 200,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        }}>
          {toast.message}
        </div>
      )}

      {showForm && (
        <EmployeeForm
          employee={editing}
          employees={employees}
          teamPalette={teamPalette}
          getTeamColor={getTeamColor}
          onAddTeam={ensureTeamColor}
          onSave={handleSave}
          onDelete={editing ? handleDelete : null}
          onClose={() => { setEditing(null); setShowForm(false); }}
        />
      )}
    </div>
  );
}
