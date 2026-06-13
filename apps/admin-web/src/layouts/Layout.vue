<template>
  <el-container class="layout">
    <el-aside width="200px">
      <div class="logo">丢呗 平台</div>
      <el-menu router :default-active="$route.path">
        <el-menu-item index="/dashboard">数据大盘</el-menu-item>
        <el-menu-item index="/tenants">租户管理</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <el-button link type="danger" @click="logout">退出</el-button>
      </el-header>
      <el-main><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
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
  color: #3b82f6;
  border-bottom: 1px solid #eee;
}
.el-header { display: flex; justify-content: flex-end; border-bottom: 1px solid #eee; }
</style>
