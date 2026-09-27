import axiosClient from '../../../api/axiosClient.js';
 
export const productoService = {
  async listar() {
    const { data } = await axiosClient.get('/productos');
    return data;
  },
 
  async crear(producto) {
    const { data } = await axiosClient.post('/productos', producto);
    return data;
  },
 
  async actualizar(id, cambios) {
    const { data } = await axiosClient.put(`/productos/${id}`, cambios);
    return data;
  },
 
  async eliminar(id) {
    const { data } = await axiosClient.delete(`/productos/${id}`);
    return data;
  },
};
 