import MarkdownIt from 'markdown-it'

let md: MarkdownIt | null = null

export function useMarkdownIt() {
  if (!md) {
    md = new MarkdownIt({
      html: false,
      linkify: true,
      breaks: true
    })
  }
  return {
    renderMarkdown(src: string) {
      return md!.render(src || '')
    }
  }
}
