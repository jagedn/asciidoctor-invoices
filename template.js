module.exports = {
  paragraph: (node) => `<p class="${node.getRoles().join(' ')}">${node.getContent()}</p>`,

  image: (node) => `<div class="image ${node.getRoles().join(' ')}"><img src="${node.getImageUri(node.getAttribute('target'))}"/></div>`,

  document: (node) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link href="https://puravida-software.gitlab.io/asciidoctor-extensions/custom-theme/asciidoctor.css" rel="stylesheet">
<link href="./invoice.css" rel="stylesheet">
</head>
<body>
${node.getContent()}
</body>`
}
