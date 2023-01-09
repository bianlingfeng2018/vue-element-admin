<template>
  <div>
    <p>hi</p>
    <el-button @click="handleClick()">click</el-button>
  </div>
</template>

<script>
import { testapi } from '@/api/asrs-order'

export default {
  name: 'PlantOverview',
  data() {
    return {
      name: 'ABC'
    }
  },
  methods: {
    handleClick() {
      testapi({ name: this.name })
        .then((res) => {
          this.$message.success(res)
        })
        .catch(reason => {
          console.log(reason)
        })
    }
  }
}
</script>

<style scoped>

</style>
