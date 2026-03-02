'use client';

import { FormEvent, useState } from 'react';

const categories = [
  { value: 'bug', label: 'Bug' },
  { value: 'suggestion', label: 'Suggestion' },
];

export function ReportForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback('');
    setStatus('submitting');

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: (formData.get('name') as string) || '',
      email: (formData.get('email') as string) || '',
      category: (formData.get('category') as string) || 'bug',
      summary: (formData.get('summary') as string) || '',
      details: (formData.get('details') as string) || '',
    };

    if (!payload.email || !payload.summary || !payload.details) {
      setStatus('error');
      setFeedback('Please fill out the required fields before submitting.');
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    setStatus('success');
    setFeedback('Thanks for the report! Our team will review it shortly.');
    event.currentTarget.reset();
  };

  const isSubmitting = status === 'submitting';

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name (optional)
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Ada Lovelace"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Contact email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="category"
          name="category"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {categories.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
          Short summary
        </label>
        <input
          id="summary"
          name="summary"
          type="text"
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Describe the issue in one line"
        />
      </div>

      <div>
        <label htmlFor="details" className="block text-sm font-medium text-gray-700">
          Details
        </label>
        <textarea
          id="details"
          name="details"
          required
          rows={5}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Steps to reproduce or the improvement you have in mind"
        />
      </div>

      {feedback && (
        <p
          className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}
          role={status === 'success' ? 'status' : 'alert'}
        >
          {feedback}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Sending…' : 'Send report'}
      </button>
    </form>
  );
}
