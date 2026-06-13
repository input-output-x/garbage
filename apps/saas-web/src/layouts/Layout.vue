<template>
  <el-container class="layout">
    <el-aside width="200px">
      <div class="logo">丢呗 SAAS</div>
      <el-menu router :default-active="$route.path">
        <el-menu-item index="/orders">订单管理</el-menu-item>
        <el-menu-item index="/riders">骑手管理</el-menu-item>
        <el-menu-item index="/communities">小区配置</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <span>{{ user?.username }}</span>
        <el-button link type="danger" @click="logout">退出</el-button>
      </el-header>
      <el-main><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
});

function logout() {
  localStorage.clear();
  router.push('/login');
}
</script>

<style scoped>
.layout { height: 100vh; }
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-weight: 600;
  color: #10b981;
  border-bottom: 1px solid #eee;
}
.el-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  border-bottom: 1px solid #eee;
}
</style>
