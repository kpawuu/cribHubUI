import DOMPurify from 'isomorphic-dompurify'

/**
 * Site page `body` may be legacy Markdown or HTML produced by the admin WYSIWYG.
 * HTML is detected when the trimmed value starts with `<`.
 */
export function useSitePageBody() {
  const { renderMarkdown } = useMarkdownIt()

  function isStoredHtml(body: string | undefined | null) {
    return /^\s*</.test(body || '')
  }

  /** Safe HTML for public `v-html` (sanitized when stored as HTML). */
  function toDisplayHtml(body: string | undefined | null) {
    const raw = body || ''
    if (!raw.trim()) return ''
    if (isStoredHtml(raw)) {
      return DOMPurify.sanitize(raw, {
        USE_PROFILES: { html: true }
      })
    }
    return renderMarkdown(raw)
  }

  /** HTML for TipTap: convert legacy Markdown once when opening the editor. */
  function toEditorHtml(body: string | undefined | null) {
    const raw = body || ''
    if (!raw.trim()) return ''
    if (isStoredHtml(raw)) return raw
    return renderMarkdown(raw)
  }

  /** True if body has visible text (ignores empty `<p></p>` from the editor). */
  function bodyHasTextContent(body: string | undefined | null) {
    const plain = (body || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return plain.length > 0
  }

  return { isStoredHtml, toDisplayHtml, toEditorHtml, bodyHasTextContent }
}
