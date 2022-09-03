import { fromMarkdown } from 'mdast-util-from-markdown'


export function getParseResultFromXmnote(data) {
  const tree = fromMarkdown(data)
  console.log(tree);
  const metadata = {}
  let highlights = []

  if(tree.children[0].type === 'html') {
    const headerMetadata = getHeaderMetaDataFromXmnote(tree.children[0].value)
    Object.assign(metadata, headerMetadata);
  }

  if(tree.children.length>0) {
    const { category, highlights: highlightsFromXmnote } = getHighlightFromXmnote(tree.children)

    metadata['category'] = category
    highlights = highlightsFromXmnote
  }

  return {
    metadata,
    highlights
  }
}

function getHeaderMetaDataFromXmnote(str) {
  const headerMetadata = {}

  // cover
  let covers = []
  const coversRegex = /\ssrc="(\S*)"\s/
  const coversMatchResult = str.match(coversRegex)

  if (coversMatchResult && coversMatchResult.length>1) {
    covers = [coversMatchResult[1].trim()]
  }

  headerMetadata['covers'] = covers

  // title
  let title = ''
  const titleRegex = /\ssize=4>(.*)<\/font>/
  const titleMatchResult = str.match(titleRegex)

  if (titleMatchResult && titleMatchResult.length>1) {
    title = titleMatchResult[1].trim()
  }

  headerMetadata['title'] = title

  // authors
  let authors = []
  const authorsRegex = /\ssize=2>作者：(.*)<\/font>/
  const authorsMatchResult = str.match(authorsRegex)

  if (authorsMatchResult && authorsMatchResult.length>1) {
    authors = authorsMatchResult[1].trim().split(/[\s;、；]/).map((s) => s.trim())
  }

  headerMetadata['authors'] = authors

  // translators
  let translators = []
  const translatorsRegex = /\ssize=2>译者：(.*)<\/font>/
  const translatorsMatchResult = str.match(translatorsRegex)

  if (translatorsMatchResult && translatorsMatchResult.length>1) {
    translators = translatorsMatchResult[1].trim().split(/[\s;、；]/).map((s) => s.trim())
  }

  headerMetadata['translators'] = translators

  // press
  let press = ''
  const pressRegex = /\ssize=2>出版社：(.*)<\/font>/
  const pressMatchResult = str.match(pressRegex)

  if (pressMatchResult && pressMatchResult.length > 1) {
    press = pressMatchResult[1].trim()
  }

  headerMetadata['press'] = press

  // date
  let date = ''
  const dateRegex = /\ssize=2>出版年：(.*)<\/font>/
  const dateMatchResult = str.match(dateRegex)

  if (dateMatchResult && dateMatchResult.length > 1) {
    date = dateMatchResult[1].trim()
  }

  headerMetadata['date'] = date

  // isbn
  let isbn
  const isbnRegex = /\ssize=2>ISBN：(\d*)<\/font>/
  const isbnMatchResult = str.match(isbnRegex)

  if (isbnMatchResult && isbnMatchResult.length > 1) {
    isbn = isbnMatchResult[1].trim()
  }

  if(isbn) {
    headerMetadata['isbn'] = isbn
  }

  return headerMetadata;
}

function getHighlightFromXmnote(arr) {
  let currentH1 = null
  let currentH2 = null
  let currentH3 = null
  let currentH4 = null
  let currentH5 = null
  let currentH6 = null

  // let currentParent = null

  let currentHeadingStr = ''

  const category = { value: 'root', depth: 0, children: [] }
  const highlights = []
  let newHighlight = false
  let currentHighlight = null

  arr.forEach(item => {
    if(item.type === 'heading') {
      currentHeadingStr = item?.children[0]?.value
      switch (item.depth) {
        case 1:
          currentH1 = {
            value: item?.children[0]?.value || 'heading-1',
            depth: item.depth,
            children: []
          }
          category.children.push(currentH1)
          break;

        case 2:
          currentH2 = {
            value: item?.children[0]?.value || 'heading-2',
            depth: item.depth,
            children: []
          }
          const parentOf2 = currentH1 || category
          parentOf2.children.push(currentH2)
          break;

        case 3:
          currentH3 = {
            value: item?.children[0]?.value || 'heading-3',
            depth: item.depth,
            children: []
          }
          const parentOf3 = currentH2 || currentH1 || category
          parentOf3.children.push(currentH3)
          break;

        case 4:
          currentH4 = {
            value: item?.children[0]?.value || 'heading-4',
            depth: item.depth,
            children: []
          }
          const parentOf4 = currentH3 || currentH2 || currentH1 || category
          parentOf4.children.push(currentH3)
          break;

        case 5:
          currentH5 = {
            value: item?.children[0]?.value || 'heading-5',
            depth: item.depth,
            children: []
          }
          const parentOf5 = currentH4 || currentH3 || currentH2 || currentH1 || category
          parentOf5.children.push(currentH3)
          break;

        case 6:
          currentH6 = {
            value: item?.children[0]?.value || 'heading-6',
            depth: item.depth,
            children: []
          }
          const parentOf6 = currentH5 || currentH4 || currentH3 || currentH2 || currentH1 || category
          parentOf6.children.push(currentH3)
          break;

        default:
          category.children.push({
            value: item?.children[0]?.value || 'heading',
            depth: 0,
            children: []
          });
          break;
      }
    } else if (item.type === 'thematicBreak') {
      if(currentHighlight) {
        highlights.push(currentHighlight)
        currentHighlight = null
      }
      newHighlight = true
    } else if (item.type === 'paragraph') {
      if(newHighlight) {
        const content = item.children.map(node => node.value).join().replaceAll('<br>', '\n')
        currentHighlight = {
          chapter: currentHeadingStr,
          content: content
        }
        newHighlight = false
      } else {
        // get location
        const locationRegex = /位置：(\d+)\s/
        const locationMathResult = item.children[1].value.match(locationRegex)

        if(locationMathResult && locationMathResult.length > 1) {
          currentHighlight['location'] = locationMathResult[1].trim()
        }

        // get created time
        const createdRegex = /\s(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s$/
        const createdMathResult = item.children[1].value.match(createdRegex)

        if (createdMathResult && createdMathResult.length > 1) {
          currentHighlight['created'] = createdMathResult[1].trim()
        }
      }
    } else if (item.type === 'blockquote') {
      const comment = item.children.map(node => {
        return node.children.map(subNode => subNode.value).join('\n')
      }).join('\n')

      currentHighlight['comment'] = comment
    }
  })

  return {
    category,
    highlights
  }
}