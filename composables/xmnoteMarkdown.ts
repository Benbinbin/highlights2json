import { fromMarkdown } from 'mdast-util-from-markdown'


export function getParseResultFromXmnote(data) {
  const tree = fromMarkdown(data)
  console.log(tree);
  const metadata = {}

  if(tree.children[0].type === 'html') {
    const headerMetadata = getHeaderMetaDataFromXmnote(tree.children[0].value)
    Object.assign(metadata, headerMetadata);
  }
  console.log(metadata);
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

}