'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardNav } from '@/src/components/ui/DashboardNav';
import { ArrowBackButton } from '@/src/components/ui/ArrowBackButton';
import { ProfileView } from '@/src/components/profile/ProfileView';
import { ProfilePdfDocument } from '@/src/components/profile/ProfilePdfDocument';
import { useTranslation } from '@/src/i18n/useTranslation';
import { useAuth } from '@/src/hooks/useAuth';
import { getProfileById, updateProfileCompletion } from '@/src/services/profileService';
import { BASE_URL } from '@/config';
import { FeedbackHistoryPanel } from '@/src/components/ui/FeedbackHistoryPanel';
import {
  coerceProfileStatus,
  getProfileStatusLabel,
  ProfileStatusValue,
  PROFILE_STATUS_RANKED_VALUES,
  PROFILE_STATUS_VALUES,
} from '@/src/constants/profileStatuses';

const LIST_PAGE_SIZE = 10;
type SortField = 'firstName' | 'lastName' | 'status';
type StatusFilter = 'all' | ProfileStatusValue;

const normalizePermissions = (value: any): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return normalizePermissions(JSON.parse(trimmed));
      } catch (e) {
        return value;
      }
    }
    return value;
  }
  if (typeof value === 'object') {
    const maybeRole = (value as Record<string, any>).role || (value as Record<string, any>).name;
    return typeof maybeRole === 'string' ? maybeRole : null;
  }
  return null;
};

const resolveProfileStatus = (profile: any): ProfileStatusValue => {
  const rawStatus = profile?.status ?? profile?.complete;
  const coerced = coerceProfileStatus(rawStatus);
  return coerced ?? 'incomplete';
};

const getStatusBadgeClasses = (status: ProfileStatusValue): string => {
  switch (status) {
    case 'complete':
      return 'bg-green-100 text-green-700';
    case 'complete_with_remark':
      return 'bg-indigo-100 text-indigo-700';
    case 'under_review':
      return 'bg-blue-100 text-blue-700';
    case 'change_requested':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

function VoirToutProfilePageContent() {
  useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams?.get('profileId');

  const sortFieldFromQuery = useMemo<SortField>(() => {
    const candidate = searchParams?.get('sortBy');
    return candidate === 'lastName' || candidate === 'status' ? (candidate as SortField) : 'firstName';
  }, [searchParams]);

  const sortOrderFromQuery = useMemo<'asc' | 'desc'>(() => {
    return searchParams?.get('sortOrder') === 'desc' ? 'desc' : 'asc';
  }, [searchParams]);

  const statusFilterFromQuery = useMemo<StatusFilter>(() => {
    const candidate = searchParams?.get('statusFilter');
    if (candidate && PROFILE_STATUS_VALUES.includes(candidate as ProfileStatusValue)) {
      return candidate as ProfileStatusValue;
    }
    return 'all';
  }, [searchParams]);

  const pageFromQuery = useMemo(() => {
    const raw = parseInt(searchParams?.get('page') || '1', 10);
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  }, [searchParams]);
  const openedFromSearch = searchParams?.get('fromSearch') === 'true';
  const searchOriginId = searchParams?.get('searchId');
  const enableListNavigation = !openedFromSearch;

  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [permissions, setPermissions] = useState<string | null>(null);
  const [permissionsResolved, setPermissionsResolved] = useState(false);
  const [statusAction, setStatusAction] = useState<'approve' | 'incomplete' | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [listPage, setListPage] = useState(pageFromQuery);
  const [listRows, setListRows] = useState<any[]>([]);
  const [listMeta, setListMeta] = useState({ page: pageFromQuery, totalPages: 1, total: 0 });
  const [pendingNav, setPendingNav] = useState<null | { direction: 'next' | 'previous'; targetPage: number }>(null);
  const [listLoading, setListLoading] = useState(false);
  const ctaSectionRef = useRef<HTMLDivElement | null>(null);
  const wasFeedbackModalOpen = useRef(false);

  const fetchProfile = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProfileById(id);
      const profileData = response?.data || response;
      if (!profileData) {
        throw new Error('Profile not found');
      }
      setProfile(profileData);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setProfile(null);
      setError(err?.data?.message || err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('userPermissions') : null;
      setPermissions(normalizePermissions(stored));
    } catch (e) {
      setPermissions(null);
    }
  }, []);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          } else {
            const login = localStorage.getItem('loginToken');
            if (login) headers['x-login-token'] = login;
          }
        }

        const res = await fetch(`${BASE_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include',
          headers,
        });

        if (!res.ok) {
          setPermissions(null);
          setPermissionsResolved(true);
          return;
        }

        const body = await res.json();
        const raw = body?.data?.permissions ?? body?.permissions ?? null;
        const normalized = normalizePermissions(raw);
        setPermissions(normalized);
        setPermissionsResolved(true);
        if (typeof window !== 'undefined') {
          if (normalized) {
            localStorage.setItem('userPermissions', normalized);
          } else {
            localStorage.removeItem('userPermissions');
          }
        }
      } catch (e) {
        setPermissions(null);
        setPermissionsResolved(true);
      }
    };

    fetchPermissions();
  }, []);

  useEffect(() => {
    if (!permissionsResolved) return;
    if (permissions === 'user') {
      router.replace('/dashboard');
    }
  }, [permissionsResolved, permissions, router]);

  useEffect(() => {
    if (!profileId) {
      setProfile(null);
      setError('Profile ID is missing.');
      setLoading(false);
      return;
    }

    if (!permissionsResolved) return;
    if (permissions === 'user') return;
    fetchProfile(profileId);
  }, [profileId, permissionsResolved, permissions, fetchProfile]);

  useEffect(() => {
    setApprovalMessage(null);
    setStatusAction(null);
    setFeedbackModalOpen(false);
    setFeedbackInput('');
    setFeedbackError(null);
  }, [profileId]);

  useEffect(() => {
    if (!enableListNavigation) return;
    setListPage(pageFromQuery);
  }, [enableListNavigation, pageFromQuery]);

  const focusCTASection = useCallback(() => {
    if (ctaSectionRef.current) {
      ctaSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    if (wasFeedbackModalOpen.current && !isFeedbackModalOpen) {
      focusCTASection();
    }
    wasFeedbackModalOpen.current = isFeedbackModalOpen;
  }, [isFeedbackModalOpen, focusCTASection]);

  const isPrivilegedUser = permissions !== 'user';
  const statusValue = useMemo(() => (profile ? resolveProfileStatus(profile) : null), [profile]);
  const statusLabel = statusValue
    ? getProfileStatusLabel(statusValue, (key) => t(key) || key)
    : t('profile.summary.notProvided') || 'Not provided';
  const statusBadgeClasses = statusValue ? getStatusBadgeClasses(statusValue) : 'bg-gray-100 text-gray-600';
  const showApprovalSection = Boolean(isPrivilegedUser && profile);
  const completionValue = Number(profile?.complete);
  const feedbackEntries = useMemo(() => {
    if (!profile || !Array.isArray(profile.fb_notes)) return [];
    return [...profile.fb_notes]
      .filter((entry: any) => typeof entry?.note === 'string' && entry.note.trim())
      .map((entry: any, index: number) => ({
        id: entry._id || entry.id || `${entry.createdAt || 'note'}-${index}`,
        note: entry.note.trim(),
        createdAt: entry.createdAt ? new Date(entry.createdAt) : null,
          createdBy: entry.createdBy || entry.created_by || null,
      }))
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }, [profile]);

  const feedbackDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [],
  );

  const shouldShowFeedbackHistory = Boolean(
    profile && (!Number.isFinite(completionValue) || (completionValue !== 3 && completionValue !== 4)),
  );

  const handleStatusAction = async (action: 'approve' | 'incomplete', feedbackMessage?: string) => {
    if (!profileId || !profile) {
      setApprovalMessage(t('dashboard.approvalSection.errorMissingProfile') || 'Profile ID missing.');
      return;
    }

    if (action === 'incomplete' && !feedbackMessage) {
      setApprovalMessage(t('dashboard.feedbackModal.errorRequired') || 'Feedback message is required.');
      return;
    }

    setStatusAction(action);
    setApprovalMessage(null);
    const completeValue = action === 'approve' ? 4 : 2;

    try {
      const response = await updateProfileCompletion(profileId, completeValue, feedbackMessage);
      const updatedData = response?.data || response || null;

      if (updatedData) {
        setProfile((prev: any | null) => ({
          ...(prev || {}),
          ...updatedData,
          complete: updatedData.complete ?? completeValue,
        }));
        if (action === 'incomplete') {
          await fetchProfile(profileId);
        }
      } else {
        await fetchProfile(profileId);
      }

      setApprovalMessage(
        action === 'approve'
          ? t('dashboard.approvalSection.approvedSuccess') || 'Profile approved successfully.'
          : t('dashboard.approvalSection.incompleteSuccess') || 'Profile marked as incomplete.',
      );
    } catch (err: any) {
      console.error('Failed to update profile status:', err);
      setApprovalMessage(
        err?.data?.message ||
          err?.message ||
          t('dashboard.approvalSection.error') ||
          'Failed to update profile status.',
      );
    } finally {
      setStatusAction(null);
    }
  };

  const openFeedbackModal = () => {
    setFeedbackInput('');
    setFeedbackError(null);
    setFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    if (statusAction === 'incomplete') return;
    setFeedbackModalOpen(false);
    setFeedbackInput('');
    setFeedbackError(null);
  };

  const handleSubmitFeedback = async () => {
    const trimmed = feedbackInput.trim();
    if (!trimmed) {
      setFeedbackError(t('dashboard.feedbackModal.errorRequired') || 'Feedback message is required.');
      return;
    }
    setFeedbackError(null);
    await handleStatusAction('incomplete', trimmed);
    setFeedbackModalOpen(false);
    setFeedbackInput('');
  };

  const fetchListContext = useCallback(
    async (targetPage: number) => {
      if (!enableListNavigation) return;
      setListLoading(true);
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          } else {
            const login = localStorage.getItem('loginToken');
            if (login) headers['x-login-token'] = login;
          }
        }

        const params = new URLSearchParams({
          page: String(targetPage),
          limit: String(LIST_PAGE_SIZE),
          sortBy: sortFieldFromQuery,
          sortOrder: sortOrderFromQuery,
        });

        if (statusFilterFromQuery !== 'all') {
          const completionIndex = PROFILE_STATUS_RANKED_VALUES.indexOf(statusFilterFromQuery);
          if (completionIndex >= 0) {
            params.append('complete', String(completionIndex));
          }
        }

        const res = await fetch(`${BASE_URL}/profile/filledBy/all?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
          headers,
        });

        if (!res.ok) {
          throw new Error('Failed to load profile list context');
        }

        const body = await res.json();
        const rows = Array.isArray(body?.data) ? body.data : [];
        const meta = body?.meta || {};
        setListRows(rows);
        setListMeta({
          page: targetPage,
          totalPages: meta.totalPages || (rows.length ? 1 : 0),
          total: meta.total ?? rows.length ?? 0,
        });
      } catch (err) {
        console.error('Failed to load navigation context:', err);
        setListRows([]);
        setListMeta((prev) => ({ ...prev, page: targetPage }));
      } finally {
        setListLoading(false);
      }
    },
    [enableListNavigation, sortFieldFromQuery, sortOrderFromQuery, statusFilterFromQuery],
  );

  useEffect(() => {
    if (enableListNavigation) return;
    setListRows([]);
    setListMeta({ page: 1, totalPages: 1, total: 0 });
    setPendingNav(null);
    setListLoading(false);
  }, [enableListNavigation]);

  useEffect(() => {
    if (!enableListNavigation) return;
    if (!permissionsResolved || permissions === 'user') return;
    fetchListContext(listPage);
  }, [enableListNavigation, permissionsResolved, permissions, listPage, fetchListContext]);

  const navigateToProfile = useCallback(
    (targetProfileId: string, targetPage: number) => {
      if (!targetProfileId) return;
      const params = new URLSearchParams();
      params.set('profileId', targetProfileId);
      params.set('page', String(targetPage));
      params.set('sortBy', sortFieldFromQuery);
      params.set('sortOrder', sortOrderFromQuery);
      params.set('statusFilter', statusFilterFromQuery);
      router.replace(`/dashboard/identification/voir-tout/profile?${params.toString()}`);
    },
    [router, sortFieldFromQuery, sortOrderFromQuery, statusFilterFromQuery],
  );

  const currentListIndex = useMemo(() => {
    if (!profileId) return -1;
    return listRows.findIndex((row) => (row?._id || row?.id) === profileId);
  }, [listRows, profileId]);

  const hasPrevious =
    enableListNavigation && (currentListIndex > 0 || (currentListIndex === 0 && listMeta.page > 1));
  const hasNext =
    enableListNavigation &&
    ((currentListIndex >= 0 && currentListIndex < listRows.length - 1) || listMeta.page < listMeta.totalPages);

  const handleNavigate = (direction: 'next' | 'previous') => {
    if (!enableListNavigation) return;
    if (!profileId || listLoading || currentListIndex === -1) return;

    if (direction === 'next') {
      if (currentListIndex < listRows.length - 1) {
        const target = listRows[currentListIndex + 1];
        navigateToProfile(target?._id || target?.id, listMeta.page);
      } else if (listMeta.page < listMeta.totalPages && !pendingNav) {
        const targetPage = listMeta.page + 1;
        setPendingNav({ direction, targetPage });
        setListPage(targetPage);
      }
    } else {
      if (currentListIndex > 0) {
        const target = listRows[currentListIndex - 1];
        navigateToProfile(target?._id || target?.id, listMeta.page);
      } else if (listMeta.page > 1 && !pendingNav) {
        const targetPage = listMeta.page - 1;
        setPendingNav({ direction, targetPage });
        setListPage(targetPage);
      }
    }
  };

  useEffect(() => {
    if (!enableListNavigation) return;
    if (!pendingNav) return;
    if (listMeta.page !== pendingNav.targetPage) return;
    if (!listRows.length) {
      setPendingNav(null);
      return;
    }
    const targetRow = pendingNav.direction === 'next' ? listRows[0] : listRows[listRows.length - 1];
    const targetId = targetRow?._id || targetRow?.id;
    if (targetId) {
      navigateToProfile(targetId, pendingNav.targetPage);
    }
    setPendingNav(null);
  }, [enableListNavigation, pendingNav, listMeta.page, listRows, navigateToProfile]);

  const handleBack = () => {
    if (openedFromSearch) {
      if (searchOriginId) {
        router.push(`/dashboard?searchId=${encodeURIComponent(searchOriginId)}`);
      } else {
        router.push('/dashboard');
      }
      return;
    }
    router.push('/dashboard/identification/voir-tout');
  };

  const printableCompleteValue = completionValue;
  const isProfilePrintable =
    !Number.isNaN(printableCompleteValue) && (printableCompleteValue === 3 || printableCompleteValue === 4);

  const handlePrintPdf = useCallback(async () => {
    if (!profile || isGeneratingPdf || !isProfilePrintable) return;

    try {
      setError(null);
      setIsGeneratingPdf(true);
      const blob = await pdf(<ProfilePdfDocument profile={profile} />).toBlob();

      if (typeof window === 'undefined' || typeof document === 'undefined') return;

      const blobUrl = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = blobUrl;

      const cleanup = () => {
        URL.revokeObjectURL(blobUrl);
        iframe.parentNode?.removeChild(iframe);
        window.removeEventListener('afterprint', handleAfterPrint);
      };

      const handleAfterPrint = () => {
        cleanup();
      };

      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (loadErr) {
          console.error('Error triggering print dialog', loadErr);
          cleanup();
        }
      };

      window.addEventListener('afterprint', handleAfterPrint, { once: true });
      document.body.appendChild(iframe);
    } catch (err) {
      console.error('Error generating profile PDF', err);
      setError(t('profile.summary.printError') || 'Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [profile, isGeneratingPdf, isProfilePrintable, t]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <ArrowBackButton ariaLabel={t('profile.summary.back') || 'Back'} onClick={handleBack} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Profile' : 'Profile'}
              </h1>
              <p className="text-sm text-gray-600">
                {t('profile.summary.title') || 'Profile Summary'}
              </p>
            </div>
          </div>

          {error && profile && (
            <div className="mb-4 rounded border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              {t('profile.summary.loading') || 'Loading profile...'}
            </div>
          ) : profile ? (
            <div className="bg-white rounded-lg shadow p-8">
              <ProfileView data={profile} includeId />
              {showApprovalSection ? (
                <section ref={ctaSectionRef} className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {t('dashboard.approvalSection.statusLabel') || t('profile.summary.status') || 'Status'}
                      </p>
                      <span
                        className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClasses}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusAction('approve')}
                        className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={statusAction === 'approve'}
                      >
                        {statusAction === 'approve'
                          ? t('dashboard.approvalSection.processing') || 'Processing...'
                          : t('dashboard.approvalSection.approve') || 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={openFeedbackModal}
                        className="px-4 py-2 rounded bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={statusAction === 'incomplete'}
                      >
                        {statusAction === 'incomplete'
                          ? t('dashboard.approvalSection.processing') || 'Processing...'
                          : t('dashboard.approvalSection.markIncomplete') || 'Mark Incomplete'}
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintPdf}
                        disabled={isGeneratingPdf || !isProfilePrintable}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isGeneratingPdf
                          ? t('profile.summary.preparingPdf') || 'Preparing PDF...'
                          : t('profile.summary.print') || 'Print Profile'}
                      </button>
                      <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                        aria-label={t('profile.summary.returnToTop') || 'Return to Top'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7M12 3v18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {approvalMessage && (
                    <p className="mt-3 text-xs text-gray-500">{approvalMessage}</p>
                  )}
                </section>
              ) : (
                <div ref={ctaSectionRef} className="flex justify-end gap-2 pt-6 border-t mt-6">
                  <button
                    onClick={handlePrintPdf}
                    disabled={isGeneratingPdf || !isProfilePrintable}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isGeneratingPdf
                      ? t('profile.summary.preparingPdf') || 'Preparing PDF...'
                      : t('profile.summary.print') || 'Print Profile'}
                  </button>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                    aria-label={t('profile.summary.returnToTop') || 'Return to Top'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7M12 3v18" />
                    </svg>
                  </button>
                </div>
              )}

              {shouldShowFeedbackHistory && (
                <FeedbackHistoryPanel
                  key={profile?._id || profile?.id || profileId || 'feedback-history'}
                  entries={feedbackEntries}
                  title={t('dashboard.feedbackHistory.title') || 'Feedback history'}
                  caption={
                    t('dashboard.feedbackHistory.caption') || 'Review past notes left while the profile was incomplete.'
                  }
                  emptyStateLabel={
                    t('dashboard.feedbackHistory.empty') || 'No feedback has been recorded yet.'
                  }
                  toggleAriaLabel={t('dashboard.feedbackHistory.toggle') || 'Toggle feedback history'}
                  unknownDateLabel={t('dashboard.feedbackHistory.unknownDate') || 'Date unavailable'}
                  reviewerLabel={t('dashboard.feedbackHistory.reviewer') || 'Reviewer'}
                  showReviewerName
                  enableCarousel
                  maxItemsPerSlide={3}
                  previousSlideLabel={t('navigation.previous') || 'Previous'}
                  nextSlideLabel={t('navigation.next') || 'Next'}
                  dateFormatter={(date) => feedbackDateFormatter.format(date)}
                  defaultOpen={false}
                  panelId="feedback-history-panel"
                />
              )}

              {enableListNavigation && profile && (
                <div
                  className={`${shouldShowFeedbackHistory ? 'mt-4' : 'mt-6'} flex flex-wrap items-center justify-end gap-3`}
                >
                  <button
                    type="button"
                    onClick={() => handleNavigate('previous')}
                    className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!hasPrevious || listLoading}
                  >
                    {t('navigation.previous') || 'Previous'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('next')}
                    className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!hasNext || listLoading}
                  >
                    {t('navigation.next') || 'Next'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-700 mb-4">{error || 'Profile not found.'}</p>
              <button
                onClick={handleBack}
                className="inline-flex items-center justify-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                {t('profile.summary.back') || 'Back'}
              </button>
            </div>
          )}
        </div>
      </main>

      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('dashboard.feedbackModal.title') || 'Provide feedback'}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {t('dashboard.feedbackModal.description') || 'Explain what needs to be fixed before resubmitting.'}
            </p>
            <textarea
              className="mt-4 w-full rounded border border-gray-300 p-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              rows={5}
              value={feedbackInput}
              onChange={(event) => setFeedbackInput(event.target.value)}
              placeholder={t('dashboard.feedbackModal.placeholder') || 'Describe the required changes...'}
              disabled={statusAction === 'incomplete'}
            />
            {feedbackError && <p className="mt-2 text-sm text-red-600">{feedbackError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeFeedbackModal}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={statusAction === 'incomplete'}
              >
                {t('dashboard.feedbackModal.cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSubmitFeedback}
                className="rounded bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={statusAction === 'incomplete'}
              >
                {statusAction === 'incomplete'
                  ? t('dashboard.approvalSection.processing') || 'Processing...'
                  : t('dashboard.feedbackModal.submit') || 'Send feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VoirToutProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-6">Loading profile...</div>}>
      <VoirToutProfilePageContent />
    </Suspense>
  );
}
