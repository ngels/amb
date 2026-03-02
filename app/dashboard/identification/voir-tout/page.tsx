'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardNav } from '@/src/components/ui/DashboardNav';
import { useTranslation } from '@/src/i18n/useTranslation';
import { useAuth } from '@/src/hooks/useAuth';
import { resolveBackendUrl } from '@/src/services/httpClient';
import {
  coerceProfileStatus,
  getProfileStatusLabel,
  PROFILE_STATUS_OPTIONS,
  PROFILE_STATUS_RANKED_VALUES,
  ProfileStatusValue,
} from '@/src/constants/profileStatuses';

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

const PAGE_SIZE = 10;
type SortField = 'firstName' | 'lastName' | 'status';

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.862 4.487" />
  </svg>
);

const Spinner = () => (
  <svg
    className="w-4 h-4 animate-spin text-blue-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    ></path>
  </svg>
);

export default function VoirToutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  useAuth();
  const callBackend = useCallback((path: string, init?: RequestInit) =>
    fetch(resolveBackendUrl(path), {
      credentials: 'include',
      cache: 'no-store',
      ...init,
    }), []);
  const buildAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
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

  const [permissions, setPermissions] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | ProfileStatusValue>('all');

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
        const headers = buildAuthHeaders();

        const res = await callBackend('/auth/me', {
          method: 'GET',
          headers,
        });

        if (!res.ok) return;
        const body = await res.json();
        const raw = body?.data?.permissions ?? body?.permissions ?? null;
        const normalized = normalizePermissions(raw);
        if (normalized) {
          setPermissions(normalized);
          if (typeof window !== 'undefined') localStorage.setItem('userPermissions', normalized);
        }
      } catch (e) {}
    };

    fetchPermissions();
  }, [buildAuthHeaders, callBackend]);

  useEffect(() => {
    if (permissions === 'user') {
      router.replace('/dashboard');
    }
  }, [permissions, router]);

  useEffect(() => {
    if (!permissions || permissions === 'user') return;

    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = buildAuthHeaders();

        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          sortBy: sortField,
          sortOrder,
        });

        if (statusFilter !== 'all') {
          const completionIndex = PROFILE_STATUS_RANKED_VALUES.indexOf(statusFilter);
          if (completionIndex >= 0) {
            params.append('complete', String(completionIndex));
          }
        }

        const res = await callBackend(`/profile/filledBy/all?${params.toString()}`, {
          method: 'GET',
          headers,
        });

        if (!res.ok) {
          // setError('Failed to load profiles');
          setProfiles([]);
          return;
        }

        const body = await res.json();
        const rows = Array.isArray(body?.data) ? body.data : [];
        const pagination = body?.meta || {};
        setProfiles(rows);
        setTotalPages(pagination.totalPages || (rows.length ? 1 : 0));
        setTotal(pagination.total ?? rows.length ?? 0);
      } catch (err: any) {
        setError(err?.message || 'Error loading profiles');
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [buildAuthHeaders, callBackend, page, permissions, sortField, sortOrder, statusFilter]);

  const tableRows = useMemo(() => {
    if (!profiles?.length) return [];
    return profiles.map((profile) => ({
      id: profile._id || profile.id,
      ownerId: profile.ownerId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      complete: profile.complete,
      status: resolveProfileStatus(profile),
    }));
  }, [profiles]);

  const handleViewProfile = (profileId?: string) => {
    if (!profileId) return;
    router.push(`/dashboard/identification/voir-tout/profile?profileId=${encodeURIComponent(profileId)}`);
  };

  const handleEditProfile = async (profileId?: string) => {
    if (!profileId) return;
    setEditingRowId(profileId);
    setError(null);
    try {
      const headers = buildAuthHeaders();
      const res = await callBackend(`/profile/byId/${encodeURIComponent(profileId)}`, {
        method: 'GET',
        headers,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.status === 'fail') {
        const message = body?.data?.message || body?.message || 'Profile not found';
        throw new Error(message);
      }
      const profileData = body?.data || body;
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('editingProfile', JSON.stringify(profileData));
        } catch (storageErr) {
          console.error('Unable to cache profile for editing:', storageErr);
        }
      }
      router.push(`/dashboard/identification/commencer?profileId=${encodeURIComponent(profileId)}`);
    } catch (err: any) {
      console.error('Failed to load profile for editing:', err);
      setError(err?.data?.message || err?.message || 'Failed to load profile for editing.');
    } finally {
      setEditingRowId(null);
    }
  };

  const startItem = (page - 1) * PAGE_SIZE + (tableRows.length ? 1 : 0);
  const endItem = tableRows.length ? startItem + tableRows.length - 1 : 0;

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as 'all' | ProfileStatusValue;
    setStatusFilter(value);
    setPage(1);
  };

  const toggleSort = (field: SortField) => {
    setPage(1);
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return <span className="ml-1 text-gray-400">↕</span>;
    return (
      <span className="ml-1 text-blue-600">
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('identification.voirTout') || 'Voir tout'}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {t('identification.listIntro') || 'View all identifications.'}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            {tableRows.length ? `${startItem}-${endItem} / ${total}` : `${total} results`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-200 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
            <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
              {t('identification.filters.statusLabel') || 'Status filter'}
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">{t('identification.filters.statusAll') || 'All statuses'}</option>
              {PROFILE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey) || option.value}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort('firstName')}
                      className="inline-flex items-center font-semibold text-xs uppercase tracking-wide"
                    >
                      {t('profile.firstName') || 'First name'}
                      {sortIndicator('firstName')}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort('lastName')}
                      className="inline-flex items-center font-semibold text-xs uppercase tracking-wide"
                    >
                      {t('profile.lastName') || 'Last name'}
                      {sortIndicator('lastName')}
                    </button>
                  </th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort('status')}
                      className="inline-flex items-center font-semibold text-xs uppercase tracking-wide"
                    >
                      Status
                      {sortIndicator('status')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      Loading profiles...
                    </td>
                  </tr>
                ) : tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      No profiles to display.
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row) => (
                    <tr key={row.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {row.id || '--'}
                      </td>
                      <td className="px-4 py-3">{row.firstName || '--'}</td>
                      <td className="px-4 py-3">{row.lastName || '--'}</td>
                      <td className="px-4 py-3 text-gray-600">{row.email || '--'}</td>
                      <td className="px-4 py-3">
                        {row.status && (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClasses(
                              row.status,
                            )}`}
                          >
                            {getProfileStatusLabel(row.status, (key) => t(key) || key)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleViewProfile(row.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                          >
                            View Full Profile
                          </button>
                          <button
                            onClick={() => handleEditProfile(row.id)}
                            className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-40"
                            aria-label="Edit profile"
                            disabled={editingRowId === row.id}
                          >
                            {editingRowId === row.id ? <Spinner /> : <EditIcon />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
            <span>
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                disabled={page >= totalPages}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
