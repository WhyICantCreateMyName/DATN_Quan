/**
 * TITAN GYM - DESIGN SYSTEM TOKENS
 * Bảng màu thể thao hiệu suất cao (High-Performance Kinetic Dark)
 */
import { Platform } from 'react-native';

export const KINETIC_THEME = {
  // Nền chính: Obsidian Black - tiết kiệm pin OLED
  background: '#0E100F',
  // Nền thẻ bề mặt: Carbon Gray - Khung thẻ, hồ sơ PT, biểu đồ
  surface: '#1A1D1B',
  // Chữ chính: Crisp Off-White - Tên bài tập, số kg tạ, đồng hồ đếm ngược
  textPrimary: '#F4F5F0',
  // Chữ phụ: Ash Gray - Ghi chú kỹ thuật, thời gian nghỉ
  textMuted: '#8E9490',
  // Màu nhấn chính: Kinetic Volt - Nút bấm hành động, nút hoàn thành
  accentPrimary: '#C8F135',
  // Chữ trên nút nhấn chính
  textOnAccent: '#0E100F',
  // Màu nhấn phụ: Signal Coral - Cảnh báo, hết hạn, hủy lịch, logout
  accentSecondary: '#FF5A36',
  // Đường viền thẻ
  border: '#272B28',
  // Trạng thái thành công
  success: '#10B981',
};

// Cấu hình phông chữ
export const KINETIC_FONTS = {
  header: Platform.select({
    ios: 'Barlow-CondensedBold',
    android: 'sans-serif-condensed',
    default: 'sans-serif',
  }),
  body: Platform.select({
    ios: 'DMSans-Regular',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  mono: Platform.select({
    ios: 'Courier',
    android: 'monospace',
    default: 'monospace',
  })
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: KINETIC_THEME.textPrimary,
    background: KINETIC_THEME.background,
    tint: KINETIC_THEME.accentPrimary,
    icon: KINETIC_THEME.textMuted,
    tabIconDefault: KINETIC_THEME.textMuted,
    tabIconSelected: KINETIC_THEME.accentPrimary,
  },
};
