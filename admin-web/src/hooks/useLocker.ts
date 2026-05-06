import { useState, useEffect, useCallback } from 'react';
import { lockerService } from '@/services/lockerService';
import { useToast } from '@/context/ToastContext';

export interface LockerRow {
  id: number;
  name: string;
  rowCount: number;
  colCount: number;
  layout: (number | null | string)[][];
}

export const useLocker = () => {
  const { showToast } = useToast();
  const [lockerRows, setLockerRows] = useState<LockerRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLockerRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await lockerService.getLockerRows();
      setLockerRows(res);
    } catch (e) {
      showToast('Lỗi khi tải danh sách Locker', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLockerRows();
  }, [fetchLockerRows]);

  const createRow = async (name: string, rowCount: number, colCount: number) => {
    try {
      await lockerService.createLockerRow({ name, rowCount, colCount });
      showToast('Thêm dãy Locker mới thành công', 'success');
      fetchLockerRows();
    } catch (e) {
      showToast('Lỗi khi tạo dãy Locker', 'error');
    }
  };

  const updateCell = async (rowId: number, x: number, y: number, value: number | null | string) => {
    try {
      await lockerService.updateLockerCell(rowId, x, y, value);
      fetchLockerRows();
    } catch (e) {
      showToast('Lỗi khi cập nhật trạng thái ô Locker', 'error');
    }
  };

  const deleteRow = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dãy Locker này?')) return;
    try {
      await lockerService.deleteLockerRow(id);
      showToast('Xóa dãy Locker thành công', 'success');
      fetchLockerRows();
    } catch (e) {
      showToast('Lỗi khi xóa dãy Locker', 'error');
    }
  };

  return {
    lockerRows,
    loading,
    refresh: fetchLockerRows,
    createRow,
    updateCell,
    deleteRow
  };
};
