<template>
  <el-table :data="list" v-loading="loading">
    <el-table-column prop="name" label="小区名称" />
    <el-table-column prop="address" label="地址" />
    <el-table-column prop="enabled" label="开通">
      <template #default="{ row }">
        <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '是' : '否' }}</el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../api';

const tenantId = JSON.parse(localStorage.getItem('user') || '{}').tenantId;
const loading = ref(false);
const list = ref<unknown[]>([]);

onMounted(async () => {
  loading.value = true;
  try {
    list.value = (await api.communities(tenantId)) as unknown[];
  } finally {
    loading.value = false;
  }
});
</script>
