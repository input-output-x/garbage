<template>
  <el-row :gutter="16">
    <el-col :span="8">
      <el-statistic title="租户数" :value="stats.tenants" />
    </el-col>
    <el-col :span="8">
      <el-statistic title="订单总数" :value="stats.orders" />
    </el-col>
    <el-col :span="8">
      <el-statistic title="今日订单" :value="stats.todayOrders" />
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { api } from '../api';

const stats = reactive({ tenants: 0, orders: 0, todayOrders: 0 });

onMounted(async () => {
  const tenants = (await api.tenants()) as unknown[];
  const ordersRes = (await api.orders()) as { items: { createdAt: string }[] };
  const items = ordersRes.items || [];
  const today = new Date().toISOString().slice(0, 10);
  stats.tenants = tenants.length;
  stats.orders = items.length;
  stats.todayOrders = items.filter((o) => o.createdAt.startsWith(today)).length;
});
</script>
