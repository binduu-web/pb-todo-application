import { useState } from 'react';
import { Check, Copy, Database, RefreshCw } from 'lucide-react';

interface SupabaseSetupGuideProps {
  issueMessage: string;
  onRetry?: () => void;
}

const SCHEMA_SNIPPET = `CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 200),
  description TEXT DEFAULT '',
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to tasks"
  ON public.tasks FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow insert access to tasks"
  ON public.tasks FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(trim(title)) > 0 AND priority IN ('High', 'Medium', 'Low') AND status IN ('Pending', 'Completed'));

CREATE POLICY "Allow update access to tasks"
  ON public.tasks FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (char_length(trim(title)) > 0 AND priority IN ('High', 'Medium', 'Low') AND status IN ('Pending', 'Completed'));

CREATE POLICY "Allow delete access to tasks"
  ON public.tasks FOR DELETE TO anon, authenticated USING (true);`;

export function SupabaseSetupGuide({
  issueMessage,
  onRetry,
}: SupabaseSetupGuideProps) {
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SCHEMA_SNIPPET);
      setCopiedSql(true);
      window.setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      setCopiedSql(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600">
          <Database className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Connect Your Supabase Database
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {issueMessage}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-display text-sm font-semibold text-slate-900">
            1. Add Supabase Environment Variables
          </h3>
          <p className="text-sm text-slate-600">
            Copy <code className="font-mono text-xs text-slate-900">.env.example</code> to{' '}
            <code className="font-mono text-xs text-slate-900">.env</code> and set your
            Supabase Project URL and Anon/Publishable Key from{' '}
            <span className="font-medium text-slate-800">
              Project Settings → API
            </span>
            .
          </p>
          <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800">
{`VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-publishable-key"`}
          </pre>

          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>Retry Connection</span>
            </button>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              2. Run SQL Schema &amp; RLS Policies
            </h3>
            <button
              type="button"
              onClick={() => void handleCopySql()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 hover:bg-slate-50"
            >
              {copiedSql ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>
          <pre className="max-h-60 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800">
            {SCHEMA_SNIPPET}
          </pre>
        </div>
      </div>
    </section>
  );
}
