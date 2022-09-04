/**
 *
 * combine result
 *
 */
export function getParseResultFromKindle(dom) {
  const metadata = getHeaderMetadataFromKindle(dom)
  const { category, highlights } = getHighlightsFromKindle(dom)

  metadata['category'] = category

  return {
    metadata,
    highlights
  }
}

/**
 *
 * get some metadata of book
 *
 */
export function getHeaderMetadataFromKindle(dom) {
  const title = dom.querySelector('.bookTitle').textContent.trim();
  const authors = dom.querySelector('.authors')
    .textContent
    .trim()
    .split(/[;、；]/)
    .map((s) => s.trim());
  const translators = authors.filter(author => {
    const regexp = /译$/;
    return regexp.test(author)
  });
  if (translators.length) {
    for (let i = 0; i < translators.length; i++) {
      let item = translators[i];
      const index = authors.indexOf(item);
      if (index === -1) return;
      authors.splice(index, 1);
      translators[i] = item.replace('译', '');
    }
    return {
      title,
      authors,
      translators
    }
  } else {
    return {
      title,
      authors
    }
  }
}

/**
 *
 * get highlights array and category object
 *
 */
// Reference: https://github.com/sawyerh/kindle-email-to-json/blob/207d7f54826a0a75a16a498b4fa6e7eff4f120c2/Converter.js
export function getHighlightsFromKindle(dom) {
  // const sectionDomArr = dom.querySelectorAll('.sectionHeading');
  // const headingDomArr = dom.querySelectorAll('.noteHeading');

  const sectionAndHeadingDomArr = dom.querySelectorAll('.sectionHeading, .noteHeading') // get the section and heading DOMs

  const category = { value: 'root', depth: 0, children: [] }

  let currentSection = null;
  let currentHeading = null;

  let currentChapterStr = '';

  let highlights = [];

  sectionAndHeadingDomArr.forEach((node, index) => {
    const text = node.textContent.trim()

    if (node.classList.contains('sectionHeading')) {
      // get the section content
      currentChapterStr = text

      currentSection = {
        value: currentChapterStr,
        depth: 1,
        children: []
      }

      category.children.push(currentSection)
    } else if (node.classList.contains('noteHeading')) {
      // get the heading content from .noteHeading element
      const HeadingRegexp = /-\s(.+)\s>/

      if (HeadingRegexp.test(text)) {
        const tempHeadingStr = text.match(HeadingRegexp)[1].trim()

        if (!currentHeading || currentHeading.value !== tempHeadingStr) {
          currentChapterStr = tempHeadingStr

          currentHeading = {
            value: currentChapterStr,
            depth: 2,
            children: []
          }

          // push the heading to category or currentSection object
          if (currentSection) {
            currentSection.children.push(currentHeading)
          } else {
            category.children.push(currentHeading)
          }
        }
      }

      // if (chapterDomArr.length) {
      //   let tempNode = heading;
      //   while (tempNode.nodeName !== 'HR') {
      //     if (tempNode.classList.contains('sectionHeading')) {
      //       chapter = tempNode.textContent.trim();
      //       break
      //     }
      //     tempNode = tempNode.previousElementSibling
      //   }
      // }

      // color
      let color = null;
      const spanNode = node.querySelector("span[class^='highlight_']")
      if (spanNode) {
        color = spanNode.textContent.trim();
      }

      // location
      let location = 0;
      const locationMatchResult = text.match(/\s(\d*)$/i)
      // match for Chinese version, which location information may be in the patten of "第 x 页"
      const locationMatchResultResultCN = text.match(/第\s(\d*)\s页$/i)

      if (locationMatchResult) {
        location = locationMatchResult[1].trim()
      } else if (locationMatchResultResultCN) {
        location = locationMatchResultResultCN[1].trim()
      }

      // content
      // based on color to tell if the content is Highlight or Comment
      // the latter's relative .noteHeading node doesn't have the color span sub element
      // Comment should attach to the (previous) Highlight
      if (!color && highlights.length > 0) {
        // attach the Comment to the previous Highlight
        const currentHighlight = highlights[highlights.length - 1]
        currentHighlight.comment = getContent(node)
      } else {
        const content = getContent(node)
        highlights.push({
          chapter: currentChapterStr,
          color,
          location,
          content
        });
      }
    }

  })
  return {
    category,
    highlights
  }
}

/**
 *
 * get .noteHeading element relative .noteText content
 *
 */
function getContent(heading) {
  // each .noteHeading element next node may be the .noteText
  // this is the highlight
  const nextNode = heading.nextElementSibling;
  if (nextNode.classList.contains('noteText')) {
    return nextNode.textContent.trim();
  } else {
    return null;
  }
}