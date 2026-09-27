import axiosClient from '../../../api/axiosClient.js';
 
export const pedidoService = {
  async listar() {
    const { data } = await axiosClient.get('/pedidos');
    return data;
  },
 
  async crear(items) {
    const { data } = await axiosClient.post('/pedidos', { items });
    return data;
  },
 
  async resolver(pedidoId, accion) {
    const { data } = await axiosClient.patch(`/pedidos/${pedidoId}`, { accion });
    return data;
  },
};
 