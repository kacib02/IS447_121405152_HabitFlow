import { StyleSheet } from 'react-native';

export const lightColors = {
  primary: '#2563eb',
  danger: '#dc2626',
  black: '#000000',
  white: '#ffffff',
  border: '#cccccc',
  background: '#ffffff',
  card: '#ffffff',
  muted: '#f3f4f6',
  progressBg: '#e5e7eb',
  success: '#16a34a',
};

export const darkColors = {
  primary: '#3b82f6',
  danger: '#ef4444',
  black: '#ffffff',
  white: '#111827',
  border: '#374151',
  background: '#111827',
  card: '#1f2937',
  muted: '#374151',
  progressBg: '#4b5563',
  success: '#22c55e',
};

export const colors = lightColors;

export const g = StyleSheet.create({
  screen: {
    padding: 16,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.black,
    marginTop: 48,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
    marginTop: 12,
  },
  bodyText: {
    fontSize: 14,
    color: colors.black,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: colors.black,
    marginTop: 4,
  },

  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.black,
    fontWeight: '600',
    fontSize: 15,
  },
  dangerButton: {
    backgroundColor: colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
  },
  smallPrimaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  smallPrimaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  smallDangerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.danger,
  },
  smallDangerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.black,
    backgroundColor: colors.white,
    marginBottom: 12,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.black,
  },
  chipTextActive: {
    color: colors.white,
  },

  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  toggleBtnTextActive: {
    color: colors.white,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  progressBg: {
    height: 8,
    backgroundColor: colors.progressBg,
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%' as any,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },

  statusMet: { color: colors.success, fontWeight: '600' as '600' },
  statusExceeded: { color: colors.primary, fontWeight: '600' as '600' },
  statusUnmet: { color: colors.danger, fontWeight: '600' as '600' },
});