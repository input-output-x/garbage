<template>
  <el-table :data="riders" v-loading="loading">
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="phone" label="手机" />
    <el-table-column prop="active" label="状态">
      <template #default="{ row }">
        <el-tag :type="row.active ? 'success' : 'info'">{{ row.active ? '在岗' : '停用' }}</el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../api';

const tenantId = JSON.parse(localStorage.getItem('user') || '{}').tenantId;
const loading = ref(false);
const riders = ref<unknown[]>([]);

onMounted(async () => {
  loading.value = true;
  try {
    riders.value = (await api.riders(tenantId)) as unknown[];
  } finally {
    loading.value = false;
  }
});
</script>
