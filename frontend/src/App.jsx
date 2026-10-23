import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  Layers,
  AlertTriangle,
  Check,
  Sun,
  Moon,
} from 'lucide-react';

import ticketService from './api/ticketService';
import TicketTable from './components/TicketTable';
import TicketModal from './components/TicketModal';
import TicketDetailModal from './components/TicketDetailModal';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Tema Claro / Oscuro con sincronización directa y persistencia
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('incident_theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('incident_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await ticketService.getTickets();
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setApiError(
        'No se pudo conectar con el backend (http://localhost:8000). Verifica que el servidor FastAPI esté activo.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleTicketCreated = async (ticketData) => {
    const nuevo = await ticketService.createTicket(ticketData);
    setTickets((prev) => [nuevo, ...prev]);
    showToast(`Ticket #${nuevo.id} creado exitosamente.`);
  };

  const handleStatusChange = async (ticketId, nuevoEstado) => {
    const updated = await ticketService.updateTicketStatus(ticketId, nuevoEstado);
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? updated : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(updated);
    }
    showToast(`Ticket #${ticketId} actualizado a "${nuevoEstado}".`);
  };

  // Métricas
  const total = tickets.length;
  const abiertos = useMemo(() => tickets.filter((t) => t.estado === 'Abierto').length, [tickets]);
  const enProceso = useMemo(() => tickets.filter((t) => t.estado === 'En Proceso').length, [tickets]);
  const resueltos = useMemo(() => tickets.filter((t) => t.estado === 'Resuelto').length, [tickets]);

  // Porcentajes de barra de distribución
  const pAbiertos = total ? (abiertos / total) * 100 : 0;
  const pEnProceso = total ? (enProceso / total) * 100 : 0;
  const pResueltos = total ? (resueltos / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                Incident Desk
              </span>
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/60 px-1.5 py-0.5 rounded">
                v1.0
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Dynamic Status Indicator */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                apiError
                  ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800'
                  : loading && tickets.length === 0
                  ? 'text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                  : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  apiError
                    ? 'bg-rose-500'
                    : loading && tickets.length === 0
                    ? 'bg-zinc-400 animate-ping'
                    : 'bg-emerald-500 dark:bg-emerald-400 animate-pulse'
                }`}
              />
              <span>
                {apiError
                  ? 'API Desconectada'
                  : loading && tickets.length === 0
                  ? 'Conectando...'
                  : 'API En Línea'}
              </span>
            </div>

            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100/90 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-700 transition-all shadow-xs"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              aria-label="Alternar modo oscuro y claro"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700 fill-zinc-700/10" />
              )}
            </button>

            {/* Sync Button */}
            <button
              onClick={fetchTickets}
              disabled={loading}
              type="button"
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100/90 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-700 transition-all shadow-xs"
              title="Recargar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Action CTA */}
            <button
              onClick={() => setIsCreateOpen(true)}
              type="button"
              className="text-xs px-3.5 py-2 font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 active:scale-[0.98] text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-all ml-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Incidente</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3 shadow-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <span className="font-semibold">Servidor no disponible: </span>
              <span>{apiError}</span>
            </div>
          </div>
        )}

        {/* Minimalist Metrics Strip con Alto Contraste */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/90 shadow-subtle dark:shadow-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Incidentes
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1.5 tabular-nums">
              {total}
            </p>
          </div>

          <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/90 shadow-subtle dark:shadow-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Abiertos
              </p>
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]" />
            </div>
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1.5 tabular-nums">
              {abiertos}
            </p>
          </div>

          <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/90 shadow-subtle dark:shadow-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                En Proceso
              </p>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5 tabular-nums">
              {enProceso}
            </p>
          </div>

          <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/90 shadow-subtle dark:shadow-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Resueltos
              </p>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 tabular-nums">
              {resueltos}
            </p>
          </div>
        </div>

        {/* Micro distribution bar */}
        {total > 0 && (
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800/90 rounded-full overflow-hidden flex">
            <div style={{ width: `${pAbiertos}%` }} className="bg-sky-500 transition-all duration-500" />
            <div style={{ width: `${pEnProceso}%` }} className="bg-amber-500 transition-all duration-500" />
            <div style={{ width: `${pResueltos}%` }} className="bg-emerald-500 transition-all duration-500" />
          </div>
        )}

        {/* Ticket Data Grid */}
        <TicketTable
          tickets={tickets}
          onStatusChange={handleStatusChange}
          loading={loading}
          onSelectTicket={(ticket) => setSelectedTicket(ticket)}
        />
      </main>

      {/* Creation Modal */}
      <TicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTicketCreated={handleTicketCreated}
      />

      {/* Detail Inspection Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onStatusChange={handleStatusChange}
      />

      {/* Floating Minimal Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-medium px-4 py-3 rounded-xl shadow-elevated dark:shadow-dark-elevated flex items-center gap-2.5 border border-zinc-800 dark:border-zinc-200 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
