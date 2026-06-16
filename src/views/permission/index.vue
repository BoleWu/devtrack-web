<template>
  <div class="permission-page animate-fade-in-up">
    <!-- 工具栏 -->
    <div class="toolbar glass-card">
      <div class="toolbar-left">
        <el-input 
          v-model="query.keyword" 
          placeholder="搜索权限名称..." 
          clearable 
          class="search-input" 
          prefix-icon="Search"
          @keyup.enter="handleSearch"
          @clear="handleSearch" 
        />
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="openCreate" class="action-btn">新增权限</el-button>
        <el-button icon="Refresh" @click="handleSearch" circle class="action-btn" />
      </div>
    </div>

    <!-- 表格 -->
    <el-card shadow="hover" class="table-card glass-card" :body-style="{ padding: '0px' }">
      <el-table 
        v-loading="loading" 
        :data="permissionList" 
        style="width: 100%" 
        :header-cell-style="{ background: 'transparent' }"
        :row-class-name="tableRowClassName"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="name" label="权限名称" min-width="150" align="center" />
        <el-table-column prop="code" label="权限Code" min-width="150" align="center" />
        <el-table-column label="请求方法" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getMethodTagType(row.method)" effect="dark" size="small">
              {{ row.method?.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="接口路径" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="180" align="center" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="160" align="center" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div class="op-actions">
              <el-button link type="primary" @click="openCopy(row)">复制</el-button>
              <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
              <el-popconfirm title="确认删除该权限吗？" @confirm="handleDelete(row)">
                <template #reference>
                  <el-button link type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogType === 'create' ? '新增权限' : '编辑权限'" 
      width="500px"
      append-to-body
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入权限名称，如：创建项目" />
        </el-form-item>
        <el-form-item label="权限Code" prop="code">
          <el-input v-model="form.code" placeholder="请输入权限Code，如：project:create" />
        </el-form-item>
        <el-form-item label="请求方法" prop="method">
          <el-select v-model="form.method" placeholder="请选择请求方法" style="width: 100%;">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>
        </el-form-item>
        <el-form-item label="接口路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入接口路径，如：/api/projects" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入权限描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { queryPermissionByList, createPermission, updatePermission, deletePermission } from '@/api/permission'
import { ElMessage } from 'element-plus'
import { Search, Plus, Refresh } from '@element-plus/icons-vue'

// 列表相关
const loading = ref(false)
const permissionList = ref([])
const query = reactive({
  name: ''
})
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const fetchPermissions = async () => {
  loading.value = true
  try {
    const params = {
      keyword: query.keyword,
      page: pagination.currentPage,
      limit: pagination.pageSize
    }
    const res = await queryPermissionByList(params)
    if (res && (res.records || res.data)) {
      permissionList.value = res.records || res.data
      pagination.total = res.total || 0
    } else {
      permissionList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取权限列表失败:', error)
    // ElMessage.error('获取权限列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  fetchPermissions()
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchPermissions()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchPermissions()
}

// 删除
const handleDelete = async (row) => {
  try {
    await deletePermission({ id: row.id })
    ElMessage.success('删除成功')
    fetchPermissions()
  } catch (error) {
    console.error('删除失败', error)
  }
}

// 获取请求方法的颜色类型
const getMethodTagType = (method) => {
  if (!method) return 'info'
  const m = method.toUpperCase()
  switch (m) {
    case 'GET': return 'success'
    case 'POST': return 'warning'
    case 'PUT': return 'primary'
    case 'DELETE': return 'danger'
    default: return 'info'
  }
}

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref('create')
const submitLoading = ref(false)
const formRef = ref(null)
const form = reactive({
  id: undefined,
  name: '',
  code: '',
  method: '',
  path: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限Code', trigger: 'blur' }],
  method: [{ required: true, message: '请选择请求方法', trigger: 'change' }],
  path: [{ required: true, message: '请输入接口路径', trigger: 'blur' }],
  description: [{ required: true, message: '请输入权限描述', trigger: 'blur' }]
}

const openCreate = () => {
  dialogType.value = 'create'
  form.id = undefined
  form.name = ''
  form.code = ''
  form.method = ''
  form.path = ''
  form.description = ''
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

const openCopy = (row) => {
  dialogType.value = 'create'
  form.id = undefined
  form.name = row.name
  form.code = row.code
  form.method = row.method
  form.path = row.path
  form.description = row.description
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

const openEdit = (row) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.name = row.name
  form.code = row.code
  form.method = row.method
  form.path = row.path
  form.description = row.description
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (dialogType.value === 'create') {
          await createPermission(form)
          ElMessage.success('添加成功')
        } else {
          await updatePermission(form)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchPermissions()
      } catch (error) {
        console.error('提交失败', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const tableRowClassName = ({ rowIndex }) => {
  return 'animated-row'
}

onMounted(() => {
  fetchPermissions()
})
</script>

<style scoped>
.permission-page {
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

.table-card {
  overflow: hidden;
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
}

.op-actions {
  display: inline-flex;
  gap: 8px;
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
