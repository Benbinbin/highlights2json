<script setup lang="ts">
import { saveAs } from 'file-saver';
import JSZip from '@progress/jszip-esm';

import { getParseResultFromKindle } from './composables/kindleHTML'
import { getParseResultFromXmnote } from './composables/xmnoteMarkdown'

/**
 *
 * setting favicon
 */
useHead({
  link: [{
    rel: 'icon',
    type: 'image/png',
    href: '/images/favicon.ico'
  }]
})

/**
 *
 * input file
 *
 */
// input source:
// * kindle
// * xmnote is 纸间书摘
const fileInput = ref(null)
const inputSources = {
  kindle: {
    name: 'Kindle',
    file: '.html'
  },
  xmnote: {
    name: '纸间书摘',
    file: '.md'
  }
}

const currentInputSource = ref('kindle')

/**
 *
 * get input file(s)
 *
 */
const isDropping = ref(false)

let filesList = []

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function (e) {
      filesList.push({
        name: file.name,
        data: e.target.result,
      });
      resolve('read');
    }
  })
}

/**
 *
 * parse to json
 *
 */
const output = ref(null)
const result = ref([])

const parse = () => {
  filesList.forEach(item => {

    if(currentInputSource.value === 'kindle') {
      const domParser = new DOMParser();
      const dom = domParser.parseFromString(item.data, 'text/html');
      // validate: whether the given HTML is a valid Kindle highlights export
      const highlightsNode = dom.querySelectorAll(".noteText");
      if (highlightsNode.length) {
        const { metadata, highlights } = getParseResultFromKindle(dom)
        result.value.push({
          name: item.name,
          metadata: metadata,
          highlights: highlights,
        })
      } else {
        console.log(`cannot get highlights from ${item.name}.`)
      }
    } else if(currentInputSource.value === 'xmnote') {
      const { metadata, highlights } = getParseResultFromXmnote(item.data)
      result.value.push({
        name: item.name,
        metadata: metadata,
        highlights: highlights,
      })
    }

  });
}

/**
 *
 * listen input change event
 *
 */
const dropFilesTypeWarning = ref(false)
const dropFilesNum = ref(0)
const rightTypeFilesNum = ref(0)

const inputFile = async (event) => {
  if (!event.target.files) return;

  dropFilesNum.value = event.target.files.length

  // regex check the file type
  const fileTypeRegex = new RegExp(`${inputSources[currentInputSource.value].file}$`)

  for (let i = 0; i < event.target.files.length; i++) {
    let file = event.target.files[i];

    if (fileTypeRegex.test(file.name)) {
      rightTypeFilesNum.value++
      await readFile(file);
    }
  }

  if (rightTypeFilesNum.value > 0 && output.value) {
    output.value.scrollIntoView({ block: 'center' })
  }

  if (rightTypeFilesNum.value < dropFilesNum.value) {
    dropFilesTypeWarning.value = true
  } else {
    rightTypeFilesNum.value = 0
    dropFilesNum.value = 0
  }

  parse();
  filesList = []

  if (fileInput.value) {
    fileInput.value.value = null
  }
}

let timer = null
watch(dropFilesTypeWarning, () => {
  if(!dropFilesTypeWarning.value) return

  if(timer) {
    clearTimeout(timer)
    timer = null
  }

  timer = setTimeout(() => {
    dropFilesTypeWarning.value = false

    rightTypeFilesNum.value = 0
    dropFilesNum.value = 0

    clearTimeout(timer)
    timer = null
  }, 3000)
})

/**
 *
 * save file(s)
 *
 */
const saveItem = (index) => {
  const data = result.value[index];
  const fileName = result.value[index].metadata.title;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, `${fileName}.json`);
}

const saveAll = () => {
  const zip = new JSZip();

  result.value.forEach(item => {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: 'application/json' });

    const fileName = item.metadata.title;

    zip.file(`${fileName}.json`, blob)
  })

  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, "output.zip");
  });
}

/**
 *
 * clear file(s)
 *
 */
const clearItem = (index) => {
  result.value.splice(index, 1)
}

const clearAll = () => {
  result.value = []
}
</script>

<template>
  <div class="container mx-auto my-8 p-4">
    <Title>Highlights2JSON</Title>
    <h1 class="text-center text-2xl sm:text-5xl font-bold">
      <a href="https://github.com/Benbinbin/highlights2json" target="_blank" class="flex justify-center items-center gap-2">
        <span class="text-yellow-400">Highlights</span>
        <img src="./public/images/logo.svg" class="w-6 sm:w-12 h-6 sm:h-12" alt="logo" />
        <span class="text-green-500">JSON</span>
      </a>
    </h1>
    <div class="my-4 flex justify-center items-center text-gray-500">
      <p class="text-xs sm:text-base font-light italic">convert book highlights to JSON</p>
    </div>

    <!-- input -->
    <div class="p-6">
      <h2 class="text-center text-xl sm:text-2xl font-bold text-gray-600">Input</h2>
      <hr class="w-1/5 mx-auto my-4 bg-gray-100">
      <div class="sources-list-container my-8 flex items-center overflow-x-auto">
        <div class="grow flex sm:flex-wrap justify-center items-center gap-4 focus:outline-none">
          <button v-for="(item, key) in inputSources" :key="key" class="source-btn"
            :class="currentInputSource === key ? 'text-white bg-blue-500 hover:bg-blue-400' : 'text-blue-500 hover:bg-blue-50'"
            @click="currentInputSource = key">{{ item.name }}</button>
        </div>
      </div>
      <div
        class="input-container sm:mx-8 h-[30vh] sm:h-[50vh] flex justify-center items-center relative text-sm sm:text-xl text-gray-400 bg-gray-50 hover:bg-gray-100 border-2 border-dashed rounded-lg transition-colors duration-300"
        :class="{ dropping: isDropping }">

        <Transition enter-from-class="opacity-0" enter-active-class="transition-opacity duration-300"
          enter-to-class="opacity-100" leave-from-class="opacity-100"
          leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0" mode="out-in">
          <div v-if="dropFilesTypeWarning" class="space-y-2">
            <p class="text-center"><span class="text-red-500">{{ dropFilesNum - rightTypeFilesNum
                }}</span>/{{dropFilesNum}} file(s)
              extension is <span class="text-red-500 font-bold">wrong</span> <span
                class="cry-animate inline-block">😭</span></p>
            <p class="text-center">please input <span
                class="inline-block p-2 text-sm font-mono text-white bg-yellow-400 rounded animate-bounce">*{{
                inputSources[currentInputSource]?.file }}</span> files</p>
          </div>

          <div v-else class="space-y-2">
            <p class="text-center">Click to Select OR Drop</p>
            <p class="text-center"><span class="p-2 text-sm font-mono text-white bg-yellow-400 rounded">*{{
                inputSources[currentInputSource]?.file }}</span> Files Here</p>
          </div>
        </Transition>

        <input ref="fileInput" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" type="file" multiple
          :accept="inputSources[currentInputSource]?.file" @change="inputFile" @dragover="isDropping = true"
          @drop="isDropping = false" @dragleave="isDropping = false">
      </div>
    </div>


    <!-- result -->
    <div class="py-6">
      <h2 ref="output" class="text-center text-xl sm:text-2xl font-bold text-gray-600">Output</h2>
      <hr class="w-1/5 mx-auto my-4 bg-gray-100">
      <div v-show="result.length > 1" class="flex justify-center items-center gap-4">
        <button
          class="px-4 py-2 flex justify-center items-center gap-1 text-white bg-red-500 shadow-md shadow-transparent hover:shadow-red-500/50 transition-shadow duration-300 rounded-md"
          @click="clearAll">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6q-.425 0-.713-.287Q4 5.425 4 5t.287-.713Q4.575 4 5 4h4q0-.425.288-.713Q9.575 3 10 3h4q.425 0 .713.287Q15 3.575 15 4h4q.425 0 .712.287Q20 4.575 20 5t-.288.713Q19.425 6 19 6v13q0 .825-.587 1.413Q17.825 21 17 21ZM7 6v13h10V6Zm2 10q0 .425.288.712Q9.575 17 10 17t.713-.288Q11 16.425 11 16V9q0-.425-.287-.713Q10.425 8 10 8t-.712.287Q9 8.575 9 9Zm4 0q0 .425.288.712q.287.288.712.288t.713-.288Q15 16.425 15 16V9q0-.425-.287-.713Q14.425 8 14 8t-.712.287Q13 8.575 13 9ZM7 6v13V6Z" />
          </svg>
          <span class="text-xs">Clear All</span>
        </button>
        <button
          class="px-4 py-2 flex justify-center items-center gap-1 text-white bg-green-500 shadow-md shadow-transparent hover:shadow-green-500/50 transition-shadow duration-300 rounded-md"
          @click="saveAll">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 15.575q-.2 0-.375-.063q-.175-.062-.325-.212l-3.6-3.6q-.275-.275-.275-.7q0-.425.275-.7q.275-.275.712-.288q.438-.012.713.263L11 12.15V5q0-.425.288-.713Q11.575 4 12 4t.713.287Q13 4.575 13 5v7.15l1.875-1.875q.275-.275.713-.263q.437.013.712.288q.275.275.275.7q0 .425-.275.7l-3.6 3.6q-.15.15-.325.212q-.175.063-.375.063ZM6 20q-.825 0-1.412-.587Q4 18.825 4 18v-2q0-.425.287-.713Q4.575 15 5 15t.713.287Q6 15.575 6 16v2h12v-2q0-.425.288-.713Q18.575 15 19 15t.712.287Q20 15.575 20 16v2q0 .825-.587 1.413Q18.825 20 18 20Z" />
          </svg>
          <span class="text-xs">Download All</span>
        </button>
      </div>


      <ul class="max-w-prose mx-auto py-6 divide-y-2">
        <li v-for="(item, index) of result" :key="item.name" class="flex justify-between items-center gap-2 py-4">
          <div class="flex items-center gap-2">
            <button
              class="shrink-0 p-2 text-white bg-red-500 shadow-md shadow-transparent hover:shadow-red-500/50 transition-shadow duration-300 rounded-md"
              @click="clearItem(index)">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6q-.425 0-.713-.287Q4 5.425 4 5t.287-.713Q4.575 4 5 4h4q0-.425.288-.713Q9.575 3 10 3h4q.425 0 .713.287Q15 3.575 15 4h4q.425 0 .712.287Q20 4.575 20 5t-.288.713Q19.425 6 19 6v13q0 .825-.587 1.413Q17.825 21 17 21ZM7 6v13h10V6Zm2 10q0 .425.288.712Q9.575 17 10 17t.713-.288Q11 16.425 11 16V9q0-.425-.287-.713Q10.425 8 10 8t-.712.287Q9 8.575 9 9Zm4 0q0 .425.288.712q.287.288.712.288t.713-.288Q15 16.425 15 16V9q0-.425-.287-.713Q14.425 8 14 8t-.712.287Q13 8.575 13 9ZM7 6v13V6Z" />
              </svg>
            </button>
            <span class="px-2 py-1 text-sm font-mono bg-gray-100 border rounded">{{ item.metadata.title }}.json</span>

          </div>

          <button @click="saveItem(index)"
            class="shrink-0 px-2 sm:px-4 py-2 flex justify-center items-center gap-1 text-white bg-green-500 shadow-md shadow-transparent hover:shadow-green-500/50 transition-shadow duration-300 rounded-md">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 15.575q-.2 0-.375-.063q-.175-.062-.325-.212l-3.6-3.6q-.275-.275-.275-.7q0-.425.275-.7q.275-.275.712-.288q.438-.012.713.263L11 12.15V5q0-.425.288-.713Q11.575 4 12 4t.713.287Q13 4.575 13 5v7.15l1.875-1.875q.275-.275.713-.263q.437.013.712.288q.275.275.275.7q0 .425-.275.7l-3.6 3.6q-.15.15-.325.212q-.175.063-.375.063ZM6 20q-.825 0-1.412-.587Q4 18.825 4 18v-2q0-.425.287-.713Q4.575 15 5 15t.713.287Q6 15.575 6 16v2h12v-2q0-.425.288-.713Q18.575 15 19 15t.712.287Q20 15.575 20 16v2q0 .825-.587 1.413Q18.825 20 18 20Z" />
            </svg>
            <span class="text-xs hidden sm:block">Download</span>
          </button>
        </li>
      </ul>
    </div>

    <div class="mx-auto py-6 max-w-prose">
      <h2 class="text-center text-xl sm:text-2xl font-bold text-gray-600">About</h2>
      <hr class="w-1/5 mx-auto my-4 bg-gray-100">
      <div class="space-y-4">
        <p>This website aims to convert book highlights from different sources to the same JSON format for more easily
          reuse by developers.</p>

        <p class="px-4 py-2 text-yellow-500 bg-yellow-100 rounded">📢 This tool is free and all convert
          steps will run
          locally on your browser, all your book highlights data will not be send backend server. </p>

        <p class="px-4 py-2 text-purple-500 bg-purple-100 rounded">🎉 This is an open source project, you can
          contribute
          to it or get the source code from this Github repo <a href="https://github.com/Benbinbin/highlights2json"
            target="_blank" class="link">highlights2json</a>.</p>

        <p>Now it supports the following formats and files as input:</p>

        <ul class="list-disc list-inside">
          <li>HTML file export from <a href="https://www.amazon.com/kindle-dbs/fd/kcp" target="_blank"
              class="link">Kindle App</a>
          </li>
          <li>Markdown file export from <a href="https://www.xmnote.com/" target="_blank" class="link">纸间书摘（原书伴app）</a>
          </li>
        </ul>

        <p class="px-4 py-2 text-green-500 bg-green-100 rounded">
          💡 You can check out <a href="https://github.com/Benbinbin/highlights2json#output" target="_blank"
            class="link">here</a> to know more about the same <span
            class="font-mono px-2 py-1 text-sm text-gray-600 bg-gray-100 border rounded"> JSON</span> format. ⚠️ And
          keep in mind that some properties in the JSON format may be missing based on different input file or format.
        </p>

        <p class="px-4 py-2 text-purple-500 bg-purple-100 rounded">📢 If you have some suggestions or problems feel free to open an
          <a href="https://github.com/Benbinbin/highlights2json/issues/new" target="_blank" class="link">Issue</a> in Github or contact with me by email <a
            href="mailto:benthomsonbin@gmail.com" class="link">benthomsonbin@gmail.com</a></p>
      </div>
    </div>

    <hr class="w-1/4 mx-auto my-8 bg-gray-50">
    <div class="flex flex-wrap justify-center items-center gap-4 text-gray-300 text-xs">
      <p>Created by <a href="https://benbinbin.com" target="_blank" class="link">Benbinbin</a></p>
      <p>LICENSE <a href="https://github.com/Benbinbin/highlights2json/blob/main/LICENSE" target="_blank"
          class="link">MIT</a></p>
      <p>Source Code <a href="https://github.com/Benbinbin/highlights2json" class="link" target="_blank">Github</a>
      </p>
      <p>Donate at <a href="https://ko-fi.com/H2H6ESSW2" class="link" target="_blank">Ko-fi</a> or <a
          href="https://afdian.net/a/benbinbin" class="link" target="_blank">爱发电</a>
      </p>
    </div>
  </div>
</template>


<style scoped lang="scss">

.link {
  @apply text-blue-400 hover:text-blue-500 underline transition-colors duration-300;
}

.sources-list-container {
  &::-webkit-scrollbar {
    display: none;
  }

  .source-btn {
    @apply p-2 text-sm border border-blue-500 rounded transition-colors duration-300;
  }
}

.dropping {
  @apply bg-gray-300 text-white;
}

.cry-animate {
  animation: bounce 1s infinite;
}

@keyframes bounce {

  0%,
  100% {
    transform: rotate(30deg);
  }

  50% {
    transform: rotate(-30deg);
  }
}
</style>

<style lang="scss">
* {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: rgba(156, 163, 175, 1);
  border: 3px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 1);
}
</style>