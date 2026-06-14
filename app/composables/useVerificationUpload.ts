/**
 * Shared verification-document upload logic.
 *
 * Used by both the dashboard banner (`UiRoleApplicationStatus.vue`) and the
 * dedicated `/account/role-requests` page so the upload pipeline,
 * replace-existing semantics, and error handling stay in one place.
 *
 * Pipeline per file:
 *   1. POST to `/file-upload` (multipart) — uploads to Cloudinary and returns
 *      a record containing the persisted URL. The file row is attached to the
 *      role-request via `entityType=role-requests` + `entityId=<rr._id>`.
 *   2. If a `verification-documents` row of the same `documentType` already
 *      exists for this role-request, remove it (so the new upload replaces).
 *   3. Create a fresh `verification-documents` row pointing at the Cloudinary
 *      URL with `roleRequestId`, `documentType`, `documentUrl`.
 *
 * The parent `role-request.substage` is re-derived server-side by the
 * `verification-documents` after-hook, and `useRoleApplications` re-fetches
 * automatically via its realtime listener — so callers do NOT need to
 * manually refresh anything after this completes.
 */

import { useAuthStore } from '@@/stores/auth'

export type ExistingDocLookup = {
  documentType: string
  _id: string
}

export type UploadResult = {
  ok: boolean
  errorMessage?: string
  cloudinaryUrl?: string
}

export function useVerificationUpload() {
  const config = useRuntimeConfig()

  /**
   * Upload one file as a verification-document of a given type.
   *
   * @param roleRequestId  The `role-requests` document id this file belongs to.
   * @param documentType   One of REQUIRED_DOCUMENT_TYPES keys (e.g. `national_id`).
   * @param file           The browser File object.
   * @param existing       Optional existing doc of the same type to replace.
   */
  async function uploadOne(
    roleRequestId: string,
    documentType: string,
    file: File,
    existing?: ExistingDocLookup | null
  ): Promise<UploadResult> {
    let token = ''
    try {
      token = useAuthStore().accessToken || ''
    } catch {
      /* Pinia store may not yet be installed in some SSR edge-cases */
    }
    if (!token && typeof localStorage !== 'undefined') {
      token = localStorage.getItem('accessToken') || ''
    }

    try {
      // Step 1 — upload through the file-upload pipeline so the file is
      // attached to the role-request itself (visible to admins inside the
      // request expandable panel).
      const form = new FormData()
      form.append('file', file, file.name)
      form.append('entityType', 'role-requests')
      form.append('entityId', roleRequestId)
      form.append('purpose', 'verification')
      form.append('tags', documentType)

      const url = `${config.public.apiBaseUrl}/file-upload`
      const res = await fetch(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form
      } as RequestInit)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        return {
          ok: false,
          errorMessage: body?.error || body?.message || `Upload failed (${res.status})`
        }
      }
      const uploaded: any = await res.json()
      const cloudUrl: string =
        uploaded?.cloudinary?.secure_url ||
        uploaded?.record?.fileUrl ||
        uploaded?.url ||
        ''
      if (!cloudUrl) {
        return { ok: false, errorMessage: 'Upload succeeded but no URL was returned.' }
      }

      // Step 2 — replace any prior doc of the same type so each
      // (roleRequestId, documentType) pair stays unique.
      const feathers = useNuxtApp().$feathers as any
      if (existing?._id) {
        try {
          await feathers.service('verification-documents').remove(existing._id)
        } catch {
          // Best-effort; an orphan doc is still visible to admin moderation.
        }
      }

      // Step 3 — register the verification-document row. This triggers the
      // server's after-hook which re-derives the role-request substage and
      // moves the user from "Docs required" to "Submitted/Reviewing".
      await feathers.service('verification-documents').create({
        roleRequestId,
        documentType,
        documentUrl: cloudUrl
      })

      return { ok: true, cloudinaryUrl: cloudUrl }
    } catch (err: any) {
      return { ok: false, errorMessage: err?.message || 'Upload failed.' }
    }
  }

  return { uploadOne }
}
