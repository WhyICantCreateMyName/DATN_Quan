/**
 * @description Format số lượng tiền tệ VND (VD: 100000 -> 100.000 ₫)
 */
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
};

/**
 * @description Kiểm tra số điện thoại hợp lệ (Đầu số VN 03, 05, 07, 08, 09 + 8 số)
 */
export const isValidPhone = (phone: string): boolean => {
  return /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone);
};

/**
 * @description Định dạng hiển thị ngày tháng (VD: 15/12/2026)
 */
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

/**
 * @description Tính số ngày còn lại đến một mốc thời gian
 */
export const getRemainingDays = (endDateString: string | Date): number => {
  const endDate = new Date(endDateString);
  const now = new Date();
  return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
};
