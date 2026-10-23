import { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';

const AREAS = ['TI', 'Operaciones', 'Ventas', 'Finanzas', 'Recursos Humanos'];
const PRIORIDADES = [
  { label: 'Baja', color: 'bg-zinc-400' },
  { label: 'Media', color: 'bg-sky-500' },
  { label: 'Alta', color: 'bg-amber-500' },
  { label: 'Critica', color: 'bg-rose-500' },
];

export default function TicketModal({ isOpen, onClose, onTicketCreated }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    area: 'TI',
    prioridad: 'Media',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.titulo.trim() || !formData.descripcion.trim()) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setLoading(true);
      await onTicketCreated(formData);
      setFormData({
        titulo: '',
        descripcion: '',
        area: 'TI',
        prioridad: 'Media',
      });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.detail ||
        'Error al registrar el ticket. Revisa el servidor.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#121215] rounded-2xl shadow-elevated dark:shadow-dark-elevated border border-zinc-200 dark:border-zinc-800 p-6 z-10 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Nuevo Registro
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
              Crear Ticket de Incidencia
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Título del Incidente
              </label>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                {formData.titulo.length}/100
              </span>
            </div>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              maxLength={100}
              placeholder="Ej: Caída de latencia en enlace troncal Monterrey"
              className="w-full text-xs px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all shadow-2xs"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                Área Solicitante
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all cursor-pointer shadow-2xs"
              >
                {AREAS.map((a) => (
                  <option key={a} value={a} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                Prioridad
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRIORIDADES.map((p) => {
                  const isSelected = formData.prioridad === p.label;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, prioridad: p.label }))}
                      className={`text-[11px] py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold shadow-xs'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? (isSelected ? 'bg-white dark:bg-zinc-950' : p.color) : p.color
                        }`}
                      />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
              Descripción y Contexto
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              placeholder="Detalla los síntomas observados, usuarios afectados o pasos previos..."
              className="w-full text-xs px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all resize-none shadow-2xs"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-xs px-3.5 py-2 font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="text-xs px-4 py-2 font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 active:scale-[0.98] text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <span>Crear Incidente</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
