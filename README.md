[![Highlights2JSON](./public/images/highlights2json.svg)](https://github.com/Benbinbin/highlights2json)

# Highlights2JSON

This project aims to convert book highlights from various sources to the same JSON format for more easily reuse by developers.

:sparkles: All your data just retain on your browser (it will not be send to backend server, because this tool just run based on the frontend), so feel free to use it.

## How to use

Visit one of the websites listed below :point_down: to use this tool:

:link: https://highlights2json.benbinbin.com

:link: https://highlights2json.vercel.app/


### Input

Visit the website shown above :point_up: and drag and drop the file(s) to the input region, just a second, you will get the output JSON file(s)

now the supported formats and files list below:

* HTML file export from [Kindle app](https://www.amazon.com/kindle-dbs/fd/kcp)

* Markdown file export from [纸间书摘（原书伴app）](https://www.xmnote.com/)

:loudspeaker: if you have some suggestion feel free to open an [issue](https://github.com/Benbinbin/highlights2json/issues/new) in Github or contact with me by email <a href="mailto:benthomsonbin@gmail.com">benthomsonbin@gmail.com</a>
### Output

The output JSON file will contains some properties as follow:

:warning: some properties maybe missing based on the content of the input file and format

```json
// the format of json
// show as the "key": "value" pair
// the "key" is property name
// the "value" is the data type
// like "[string]" represent the value is an array with the element which type is string
{
  "id": "any", // a identify code of this entry in database
  // the input file name
  "name": "string",
  // some metadata of the book
  "metadata": {
    "isbn": "number",
    "title": "string",
    "date": "string", // publish date of the book
    "authors": "[string]",
    "translators": "[string]",
    "press": "string",
    "covers": "[string]", // a urls list of the book cover images
    "types": "[string]",
    "tags": "[string]",
    "stars": "number",
    "links": "[string]", // a urls list about the book
  },
  "introduction": "string", // the introduction of the book
  "review": "string", // your review of the book,
  // the category data structure is a tree
  // each node contain three property:
  // * value: the (string) value of this node
  // * depth: the (number) level of this node
  // * children: the sub nodes array
  "category": "object",
  "highlights": [{
    "chapter": "string",
    "color": "string",
    "type": "string",
    "tags": "[string]",
    "location": "number",
    "content": "string",
    "comment": "string",
    "created": "string" // highlight created time
  }],
}
```

## License

[MIT](./LICENSE)

## Feedback

If you have any problem or suggestion about this project, feel free to open an [issue](https://github.com/Benbinbin/highlights2json/issues/new) in Github or contact with me by email <a href="mailto:benthomsonbin@gmail.com">benthomsonbin@gmail.com</a>

## Donate
[![ko-fi](./public/images/kofi.svg)](https://ko-fi.com/benbinbin)

[![ko-fi](./public/images/afdian.svg)](https://afdian.net/a/benbinbin)