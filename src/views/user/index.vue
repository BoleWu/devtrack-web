<template>
  <div class="user-page animate-fade-in-up">
    <div class="toolbar glass-card">
      <div class="toolbar-left">
        <el-input 
          v-model="query.name" 
          placeholder="搜索用户..." 
          clearable 
          class="search-input" 
          prefix-icon="Search"
          @keyup.enter="handleSearch"
          @clear="handleSearch" 
        />
        <el-select v-model="query.status" placeholder="状态" clearable class="status-select" @change="handleSearch">
          <el-option label="在用" :value="0" />
          <el-option label="冻结" :value="1" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Search" @click="handleSearch" class="action-btn">查询</el-button>
        <el-button icon="Refresh" @click="handleSearch" circle class="action-btn" />
      </div>
    </div>

    <el-card shadow="hover" class="table-card glass-card" :body-style="{ padding: '0px' }">
      <el-table 
        v-loading="loading" 
        :data="userList" 
        style="width: 100%" 
        :header-cell-style="{ background: 'transparent' }"
        :row-class-name="tableRowClassName"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column key="col-name" prop="name" label="姓名" min-width="120" align="center">
          <template #default="{ row }">
            <span class="user-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column key="col-username" prop="username" label="用户名" min-width="120" align="center" />
        <el-table-column label="角色" min-width="180" align="center">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roleList"
              :key="role.id"
              size="small"
              class="role-tag"
              effect="light"
            >
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" align="center" />
        <el-table-column prop="phone" label="电话" min-width="120" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'" effect="dark" round>
              {{ row.status === 0 ? '在用' : '冻结' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" align="center" />
      </el-table>

      <div class="pagination-container">
        <el-pagination 
          v-model:current-page="pagination.currentPage" 
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" 
          :total="pagination.total" 
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange" 
          @current-change="handleCurrentChange" 
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { queryUserInfoByList } from '@/api/user'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const userList = ref([])
const query = reactive({
  name: '',
  status: 0
})
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      name: query.name,
      status: query.status,
      page: pagination.currentPage,
      limit: pagination.pageSize
    }
    const res = await queryUserInfoByList(params)
    console.log(res)
    if (res && (res.records || res.data)) {
      userList.value = res.records || res.data
      pagination.total = res.total || 0
    } else {
      userList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  fetchUsers()
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchUsers()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchUsers()
}

const tableRowClassName = ({ rowIndex }) => {
  return 'animated-row'
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-page {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 15px;
}

.search-input {
  width: 240px;
}

.status-select {
  width: 120px;
}

.table-card {
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  color: #409EFF;
}

.role-tag {
  margin: 2px;
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 行动画 */
:deep(.animated-row) {
  animation: fadeInUp 0.3s ease-out forwards;
  opacity: 0;
}

:deep(.el-table__body tr) {
  transition: all 0.3s ease;
}

:deep(.el-table__body tr:hover > td) {
  background-color: rgba(64, 158, 255, 0.05) !important;
}

/* 使用 nth-child 为行添加交错动画延迟 */
:deep(.el-table__body tr:nth-child(1)) { animation-delay: 0.05s; }
:deep(.el-table__body tr:nth-child(2)) { animation-delay: 0.1s; }
:deep(.el-table__body tr:nth-child(3)) { animation-delay: 0.15s; }
:deep(.el-table__body tr:nth-child(4)) { animation-delay: 0.2s; }
:deep(.el-table__body tr:nth-child(5)) { animation-delay: 0.25s; }
:deep(.el-table__body tr:nth-child(6)) { animation-delay: 0.3s; }
:deep(.el-table__body tr:nth-child(7)) { animation-delay: 0.35s; }
:deep(.el-table__body tr:nth-child(8)) { animation-delay: 0.4s; }
:deep(.el-table__body tr:nth-child(9)) { animation-delay: 0.45s; }
:deep(.el-table__body tr:nth-child(10)) { animation-delay: 0.5s; }
</style>
