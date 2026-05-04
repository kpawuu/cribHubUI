<template>
  <div class="bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 py-4">
      <!-- Header -->
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex gap-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-primary-200 bg-primary-50 text-primary-700"
            aria-hidden="true"
          >
            <UiHeroIcon name="document-text" size="md" />
          </div>
          <div>
            <p class="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-600">
              <UiHeroIcon name="shield-check" size="xs" class="text-primary-500" />
              Admin
            </p>
            <h1 class="text-xl font-bold text-gray-900">Site pages</h1>
            <p class="mt-1 max-w-2xl text-sm text-gray-600">
              Rich content for legal, blog, tools, and marketing pages. Markdown opens as HTML in the editor and saves as HTML.
            </p>
          </div>
        </div>
        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          @click="openCreate"
        >
          <UiHeroIcon name="plus" class="text-white" />
          New page
        </button>
      </div>

      <transition
        enter-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="editorOpen" class="mb-4 overflow-hidden rounded border border-gray-200 bg-white">
          <div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
            <h2 class="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span class="flex h-7 w-7 items-center justify-center rounded border border-primary-200 bg-white text-primary-600">
                <UiHeroIcon v-if="editingId" name="pencil-square" size="xs" />
                <UiHeroIcon v-else name="document-plus" size="xs" />
              </span>
              {{ editingId ? 'Edit page' : 'New page' }}
            </h2>
            <button
              type="button"
              class="rounded p-1.5 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
              aria-label="Close editor"
              @click="closeEditor"
            >
              <UiHeroIcon name="x-mark" size="md" />
            </button>
          </div>

          <div class="p-4">
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <UiHeroIcon name="hashtag" size="xs" class="text-gray-400" />
                  Slug
                </label>
                <input
                  v-model="form.slug"
                  :disabled="!!editingId"
                  type="text"
                  class="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm font-mono transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="e.g. privacy-policy"
                />
              </div>

              <div>
                <label class="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <UiHeroIcon name="folder" size="xs" class="text-gray-400" />
                  Section
                </label>
                <div class="relative">
                  <select
                    v-model="form.section"
                    class="w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option v-for="s in sections" :key="s" :value="s">{{ s }}</option>
                  </select>
                  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
                    <UiHeroIcon name="chevron-down" size="xs" />
                  </span>
                </div>
              </div>

              <div class="sm:col-span-2">
                <label class="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <UiHeroIcon name="bookmark" size="xs" class="text-gray-400" />
                  Title
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  class="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Page title"
                />
              </div>

              <div>
                <label class="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <UiHeroIcon name="chart-bar" size="xs" class="text-gray-400" />
                  Status
                </label>
                <div class="relative">
                  <select
                    v-model="form.status"
                    class="w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
                    <UiHeroIcon name="chevron-down" size="xs" />
                  </span>
                </div>
              </div>

              <div>
                <label class="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <UiHeroIcon name="magnifying-glass" size="xs" class="text-gray-400" />
                  Meta title <span class="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  v-model="form.metaTitle"
                  type="text"
                  class="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="SEO title"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <UiHeroIcon name="magnifying-glass" size="xs" class="text-gray-400" />
                  Meta description <span class="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  v-model="form.metaDescription"
                  type="text"
                  class="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="SEO description"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <UiHeroIcon name="document-text" size="xs" class="text-gray-400" />
                  Body
                </label>
                <ClientOnly>
                  <SitePageBodyEditor v-model="form.body" />
                  <template #fallback>
                    <div class="flex min-h-[200px] items-center justify-center rounded border border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500">
                      <span class="inline-flex items-center gap-2">
                        <UiHeroIcon name="arrow-path" class="animate-spin text-primary-600" size="md" />
                        Loading editor…
                      </span>
                    </div>
                  </template>
                </ClientOnly>
              </div>
            </div>

            <div
              v-if="formError"
              class="mt-3 flex gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              <UiHeroIcon name="exclamation-circle" class="mt-0.5 shrink-0 text-red-600" size="sm" />
              <span>{{ formError }}</span>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                :disabled="saving"
                @click="save"
              >
                <UiHeroIcon
                  v-if="saving"
                  name="arrow-path"
                  class="animate-spin text-white"
                />
                <UiHeroIcon v-else name="arrow-down-tray" class="text-white" />
                {{ saving ? 'Saving…' : 'Save' }}
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                @click="closeEditor"
              >
                <UiHeroIcon name="x-mark" size="xs" class="text-gray-500" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </transition>

      <div
        v-if="loadError"
        class="mb-4 flex gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        role="alert"
      >
        <UiHeroIcon name="exclamation-triangle" class="mt-0.5 shrink-0 text-red-600" size="sm" />
        <span>{{ loadError }}</span>
      </div>

      <div v-if="loading" class="space-y-2">
        <div v-for="n in 6" :key="n" class="h-12 animate-pulse rounded border border-gray-200 bg-white" />
      </div>

      <div v-else class="overflow-hidden rounded border border-gray-200 bg-white">
        <div class="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
          <UiHeroIcon name="table-cells" class="text-gray-500" size="sm" />
          <span class="text-xs font-semibold uppercase tracking-wide text-gray-700">All pages</span>
          <span class="ml-auto text-xs tabular-nums text-gray-500">{{ rows.length }} total</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <span class="inline-flex items-center gap-1.5">
                    <UiHeroIcon name="link" size="xs" class="text-gray-400" />
                    Slug
                  </span>
                </th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <span class="inline-flex items-center gap-1.5">
                    <UiHeroIcon name="document-text" size="xs" class="text-gray-400" />
                    Title
                  </span>
                </th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <span class="inline-flex items-center gap-1.5">
                    <UiHeroIcon name="folder" size="xs" class="text-gray-400" />
                    Section
                  </span>
                </th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <span class="inline-flex items-center gap-1.5">
                    <UiHeroIcon name="chart-bar" size="xs" class="text-gray-400" />
                    Status
                  </span>
                </th>
                <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <span class="inline-flex items-center justify-end gap-1.5">
                    <UiHeroIcon name="pencil" size="xs" class="text-gray-400" />
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr
                v-for="row in rows"
                :key="String(row._id)"
                class="transition-colors hover:bg-gray-50"
              >
                <td class="whitespace-nowrap px-3 py-2">
                  <span class="inline-flex items-center gap-1.5">
                    <UiHeroIcon name="hashtag" size="xs" class="text-gray-300" />
                    <code class="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs font-mono text-gray-800">{{ row.slug }}</code>
                  </span>
                </td>
                <td class="max-w-[12rem] truncate px-3 py-2 font-medium text-gray-900 sm:max-w-xs">{{ row.title }}</td>
                <td class="px-3 py-2">
                  <span class="inline-flex items-center gap-1.5 text-xs capitalize text-gray-700">
                    <UiHeroIcon :name="sectionIcon(row.section)" size="xs" class="text-gray-400" />
                    {{ row.section }}
                  </span>
                </td>
                <td class="px-3 py-2">
                  <span
                    class="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium"
                    :class="
                      row.status === 'published'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-amber-200 bg-amber-50 text-amber-800'
                    "
                  >
                    <UiHeroIcon
                      v-if="row.status === 'published'"
                      name="check-circle"
                      size="xs"
                      class="text-emerald-600"
                    />
                    <UiHeroIcon v-else name="clock" size="xs" class="text-amber-600" />
                    {{ row.status }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-3 py-2 text-right">
                  <button
                    type="button"
                    class="mr-1 inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                    @click="openEdit(row)"
                  >
                    <UiHeroIcon name="pencil" size="xs" class="text-gray-500" />
                    Edit
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
                    @click="confirmRemove(row)"
                  >
                    <UiHeroIcon name="trash" size="xs" class="text-red-500" />
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!rows.length" class="border-t border-gray-100 px-4 py-10 text-center">
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-300">
            <UiHeroIcon name="document-text" size="lg" />
          </div>
          <p class="text-sm font-semibold text-gray-900">No pages yet</p>
          <p class="mt-1 text-xs text-gray-500">Create a page with “New page”.</p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <transition
        enter-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="deleteTarget"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 p-4"
          @click.self="deleteTarget = null"
        >
          <div class="w-full max-w-md rounded border border-gray-200 bg-white">
            <div class="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
                <UiHeroIcon name="trash" size="sm" />
              </span>
              <h3 class="text-sm font-semibold text-gray-900">Delete page</h3>
            </div>
            <div class="flex gap-3 px-4 py-3">
              <UiHeroIcon name="exclamation-triangle" class="mt-0.5 shrink-0 text-amber-500" size="sm" />
              <p class="text-sm text-gray-700">
                Delete <strong class="font-semibold text-gray-900">{{ deleteTarget.slug }}</strong>? This cannot be undone.
              </p>
            </div>
            <div class="flex justify-end gap-2 border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                @click="deleteTarget = null"
              >
                <UiHeroIcon name="x-mark" size="xs" class="text-gray-500" />
                Cancel
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                :disabled="deleting"
                @click="doRemove"
              >
                <UiHeroIcon
                  v-if="deleting"
                  name="arrow-path"
                  class="animate-spin text-white"
                  size="sm"
                />
                <UiHeroIcon v-else name="trash" class="text-white" size="sm" />
                {{ deleting ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useSitePagesStore } from '@@/stores/sitePages'

definePageMeta({ middleware: ['auth', 'admin'], layout: 'account' })
useHead({ title: 'Site pages — Admin — CribHub' })

const sections = ['legal', 'marketing', 'blog', 'explore', 'tools', 'footer'] as const

type Row = {
  _id: string
  slug: string
  title: string
  body: string
  section: string
  status: string
  metaTitle?: string
  metaDescription?: string
}

const { toEditorHtml, bodyHasTextContent } = useSitePageBody()
const sitePages = useSitePagesStore()
const rows = computed(() => sitePages.list as Row[])
const bootstrapped = ref(false)
const loading = computed(() => !bootstrapped.value || sitePages.isLoading)
const editorOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')
const deleteTarget = ref<Row | null>(null)
const deleting = ref(false)

const form = reactive({
  slug: '',
  title: '',
  body: '',
  section: 'marketing',
  status: 'draft' as 'draft' | 'published',
  metaTitle: '',
  metaDescription: ''
})

const loadError = ref<string | null>(null)

type SectionIconName = 'scale' | 'megaphone' | 'newspaper' | 'map' | 'cog' | 'rectangle-stack' | 'folder'

function sectionIcon(section: string): SectionIconName {
  const map: Record<string, SectionIconName> = {
    legal: 'scale',
    marketing: 'megaphone',
    blog: 'newspaper',
    explore: 'map',
    tools: 'cog',
    footer: 'rectangle-stack'
  }
  return map[section] ?? 'folder'
}

async function load() {
  loadError.value = null
  try {
    await sitePages.fetchList({ $sort: { updatedAt: -1 } })
  } catch (e: any) {
    loadError.value = e?.message || 'Could not load site pages. Check your connection and admin access.'
  } finally {
    bootstrapped.value = true
  }
}

function resetForm() {
  form.slug = ''
  form.title = ''
  form.body = '<p></p>'
  form.section = 'marketing'
  form.status = 'draft'
  form.metaTitle = ''
  form.metaDescription = ''
  formError.value = ''
}

function openCreate() {
  editingId.value = null
  resetForm()
  editorOpen.value = true
}

function openEdit(row: Row) {
  editingId.value = String(row._id)
  form.slug = row.slug
  form.title = row.title
  form.body = toEditorHtml(row.body)
  form.section = row.section
  form.status = (row.status as 'draft' | 'published') || 'draft'
  form.metaTitle = row.metaTitle || ''
  form.metaDescription = row.metaDescription || ''
  formError.value = ''
  editorOpen.value = true
}

function closeEditor() {
  editorOpen.value = false
  editingId.value = null
  resetForm()
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

async function save() {
  formError.value = ''
  if (!editingId.value) {
    if (!form.slug.trim() || !slugPattern.test(form.slug.trim())) {
      formError.value = 'Invalid slug. Use lowercase letters, numbers, and hyphens only.'
      return
    }
  }
  if (!form.title.trim() || !bodyHasTextContent(form.body)) {
    formError.value = 'Title and body are required.'
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await sitePages.patchPage(editingId.value, {
        title: form.title.trim(),
        body: form.body,
        section: form.section,
        status: form.status,
        metaTitle: form.metaTitle.trim() || undefined,
        metaDescription: form.metaDescription.trim() || undefined
      })
    } else {
      await sitePages.createPage({
        slug: form.slug.trim(),
        title: form.title.trim(),
        body: form.body,
        section: form.section,
        status: form.status,
        metaTitle: form.metaTitle.trim() || undefined,
        metaDescription: form.metaDescription.trim() || undefined
      })
    }
    closeEditor()
  } catch (e: any) {
    formError.value = e?.message || 'Save failed'
  } finally {
    saving.value = false
  }
}

function confirmRemove(row: Row) {
  deleteTarget.value = row
}

async function doRemove() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await sitePages.removePage(String(deleteTarget.value._id))
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>
