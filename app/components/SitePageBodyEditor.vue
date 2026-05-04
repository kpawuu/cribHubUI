<template>
  <div class="overflow-hidden rounded border border-gray-200 bg-white">
    <div v-if="editor" class="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-1.5 py-1">
      <span class="mr-1 hidden text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:inline">Format</span>
      <button
        type="button"
        class="rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-gray-900"
        :class="{ 'bg-white text-primary-700 ring-1 ring-primary-300': editor.isActive('bold') }"
        title="Bold"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <i class="las la-bold text-lg leading-none"></i>
      </button>
      <button
        type="button"
        class="rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-gray-900"
        :class="{ 'bg-white text-primary-700 ring-1 ring-primary-300': editor.isActive('italic') }"
        title="Italic"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <i class="las la-italic text-lg leading-none"></i>
      </button>
      <span class="mx-1 h-5 w-px bg-gray-200" aria-hidden="true" />
      <button
        type="button"
        class="rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-gray-900"
        :class="{ 'bg-white text-primary-700 ring-1 ring-primary-300': editor.isActive('heading', { level: 2 }) }"
        title="Heading 2"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <span class="text-xs font-bold">H2</span>
      </button>
      <button
        type="button"
        class="rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-gray-900"
        :class="{ 'bg-white text-primary-700 ring-1 ring-primary-300': editor.isActive('heading', { level: 3 }) }"
        title="Heading 3"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        <span class="text-xs font-bold">H3</span>
      </button>
      <span class="mx-1 h-5 w-px bg-gray-200" aria-hidden="true" />
      <button
        type="button"
        class="rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-gray-900"
        :class="{ 'bg-white text-primary-700 ring-1 ring-primary-300': editor.isActive('bulletList') }"
        title="Bullet list"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <i class="las la-list-ul text-lg leading-none"></i>
      </button>
      <button
        type="button"
        class="rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-gray-900"
        :class="{ 'bg-white text-primary-700 ring-1 ring-primary-300': editor.isActive('orderedList') }"
        title="Numbered list"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <i class="las la-list-ol text-lg leading-none"></i>
      </button>
      <button
        type="button"
        class="rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-gray-900"
        :class="{ 'bg-white text-primary-700 ring-1 ring-primary-300': editor.isActive('blockquote') }"
        title="Quote"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        <i class="las la-quote-right text-lg leading-none"></i>
      </button>
      <span class="mx-1 h-5 w-px bg-gray-200" aria-hidden="true" />
      <button
        type="button"
        class="rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-gray-900"
        :class="{ 'bg-white text-primary-700 ring-1 ring-primary-300': editor.isActive('link') }"
        title="Link"
        @click="setLink"
      >
        <i class="las la-link text-lg leading-none"></i>
      </button>
      <span class="mx-1 h-5 w-px bg-gray-200" aria-hidden="true" />
      <button
        type="button"
        class="rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-gray-900"
        title="Undo"
        @click="editor.chain().focus().undo().run()"
      >
        <i class="las la-undo text-lg leading-none"></i>
      </button>
      <button
        type="button"
        class="rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-gray-900"
        title="Redo"
        @click="editor.chain().focus().redo().run()"
      >
        <i class="las la-redo text-lg leading-none"></i>
      </button>
    </div>
    <editor-content v-if="editor" :editor="editor" class="site-page-body-editor" />
  </div>
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  immediatelyRender: false,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      link: false
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary-600 underline font-medium'
      }
    }),
    Placeholder.configure({
      placeholder: 'Write page content…'
    })
  ],
  content: props.modelValue?.trim() ? props.modelValue : '<p></p>',
  editorProps: {
    attributes: {
      class:
        'prose prose-gray max-w-none focus:outline-none min-h-[280px] px-4 py-3 text-[15px] leading-relaxed text-gray-800'
    }
  },
  onUpdate: ({ editor: ed }) => {
    emit('update:modelValue', ed.getHTML())
  }
})

watch(
  () => props.modelValue,
  (html) => {
    const ed = editor.value
    if (!ed || ed.isDestroyed) return
    const next = html?.trim() ? html : '<p></p>'
    const cur = ed.getHTML()
    if (next === cur) return
    ed.commands.setContent(next, { emitUpdate: false })
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function setLink() {
  const ed = editor.value
  if (!ed) return
  const prev = ed.getAttributes('link').href
  const url = typeof window !== 'undefined' ? window.prompt('Link URL', prev || 'https://') : null
  if (url === null) return
  if (url === '') {
    ed.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  ed.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}
</script>

<style scoped>
.site-page-body-editor :deep(.ProseMirror) {
  min-height: 280px;
  outline: none;
}

.site-page-body-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  color: #9ca3af;
}
</style>
