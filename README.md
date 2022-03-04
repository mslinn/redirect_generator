# redirect-generator

Visual Studio Code Extension that makes it easier to move HTML pages in Jekyll websites, without breaking external links.


## Features

Creates HTML page stubs that contain [HTTP Meta Refresh redirects](https://www.w3.org/TR/WCAG20-TECHS/H76.html)
for the HTML file in the currently active editor.
The [`redirect_from`](https://github.com/jekyll/jekyll-redirect-from) documentation describes how the redirects work.

Each time this plugin is invoked from a Visual Studio Code edit pane,
it writes a new path under the `redirect_from:` key, which it creates if necessary.
The newest paths are created at the bottom.

This plugin injects the URL of a redirect page into
[Jekyll](http://jekyllrb.com/) [front matter](https://jekyllrb.com/docs/front-matter/).
Here is an example of front matter, showing the paths of two redirects:

**`/about/index.html`**
```
---
layout: default
title: Restless Page
redirect_from:
  - /old/path1/index.html
  - /old/path2/blah.html
---
```

Given the above front matter in a page at `/about/index.html`, 2 stub HTML pages would be created,
containing identical contents,
in addition to the [normally generated page](https://jekyllrb.com/docs/structure/) at `_site/about/index.html`:

**`/_site/old/path1/index.html`**
```html
<head>
  <title>Restless Page</title>
  <meta http-equiv="refresh" content="0;URL='/about/index.html'" />
</head>
```

**`/_site/old/path2/blah.html`**
```html
<head>
  <title>Restless Page</title>
  <meta http-equiv="refresh" content="0;URL='/about/index.html'" />
</head>
```


## Requirements
This plugin is written in TypeScript, which is compatible with Node.js.
Install TypeScript dependencies like this:
```shell
npm install
```

This plugin requires the following Jekyll plugins.
Read their documentation to install them.

  - [Sitemap Generator](https://github.com/jekyll/jekyll-sitemap)
  - [`redirect_from`](https://github.com/jekyll/jekyll-redirect-from)


## Known Issues

None.

## Release Notes

### 0.1.0

Initial release.


**Enjoy!**
