'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardNav } from '@/src/components/ui/DashboardNav';
import { ArrowBackButton } from '@/src/components/ui/ArrowBackButton';
import { resolveBackendUrl } from '@/src/services/httpClient';
import { useTranslation } from '@/src/i18n/useTranslation';
import { ProfileView } from '@/src/components/profile/ProfileView';
import { ProfilePdfDocument } from '@/src/components/profile/ProfilePdfDocument';
import { CollapsibleView } from '@/src/components/ui/CollapsibleView';
import { FeedbackHistoryPanel } from '@/src/components/ui/FeedbackHistoryPanel';
import {
  coerceProfileStatus,
  getProfileStatusLabel,
  ProfileStatusValue,
} from '@/src/constants/profileStatuses';

interface Profile {
  id?: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  complete?: number;
  status?: ProfileStatusValue | string;
}

const normalizePermissions = (value: any): string | null => {
  if (!value) return null;
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
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

const resolveProfileStatus = (profile: Profile): ProfileStatusValue => {
  const rawStatus = profile.status ?? profile.complete;
  const coerced = coerceProfileStatus(rawStatus);
  if (coerced) {
    return coerced;
  }
  return 'incomplete';
};

const composeFullName = (first?: string | null, last?: string | null) =>
  [first, last].filter(Boolean).join(' ').trim();

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const buildRequest = useCallback((path: string, init?: RequestInit) =>
    fetch(resolveBackendUrl(path), {
      credentials: 'include',
      cache: 'no-store',
      ...init,
    }), []);
  const buildAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {};
    try {
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        } else {
          const login = localStorage.getItem('loginToken');
          if (login) headers['x-login-token'] = login;
        }
      }
    } catch (e) {}
    return headers;
  }, []);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewFullProfileId, setViewFullProfileId] = useState<string | null>(null);
  const [fullProfileData, setFullProfileData] = useState<any>(null);
  const [permissions, setPermissions] = useState<string | null>(null);
  const [permissionsResolved, setPermissionsResolved] = useState(false);

  const [searchId, setSearchId] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchExpanded, setSearchExpanded] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const requestedViewId = searchParams?.get('view');
  const searchIdFromQuery = searchParams?.get('searchId');

  // Read permissions from localStorage so UI can react immediately
  useEffect(() => {
    try {
      const p = typeof window !== 'undefined' ? localStorage.getItem('userPermissions') : null;
      setPermissions(normalizePermissions(p));
    } catch (e) {
      setPermissions(null);
    }
  }, []);

  // Fetch fresh permissions to ensure admin/operator features render
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const headers = { 'Content-Type': 'application/json', ...buildAuthHeaders() };

        const res = await buildRequest('/auth/me', {
          method: 'GET',
          headers,
        });

        if (!res.ok) {
          setPermissions(null);
          setPermissionsResolved(true);
          return;
        }

        const body = await res.json();
        const rawPermissions = body?.data?.permissions ?? body?.permissions ?? null;
        const normalized = normalizePermissions(rawPermissions);
        setPermissions(normalized);
        setPermissionsResolved(true);
        if (typeof window !== 'undefined') {
          if (normalized) {
            localStorage.setItem('userPermissions', normalized);
          } else {
            localStorage.removeItem('userPermissions');
          }
        }
      } catch (err) {
        setPermissions(null);
        setPermissionsResolved(true);
      }
    };

    fetchPermissions();
  }, [buildAuthHeaders, buildRequest]);

  useEffect(() => {
    if (!permissionsResolved) return;
    if (permissions === null) return; // still unknown
    if (permissions !== 'user' && !requestedViewId) {
      setIsLoading(false);
      setProfiles([]);
      setFullProfileData(null);
      setError(null);
      return;
    }

    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const headers = buildAuthHeaders();

        const res = await buildRequest('/profile/me', { headers });

        if (res.ok) {
          const body = await res.json();

          if (body.status === 'fail') {
            const errorMessage = body.data?.message || 'Failed to load profile';
            if (errorMessage === 'profile_not_found') {
              setError('Profile not found');
            } else {
              setError(errorMessage);
            }
            setProfiles([]);
            setFullProfileData(null);
          } else {
            const profile = body.data || body;
            setProfiles(profile ? [profile] : []);
            setFullProfileData(profile);
          }
        } else {
          setError('Failed to load profiles');
        }
      } catch (err: any) {
        setError(err?.message || 'Error loading profiles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [buildAuthHeaders, buildRequest, permissions, permissionsResolved, requestedViewId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const completionValue = fullProfileData?.complete;
    if (completionValue === undefined || completionValue === null) {
      localStorage.removeItem('profileCompleteStatus');
    } else {
      localStorage.setItem('profileCompleteStatus', String(completionValue));
    }
    window.dispatchEvent(new Event('profile-completion-changed'));
  }, [fullProfileData?.complete]);

  const feedbackEntries = useMemo(() => {
    if (!fullProfileData || !Array.isArray(fullProfileData?.fb_notes)) return [];
    return [...fullProfileData.fb_notes]
      .filter((entry: any) => typeof entry?.note === 'string' && entry.note.trim())
      .map((entry: any, index: number) => ({
        id: entry._id || entry.id || `${entry.createdAt || 'note'}-${index}`,
        note: entry.note.trim(),
        createdAt: entry.createdAt ? new Date(entry.createdAt) : null,
      }))
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }, [fullProfileData]);

  const feedbackDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [],
  );

  const handlePrintPdf = useCallback(async () => {
    if (!fullProfileData || isGeneratingPdf) return;
    const completeValue = Number(fullProfileData.complete);
    if (Number.isNaN(completeValue) || (completeValue !== 3 && completeValue !== 4)) {
      return;
    }

    setError(null);
    try {
      setIsGeneratingPdf(true);
          const blob = await pdf(<ProfilePdfDocument profile={fullProfileData} />).toBlob();

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
  }, [fullProfileData, isGeneratingPdf, t]);

  const searchById = useCallback(async (id: string) => {
    if (!id) {
      setSearchError('Please provide an ID');
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const headers = buildAuthHeaders();

        const res = await buildRequest(`/profile/byId/${encodeURIComponent(id)}`, { headers });

      if (res.ok) {
        const body = await res.json();
        if (body.status === 'fail') {
          setSearchError('--No profile match for this info --');
        } else {
          setSearchResult(body.data || body);
          setSearchExpanded(true);
        }
      } else {
        setSearchError('Failed to search');
      }
    } catch (err: any) {
      setSearchError(err?.message || 'Error searching');
    } finally {
      setSearchLoading(false);
    }
  }, [buildAuthHeaders, buildRequest]);

  const openProfileInline = useCallback(async (id: string | null) => {
    const fetchSelfProfile = permissions === 'user';
    if (!fetchSelfProfile && !id) return;
    setIsLoading(true);
    setError(null);
    try {
      const headers = buildAuthHeaders();

      const endpointPath = fetchSelfProfile
        ? '/profile/me'
        : `/profile/byId/${encodeURIComponent(id as string)}`;

      const res = await buildRequest(endpointPath, { headers });

      if (res.ok) {
        const body = await res.json();
        if (body.status === 'fail') {
          setError('Profile not found');
        } else {
          const profileData = body.data || body;
          setFullProfileData(profileData);
          const nextId = fetchSelfProfile ? (id || 'self') : (id as string);
          setViewFullProfileId(nextId);
          setExpandedProfileId(null);
          if (fetchSelfProfile) {
            router.replace('/dashboard');
          } else {
            router.replace(`/dashboard?view=${encodeURIComponent(id as string)}`);
          }
        }
      } else {
        setError('Failed to load profile');
      }
    } catch (err: any) {
      console.error('Error loading profile inline:', err);
      setError(err?.message || 'Error loading profile');
    } finally {
      setIsLoading(false);
    }
  }, [buildAuthHeaders, buildRequest, permissions, router]);

  useEffect(() => {
    if (requestedViewId && requestedViewId !== viewFullProfileId) {
      openProfileInline(requestedViewId);
    }
  }, [requestedViewId, viewFullProfileId, openProfileInline]);

  useEffect(() => {
    if (!searchIdFromQuery) return;
    setSearchExpanded(true);
    setSearchId(searchIdFromQuery);
    searchById(searchIdFromQuery);

    const serialized = searchParams?.toString() || '';
    if (serialized.includes('searchId=')) {
      const params = new URLSearchParams(serialized);
      params.delete('searchId');
      const next = params.toString() ? `/dashboard?${params.toString()}` : '/dashboard';
      router.replace(next);
    }
  }, [searchIdFromQuery, searchParams, router, searchById]);

  const handleCloseFullProfile = () => {
    setViewFullProfileId(null);
    router.replace('/dashboard');
  };

  const printableCompleteValue = Number(fullProfileData?.complete);
  const isProfilePrintable =
    !Number.isNaN(printableCompleteValue) && (printableCompleteValue === 3 || printableCompleteValue === 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="p-6">

        {viewFullProfileId && fullProfileData ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ArrowBackButton
                  ariaLabel={t('profile.summary.back') || 'Back'}
                  onClick={handleCloseFullProfile}
                />
                <div>
                  <h2 className="text-2xl font-bold">
                    {fullProfileData.firstName} {fullProfileData.lastName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{t('profile.summary.title') || 'Profile Summary'}</p>
                </div>
              </div>
            </div>

            <ProfileView data={fullProfileData} includeId />

            {!!feedbackEntries.length && (
              <FeedbackHistoryPanel
                entries={feedbackEntries}
                title={t('dashboard.feedbackHistory.title') || 'Feedback history'}
                caption={
                  t('dashboard.feedbackHistory.caption') ||
                  'Review notes left by reviewers while your profile is incomplete.'
                }
                emptyStateLabel={t('dashboard.feedbackHistory.empty') || 'No feedback has been recorded yet.'}
                toggleAriaLabel={t('dashboard.feedbackHistory.toggle') || 'Toggle feedback history'}
                unknownDateLabel={t('dashboard.feedbackHistory.unknownDate') || 'Date unavailable'}
                panelId="self-feedback-history-panel"
                dateFormatter={(date) => feedbackDateFormatter.format(date)}
                defaultOpen
                enableCarousel
                maxItemsPerSlide={3}
                previousSlideLabel={t('navigation.previous') || 'Previous'}
                nextSlideLabel={t('navigation.next') || 'Next'}
              />
            )}

            <div className="flex justify-end gap-2 pt-6 border-t">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                aria-label={t('profile.summary.returnToTop') || 'Return to Top'}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7 7 7M12 3v18"
                  />
                </svg>
              </button>
              <button
                onClick={handlePrintPdf}
                disabled={isGeneratingPdf || !isProfilePrintable}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGeneratingPdf
                  ? t('profile.summary.preparingPdf') || 'Preparing PDF...'
                  : t('profile.summary.print') || 'Print Profile'}
              </button>
              
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                {error}
              </div>
            )}

            {permissions && permissions !== 'user' && (
              <div className="mb-4 p-4 bg-white rounded shadow-sm flex items-center gap-2">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Search profile by ID"
                  className="flex-1 px-3 py-2 border rounded"
                />
                <button
                  onClick={() => searchById(searchId)}
                  disabled={searchLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
                <button
                  onClick={() => {
                    setSearchId('');
                    setSearchResult(null);
                    setSearchError(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            )}

            {searchError && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                {searchError}
              </div>
            )}

            {searchResult && (
              <CollapsibleView
                className="mb-4"
                title={
                  composeFullName(searchResult.firstName, searchResult.lastName) ||
                  searchResult.email ||
                  t('profile.summary.notProvided') ||
                  'Profile'
                }
                subtitle={searchResult.email || undefined}
                isOpen={searchExpanded}
                onToggle={() => setSearchExpanded((s) => !s)}
              >
                <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">
                      {t('profile.summary.firstName') || 'First Name'}
                    </p>
                    <p className="text-gray-900 mt-1">{searchResult.firstName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">
                      {t('profile.summary.lastName') || 'Last Name'}
                    </p>
                    <p className="text-gray-900 mt-1">{searchResult.lastName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">
                      {t('profile.summary.email') || 'Email'}
                    </p>
                    <p className="text-gray-900 mt-1">{searchResult.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const targetId = searchResult._id || searchResult.id || null;
                      if (!targetId) {
                        openProfileInline(null);
                        return;
                      }
                      const params = new URLSearchParams({
                        profileId: targetId,
                        fromSearch: 'true',
                        searchId: targetId,
                      });
                      router.push(`/dashboard/identification/voir-tout/profile?${params.toString()}`);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {t('dashboard.viewFullProfile') || 'View Full Profile'}
                  </button>
                </div>
              </CollapsibleView>
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading profiles...</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No completed profiles yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {t('dashboard.completedProfiles')}
                </h2>

                {profiles.map((profile) => {
                  const statusValue = resolveProfileStatus(profile);
                  const statusLabel = getProfileStatusLabel(statusValue, t);
                  const profileKey = profile._id || profile.id || null;
                  const fullName =
                    composeFullName(profile.firstName, profile.lastName) ||
                    profile.email ||
                    t('profile.summary.notProvided') ||
                    'Profile';

                  return (
                    <CollapsibleView
                      key={profile._id || profile.id}
                      title={fullName}
                      subtitle={profile.email || undefined}
                      isOpen={expandedProfileId === (profile._id || profile.id)}
                      onToggle={() => {
                        setExpandedProfileId(expandedProfileId === profileKey ? null : profileKey);
                      }}
                    >
                      <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                        <div>
                          <p className="text-gray-600 font-medium">
                            {t('profile.summary.firstName') || 'First Name'}
                          </p>
                          <p className="text-gray-900 mt-1">{profile.firstName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">
                            {t('profile.summary.lastName') || 'Last Name'}
                          </p>
                          <p className="text-gray-900 mt-1">{profile.lastName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">
                            {t('profile.summary.email') || 'Email'}
                          </p>
                          <p className="text-gray-900 mt-1">{profile.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">
                            {t('profile.summary.dateOfBirth') || 'Date of Birth'}
                          </p>
                          <p className="text-gray-900 mt-1">{profile.dateOfBirth || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">
                            {t('profile.summary.gender') || 'Gender'}
                          </p>
                          <p className="text-gray-900 mt-1">{profile.gender || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">
                            {t('profile.summary.status') || 'Status'}
                          </p>
                          <p className="text-green-600 font-semibold mt-1">{statusLabel}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openProfileInline(profile._id || profile.id || null);
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          {t('dashboard.viewFullProfile') || 'View Full Profile'}
                        </button>
                      </div>
                    </CollapsibleView>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-6">Loading dashboard...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}
