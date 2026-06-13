<template>
  <div>
    <div class="toolbar">
      <el-select v-model="status" clearable placeholder="订单状态" @change="load">
        <el-option v-for="(label, key) in statusLabels" :key="key" :label="label" :value="key" />
      </el-select>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table :data="orders" v-loading="loading">
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column prop="garbageType" label="类型" width="100" />
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column prop="totalAmount" label="金额" width="80">
        <template #default="{ row }">¥{{ row.totalAmount }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">{{ statusLabels[row.status] }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'paid'"
            size="small"
            type="primary"
            @click="openAssign(row)"
          >
            派单
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="assignVisible" title="指派骑手" width="400px">
      <el-select v-model="selectedRider" placeholder="选择骑手" style="width:100%">
        <el-option v-for="r in riders" :key="r.id" :label="r.name" :value="r.id" />
      </el-select>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { ORDER_STATUS_LABELS } from '@garbage/shared';
import { api } from '../api';

const statusLabels = ORDER_STATUS_LABELS;
const tenantId = JSON.parse(localStorage.getItem('user') || '{}').tenantId;

const loading = ref(false);
const orders = ref<Record<string, unknown>[]>([]);
const status = ref('');
const assignVisible = ref(false);
const selectedRider = ref('');
const riders = ref<{ id: string; name: string }[]>([]);
let currentOrderId = '';

async function load() {
  if (!tenantId) return;
  loading.value = true;
  try {
    const res = await api.orders(tenantId, status.value || undefined) as {
      items: Record<string, unknown>[];
    };
    orders.value = res.items || [];
  } finally {
    loading.value = false;
  }
}

async function openAssign(row: { id: string }) {
  currentOrderId = row.id;
  riders.value = (await api.riders(tenantId)) as { id: string; name: string }[];
  selectedRider.value = '';
  assignVisible.value = true;
}

async function confirmAssign() {
  if (!selectedRider.value) return;
  try {
    await api.assign(currentOrderId, selectedRider.value);
    ElMessage.success('派单成功');
    assignVisible.value = false;
    load();
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : '派单失败');
  }
}

onMounted(load);
</script>

<style scoped>
.toolbar { margin-bottom: 16px; display: flex; gap: 12px; }
</style>
