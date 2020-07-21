<template>
  <div>
    <h1>
      0000
    </h1>
    text
  </div>
</template>

<script>
  import webPy from 'web-py'
  export default {
    name: "TextCom",
    mounted() {
      if (!window.d) {
        webPy.init('http://47.96.139.86:9100')
      }
    }
  }
</script>
