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
      // import('web-py').then(module => {
      //   module.default.init('http://api.lynn.cool')
      //   // console.log(module.default);
      // })
    }
  }
}
</script>
