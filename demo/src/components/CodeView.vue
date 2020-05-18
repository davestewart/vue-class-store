<script>
export default {
  functional: true,

  render (h, context) {
    const slots = context.slots()
    const text = slots
      ? slots.default[0].text.trim().split(/[\r\n]+/).map(line => line.trim()).join('\n')
      : ''
    return h('div', {class: 'codeView'}, [
      h('p', 'Check the files the source panel:'),
      h('pre', text)
    ])
  }
}
</script>


<style>
.codeView p {
  font-style: italic;
}

.codeView pre {
  padding: .5em .8em;
  border-radius: .25em;
  margin-left: 1.5em;
  background: #F4F4F4;
  color: #0FA0CE;
  font-weight: 200;
  font-family: monospace;
}

</style>
