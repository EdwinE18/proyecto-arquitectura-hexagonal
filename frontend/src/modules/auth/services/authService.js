import axiosClient from '../../../api/axiosClient.js';
 
export const authService = {
  async registrar({ nombre, apellidoPaterno, apellidoMaterno, correo, password }) {
    const { data } = await axiosClient.post('/auth/registro', {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      correo,
      password,
    });
    return data;
  },
 
  async login({ correo, password }) {
    const { data } = await axiosClient.post('/auth/login', { correo, password });
    return data; // { token, usuario }
  },
};
 