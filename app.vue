<script setup lang="ts">
import { saveAs } from 'file-saver';
import { getMetaData, getHighlights } from './composables/kindleHTML'

// input source:
// * kindle
// * xmnote is 纸间书摘
const inputSources = [
  {
    name: 'Kindle',
    key: 'kindle'
  },
  {
    name: 'Kindle2',
    key: 'kindle2'
  },
  {
    name: 'Kindle3',
    key: 'kindle3'
  },
  {
    name: 'Kindle4',
    key: 'kindle4'
  },
  {
    name: 'Kindle5',
    key: 'kindle5'
  },
  {
    name: 'Kindle6',
    key: 'kindle6'
  },
  {
    name: 'Kindle7',
    key: 'kindle7'
  },
  {
    name: 'Kindle8',
    key: 'kindle8'
  },
  {
    name: 'Kindle9',
    key: 'kindle9'
  },
  {
    name: 'Kindle10',
    key: 'kindle10'
  },
  {
    name: 'Kindle11',
    key: 'kindle11'
  },
  {
    name: 'Kindle12',
    key: 'kindle12'
  },
]
const currentInputSource = ref('kindle')

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

const inputFile = async (event) => {
  if (!event.target.files) return;

  for (let i = 0; i < event.target.files.length; i++) {
    let file = event.target.files[i];
    await readFile(file);
  }
  parse();
  filesList = []
}

const result = ref([])
const parse = () => {
  filesList.forEach(item => {
    const domParser = new DOMParser();
    const dom = domParser.parseFromString(item.data, 'text/html');
    // validate: whether the given HTML is a valid Kindle highlights export

    const highlightsNode = dom.querySelectorAll(".noteText");
    if (!highlightsNode.length) return `cannot get highlights from ${item.name}.`

    const metadata = getMetaData(dom);
    const highlights = getHighlights(dom);
    result.value.push({
      name: item.name,
      metadata: metadata,
      highlights: highlights,
    })
  });
}

const saveAsJSON = (index) => {
  const data = result.value[index];
  const fileName = result.value[index].metadata.title;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, `${fileName}.json`);
}
</script>

<template>
  <div class="container mx-auto my-8 p-4">
    <Title>Highlights2JSON</Title>
    <h1 class="text-center text-3xl sm:text-5xl font-bold">
      <a href="https://github.com/Benbinbin/highlights2json" target="_blank">
        <span class="text-yellow-400">Highlights</span>
        <span>🔀</span>
        <span class="text-green-500">JSON</span>
      </a>
    </h1>
    <div class="my-4 flex justify-center items-center text-gray-500">
      <p class="text-xs sm:text-base font-light italic">convert book highlights to the same <a
          href="https://github.com/Benbinbin/highlights2json#output" target="_blank" class="link">JSON format</a></p>
    </div>

    <!-- input -->
    <div class="p-6">
      <h2 class="text-center text-2xl font-bold text-gray-600">Input</h2>
      <hr class="w-1/5 mx-auto my-4 bg-gray-100">
      <div class="sources-list-container my-4 flex items-center overflow-x-auto">
        <div class="flex sm:flex-wrap justify-center items-center gap-4 ">
          <button v-for="item in inputSources" :key="item.key" class="source-btn"
            :class="currentInputSource === item.key ? 'text-white bg-blue-500 hover:bg-blue-400' : 'text-blue-500 hover:bg-blue-500'"
            @click="currentInputSource = item.key">{{ item.name }}</button>
        </div>

      </div>
      <div
        class="input-container sm:mx-8 h-[30vh] sm:h-[45vh] flex flex-col justify-center items-center gap-2 relative text-xl text-gray-400 bg-gray-50 hover:bg-gray-100 border-2 border-dashed rounded-lg transition-colors duration-300"
        :class="{ dropping: isDropping }" @dragover="isDropping = true" @drop="isDropping = false"
        @dragleave="isDropping = false">
        <p>Click to Select Files</p>
        <p>OR</p>
        <p>Drop Files Here</p>
        <input id="file_upload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" type="file" multiple
          accept=".html" @change="inputFile">
      </div>
    </div>


    <!-- result -->
    <div class="py-6">
      <h2 class="text-center text-2xl font-bold text-gray-600">Output</h2>
      <hr class="w-1/5 mx-auto my-4 bg-gray-100">
      <ul class="max-w-prose mx-auto py-6 divide-y-2 list-disc list-inside">
        <li v-for="(item, index) of result" :key="item.name" class="flex justify-between items-center gap-2 py-4">
          <span>{{ item.metadata.title }}</span>
          <div class="btn-ground ml-4">
            <button @click="saveAsJSON(index)"
              class="p-3 rounded-lg bg-green-400 hover:bg-green-300 text-xs text-white font-bold focus:outline-none transition-colors duration-300">JSON</button>
          </div>
        </li>
      </ul>
    </div>

    <div class="mx-auto py-6 max-w-prose">
      <h2 class="text-center text-2xl font-bold text-gray-600">About</h2>
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
      </div>
    </div>

    <hr class="w-1/4 mx-auto my-8 bg-gray-50">
    <div class="flex flex-wrap justify-center items-center gap-4 text-gray-300 text-xs">
      <p>Created by <a href="https://benbinbin.com" target="_blank" class="link">Benbinbin</a></p>
      <p>LICENSE <a href="./LICENSE" class="link">MIT</a></p>
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