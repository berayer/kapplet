<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
</script>

<template>
  <el-config-provider size="small" :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>
