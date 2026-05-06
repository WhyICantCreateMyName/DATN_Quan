import axiosClient from './axiosClient';

export const lockerService = {
  getLockerRows: (): Promise<any> => axiosClient.get('/lockers'),
  
  createLockerRow: (data: { name: string; rowCount: number; colCount: number }): Promise<any> =>
    axiosClient.post('/lockers', data),
    
  updateLockerCell: (rowId: number, x: number, y: number, value: number | null | string): Promise<any> =>
    axiosClient.patch(`/lockers/${rowId}/cell`, { x, y, value }),
    
  deleteLockerRow: (id: number): Promise<any> => axiosClient.delete(`/lockers/${id}`),
};
