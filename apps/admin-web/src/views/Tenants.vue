<template>
  <div>
    <el-button type="primary" @click="showCreate = true" style="margin-bottom:16px">开通租户</el-button>
    <el-table :data="tenants" v-loading="loading">
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="city" label="城市" />
      <el-table-column prop="contactPhone" label="联系电话" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag>{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="commissionRate" label="抽成">
        <template #default="{ row }">{{ (row.commissionRate * 100).toFixed(0) }}%</template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button
            v-if="row.status !== 'active'"
            size="small"
            @click="setStatus(row.id, 'active')"
          >启用</el-button>
          <el-button
            v-else
            size="small"
            type="warning"
            @click="setStatus(row.id, 'suspended')"
          >停用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showCreate" title="开通租户" width="480px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="城市"><el-input v-model="form.city" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="form.contactPhone" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" @click="create">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { api } from '../api';

const loading = ref(false);
const tenants = ref<Record<string, unknown>[]>([]);
const showCreate = ref(false);
const form = reactive({ name: '', city: '', contactPhone: '' });

async function load() {
  loading.value = true;
  try {
    tenants.value = (await api.tenants()) as Record<string, unknown>[];
  } finally {
    loading.value = false;
  }
}

async function create() {
  await api.createTenant(form);
  ElMessage.success('创建成功');
  showCreate.value = false;
  load();
}

async function setStatus(id: string, status: string) {
  await api.updateTenantStatus(id, status);
  ElMessage.success('已更新');
  load();
}

onMounted(load);
</script>
