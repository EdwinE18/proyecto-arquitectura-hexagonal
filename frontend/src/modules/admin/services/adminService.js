import axiosClient from '../../../api/axiosClient.js';
 
export const adminService = {
  async listarSolicitudesPendientes() {
    const { data } = await axiosClient.get('/admin/solicitudes');
    return data;
  },
 
  async resolverSolicitud(usuarioId, { accion, rol }) {
    const { data } = await axiosClient.patch(`/admin/solicitudes/${usuarioId}`, { accion, rol });
    return data;
  },
 
  async listarTodosUsuarios() {
    const { data } = await axiosClient.get('/admin/usuarios');
    return data;
  },
};
 