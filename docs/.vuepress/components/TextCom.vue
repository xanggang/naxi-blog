<template>
  <div></div>
</template>

<script>
export default {
  name: "TextCom",
  data() {
    return {
      dynamicComponent: null
    }
  },
  mounted() {
    if (!window.d) {
      import('web-py').then(module => {
        module.default.init('http://47.96.139.86:9100')
        // console.log(module.default);
      })
    }
  }
}
</script>
