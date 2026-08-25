import api from "../axios";

export const getOrderById = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.data;
};
