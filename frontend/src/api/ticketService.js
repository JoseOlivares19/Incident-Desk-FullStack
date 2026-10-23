import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ticketService = {
  /**
   * Obtiene la lista completa de tickets
   */
  async getTickets() {
    const response = await apiClient.get('/tickets');
    return response.data;
  },

  /**
   * Registra un nuevo ticket
   * @param {{ titulo: string, descripcion: string, area: string, prioridad: string }} ticketData
   */
  async createTicket(ticketData) {
    const response = await apiClient.post('/tickets', ticketData);
    return response.data;
  },

  /**
   * Actualiza únicamente el estado del ticket indicado
   * @param {number} ticketId
   * @param {string} nuevoEstado - "Abierto" | "En Proceso" | "Resuelto"
   */
  async updateTicketStatus(ticketId, nuevoEstado) {
    const response = await apiClient.put(`/tickets/${ticketId}/estado`, {
      estado: nuevoEstado,
    });
    return response.data;
  },
};

export default ticketService;

