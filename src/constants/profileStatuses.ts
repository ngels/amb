export type ProfileStatusValue =
  | 'incomplete'
  | 'under_review'
  | 'change_requested'
  | 'complete_with_remark'
  | 'complete';

interface ProfileStatusOption {
  value: ProfileStatusValue;
  labelKey: string;
}

const OPTIONS: ProfileStatusOption[] = [
  { value: 'incomplete', labelKey: 'profile.status.incomplete' },
  { value: 'under_review', labelKey: 'profile.status.underReview' },
  { value: 'change_requested', labelKey: 'profile.status.changeRequested' },
  { value: 'complete_with_remark', labelKey: 'profile.status.completeWithRemark' },
  { value: 'complete', labelKey: 'profile.status.complete' },
];

export const PROFILE_STATUS_VALUES: ProfileStatusValue[] = OPTIONS.map((option) => option.value);

export const PROFILE_STATUS_RANKED_VALUES: ProfileStatusValue[] = [...PROFILE_STATUS_VALUES];

export const PROFILE_STATUS_OPTIONS: ProfileStatusOption[] = OPTIONS;

export const isProfileStatusValue = (value: unknown): value is ProfileStatusValue =>
  typeof value === 'string' && PROFILE_STATUS_VALUES.includes(value as ProfileStatusValue);

export const getProfileStatusLabel = (
  value: string | null | undefined,
  translate: (key: string) => string,
): string => {
  const option = PROFILE_STATUS_OPTIONS.find((status) => status.value === value) ?? PROFILE_STATUS_OPTIONS[0];
  return translate(option.labelKey) || option.value;
};

const normalizeStatusString = (value: string): ProfileStatusValue | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const maybeNumber = Number(trimmed);
  if (!Number.isNaN(maybeNumber)) {
    const idx = Math.floor(maybeNumber);
    return PROFILE_STATUS_RANKED_VALUES[idx] ?? null;
  }

  const normalized = trimmed.toLowerCase().replace(/[^a-z]+/g, '_');
  return isProfileStatusValue(normalized) ? (normalized as ProfileStatusValue) : null;
};

export const coerceProfileStatus = (value: unknown): ProfileStatusValue | null => {
  if (value == null) return null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    const idx = Math.floor(value);
    return PROFILE_STATUS_RANKED_VALUES[idx] ?? null;
  }

  if (typeof value === 'string') {
    if (isProfileStatusValue(value)) {
      return value;
    }
    return normalizeStatusString(value);
  }

  return null;
};
