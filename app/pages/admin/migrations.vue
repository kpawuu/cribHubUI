<template>
  <div class="mx-auto w-full max-w-5xl px-3 py-4 lg:px-6 lg:py-6">
    <!-- Header -->
    <div class="mb-5">
      <p class="text-[10px] font-bold uppercase tracking-widest text-primary-600">Admin · Maintenance</p>
      <h1 class="mt-0.5 text-xl font-bold text-gray-900 lg:text-2xl">Data migrations</h1>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        Run one-off, idempotent maintenance scripts against the production database. Each migration
        reports what it would change so you can preview before committing.
      </p>
    </div>

    <!-- Backfill acceptedTerms card -->
    <section class="rounded border border-gray-100 bg-white p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-base font-semibold text-gray-900">
            <i class="las la-history mr-1 text-primary-600"></i>
            Backfill <code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">acceptedTerms</code> from
            <code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">commissionPercent</code>
          </h2>
          <p class="mt-1 max-w-2xl text-sm text-gray-600">
            For every <strong>agent</strong> and <strong>property-manager</strong> assignment that has
            a legacy <code>commissionPercent</code> but no structured <code>acceptedTerms</code>,
            synthesise:
          </p>
          <pre class="mt-2 overflow-x-auto rounded bg-gray-900 px-3 py-2 text-[11px] leading-relaxed text-emerald-200">acceptedTerms = { rent: { type: 'percent', value: &lt;commissionPercent&gt; } }</pre>
          <ul class="mt-3 list-inside list-disc space-y-1 text-xs text-gray-500">
            <li>Idempotent: rows that already have <code>acceptedTerms</code> are skipped.</li>
            <li>Records without a numeric <code>commissionPercent</code> are skipped.</li>
            <li>Use <strong>Preview</strong> first to verify counts before committing.</li>
          </ul>
        </div>
        <div class="flex flex-col items-end gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            :disabled="isRunning"
            @click="runMigration(true)"
          >
            <i class="las la-eye"></i> Preview (dry-run)
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
            :disabled="isRunning"
            @click="confirmAndRun()"
          >
            <span v-if="isRunning"><i class="las la-circle-notch la-spin mr-1"></i> Running…</span>
            <span v-else><i class="las la-bolt mr-1"></i> Run migration</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Result panel -->
    <section
      v-if="report || error"
      class="mt-5 rounded border bg-white p-5"
      :class="error ? 'border-red-200' : 'border-emerald-200'"
    >
      <h3 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wide" :class="error ? 'text-red-700' : 'text-emerald-700'">
        <i :class="error ? 'las la-exclamation-triangle' : 'las la-check-circle'"></i>
        {{ error ? 'Migration failed' : (report?.dryRun ? 'Preview complete' : 'Migration complete') }}
      </h3>

      <p v-if="error" class="mt-2 text-sm text-red-700">{{ error }}</p>

      <template v-else-if="report">
        <p class="mt-2 text-sm text-gray-600">
          <span v-if="report.dryRun">
            Preview only — no records were written. Click <strong>Run migration</strong> to apply changes.
          </span>
          <span v-else>
            Updated <strong>{{ report.totalUpdated }}</strong> assignment record{{ report.totalUpdated === 1 ? '' : 's' }} across agents and property managers.
          </span>
        </p>

        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <div class="rounded border border-gray-100 bg-gray-50 p-3 text-sm">
            <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500">Agent assignments</p>
            <dl class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <dt class="text-gray-500">Scanned</dt><dd class="text-right font-semibold text-gray-900">{{ report.agentAssignments.scanned }}</dd>
              <dt class="text-gray-500">Missing acceptedTerms</dt><dd class="text-right font-semibold text-gray-900">{{ report.agentAssignments.missingTerms }}</dd>
              <dt class="text-gray-500">With commission %</dt><dd class="text-right font-semibold text-gray-900">{{ report.agentAssignments.candidatesWithCommission }}</dd>
              <dt class="text-gray-500">{{ report.dryRun ? 'Would update' : 'Updated' }}</dt><dd class="text-right font-bold text-emerald-700">{{ report.agentAssignments.updated }}</dd>
              <dt class="text-gray-500">Skipped (no commission)</dt><dd class="text-right font-semibold text-amber-700">{{ report.agentAssignments.skippedNoCommission }}</dd>
            </dl>
          </div>
          <div class="rounded border border-gray-100 bg-gray-50 p-3 text-sm">
            <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500">PM assignments</p>
            <dl class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <dt class="text-gray-500">Scanned</dt><dd class="text-right font-semibold text-gray-900">{{ report.pmAssignments.scanned }}</dd>
              <dt class="text-gray-500">Missing acceptedTerms</dt><dd class="text-right font-semibold text-gray-900">{{ report.pmAssignments.missingTerms }}</dd>
              <dt class="text-gray-500">With commission %</dt><dd class="text-right font-semibold text-gray-900">{{ report.pmAssignments.candidatesWithCommission }}</dd>
              <dt class="text-gray-500">{{ report.dryRun ? 'Would update' : 'Updated' }}</dt><dd class="text-right font-bold text-emerald-700">{{ report.pmAssignments.updated }}</dd>
              <dt class="text-gray-500">Skipped (no commission)</dt><dd class="text-right font-semibold text-amber-700">{{ report.pmAssignments.skippedNoCommission }}</dd>
            </dl>
          </div>
        </div>

        <div v-if="report.errors?.length" class="mt-4 rounded border border-red-200 bg-red-50 p-3">
          <p class="text-xs font-bold uppercase tracking-wide text-red-700">{{ report.errors.length }} error{{ report.errors.length === 1 ? '' : 's' }}</p>
          <ul class="mt-2 space-y-1 text-xs text-red-700">
            <li v-for="(e, i) in report.errors" :key="i" class="font-mono">
              [{{ e.collection }}] {{ e.id }} — {{ e.message }}
            </li>
          </ul>
        </div>

        <p class="mt-4 text-[11px] text-gray-400">
          Started {{ formatDate(report.startedAt) }} • Finished {{ formatDate(report.finishedAt) }}
        </p>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'account', middleware: ['auth', 'admin'] })
useHead({ title: 'Data migrations' })

const feathers = useNuxtApp().$feathers as any

type BackfillReport = {
  action: 'backfill-accepted-terms'
  dryRun: boolean
  agentAssignments: {
    scanned: number
    missingTerms: number
    candidatesWithCommission: number
    updated: number
    skippedNoCommission: number
  }
  pmAssignments: {
    scanned: number
    missingTerms: number
    candidatesWithCommission: number
    updated: number
    skippedNoCommission: number
  }
  totalUpdated: number
  startedAt: string
  finishedAt: string
  errors: Array<{ collection: string; id: string; message: string }>
}

const isRunning = ref(false)
const report = ref<BackfillReport | null>(null)
const error = ref<string | null>(null)

function formatDate(iso?: string): string {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
  catch { return iso }
}

async function runMigration(dryRun: boolean) {
  isRunning.value = true
  error.value = null
  try {
    const res = await feathers.service('admin-migrations').create({
      action: 'backfill-accepted-terms',
      dryRun
    })
    report.value = res as BackfillReport
  } catch (e: any) {
    error.value = e?.message || 'Migration failed.'
    report.value = null
  } finally {
    isRunning.value = false
  }
}

async function confirmAndRun() {
  if (!confirm('This will write changes to the live database. Are you sure?')) return
  await runMigration(false)
}
</script>
