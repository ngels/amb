import { helpFaqEntries } from '@/src/i18n/translations';
import { FaqSection } from './FaqSection';
import { ReportForm } from './ReportForm';

export default function HelpPage() {

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-5xl space-y-12 px-4">
        <section className="grid gap-8 rounded-xl bg-white p-8 shadow-sm md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Quick tutorial</p>
            <h1 className="text-3xl font-bold text-gray-900">Get started in three minutes</h1>
            <p className="text-base text-gray-600">
              Learn where to find key navigation items, how to submit identification documents, and tips for
              collaborating with your team. Replace the placeholder image with final artwork when it is ready.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/api/help/tutorial"
                download="amb-tutorial.pdf"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Download PDF
              </a>
            </div>
          </div>
          <div className="flex h-full items-center justify-center">
            <div className="flex h-56 w-full max-w-sm items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-500">
              Tutorial image placeholder
            </div>
          </div>
        </section>

        <FaqSection items={helpFaqEntries} />

        <section className="grid gap-8 rounded-xl bg-white p-8 shadow-sm md:grid-cols-[1.1fr,0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Need more help?</p>
            <h2 className="text-2xl font-bold text-gray-900">Report a bug or suggest an improvement</h2>
            <p className="mt-3 text-gray-600">
              Tell us what broke or what could be smoother. We read every submission and follow up by email if we need
              more detail.
            </p>
          </div>
          <ReportForm />
        </section>
      </div>
    </div>
  );
}
