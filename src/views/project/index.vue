<template>
  <div class="project-page animate-fade-in-up">
    <!-- 工具栏区域：包含搜索、状态筛选、新增和刷新按钮 -->
    <div class="toolbar glass-card">
      <div class="toolbar-left">
        <el-input
          v-model="query.keyword"
          placeholder="搜索项目..."
          clearable
          class="toolbar-item search-input"
          prefix-icon="Search"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="query.status"
          placeholder="状态"
          clearable
          class="toolbar-item status-select"
        >
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="openCreate" class="action-btn">新增项目</el-button>
        <el-button icon="Refresh" @click="fetchProjects" circle class="action-btn" />
      </div>
    </div>

    <!-- 项目列表表格 -->
    <el-card shadow="hover" class="table-card glass-card" :body-style="{ padding: '0px' }">
      <el-table 
        ref="tableRef" 
        v-loading="loading" 
        :data="filteredProjects" 
        row-key="id" 
        style="width: 100%" 
        :header-cell-style="{ background: 'transparent' }"
        :row-class-name="tableRowClassName"
        @header-dragend="handleHeaderDragend"
      >
        <el-table-column prop="name" label="项目名称" min-width="200" show-overflow-tooltip resizable align="center" />
        <el-table-column label="状态" width="120" resizable align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="260" show-overflow-tooltip resizable align="center" />
        <el-table-column prop="principal" label="项目负责人" min-width="150" show-overflow-tooltip resizable align="center" />
        <el-table-column label="成员" width="100" align="center" resizable>
          <template #default="{ row }">
            {{ row.memberCount }}
          </template>
        </el-table-column>
        <!-- 操作列：固定在右侧，禁止拉伸，列名居中，按钮左对齐 -->
        <el-table-column label="操作" width="240" fixed="right" :resizable="false" header-align="center" align="left">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="pagination.pageSizes"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 项目详情抽屉 -->
    <el-drawer v-model="detailVisible" title="项目详情" size="420px" append-to-body>
      <div v-if="currentProject" class="detail">
        <div class="detail-header">
          <div class="detail-title">{{ currentProject.name }}</div>
          <el-tag :type="getStatusType(currentProject.status)">{{ getStatusLabel(currentProject.status) }}</el-tag>
        </div>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="项目ID">{{ currentProject.id }}</el-descriptions-item>
          <el-descriptions-item label="描述">
            <span>{{ currentProject.description || '-' }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 成员管理区域 -->
        <div class="section">
          <div class="section-title">项目成员</div>
          <div class="member-input">
            <el-select
              v-model="selectedMemberIds"
              multiple
              filterable
              remote
              placeholder="搜索并选择成员"
              :remote-method="searchUsers"
              :loading="userLoading"
              style="width: 100%"
              @visible-change="(val) => val && searchUsers('')"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
              <el-option v-if="userHasMore" :value="'__LOAD_MORE__'" style="height: 30px; display: flex; justify-content: center; align-items: center; cursor: default;" disabled>
                <el-button link type="primary" :loading="userLoading" @click.stop="loadMoreUsers">
                  {{ userLoading ? '加载中...' : '加载更多...' }}
                </el-button>
              </el-option>
            </el-select>
            <el-button type="primary" @click="handleAddMembers">添加</el-button>
          </div>
          <div class="member-tags">
            <el-tag
              v-for="m in members"
              :key="m.id"
              closable
              @close="removeMember(m.id)"
              class="member-tag"
            >
              {{ m.name }}
            </el-tag>
            <el-empty v-if="members.length === 0" description="暂无成员" />
          </div>
          <div style="margin-top: 10px; text-align: right;">
            <el-button type="success" size="small" @click="saveProjectMembers">保存成员变更</el-button>
          </div>
        </div>

        <div class="detail-actions">
          <el-button type="primary" @click="openEdit(currentProject)">编辑项目</el-button>
          <el-button type="danger" @click="handleDelete(currentProject)">删除项目</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 项目表单弹窗（新增/编辑） -->
    <el-dialog v-model="formVisible" :title="formMode === 'create' ? '新增项目' : '编辑项目'" width="520px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" clearable style="width: 100%">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createProject, deleteProject, getProjectList, updateProject } from '@/api/project'
import { queryUserInfoByList } from '@/api/user'
import { addListMember } from '@/api/member'
import { Search, Plus, Refresh } from '@element-plus/icons-vue'

// --- 无限滚动指令 v-loadmore ---
const vLoadmore = {
  mounted(el, binding) {
    const selectDropdown = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
    if (selectDropdown) {
      selectDropdown.addEventListener('scroll', () => {
        const condition = selectDropdown.scrollHeight - selectDropdown.scrollTop <= selectDropdown.clientHeight + 1
        if (condition) {
          binding.value()
        }
      })
    }
  }
}

// --- 状态定义 ---
const loading = ref(false) // 表格加载状态
const saving = ref(false)  // 表单保存状态
const projectsRaw = ref([]) // 原始项目列表数据
const tableRef = ref(null) // 表格实例引用

const tableRowClassName = ({ rowIndex }) => {
  return 'animated-row'
}

// --- 表格列宽拖拽逻辑 ---
// 实现邻居列联动拉伸：当拖拽某一列时，自动调整其右侧相邻列的宽度，以保持总宽度不变
const handleHeaderDragend = (newWidth, oldWidth, column, event) => {
  const delta = newWidth - oldWidth
  if (delta === 0) return

  // 获取所有列配置
  const columns = tableRef.value?.store?.states?.columns?.value || []
  const idx = columns.findIndex(c => c.id === column.id)
  
  // 如果找不到列或已经是最后一列，则无法调整下一列
  if (idx === -1 || idx === columns.length - 1) return

  const nextCol = columns[idx + 1]
  // 必须确保下一列有宽度值，如果是自适应列(min-width)，需要取 realWidth
  const nextWidth = nextCol.realWidth || nextCol.width || 0
  
  // 减少下一列的宽度以保持总宽度不变
  // 注意：需要处理最小宽度限制，避免列消失（默认最小40px）
  const minWidth = nextCol.minWidth || 40 
  const targetWidth = Math.max(minWidth, nextWidth - delta)
  
  nextCol.width = targetWidth
}

// --- 筛选与查询 ---
const query = reactive({ keyword: '', status: '' })

// 状态字典配置
const statusOptions = [
  { value: 'ACTIVE', label: '进行中' },
  { value: 'DONE', label: '已完成' },
  { value: 'ARCHIVED', label: '已归档' }
]

// 获取状态显示文本
const getStatusLabel = (status) => {
  const match = statusOptions.find(s => s.value === status)
  return match?.label || status || '-'
}

// 获取状态标签样式类型
const getStatusType = (status) => {
  if (status === 'DONE') return 'success'
  if (status === 'ARCHIVED') return 'info'
  return 'primary'
}

// --- 分页配置 ---
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pageSizes: [10, 20, 50, 100]
})

const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchProjects()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchProjects()
}

const handleSearch = () => {
  pagination.currentPage = 1
  fetchProjects()
}

// --- 数据处理 ---
// 规范化后端返回的项目数据对象
const normalizeProject = (p) => {
  const id = p?.id ?? p?.projectId
  const name = p?.name ?? p?.projectName ?? ''
  const description = p?.description ?? ''
  const status = p?.status ?? ''
  const memberCount = p?.memberCount ?? 0 // 成员数量
  const principal = p?.principal ?? '' // 项目负责人
  // 解析成员列表，如果为 null 则默认为空数组
  const members = Array.isArray(p?.members) 
    ? p.members.map(m => ({ id: m.id, name: m.name, role: m.role || 'MEMBER' }))
    : []
  return { id, name, description, status, memberCount, principal, members, raw: p }
}

// 处理后的项目列表
const projects = computed(() => (Array.isArray(projectsRaw.value) ? projectsRaw.value : []).map(normalizeProject).filter(p => p.id != null))

// 根据搜索条件过滤后的项目列表
const filteredProjects = computed(() => {
  const status = query.status
  return projects.value.filter(p => {
    if (status && p.status !== status) return false
    return true
  })
})

// --- 详情抽屉逻辑 ---
const detailVisible = ref(false)
const currentProjectId = ref(null)

// 当前选中的项目对象
const currentProject = computed(() => {
  if (currentProjectId.value == null) return null
  return projects.value.find(p => p.id === currentProjectId.value) || null
})

// --- 表单逻辑 (新增/编辑) ---
const formVisible = ref(false)
const formMode = ref('create') // 'create' | 'edit'
const formRef = ref(null)
const form = reactive({ id: null, name: '', description: '', status: '' })

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '项目名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// --- 成员管理逻辑 ---
const members = ref([]) // 存储成员对象列表 { id, name }
const selectedMemberIds = ref([]) // 下拉框选中的成员ID列表
const userOptions = ref([]) // 用户选项列表
const userLoading = ref(false) // 远程搜索加载状态

const getMembersKey = (projectId) => `projectMembers:${projectId}`

// 加载成员列表
const loadMembers = (projectId) => {
  if (projectId == null) {
    members.value = []
    return
  }
  
  // 优先从项目数据中获取成员列表
  const project = projects.value.find(p => p.id === projectId)
  if (project && project.members && project.members.length > 0) {
    members.value = [...project.members]
    return
  }

  // 只有在项目数据中没有成员时，才尝试从本地存储加载（兼容旧逻辑，或者作为备选）
  // 实际生产中建议移除本地存储逻辑，完全依赖后端
  const raw = localStorage.getItem(getMembersKey(projectId))
  if (!raw) {
    members.value = []
    return
  }
  try {
    const parsed = JSON.parse(raw)
    // 兼容旧数据（纯字符串数组）和新数据（对象数组）
    members.value = Array.isArray(parsed) 
      ? parsed.map(m => (typeof m === 'string' ? { id: m, name: m } : m)).filter(Boolean)
      : []
  } catch (_) {
    members.value = []
  }
}

// 保存成员列表
const saveMembers = (projectId, list) => {
  if (projectId == null) return
  // 仅更新本地视图状态（如果需要），不再依赖 localStorage 作为持久化
  // 但为了兼容可能的离线/未刷新场景，暂时保留写入 localStorage，但读取优先用 API 数据
  localStorage.setItem(getMembersKey(projectId), JSON.stringify(list))
}

const userPage = ref(1)
const userPageSize = 20
const userHasMore = ref(false)
const userQuery = ref('')

// 远程搜索用户
const searchUsers = async (query) => {
  userQuery.value = query || ''
  userPage.value = 1
  userLoading.value = true
  try {
    const res = await queryUserInfoByList({
      name: userQuery.value,
      page: userPage.value,
      limit: userPageSize
    })
    const list = res?.data || res?.records || []
    userOptions.value = list.map(u => ({
      id: u.id,
      name: u.name || u.username || u.email || 'Unknown'
    }))
    
    // 计算是否还有更多数据
    const total = res?.total ?? res?.data?.total ?? 0
    userHasMore.value = (userPage.value * userPageSize) < total
  } catch (e) {
    console.error('搜索用户失败:', e)
    userOptions.value = []
    userHasMore.value = false
  } finally {
    userLoading.value = false
  }
}

// 加载更多用户
const loadMoreUsers = async () => {
  if (userLoading.value || !userHasMore.value) return
  
  userLoading.value = true
  try {
    userPage.value += 1
    const res = await queryUserInfoByList({
      name: userQuery.value,
      page: userPage.value,
      limit: userPageSize
    })
    const list = res?.data || res?.records || []
    const newOpts = list.map(u => ({
      id: u.id,
      name: u.name || u.username || u.email || 'Unknown'
    }))
    
    // 去重合并
    const existingIds = new Set(userOptions.value.map(u => u.id))
    const uniqueNewOpts = newOpts.filter(u => !existingIds.has(u.id))
    userOptions.value = [...userOptions.value, ...uniqueNewOpts]
    
    const total = res?.total ?? res?.data?.total ?? 0
    userHasMore.value = (userPage.value * userPageSize) < total
  } catch (e) {
    console.error('加载更多用户失败:', e)
  } finally {
    userLoading.value = false
  }
}

// 添加选中的成员
const handleAddMembers = () => {
  if (!selectedMemberIds.value.length) return
  
  const newMembers = []
  selectedMemberIds.value.forEach(id => {
    // 避免重复添加
    if (!members.value.some(m => m.id === id)) {
      const user = userOptions.value.find(u => u.id === id)
      if (user) {
        newMembers.push({ ...user, role: 'MEMBER' })
      }
    }
  })

  if (newMembers.length > 0) {
    // 仅更新前端视图，不调用后端接口
    members.value = [...members.value, ...newMembers]
    ElMessage.success(`已添加到列表（需点击保存生效）`)
    // 清空选择
    selectedMemberIds.value = []
  }
}

// 移除成员
const removeMember = (memberId) => {
  // 仅更新前端视图
  members.value = members.value.filter(m => m.id !== memberId)
}

// 保存成员变更
const saveProjectMembers = async () => {
  if (!currentProjectId.value) return

  try {
    const originalMembers = currentProject.value?.members || []
    const currentMembers = members.value
    
    const payloadMembers = []
    const processedIds = new Set()

    // 1. 处理原有成员 (保留或删除)
    originalMembers.forEach(orig => {
      const curr = currentMembers.find(m => m.id === orig.id)
      if (curr) {
        // 仍存在 -> 保留 (deleted: 0)
        payloadMembers.push({
          userId: curr.id,
          role: curr.role || orig.role || 'MEMBER',
          deleted: 0
        })
        processedIds.add(curr.id)
      } else {
        // 不存在 -> 删除 (deleted: 1)
        payloadMembers.push({
          userId: orig.id,
          role: orig.role || 'MEMBER',
          deleted: 1
        })
      }
    })

    // 2. 处理新增成员
    currentMembers.forEach(curr => {
      if (!processedIds.has(curr.id)) {
        // 原有列表里没有 -> 新增 (deleted: 0)
        payloadMembers.push({
          userId: curr.id,
          role: curr.role || 'MEMBER',
          deleted: 0
        })
      }
    })

    const payload = {
      projectId: currentProjectId.value,
      members: payloadMembers
    }
    
    await addListMember(payload)
    ElMessage.success('成员信息保存成功')
    
    // 刷新项目列表以获取最新数据（包括成员）
    await fetchProjects()
    
    // 重新加载成员数据
    loadMembers(currentProjectId.value)
    
  } catch (e) {
    console.error('保存成员失败:', e)
  }
}

// 监听详情抽屉打开，重置选项
watch(detailVisible, (val) => {
  if (val) {
    selectedMemberIds.value = []
    searchUsers('') // 默认加载一页
  }
})

// 监听当前项目ID变化，自动加载对应成员
watch(currentProjectId, (id) => loadMembers(id), { immediate: true })

// --- 核心业务方法 ---

// 获取项目列表
const fetchProjects = async () => {
  loading.value = true
  try {
    const params = {
      name: query.keyword,
      page: pagination.currentPage,
      limit: pagination.pageSize
    }
    const res = await getProjectList(params)
    if (res && res.data) {
      projectsRaw.value = Array.isArray(res.data) ? res.data : []
      pagination.total = res.total || 0
    } else {
      projectsRaw.value = []
      pagination.total = 0
    }
  } catch (e) {
    console.error('加载项目失败', e)
    projectsRaw.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 组件挂载时自动拉取数据
onMounted(fetchProjects)

// 打开详情页
const openDetail = (row) => {
  currentProjectId.value = row.id
  detailVisible.value = true
}

// 打开新增弹窗
const openCreate = () => {
  formMode.value = 'create'
  form.id = null
  form.name = ''
  form.description = ''
  form.status = ''
  formVisible.value = true
  formRef.value?.clearValidate?.()
}

// 打开编辑弹窗
const openEdit = (row) => {
  formMode.value = 'edit'
  form.id = row.id
  form.name = row.name
  form.description = row.description
  form.status = row.status
  formVisible.value = true
  formRef.value?.clearValidate?.()
}

// 提交表单（新增或更新）
const submitForm = async () => {
  try {
    await formRef.value?.validate?.()
  } catch (_) {
    return
  }

  const payload = {
    name: form.name,
    projectName: form.name,
    description: form.description,
    status: form.status || undefined
  }

  saving.value = true
  try {
    if (formMode.value === 'create') {
      await createProject(payload)
      ElMessage.success('项目已创建')
    } else {
      await updateProject(form.id, payload)
      ElMessage.success('项目已更新')
    }
    formVisible.value = false
    await fetchProjects()
  } catch (e) {
    ElMessage.error(e?.message || (formMode.value === 'create' ? '创建失败' : '更新失败'))
  } finally {
    saving.value = false
  }
}

// 删除项目
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除项目「${row.name}」吗？`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch (_) {
    return
  }

  try {
    await deleteProject(row.id)
    ElMessage.success('项目已删除')
    // 如果删除的是当前详情页展示的项目，关闭详情页
    if (currentProjectId.value === row.id) {
      detailVisible.value = false
      currentProjectId.value = null
    }
    localStorage.removeItem(getMembersKey(row.id))
    await fetchProjects()
  } catch (e) {
    console.error('删除失败', e)
  }
}

</script>

<style scoped>
.project-page {
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

.toolbar-item {
  width: 200px;
}

.search-input {
  width: 240px;
}

.status-select {
  width: 150px;
}

.table-card {
  overflow: hidden;
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.member-input {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.member-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.member-tag {
  max-width: 100%;
}

.detail-actions {
  display: flex;
  gap: 12px;
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