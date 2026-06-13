<template>
  <div class="login-page">
    <el-card class="card">
      <h2>SAAS 运营端登录</h2>
      <p class="hint">演示账号：tenant / tenant123</p>
      <el-form @submit.prevent="onSubmit">
        <el-form-item label="账号">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" style="width:100%">
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { api } from '../api';

const router = useRouter();
const loading = ref(false);
const form = reactive({ username: 'tenant', password: 'tenant123' });

async function onSubmit() {
  loading.value = true;
  try {
    const data = await api.login(form.username, form.password) as {
      token: string;
      user: { tenantId?: string; username: string };
    };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/');
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
}
.card { width: 400px; }
.hint { color: #999; font-size: 13px; margin-bottom: 16px; }
</style>
