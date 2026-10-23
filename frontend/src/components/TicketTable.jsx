import { useState, useMemo } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ESTADOS = ['Abierto', 'En Proceso', 'Resuelto'];
const AREAS = ['Todas', 'TI', 'Operaciones', 'Ventas', 'Finanzas', 'Recursos Humanos'];
const PRIORIDADES = ['Todas', 'Baja', 'Media', 'Alta', 'Critica'];

const getPrioridadMeta = (prioridad) => {
  switch (prioridad) {
    case 'Critica':
      return {
        dot: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]',
        text: 'text-rose-700 dark:text-rose-300 font-semibold',
        bg: 'bg-rose-50 dark:bg-rose-950/70',
        border: 'border-rose-200 dark:border-rose-800',
      };
    case 'Alta':
      return {
        dot: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]',
        text: 'text-amber-800 dark:text-amber-300 font-semibold',
        bg: 'bg-amber-50 dark:bg-amber-950/70',
        border: 'border-amber-200 dark:border-amber-800',
      };
    case 'Media':
      return {
        dot: 'bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.7)]',
        text: 'text-sky-700 dark:text-sky-300 font-semibold',
        bg: 'bg-sky-50 dark:bg-sky-950/70',
        border: 'border-sky-200 dark:border-sky-800',
      };
    case 'Baja':
    default:
      return {
        dot: 'bg-zinc-400 dark:bg-zinc-400',
        text: 'text-zinc-700 dark:text-zinc-300 font-medium',
        bg: 'bg-zinc-100 dark:bg-zinc-800/90',
        border: 'border-zinc-200 dark:border-zinc-700',
      };
  }
};

export default function TicketTable({
  tickets,
  onStatusChange,
  loading,
  onSelectTicket,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('Todos');
  const [selectedArea, setSelectedArea] = useState('Todas');
  const [selectedPrioridad, setSelectedPrioridad] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updatingId, setUpdatingId] = useState(null);

  // Totales por estado para los segmented tabs
  const countTotal = tickets.length;
  const countAbiertos = useMemo(
    () => tickets.filter((t) => t.estado === 'Abierto').length,
    [tickets]
  );
  const countEnProceso = useMemo(
    () => tickets.filter((t) => t.estado === 'En Proceso').length,
    [tickets]
  );
  const countResueltos = useMemo(
    () => tickets.filter((t) => t.estado === 'Resuelto').length,
    [tickets]
  );

  // Filtrado reactivo en memoria
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        t.titulo.toLowerCase().includes(q) ||
        t.descripcion.toLowerCase().includes(q) ||
        String(t.id).includes(q);

      const matchEstado =
        selectedEstado === 'Todos' || t.estado === selectedEstado;
      const matchArea = selectedArea === 'Todas' || t.area === selectedArea;
      const matchPrioridad =
        selectedPrioridad === 'Todas' || t.prioridad === selectedPrioridad;

      return matchSearch && matchEstado && matchArea && matchPrioridad;
    });
  }, [tickets, searchTerm, selectedEstado, selectedArea, selectedPrioridad]);

  // Paginación
  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  const handleStatusUpdate = async (e, ticketId, nuevoEstado) => {
    e.stopPropagation();
    try {
      setUpdatingId(ticketId);
      await onStatusChange(ticketId, nuevoEstado);
    } finally {
      setUpdatingId(null);
    }
  };

  const hasActiveFilters =
    searchTerm ||
    selectedEstado !== 'Todos' ||
    selectedArea !== 'Todas' ||
    selectedPrioridad !== 'Todas';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedEstado('Todos');
    setSelectedArea('Todas');
    setSelectedPrioridad('Todas');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-subtle dark:shadow-none overflow-hidden transition-colors">
      {/* Segmented Status Tabs & Search Toolbar */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#121215] space-y-3.5">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800/90 rounded-xl gap-1 text-xs font-medium border border-zinc-200/60 dark:border-zinc-700/60">
            <button
              onClick={() => {
                setSelectedEstado('Todos');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedEstado === 'Todos'
                  ? 'bg-white dark:bg-zinc-700/80 text-zinc-950 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Todos <span className="ml-1 text-[11px] opacity-75 font-mono">({countTotal})</span>
            </button>
            <button
              onClick={() => {
                setSelectedEstado('Abierto');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedEstado === 'Abierto'
                  ? 'bg-white dark:bg-zinc-700/80 text-zinc-950 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>Abiertos</span>
              <span className="text-[11px] opacity-75 font-mono">({countAbiertos})</span>
            </button>
            <button
              onClick={() => {
                setSelectedEstado('En Proceso');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedEstado === 'En Proceso'
                  ? 'bg-white dark:bg-zinc-700/80 text-zinc-950 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>En Proceso</span>
              <span className="text-[11px] opacity-75 font-mono">({countEnProceso})</span>
            </button>
            <button
              onClick={() => {
                setSelectedEstado('Resuelto');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedEstado === 'Resuelto'
                  ? 'bg-white dark:bg-zinc-700/80 text-zinc-950 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Resueltos</span>
              <span className="text-[11px] opacity-75 font-mono">({countResueltos})</span>
            </button>
          </div>

          {/* Quick Counter */}
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            Mostrando <span className="text-zinc-900 dark:text-white font-semibold">{filteredTickets.length}</span> de{' '}
            <span className="text-zinc-900 dark:text-white font-semibold">{tickets.length}</span> incidentes
          </div>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por ID, título o descripción..."
              className="w-full text-xs pl-8 pr-7 py-2 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2">
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs py-2 px-3 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer transition-colors shadow-xs"
            >
              {AREAS.map((a) => (
                <option key={a} value={a} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  {a === 'Todas' ? 'Todas las Áreas' : a}
                </option>
              ))}
            </select>

            <select
              value={selectedPrioridad}
              onChange={(e) => {
                setSelectedPrioridad(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs py-2 px-3 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer transition-colors shadow-xs"
            >
              {PRIORIDADES.map((p) => (
                <option key={p} value={p} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  {p === 'Todas' ? 'Prioridad: Todas' : `Prioridad: ${p}`}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white px-2 py-1 transition-colors underline underline-offset-2"
                title="Restablecer filtros"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      {loading && (
        <div className="py-20 text-center">
          <div className="inline-block w-6 h-6 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin mb-2" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Sincronizando incidentes...</p>
        </div>
      )}

      {!loading && filteredTickets.length === 0 && (
        <div className="py-20 text-center px-4">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">No se encontraron tickets</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Prueba ajustando los términos de búsqueda o limpiando los filtros seleccionados.
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-4 text-xs font-semibold text-zinc-900 dark:text-white underline underline-offset-4"
            >
              Restablecer todos los filtros
            </button>
          )}
        </div>
      )}

      {!loading && filteredTickets.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-[#18181b]">
                  <th className="py-3 px-4 w-16">ID</th>
                  <th className="py-3 px-4">Incidente</th>
                  <th className="py-3 px-4 w-32">Área</th>
                  <th className="py-3 px-4 w-28">Prioridad</th>
                  <th className="py-3 px-4 w-36">Fecha</th>
                  <th className="py-3 px-4 w-36 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                {paginatedTickets.map((ticket) => {
                  const prio = getPrioridadMeta(ticket.prioridad);
                  const isUpdating = updatingId === ticket.id;

                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => onSelectTicket(ticket)}
                      className="group hover:bg-zinc-50/90 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono text-zinc-500 dark:text-zinc-400 font-medium tabular-nums">
                        #{ticket.id}
                      </td>

                      {/* Title & Preview */}
                      <td className="py-3 px-4 max-w-md">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {ticket.titulo}
                          </span>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 font-normal line-clamp-1 mt-0.5 pr-4 text-[11px]">
                          {ticket.descripcion}
                        </p>
                      </td>

                      {/* Área */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80">
                          {ticket.area}
                        </span>
                      </td>

                      {/* Prioridad */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border ${prio.bg} ${prio.text} ${prio.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
                          <span>{ticket.prioridad}</span>
                        </span>
                      </td>

                      {/* Fecha */}
                      <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] whitespace-nowrap tabular-nums">
                        {formatDate(ticket.fecha_creacion)}
                      </td>

                      {/* Estado Dropdown */}
                      <td
                        className="py-3 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          disabled={isUpdating}
                          value={ticket.estado}
                          onChange={(e) => handleStatusUpdate(e, ticket.id, e.target.value)}
                          className={`text-[11px] font-semibold py-1.5 px-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 cursor-pointer transition-all shadow-2xs ${
                            isUpdating ? 'opacity-40 cursor-wait' : ''
                          } ${
                            ticket.estado === 'Resuelto'
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                              : ticket.estado === 'En Proceso'
                              ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                              : 'bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                          }`}
                        >
                          {ESTADOS.map((est) => (
                            <option key={est} value={est} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                              {est}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50/50 dark:bg-[#121215]">
            <div className="flex items-center gap-3">
              <span className="tabular-nums">
                Página <span className="font-bold text-zinc-900 dark:text-white">{currentPage}</span> de{' '}
                <span className="font-bold text-zinc-900 dark:text-white">{totalPages}</span>
              </span>

              <span className="text-zinc-300 dark:text-zinc-700">•</span>

              <div className="flex items-center gap-1.5">
                <span>Mostrar</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>por página</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-zinc-700 dark:text-zinc-200"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-zinc-700 dark:text-zinc-200"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
