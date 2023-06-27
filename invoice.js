const fs = require("fs")
function invoiceDetailsBlockMacro(processor, context, parent, target, attrs){
  const path = parent.document.getAttribute('invoice-file');
  const data = fs.readFileSync(path, 'utf8');

  const separator = attrs.separator || '|'
  const frame = attrs.frame || 'ends'
  const cols = attrs.cols || '<1'
  const symbol = attrs.symbol || '€'

  const lines = []
  lines.push(`[separator=${separator},frame=${frame},cols="${cols}",width=100%]`)
  lines.push('|===')
  data.split(/\r?\n/).forEach(l=>{
    if( l.trim().length)
      lines.push(`${separator}${l} ${symbol}`)
  })
  lines.push('|===')

  const block = processor.createBlock(parent, 'open', '', attrs)
  processor.parseContent(block, lines.join('\n'))
  return block
}

function invoiceTotalBlockMacro(processor, context, parent, target, attrs){
  const path = parent.document.getAttribute('invoice-file');
  const data = fs.readFileSync(path, 'utf8');

  const separator = attrs.separator || '|'
  const frame = attrs.frame || 'ends'
  const cols = attrs.cols || '<1'
  const iva = attrs.iva || null;
  const symbol = attrs.symbol || '€'

  const total = data.split(/\r?\n/).reduce( (a, l)=>{
    if( l.trim().length){
      const subtotal = parseFloat(l.split(separator).slice(-1))
      return a+subtotal
    }
    return a
  }, 0)

  const lines = []
  lines.push(`[separator=${separator},frame=${frame},cols="${cols}",width=100%]`)
  lines.push('|===')
  if( iva ){
    lines.push(`${separator}Net:${separator}${total} ${symbol}`)
    lines.push(`${separator}IVA:${separator}${iva}%`)
    lines.push(`${separator}Total:${separator}${total+(Math.round((total*iva)/100))} ${symbol}`)
  }else{
    lines.push(`${separator}Total:${separator}${total} ${symbol}`)
  }
  lines.push('|===')

  const block = processor.createBlock(parent, 'open', '', attrs)
  processor.parseContent(block, lines.join('\n'))
  return block
}

function invoicesBlockMacro(context) {
  return function () {
    const self = this
    self.named("invoices")
    self.process((parent, target, attrs) => {
      switch( target ){
        case 'details': return invoiceDetailsBlockMacro(self, context, parent, target, attrs)
        case 'total': return invoiceTotalBlockMacro(self, context, parent, target, attrs)
      }
      return self.createBlock(parent, 'paragraph', '<comand not found>')
    })
  }
}

module.exports.register = function (registry, context) {
  if (typeof registry.register === 'function') {
    registry.register(function (){
      this.blockMacro(invoicesBlockMacro(context))
      this.blockMacro(invoicesBlockMacro(context))
    })
  } else if (typeof registry.blockMacro === 'function') {
    this.blockMacro(invoicesBlockMacro(context))
  }
  return registry
}
