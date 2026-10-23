import { X, Calendar, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

const ESTADOS = ['Abierto', 'En Proceso', 'Resuelto'];

const getPrioridadBadge = (prioridad) => {
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

export default function TicketDetailModal({ ticket, onClose, onStatusChange }) {
  if (!ticket) return null;

  const prio = getPrioridadBadge(ticket.prioridad);

  const formattedDate = new Date(ticket.fecha_creacion).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#121215] rounded-2xl shadow-elevated dark:shadow-dark-elevated border border-zinc-200 dark:border-zinc-800 p-6 z-10 transition-all">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold border border-zinc-200 dark:border-zinc-700">
              #{ticket.id}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border ${prio.bg} ${prio.text} ${prio.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
              {ticket.prioridad}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">•</span>
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{ticket.area}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
              {ticket.titulo}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Registrado el {formattedDate}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
            <p className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Detalle del Incidente
            </p>
            <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-normal">
              {ticket.descripcion}
            </p>
          </div>

          {/* Quick status switch */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">
              Cambiar Estado del Ticket
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ESTADOS.map((est) => {
                const isActive = ticket.estado === est;
                return (
                  <button
                    key={est}
                    onClick={() => onStatusChange(ticket.id, est)}
                    className={`text-xs py-2 px-3 rounded-lg border font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-950 shadow-xs'
                        : 'bg-white dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {est === 'Abierto' && <Clock className="w-3.5 h-3.5" />}
                    {est === 'En Proceso' && <PlayCircle className="w-3.5 h-3.5" />}
                    {est === 'Resuelto' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{est}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3.5 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs px-4 py-2 font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
