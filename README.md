# Highlights2JSON

Homepage :point_right: https://highlights2json.benbinbin.com

 This project aim to convert book highlights from various sources to the same JSON format for more easily reuse by developers.

:sparkles: All your data just retain on your browser (it will not be send to backend server, because this tool just run based on the frontend), so feel free to use it.

## Input

Visit the [website](https://highlights2json.benbinbin.com) and drag and drop the file(s) to the input region, just a second, you will get the output JSON file(s)

:loudspeaker: the supported formats and files

* HTML file export from [Kindle app](https://www.amazon.com/kindle-dbs/fd/kcp).

* Markdown file export from [纸间书摘（原书伴app）](https://www.xmnote.com/)

## Output

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
    "date": "Date", // publish date
    "authors": "[string]",
    "translators": "[string]",
    "press": "string",
    "covers": "[string]", // a urls list of the book cover images
    "types": "[string]",
    "description": "string",
    "review": "string",
    "tags": "[string]",
    "stars": "number",
    "links": "[string]", // a urls list about the book
    "category": "object",
  },
  "highlights": [{
    "chapter": "string",
    "color": "string",
    "type": "string",
    "tags": "[string]",
    "location": "number",
    "content": "string",
    "comment": "string",
    "created": "Date" // created time
  }],
}
```