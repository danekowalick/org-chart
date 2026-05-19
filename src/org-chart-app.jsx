import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Users, Network, Plus, Pencil, Trash2, X, Search, Building2, Upload, Image as ImageIcon, MapPin, Filter, Maximize2, Minimize2 } from 'lucide-react';

// --- Seed data from uploaded CSV ---
// Normalized: "Josh Franck" -> "Joshua Franck"; "NA" manager -> null; "NA" team -> "Unassigned"
const rawSeed = [
  { name: 'Mike Stoltzfus', title: 'CEO', manager: null, team: 'Executive', location: 'Lancaster, PA' },
  { name: 'Jessica Lucas', title: 'CFO', manager: 'Mike Stoltzfus', team: 'Executive', location: 'Boise, ID' },
  { name: 'Justin Whear', title: 'CTO', manager: 'Mike Stoltzfus', team: 'Executive', location: 'Moscow, ID' },
  { name: 'Kelsey Stout', title: 'Head of HR', manager: 'Mike Stoltzfus', team: 'Executive', location: 'Moscow, ID' },
  { name: 'Luke Jankovic', title: 'COO', manager: 'Mike Stoltzfus', team: 'Executive', location: 'Moscow, ID' },
  { name: 'Bre House', title: 'VP, Client Success', manager: 'Luke Jankovic', team: 'Executive', location: 'Moscow, ID' },
  { name: 'Deke Bowman', title: 'Head of Product', manager: 'Luke Jankovic', team: 'Executive', location: 'Philadelphia, PA' },
  { name: 'Bev Beachy', title: 'Finance', manager: 'Jessica Lucas', team: 'Finance', location: 'Lancaster, PA' },
  { name: 'Julie Nolt', title: 'Payroll & Benefits Specialist', manager: 'Jessica Lucas', team: 'Finance', location: 'Lancaster, PA' },
  { name: 'Chase Clift', title: 'Bookkeeper', manager: 'Jessica Lucas', team: 'Finance', location: 'Moscow, ID' },
  { name: 'Maxwell Edgin', title: 'Revenue Operations Specialist', manager: 'Jessica Lucas', team: 'Finance', location: 'West Chester, PA' },
  { name: 'Brad Marshall', title: 'Engineering Lead, Impact', manager: 'Justin Whear', team: 'Impact', location: 'Lancaster, PA' },
  { name: 'Tim Tantra', title: 'Engineering Lead, Genesis', manager: 'Justin Whear', team: 'Genesis', location: 'Lancaster, PA' },
  { name: 'Scott Esch', title: 'Engineering Lead, Nexus', manager: 'Justin Whear', team: 'Nexus', location: 'Washington, MI' },
  { name: 'Brent Esh', title: 'Engineer', manager: 'Justin Whear', team: 'Engineering', location: 'Los Angeles, CA' },
  { name: 'Stephen Grammer', title: 'Engineer', manager: 'Justin Whear', team: 'Engineering', location: 'Moscow, ID' },
  { name: 'Kendall Frey', title: 'Engineer', manager: 'Brad Marshall', team: 'Impact', location: 'Canada' },
  { name: 'Alisa Esh', title: 'Engineer', manager: 'Brad Marshall', team: 'Impact', location: 'Lancaster, PA' },
  { name: 'Daniel Glick', title: 'Engineer', manager: 'Brad Marshall', team: 'Impact', location: 'Lancaster, PA' },
  { name: 'Graham Weber', title: 'Engineer', manager: 'Brad Marshall', team: 'Impact', location: 'Lancaster, PA' },
  { name: 'Nicholas Stricker', title: 'Engineer', manager: 'Brad Marshall', team: 'Impact', location: 'Lancaster, PA' },
  { name: 'Ian Warfield', title: 'Engineer', manager: 'Tim Tantra', team: 'Genesis', location: 'Jeffersonton, VA' },
  { name: 'Randy Yoder', title: 'Engineer', manager: 'Tim Tantra', team: 'Genesis', location: 'Lancaster, PA' },
  { name: 'Paul Metien', title: 'Engineer', manager: 'Tim Tantra', team: 'Genesis', location: 'Lynden, WA' },
  { name: 'Reed Harston', title: 'Engineer', manager: 'Tim Tantra', team: 'Engineering', location: 'Moscow, ID' },
  { name: 'Akmaljon Kamolov', title: 'Engineer', manager: 'Scott Esch', team: 'Nexus', location: 'Lancaster, PA' },
  { name: 'Luke McCabe', title: 'Engineering Intern', manager: 'Stephen Grammer', team: 'Engineering', location: 'Moscow, ID' },
  { name: 'Brian Esh', title: 'Director of Professional Services', manager: 'Luke Jankovic', team: 'Professional Services', location: 'Lancaster, PA' },
  { name: 'Dorothy Jobira', title: 'Systems Consultant', manager: 'Brian Esh', team: 'Professional Services', location: 'Lancaster, PA' },
  { name: 'Isaac Jobira', title: 'Systems Consultant', manager: 'Brian Esh', team: 'Professional Services', location: 'Lancaster, PA' },
  { name: 'Roger Bailey', title: 'Systems Consultant', manager: 'Brian Esh', team: 'Professional Services', location: 'Lancaster, PA' },
  { name: 'Marylou Hurst', title: 'Systems Consultant', manager: 'Brian Esh', team: 'Professional Services', location: 'Lebanon, TN' },
  { name: 'Luke Brunaugh', title: 'Solutions Architect', manager: 'Brian Esh', team: 'Professional Services', location: 'Moscow, ID' },
  { name: 'Oree Wyatt', title: 'Solutions Architect', manager: 'Brian Esh', team: 'Professional Services', location: 'Moscow, ID' },
  { name: 'Tom Lieberher', title: 'Manager, Support Specialists', manager: 'Bre House', team: 'Support', location: 'Lancaster, PA' },
  { name: 'Ruth Turner', title: 'Support Specialist', manager: 'Tom Lieberher', team: 'Support', location: 'Fort Worth, TX' },
  { name: 'Amy Roussey', title: 'Project Manager', manager: 'Tom Lieberher', team: 'Support', location: 'Lancaster, PA' },
  { name: 'Bryan Lowe', title: 'Sr. Support Specialist', manager: 'Tom Lieberher', team: 'Support', location: 'Lancaster, PA' },
  { name: 'Franz Schafer', title: 'Sr. Support Specialist', manager: 'Tom Lieberher', team: 'Support', location: 'Lancaster, PA' },
  { name: 'Matt Evans', title: 'Support Specialist', manager: 'Tom Lieberher', team: 'Support', location: 'Lancaster, PA' },
  { name: 'Kristina Carter', title: 'Support Specialist', manager: 'Tom Lieberher', team: 'Support', location: 'Moscow, ID' },
  { name: 'Luke Paul', title: 'Support Specialist', manager: 'Tom Lieberher', team: 'Support', location: 'Moscow, ID' },
  { name: 'Denise Comer', title: 'Support Specialist', manager: 'Tom Lieberher', team: 'Support', location: 'Powder Springs, GA' },
  { name: 'Britney White', title: 'Sr. Support Specialist', manager: 'Tom Lieberher', team: 'Support', location: 'Warrior, AL' },
  { name: 'Rodney Smoker', title: 'Sr. Consultant', manager: 'Bre House', team: 'Consulting', location: 'Lancaster, PA' },
  { name: 'Duane Friesen', title: 'Customizations Manager', manager: 'Luke Jankovic', team: 'Customizations', location: 'Waco, TX' },
  { name: 'Zachary Enas', title: 'Customizations Specialist', manager: 'Duane Friesen', team: 'Customizations', location: 'Corvallis, OR' },
  { name: 'Seth Haynes', title: 'Customizations Specialist', manager: 'Duane Friesen', team: 'Customizations', location: 'Moscow, ID' },
  { name: 'Walter Cantrell', title: 'Customizations Specialist', manager: 'Duane Friesen', team: 'Customizations', location: 'Taylors, SC' },
  { name: 'Jonathan Brownell', title: 'Customizations Independent Contractor', manager: null, team: 'Customizations', location: 'Moscow, ID' },
  { name: 'Joshua Franck', title: 'VP, Growth', manager: 'Luke Jankovic', team: 'Growth', location: 'Stromsburg, NE' },
  { name: 'Kimberly Douglass', title: 'Territory Manager', manager: 'Joshua Franck', team: 'Growth', location: 'Fishers, IN' },
  { name: 'Gregg Horst', title: 'Territory Manager', manager: 'Joshua Franck', team: 'Growth', location: 'Lancaster, PA' },
  { name: 'Janelle Lieberher', title: 'Territory Manager', manager: 'Joshua Franck', team: 'Growth', location: 'Lancaster, PA' },
  { name: 'Tim Latham', title: 'Territory Manager', manager: 'Joshua Franck', team: 'Growth', location: 'Lancaster, PA' },
  { name: 'Mark Olson', title: 'Territory Manager', manager: 'Joshua Franck', team: 'Growth', location: 'Liberty Lake, WA' },
  { name: 'Kristian Bennett', title: 'Territory Manager', manager: 'Joshua Franck', team: 'Growth', location: 'Moscow, ID' },
  { name: 'Philip Tate', title: 'Territory Manager', manager: 'Joshua Franck', team: 'Growth', location: 'Moscow, ID' },
  { name: 'Emily Henson', title: 'Territory Manager', manager: 'Joshua Franck', team: 'Growth', location: 'Simpsonville, SC' },
  { name: 'Jubilee Joiner', title: 'Sales Independent Contractor', manager: 'Joshua Franck', team: 'Unassigned', location: 'Moscow, ID' },
  { name: 'Bradley Murphy', title: 'Director of Marketing', manager: 'Luke Jankovic', team: 'Marketing', location: 'Lancaster, PA' },
  { name: 'Haley Hawbaker', title: 'Content & Marketing Generalist', manager: 'Bradley Murphy', team: 'Marketing', location: 'Lancaster, PA' },
  { name: 'Joel Cornett', title: 'Product Manager', manager: 'Deke Bowman', team: 'Product', location: 'Lancaster, PA' },
  { name: 'Justin Miller', title: 'Product Manager', manager: 'Deke Bowman', team: 'Product', location: 'Sugarcreek, OH' },
  { name: 'Dane Kowalick', title: 'IT Manager', manager: 'Luke Jankovic', team: 'IT', location: 'Moscow, ID' },
  { name: 'Dan Chansky', title: 'Network Engineer', manager: 'Dane Kowalick', team: 'IT', location: 'Lancaster, PA' },
  { name: 'Charity Landis', title: 'Hospitality Guru', manager: 'Kelsey Stout', team: 'HR', location: 'Lancaster, PA' },
  { name: 'George Landis', title: 'HR Operations & Recruitment', manager: 'Kelsey Stout', team: 'HR', location: 'Moscow, ID' },
];

const buildSeed = () => {
  const withIds = rawSeed.map((e, i) => ({ ...e, id: i + 1, photo: null }));
  const nameToId = new Map(withIds.map(e => [e.name, e.id]));
  return withIds.map(e => ({
    id: e.id,
    name: e.name,
    title: e.title,
    team: e.team,
    location: e.location,
    photo: e.photo,
    managerId: e.manager ? (nameToId.get(e.manager) ?? null) : null,
  }));
};

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
  Unassigned:               { bg: '#888', text: '#fafaf7' },
};

// Cycled through when the user creates a new team — distinct from the base palette
// so two new teams in a row read as visually different.
const extraTeamColors = [
  { bg: '#2d5d4f', text: '#fafaf7' },
  { bg: '#8c4a2d', text: '#fafaf7' },
  { bg: '#4a3b6a', text: '#fafaf7' },
  { bg: '#7a5a2d', text: '#fafaf7' },
  { bg: '#5a7a3d', text: '#fafaf7' },
  { bg: '#3d6a8a', text: '#fafaf7' },
  { bg: '#8a3d5a', text: '#fafaf7' },
  { bg: '#6a4a3b', text: '#fafaf7' },
];

const makeGetTeamColor = (palette) => (team) => palette[team] || { bg: '#888', text: '#fafaf7' };
const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export default function OrgChartApp() {
  // Backend persistence: GET on mount, PUT (debounced) on changes.
  // Auth, hosting, and the /api/* routes are handled by Azure Static Web Apps.
  const [employees, setEmployees] = useState(buildSeed);
  const [teamPalette, setTeamPalette] = useState({ ...baseTeamColors });
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user (from Static Web Apps auth) and seed data from API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 1) Who's logged in (Static Web Apps exposes this at /.auth/me)
      try {
        const meRes = await fetch('/.auth/me');
        if (meRes.ok) {
          const me = await meRes.json();
          if (!cancelled && me.clientPrincipal) setCurrentUser(me.clientPrincipal);
        }
      } catch (e) { /* unauthenticated dev mode is fine */ }

      // 2) Load employees + teams in parallel
      try {
        const [empRes, teamRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/teams'),
        ]);
        if (cancelled) return;
        if (empRes.ok) {
          const data = await empRes.json();
          if (Array.isArray(data) && data.length > 0) setEmployees(data);
        }
        if (teamRes.ok) {
          const data = await teamRes.json();
          if (data && typeof data === 'object' && Object.keys(data).length > 0) setTeamPalette(data);
        }
      } catch (e) {
        console.warn('Failed to load from API, using seed:', e);
      } finally {
        if (!cancelled) setStorageLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Debounced save: PUT employees + teams whenever they change.
  // Saves run in parallel; status indicator gives the user confidence.
  useEffect(() => {
    if (!storageLoaded) return;
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
  }, [employees, teamPalette, storageLoaded]);
  const [view, setView] = useState('tree');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTeams, setActiveTeams] = useState(new Set());
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [toast, setToast] = useState(null);
  // Display mode: chart-only, fullscreen-style presentation view
  const [displayMode, setDisplayMode] = useState(false);
  const appRootRef = useRef(null);

  // Prevent stale seed data from flashing before API loads
if (!storageLoaded) {
  return (
    <div style={{ padding: "20px", fontSize: "18px" }}>
      Loading org chart…
    </div>
  );
}
  // Toggle browser fullscreen and the in-app chrome-hiding mode together.
  // Fullscreen API is best-effort: if it's blocked, we still hide chrome.
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

  // ESC exits display mode (browsers also exit native fullscreen on ESC,
  // but if the user is in our chrome-hidden fallback without native fs,
  // we still need to listen). Also sync state when native fs exits.
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

  // Ensures any team referenced by an employee has a color. Called when a new
  // team is created or when a save brings in an unknown team name.
  const ensureTeamColor = (teamName) => {
    if (!teamName || teamPalette[teamName]) return;
    setTeamPalette(prev => {
      if (prev[teamName]) return prev;
      const used = new Set(Object.values(prev).map(c => c.bg));
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

  // IDs whose visible card should glow because they match the search query.
  // Distinct from filteredTable: in the tree, non-matches stay visible (dimmed)
  // so the matched card has context, but only matches are highlighted.
  const searchMatchIds = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return null; // null = "no active search"
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
              {/* Save status indicator */}
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

// --- Table view ---
function TableView({ employees, allEmployees, onEdit, getTeamColor }) {
  return (
    <div className="fade-in" style={{ background: '#fff', border: '1px solid #e5e4dc', borderRadius: 10, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f5f4ec', borderBottom: '1px solid #e5e4dc', position: 'sticky', top: 0, zIndex: 1 }}>
              {['Name', 'Title', 'Team', 'Location', 'Manager', ''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#888' }}>No employees match the current filters</td></tr>
            ) : employees.map(emp => {
              const manager = allEmployees.find(e => e.id === emp.managerId);
              const c = getTeamColor(emp.team);
              return (
                <tr key={emp.id} className="row-hover" style={{ borderBottom: '1px solid #f0efe8' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {emp.photo ? (
                        <img src={emp.photo} alt={emp.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${c.bg}` }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.bg, color: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
                          {getInitials(emp.name)}
                        </div>
                      )}
                      <span style={{ fontWeight: 500 }}>{emp.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#444' }}>{emp.title}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: c.bg, color: c.text, fontSize: 11, fontWeight: 500 }}>{emp.team}</span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#666' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} style={{ color: '#999' }} />
                      {emp.location || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#666' }}>{manager ? manager.name : '—'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button onClick={() => onEdit(emp)} className="btn-ghost" style={{ background: 'transparent', border: 'none', padding: 6, borderRadius: 4, color: '#666', display: 'flex' }}><Pencil size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Tree view ---
function TreeView({ tree, draggedId, dragOverId, setDraggedId, setDragOverId, onReparent, getDescendantIds, onEdit, searchMatchIds, getTeamColor, displayMode, onExitDisplayMode }) {
  // slotTarget = { parentId, kind: 'branch' | 'leaf', index } — where ghost shows up
  const [slotTarget, setSlotTarget] = useState(null);

  // Ref registry so we can scroll a card into view when search narrows to one match
  const cardRefs = useRef(new Map());
  const registerCardRef = (id, el) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  };

  // Scroll container ref + pan/auto-pan state
  const scrollRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const autoPanRef = useRef({ vx: 0, vy: 0, rafId: null });

  // When the search collapses to exactly one match, smoothly scroll it into view
  useEffect(() => {
    if (!searchMatchIds || searchMatchIds.size !== 1) return;
    const onlyId = searchMatchIds.values().next().value;
    // Defer one frame so the DOM has settled after any re-render
    const t = setTimeout(() => {
      const el = cardRefs.current.get(onlyId);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }, 60);
    return () => clearTimeout(t);
  }, [searchMatchIds]);

  // --- Right-click pan: hold right mouse button and drag to scroll the canvas ---
  const handleMouseDown = (e) => {
    if (e.button !== 2) return; // right button only
    const container = scrollRef.current;
    if (!container) return;
    e.preventDefault();
    setIsPanning(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startScrollLeft = container.scrollLeft;
    const startScrollTop = container.scrollTop;

    const onMove = (ev) => {
      container.scrollLeft = startScrollLeft - (ev.clientX - startX);
      container.scrollTop  = startScrollTop  - (ev.clientY - startY);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      setIsPanning(false);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // --- Auto-pan during card drag: when pointer nears a container edge, scroll that way ---
  // Edge zone size in px; pan speed scales with how deep into the zone the pointer is.
  const EDGE = 70;
  const MAX_SPEED = 18;

  const tickAutoPan = () => {
    const container = scrollRef.current;
    const { vx, vy } = autoPanRef.current;
    if (container && (vx !== 0 || vy !== 0)) {
      container.scrollLeft += vx;
      container.scrollTop  += vy;
      autoPanRef.current.rafId = requestAnimationFrame(tickAutoPan);
    } else {
      autoPanRef.current.rafId = null;
    }
  };

  const updateAutoPanFromPoint = (clientX, clientY) => {
    const container = scrollRef.current;
    if (!container) return;
    const r = container.getBoundingClientRect();
    let vx = 0, vy = 0;
    if (clientX < r.left + EDGE)        vx = -Math.round(MAX_SPEED * (1 - (clientX - r.left) / EDGE));
    else if (clientX > r.right - EDGE)  vx =  Math.round(MAX_SPEED * (1 - (r.right - clientX) / EDGE));
    if (clientY < r.top + EDGE)         vy = -Math.round(MAX_SPEED * (1 - (clientY - r.top) / EDGE));
    else if (clientY > r.bottom - EDGE) vy =  Math.round(MAX_SPEED * (1 - (r.bottom - clientY) / EDGE));
    autoPanRef.current.vx = vx;
    autoPanRef.current.vy = vy;
    if ((vx !== 0 || vy !== 0) && autoPanRef.current.rafId == null) {
      autoPanRef.current.rafId = requestAnimationFrame(tickAutoPan);
    }
  };

  const stopAutoPan = () => {
    autoPanRef.current.vx = 0;
    autoPanRef.current.vy = 0;
    if (autoPanRef.current.rafId != null) {
      cancelAnimationFrame(autoPanRef.current.rafId);
      autoPanRef.current.rafId = null;
    }
  };

  // Stop auto-pan whenever the drag ends (covers cancelled drags and drops)
  useEffect(() => {
    if (draggedId === null) stopAutoPan();
  }, [draggedId]);

  // Cleanup on unmount
  useEffect(() => () => stopAutoPan(), []);

  const dragProps = {
    draggedId, dragOverId, setDraggedId, setDragOverId,
    onReparent, getDescendantIds, onEdit,
    slotTarget, setSlotTarget,
    searchMatchIds, registerCardRef,
    getTeamColor,
    displayMode,
  };

  return (
    <div
      ref={scrollRef}
      className="fade-in"
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => e.preventDefault()}
      onDragOver={(e) => {
        if (draggedId !== null) updateAutoPanFromPoint(e.clientX, e.clientY);
      }}
      onDragLeave={(e) => {
        // If the pointer leaves the container entirely, halt auto-pan
        if (!scrollRef.current) return;
        const r = scrollRef.current.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
          stopAutoPan();
        }
      }}
      onDrop={stopAutoPan}
      style={{
        background: '#fff',
        border: displayMode ? 'none' : '1px solid #e5e4dc',
        borderRadius: displayMode ? 0 : 10,
        padding: displayMode ? '48px 32px' : 32,
        overflow: 'auto',
        flex: 1,
        minHeight: 0,
        cursor: isPanning ? 'grabbing' : 'auto',
        userSelect: isPanning ? 'none' : 'auto',
        position: 'relative',
      }}
    >
      {/* Floating Exit button in display mode */}
      {displayMode && (
        <button
          onClick={onExitDisplayMode}
          title="Exit display mode (Esc)"
          style={{
            position: 'fixed', top: 20, right: 24, zIndex: 50,
            background: 'rgba(26, 26, 26, 0.88)', color: '#fafaf7',
            border: 'none', padding: '9px 14px', borderRadius: 8,
            fontSize: 12, fontWeight: 500, letterSpacing: '0.02em',
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26, 26, 26, 1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(26, 26, 26, 0.88)'}
        >
          <Minimize2 size={13} /> Exit · Esc
        </button>
      )}

      {tree.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>No employees to display</div>
      ) : (
        <>
          {!displayMode && (
          <div
            className={`top-drop-zone ${dragOverId === '__root__' ? 'active' : ''}`}
            onDragOver={(e) => {
              if (draggedId === null) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragOverId !== '__root__') setDragOverId('__root__');
              if (slotTarget) setSlotTarget(null);
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget)) return;
              if (dragOverId === '__root__') setDragOverId(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedId !== null) onReparent(draggedId, null);
              setDraggedId(null);
              setDragOverId(null);
              setSlotTarget(null);
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24,
              padding: '8px 14px', background: '#f5f4ec', border: '1px dashed #c8c7bf',
              borderRadius: 20, fontSize: 11, color: '#666'
            }}
          >
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#7eb3d9' }} />
            {draggedId !== null
              ? 'Drop here to promote to top level — drag near an edge to auto-scroll'
              : 'Drag to reparent · Right-click and drag to pan the canvas'}
          </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', minWidth: 'fit-content' }}>
            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
              {tree.map(root => (
                <OrgNode key={root.id} node={root} {...dragProps} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- Org node (recursive) ---
function OrgNode({ node, ...dragProps }) {
  const { slotTarget } = dragProps;
  const hasChildren = node.children && node.children.length > 0;

  // Children split:
  //  - "branch" children = anyone with their own reports (gets a sub-tree column)
  //  - solo leaves on a unique-team also become branch columns (so a single
  //    Consulting report sits as its own column, not stranded under a sibling's stack)
  //  - "leaf" children = 2+ leaves on the same team, grouped under a team strap
  const { branchChildren, leafChildren } = useMemo(() => {
    if (!hasChildren) return { branchChildren: [], leafChildren: [] };
    const managers = node.children.filter(c => c.children && c.children.length > 0);
    const leaves = node.children.filter(c => !c.children || c.children.length === 0);

    // Count leaves per team. Solo leaves (count of 1) promote to branch columns.
    const teamCounts = {};
    leaves.forEach(l => { teamCounts[l.team] = (teamCounts[l.team] || 0) + 1; });
    const soloLeaves = leaves.filter(l => teamCounts[l.team] === 1);
    const groupedLeaves = leaves.filter(l => teamCounts[l.team] > 1);

    return {
      branchChildren: [...managers, ...soloLeaves],
      leafChildren: groupedLeaves,
    };
  }, [hasChildren, node.children]);

  // Group consecutive leaf children by team for the team strap
  const leafGroups = useMemo(() => {
    const groups = [];
    let current = null;
    leafChildren.forEach(child => {
      if (!current || current.team !== child.team) {
        current = { team: child.team, children: [child] };
        groups.push(current);
      } else {
        current.children.push(child);
      }
    });
    return groups;
  }, [leafChildren]);

  const ghostBranch = slotTarget && slotTarget.parentId === node.id && slotTarget.kind === 'branch';
  const ghostLeaf   = slotTarget && slotTarget.parentId === node.id && slotTarget.kind === 'leaf';

  // "Team head" case: this manager owns a single team that matches their own team.
  // Lift that label above the manager card so it reads as "BRIAN ESH leads Professional Services".
  // The corresponding group inside LeafColumn skips its inline label.
  const teamHeadGroupIdx = leafGroups.findIndex(g => g.team === node.team);
  const isTeamHead = leafGroups.length === 1 && teamHeadGroupIdx === 0;
  const teamHeadColor = isTeamHead ? dragProps.getTeamColor(node.team) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {isTeamHead && (
        <div style={{
          fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: teamHeadColor.bg, fontWeight: 700, marginBottom: 6
        }}>
          {node.team}
        </div>
      )}
      <NodeCard node={node} {...dragProps} />

      {(hasChildren || ghostBranch || ghostLeaf) && (
        <>
          <div style={{ width: 1, height: 24, background: '#c8c7bf' }} />

          {(branchChildren.length > 0 || ghostBranch) && (
            <BranchRow parent={node} branchChildren={branchChildren} dragProps={dragProps} />
          )}

          {(leafGroups.length > 0 || ghostLeaf) && (
            <LeafColumn
              parent={node}
              leafGroups={leafGroups}
              hadBranchRow={branchChildren.length > 0 || ghostBranch}
              suppressLabelForGroupIdx={isTeamHead ? 0 : -1}
              dragProps={dragProps}
            />
          )}
        </>
      )}
    </div>
  );
}

// --- Branch row: horizontal fan of sub-trees, with slot gaps between them ---
function BranchRow({ parent, branchChildren, dragProps }) {
  const { draggedId, slotTarget, setSlotTarget } = dragProps;
  const ghostHere = slotTarget && slotTarget.parentId === parent.id && slotTarget.kind === 'branch';
  const ghostIdx = ghostHere ? slotTarget.index : -1;

  const handleSlotOver = (e, idx) => {
    if (draggedId === null) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    const next = { parentId: parent.id, kind: 'branch', index: idx };
    if (!slotTarget || slotTarget.parentId !== next.parentId || slotTarget.kind !== next.kind || slotTarget.index !== next.index) {
      setSlotTarget(next);
    }
  };

  const handleSlotDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragProps.onReparent(draggedId, parent.id);
    dragProps.setDraggedId(null);
    dragProps.setDragOverId(null);
    setSlotTarget(null);
  };

  // Build items with optional ghost slot inserted
  const items = [];
  for (let i = 0; i <= branchChildren.length; i++) {
    items.push(<SlotGap key={`slot-${i}`} orientation="horizontal" active={draggedId !== null} showGhost={ghostIdx === i}
      onDragOver={(e) => handleSlotOver(e, i)} onDrop={handleSlotDrop} />);
    if (i < branchChildren.length) {
      const child = branchChildren[i];
      items.push(
        <div key={`branch-${child.id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 1, height: 24, background: '#c8c7bf' }} />
          <OrgNode node={child} {...dragProps} />
        </div>
      );
    }
  }

  // The horizontal connector bar should span from the center of the first
  // branch column's vertical drop line to the center of the last. Each branch
  // column is 200px wide and centered, and the leading/trailing slots have a
  // resting width of 16px (28 while dragging, but the bar is hidden then anyway).
  // So the inset from each side is: leadingSlotWidth + halfBranchWidth.
  const visualCount = branchChildren.length + (ghostHere ? 1 : 0);
  const SLOT_W = draggedId !== null ? 28 : 16;
  const BAR_INSET = SLOT_W + 100; // center of a 200px branch column

  return (
    <div style={{ display: 'flex', position: 'relative' }}>
      {visualCount > 1 && (
        <div style={{
          position: 'absolute', top: 0, height: 1, background: '#c8c7bf',
          left: BAR_INSET, right: BAR_INSET,
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {items}
      </div>
    </div>
  );
}

// --- Leaf column: vertical stack grouped by team, with team strap on the left ---
function LeafColumn({ parent, leafGroups, hadBranchRow, suppressLabelForGroupIdx = -1, dragProps }) {
  const { draggedId, slotTarget, setSlotTarget, getTeamColor } = dragProps;
  const ghostHere = slotTarget && slotTarget.parentId === parent.id && slotTarget.kind === 'leaf';
  const ghostIdx = ghostHere ? slotTarget.index : -1;

  const handleSlotOver = (e, idx) => {
    if (draggedId === null) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    const next = { parentId: parent.id, kind: 'leaf', index: idx };
    if (!slotTarget || slotTarget.parentId !== next.parentId || slotTarget.kind !== next.kind || slotTarget.index !== next.index) {
      setSlotTarget(next);
    }
  };

  const handleSlotDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragProps.onReparent(draggedId, parent.id);
    dragProps.setDraggedId(null);
    dragProps.setDragOverId(null);
    setSlotTarget(null);
  };

  // Walk through groups with a running flat index for slot identity
  let flatIdx = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', marginTop: hadBranchRow ? 18 : 0, gap: 14 }}>
      {leafGroups.map((group, gIdx) => {
        const c = getTeamColor(group.team);
        const startIdx = flatIdx;
        const groupRows = [];
        // Top slot for this group
        groupRows.push(
          <SlotGap key={`top-${gIdx}`} orientation="vertical" active={draggedId !== null} showGhost={ghostIdx === startIdx}
            onDragOver={(e) => handleSlotOver(e, startIdx)} onDrop={handleSlotDrop} />
        );
        group.children.forEach((child, cIdx) => {
          const myIdx = flatIdx;
          flatIdx += 1;
          groupRows.push(<NodeCard key={`card-${child.id}`} node={child} {...dragProps} />);
          groupRows.push(
            <SlotGap key={`gap-${child.id}`} orientation="vertical" active={draggedId !== null} showGhost={ghostIdx === myIdx + 1}
              onDragOver={(e) => handleSlotOver(e, myIdx + 1)} onDrop={handleSlotDrop} />
          );
        });

        return (
          <div key={`${group.team}-${gIdx}`} style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
            <div style={{ width: 4, background: c.bg, borderRadius: 2, flexShrink: 0, marginTop: 6, marginBottom: 6 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {gIdx !== suppressLabelForGroupIdx && (
                <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.bg, fontWeight: 700 }}>
                  {group.team}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {groupRows}
              </div>
            </div>
          </div>
        );
      })}

      {/* If there are no leaf groups yet but a ghost should appear (dragging onto an empty leaf area) */}
      {leafGroups.length === 0 && ghostHere && (
        <SlotGap orientation="vertical" active={true} showGhost={true}
          onDragOver={(e) => handleSlotOver(e, 0)} onDrop={handleSlotDrop} />
      )}
    </div>
  );
}

// --- Slot gap between cards ---
function SlotGap({ orientation, active, showGhost, onDragOver, onDrop }) {
  if (orientation === 'horizontal') {
    let width;
    if (showGhost) width = 232;
    else if (active) width = 28;
    else width = 16;
    return (
      <div onDragOver={onDragOver} onDrop={onDrop}
        style={{
          width,
          alignSelf: 'stretch',
          minHeight: 80,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: 24,
          transition: 'width 0.22s cubic-bezier(.2,.7,.2,1)',
        }}>
        {showGhost && <GhostCard />}
      </div>
    );
  }
  let height;
  if (showGhost) height = 60;
  else if (active) height = 8;
  else height = 4;
  return (
    <div onDragOver={onDragOver} onDrop={onDrop}
      style={{
        height,
        width: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'height 0.22s cubic-bezier(.2,.7,.2,1)',
      }}>
      {showGhost && <GhostCard />}
    </div>
  );
}

function GhostCard() {
  return (
    <div className="ghost-card" style={{
      width: 200, height: 48,
      border: '2px dashed #1a1a1a', borderRadius: 8,
      background: '#fafaf7',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#1a1a1a', flexShrink: 0
    }}>
      <Plus size={18} strokeWidth={2.5} />
    </div>
  );
}

// --- Employee card ---
function NodeCard({ node, draggedId, dragOverId, setDraggedId, setDragOverId, onReparent, getDescendantIds, onEdit, slotTarget, setSlotTarget, searchMatchIds, registerCardRef, getTeamColor, displayMode }) {
  const c = getTeamColor(node.team);
  const isBeingDragged = draggedId === node.id;
  const isDropTarget = dragOverId === node.id && draggedId !== null && draggedId !== node.id;
  const wouldBeInvalid = draggedId !== null && draggedId !== node.id && getDescendantIds && getDescendantIds(draggedId).has(node.id);

  const isSearchActive = searchMatchIds != null;
  const isSearchMatch = isSearchActive && searchMatchIds.has(node.id);
  const isSearchMiss = isSearchActive && !isSearchMatch;

  // Register/unregister this card's DOM element so the parent can scroll to it
  const setRef = (el) => {
    if (registerCardRef) registerCardRef(node.id, el);
  };

  const handleDragStart = (e) => {
    setDraggedId(node.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(node.id));
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    if (setSlotTarget) setSlotTarget(null);
  };

  const handleDragOver = (e) => {
    if (draggedId === null || draggedId === node.id) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = wouldBeInvalid ? 'none' : 'move';
    if (dragOverId !== node.id) setDragOverId(node.id);
    if (setSlotTarget && slotTarget) setSlotTarget(null);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverId === node.id) setDragOverId(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedId !== null && draggedId !== node.id) onReparent(draggedId, node.id);
    setDraggedId(null);
    setDragOverId(null);
    if (setSlotTarget) setSlotTarget(null);
  };

  let borderColor = `${c.bg}25`;
  let bgColor = '#fff';
  let boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
  let opacity = 1;

  if (isBeingDragged) {
    opacity = 0.4;
  } else if (isDropTarget && !wouldBeInvalid) {
    // Drop target visuals take precedence over search visuals
    borderColor = c.bg;
    bgColor = `${c.bg}08`;
    boxShadow = `0 0 0 2px ${c.bg}, 0 4px 12px rgba(0,0,0,0.1)`;
  } else if (isDropTarget && wouldBeInvalid) {
    borderColor = '#a04040';
    bgColor = '#fdf0f0';
    boxShadow = '0 0 0 2px #a04040';
  } else if (isSearchMatch) {
    // Warm amber highlight that reads on any team color
    borderColor = '#d4a017';
    bgColor = '#fffaeb';
    boxShadow = '0 0 0 2px #d4a017, 0 4px 14px rgba(212, 160, 23, 0.25)';
  } else if (isSearchMiss) {
    opacity = 0.32;
  }

  return (
    <div
      ref={setRef}
      draggable={!displayMode}
      onDragStart={displayMode ? undefined : handleDragStart}
      onDragEnd={displayMode ? undefined : handleDragEnd}
      onDragOver={displayMode ? undefined : handleDragOver}
      onDragLeave={displayMode ? undefined : handleDragLeave}
      onDrop={displayMode ? undefined : handleDrop}
      className={`card-hover ${isSearchMatch ? 'search-match-pulse' : ''}`}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        background: bgColor, border: `1px solid ${borderColor}`, borderLeft: `3px solid ${c.bg}`,
        padding: '10px 12px', borderRadius: 8, width: 200,
        transition: 'opacity 0.2s, box-shadow 0.2s, background 0.2s, border-color 0.2s',
        boxShadow, opacity,
        cursor: displayMode ? 'default' : 'grab',
        userSelect: 'none', flexShrink: 0
      }}
    >
      {node.photo ? (
        <img src={node.photo} alt={node.name} draggable={false}
          style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${c.bg}`, flexShrink: 0 }} />
      ) : (
        <div style={{
          width: 30, height: 30, borderRadius: '50%', background: c.bg, color: c.text,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600, flexShrink: 0
        }}>
          {getInitials(node.name)}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.name}</div>
        <div style={{ fontSize: 10, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.title}</div>
        {node.location && (
          <div style={{ fontSize: 9, color: '#999', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <MapPin size={9} /> {node.location}
          </div>
        )}
      </div>
      {!displayMode && (
        <div onMouseDown={(e) => e.stopPropagation()}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(node); }} draggable={false} className="btn-ghost"
            style={{ background: 'transparent', border: 'none', padding: 4, borderRadius: 3, color: '#888', display: 'flex' }}>
            <Pencil size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// --- Employee form ---
function EmployeeForm({ employee, employees, onSave, onDelete, onClose, teamPalette, getTeamColor, onAddTeam }) {
  const [form, setForm] = useState(employee || {
    name: '', title: '', team: 'Engineering', location: '', managerId: null, photo: null
  });
  const fileInputRef = useRef(null);
  const [photoError, setPhotoError] = useState(null);
  // Team creation flow: "adding" toggles the inline new-team input
  const [addingTeam, setAddingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  // Two-step delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Manager combobox state
  const [managerQuery, setManagerQuery] = useState('');
  const [managerOpen, setManagerOpen] = useState(false);
  const managerInputRef = useRef(null);
  const managerWrapRef = useRef(null);

  const knownTeams = useMemo(() => {
    const set = new Set(Object.keys(teamPalette));
    employees.forEach(e => set.add(e.team));
    return Array.from(set).sort();
  }, [employees, teamPalette]);

  const possibleManagers = employees.filter(e => !employee || e.id !== employee.id);
  const currentManager = possibleManagers.find(m => m.id === Number(form.managerId));

  // Filtered manager list by query (name, title, or team match)
  const filteredManagers = useMemo(() => {
    const q = managerQuery.toLowerCase().trim();
    if (!q) return possibleManagers.slice(0, 50);
    return possibleManagers.filter(m =>
      m.name.toLowerCase().includes(q)
      || m.title.toLowerCase().includes(q)
      || m.team.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [possibleManagers, managerQuery]);

  // Close the manager dropdown when clicking outside
  useEffect(() => {
    if (!managerOpen) return;
    const onClick = (e) => {
      if (managerWrapRef.current && !managerWrapRef.current.contains(e.target)) {
        setManagerOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [managerOpen]);

  const c = getTeamColor(form.team);

  // Commit a newly-created team: register it in the palette IMMEDIATELY (so the
  // <select> below has the option to render), then set the form's team to it.
  const commitNewTeam = () => {
    const name = newTeamName.trim();
    if (!name) return;
    if (onAddTeam) onAddTeam(name);
    setForm(prev => ({ ...prev, team: name }));
    setAddingTeam(false);
    setNewTeamName('');
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.title.trim()) return;
    onSave({ ...form, managerId: form.managerId ? Number(form.managerId) : null });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    if (!file.type.startsWith('image/')) { setPhotoError('Please choose an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setPhotoError('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        setForm(prev => ({ ...prev, photo: canvas.toDataURL('image/jpeg', 0.85) }));
      };
      img.onerror = () => setPhotoError('Could not read image');
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(20, 20, 18, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 16, backdropFilter: 'blur(4px)'
    }}>
      <div onClick={(e) => e.stopPropagation()} className="fade-in" style={{
        background: '#fafaf7', borderRadius: 12, padding: 28, width: '100%', maxWidth: 460,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid #e5e4dc',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 className="display-font" style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>
            {employee ? 'Edit employee' : 'Add employee'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', padding: 4, color: '#666', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #e5e4dc' }}>
          {form.photo ? (
            <img src={form.photo} alt="Preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${c.bg}` }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: c.bg, color: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600 }}>
              {form.name ? getInitials(form.name) : <ImageIcon size={24} />}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => fileInputRef.current?.click()} className="btn-ghost"
                style={{ background: '#fff', border: '1px solid #e5e4dc', padding: '7px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Upload size={12} /> {form.photo ? 'Replace' : 'Upload photo'}
              </button>
              {form.photo && (
                <button onClick={() => setForm({ ...form, photo: null })} className="btn-ghost"
                  style={{ background: 'transparent', border: '1px solid #e5e4dc', padding: '7px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, color: '#a04040' }}>
                  Remove
                </button>
              )}
            </div>
            {photoError
              ? <div style={{ fontSize: 11, color: '#a04040', marginTop: 6 }}>{photoError}</div>
              : <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>JPG, PNG, GIF up to 5MB</div>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full name">
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus style={inputStyle} />
          </Field>
          <Field label="Title">
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Team">
            {addingTeam ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitNewTeam();
                    } else if (e.key === 'Escape') {
                      setAddingTeam(false);
                      setNewTeamName('');
                    }
                  }}
                  autoFocus
                  placeholder="New team name"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={commitNewTeam}
                  disabled={!newTeamName.trim()}
                  style={{
                    background: newTeamName.trim() ? '#1a1a1a' : '#c8c7bf',
                    color: '#fafaf7', border: 'none',
                    padding: '0 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                    cursor: newTeamName.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => { setAddingTeam(false); setNewTeamName(''); }}
                  style={{ background: 'transparent', border: '1px solid #e5e4dc', padding: '0 10px', borderRadius: 6, color: '#666', display: 'flex', alignItems: 'center' }}
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <select
                value={knownTeams.includes(form.team) ? form.team : ''}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setAddingTeam(true);
                    setNewTeamName('');
                  } else if (e.target.value) {
                    setForm({ ...form, team: e.target.value });
                  }
                }}
                style={inputStyle}
              >
                {!knownTeams.includes(form.team) && form.team && (
                  <option value="">— Select a team —</option>
                )}
                {knownTeams.map(t => <option key={t} value={t}>{t}</option>)}
                <option disabled>──────────</option>
                <option value="__new__">+ Create new team…</option>
              </select>
            )}
          </Field>
          <Field label="Location">
            <input type="text" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State or Country" style={inputStyle} />
          </Field>
          <Field label="Reports to">
            <ManagerCombobox
              currentManager={currentManager}
              filteredManagers={filteredManagers}
              managerQuery={managerQuery}
              setManagerQuery={setManagerQuery}
              managerOpen={managerOpen}
              setManagerOpen={setManagerOpen}
              managerInputRef={managerInputRef}
              managerWrapRef={managerWrapRef}
              getTeamColor={getTeamColor}
              onPick={(id) => {
                setForm({ ...form, managerId: id });
                setManagerOpen(false);
                setManagerQuery('');
              }}
            />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 24 }}>
          {/* Delete (only when editing) - lives in the modal so misclicks can't nuke someone */}
          {employee && onDelete && (
            confirmDelete ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 'auto' }}>
                <span style={{ fontSize: 12, color: '#5a2020', fontWeight: 500 }}>Delete {form.name}?</span>
                <button
                  onClick={() => onDelete(employee.id)}
                  style={{ background: '#5a2020', color: '#fafaf7', border: 'none', padding: '7px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="btn-ghost"
                  style={{ background: 'transparent', border: '1px solid #e5e4dc', padding: '7px 12px', borderRadius: 6, fontSize: 12, color: '#555' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="btn-ghost"
                style={{
                  background: 'transparent', border: '1px solid #e5d4d4', color: '#a04040',
                  padding: '8px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 6, marginRight: 'auto'
                }}
              >
                <Trash2 size={13} /> Delete employee
              </button>
            )
          )}
          <button onClick={onClose} className="btn-ghost"
            style={{ background: 'transparent', border: '1px solid #e5e4dc', padding: '9px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: '#555' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary"
            style={{ background: '#1a1a1a', color: '#fafaf7', border: 'none', padding: '9px 18px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>
            {employee ? 'Save changes' : 'Add employee'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Searchable manager picker for the "Reports to" field ---
function ManagerCombobox({
  currentManager, filteredManagers, managerQuery, setManagerQuery,
  managerOpen, setManagerOpen, managerInputRef, managerWrapRef,
  getTeamColor, onPick
}) {
  // The visible text in the input: query while open, manager name while closed
  const displayValue = managerOpen
    ? managerQuery
    : (currentManager ? currentManager.name : '');

  return (
    <div ref={managerWrapRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={managerInputRef}
          type="text"
          value={displayValue}
          placeholder={currentManager ? '' : '— No manager —'}
          onFocus={() => { setManagerOpen(true); setManagerQuery(''); }}
          onChange={(e) => { setManagerQuery(e.target.value); if (!managerOpen) setManagerOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { setManagerOpen(false); e.target.blur(); }
            if (e.key === 'ArrowDown' && !managerOpen) setManagerOpen(true);
          }}
          style={{ ...inputStyle, paddingRight: 64 }}
        />
        {/* Clear button when a manager is selected */}
        {currentManager && !managerOpen && (
          <button
            onClick={() => { onPick(null); setManagerQuery(''); }}
            title="Clear manager"
            style={{
              position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', padding: 2, color: '#999',
              display: 'flex', alignItems: 'center', cursor: 'pointer'
            }}
          >
            <X size={13} />
          </button>
        )}
        <Search size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }} />
      </div>

      {managerOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: '#fff', border: '1px solid #e5e4dc', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          maxHeight: 260, overflowY: 'auto'
        }}>
          {/* "No manager" option at the top */}
          <div
            onClick={() => onPick(null)}
            style={{
              padding: '9px 12px', fontSize: 12, color: '#666',
              cursor: 'pointer', borderBottom: '1px solid #f0efe8',
              fontStyle: 'italic'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f4ec'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
          >
            — No manager —
          </div>
          {filteredManagers.length === 0 ? (
            <div style={{ padding: '14px 12px', fontSize: 12, color: '#888', textAlign: 'center' }}>
              No matches
            </div>
          ) : filteredManagers.map(m => {
            const c = getTeamColor(m.team);
            return (
              <div
                key={m.id}
                onClick={() => onPick(m.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', cursor: 'pointer',
                  borderBottom: '1px solid #f7f6ee'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f4ec'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                {m.photo ? (
                  <img src={m.photo} alt={m.name} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${c.bg}`, flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', background: c.bg, color: c.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 600, flexShrink: 0
                  }}>
                    {getInitials(m.name)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title} · {m.team}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  padding: '9px 12px',
  border: '1px solid #e5e4dc',
  borderRadius: 6,
  fontSize: 13,
  background: '#fff',
  outline: 'none',
  color: '#1a1a1a',
};
