<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const editor = ref<any>(null)
const CkeditorComponent = ref<any>(null)
const ClassicEditor = ref<any>(null)

const isReady = ref(false)

onMounted(async () => {
  if (import.meta.client) {
    const { Ckeditor } = await import('@ckeditor/ckeditor5-vue')
    const ClassicEditorBuild = await import('@ckeditor/ckeditor5-build-classic')
    
    CkeditorComponent.value = Ckeditor
    ClassicEditor.value = ClassicEditorBuild.default
    
    isReady.value = true
  }
})

const editorConfig = {
  toolbar: [
    'heading', '|',
    'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
    'undo', 'redo'
  ]
}

const content = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  if (content.value !== newVal) {
    content.value = newVal
  }
})

const onInput = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="rich-editor-wrapper text-black">
    <component
      v-if="isReady && CkeditorComponent && ClassicEditor"
      :is="CkeditorComponent"
      :editor="ClassicEditor"
      v-model="content"
      :config="editorConfig"
      @update:modelValue="onInput"
    />
    <div v-else class="h-32 border border-gray-300 rounded-md flex items-center justify-center bg-gray-50 text-gray-500">
      Loading editor...
    </div>
  </div>
</template>

<style>
/* Adjust CKEditor height and tailwind resets */
.rich-editor-wrapper .ck-editor__editable {
  min-height: 200px;
}
.rich-editor-wrapper h2 {
  font-size: 1.5em;
  font-weight: bold;
}
.rich-editor-wrapper h3 {
  font-size: 1.17em;
  font-weight: bold;
}
.rich-editor-wrapper ul {
  list-style-type: disc;
  margin-left: 1.5em;
}
.rich-editor-wrapper ol {
  list-style-type: decimal;
  margin-left: 1.5em;
}
</style>
