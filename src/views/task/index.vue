<template>
  <div class="app-container">
    <!-- 顶部筛选栏 -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="所属项目">
          <el-select v-model="queryParams.projectId" placeholder="选择项目" clearable @change="fetchTasks" style="width: 240px">
            <el-option
              v-for="item in projectOptions"
              :key="item.id"
              :label="item.name || item.projectName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchTasks">查询</el-button>
          <el-button type="success" @click="handleCreate">新建任务</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-radio-group v-model="viewMode">
            <el-radio-button label="list">列表视图</el-radio-button>
            <el-radio-button label="kanban">看板视图</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'" v-loading="loading">
      <el-table ref="tableRef" :data="taskList" border style="width: 100%" @header-dragend="handleHeaderDragend">
        <el-table-column prop="title" label="任务标题" align="center"  min-width="200"  />
        <el-table-column prop="priority" label="优先级" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">{{ getPriorityLabel(row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="dark">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行人" align="center" min-width="160">
          <template #default="{ row }">
            <span v-if="Array.isArray(row.members) && row.members.length">
              {{ row.members.map(m => m.name).join('、') }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="180" />
        <el-table-column label="操作" width="240" align="center" fixed="right" :resizable="false">
          <template #default="scope">
            <span class="op-actions">
              <el-dropdown @command="cmd => handleChangeStatus(scope.row, cmd)">
                <el-button size="small" :type="getStatusType(scope.row.status)">状态</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="'TODO'" :disabled="isStatusDisabled(scope.row.status, 'TODO')">TODO</el-dropdown-item>
                    <el-dropdown-item :command="'DOING'" :disabled="isStatusDisabled(scope.row.status, 'DOING')">DOING</el-dropdown-item>
                    <el-dropdown-item :command="'DONE'" :disabled="isStatusDisabled(scope.row.status, 'DONE')">DONE</el-dropdown-item>
                    <el-dropdown-item :command="'BLOCKED'" :disabled="isStatusDisabled(scope.row.status, 'BLOCKED')">BLOCKED</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button link type="success" @click="openAssign(scope.row)">指派</el-button>
              <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 看板视图 -->
    <div v-else class="kanban-container" v-loading="loading">
      <!-- 空状态提示 -->
      <div v-if="taskList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无任务数据">
          <el-button type="primary" @click="handleCreate">新建任务</el-button>
        </el-empty>
      </div>
      
      <!-- 看板列 -->
      <template v-else>
        <div v-for="status in statusList" :key="status.key" class="kanban-column">
          <div class="kanban-header" :class="'header-' + status.type">
            {{ status.label }} ({{ getTasksByStatus(status.key).length }})
          </div>
          <div class="kanban-body">
            <el-card 
              v-for="task in getTasksByStatus(status.key)" 
              :key="task.id" 
              class="kanban-card" 
              shadow="hover"
              @click="handleEdit(task)"
            >
              <div class="card-title">{{ task.title }}</div>
              <div class="card-meta">
                <el-tag size="small" :type="getPriorityType(task.priority)">{{ getPriorityLabel(task.priority) }}</el-tag>
                <span class="due-date">{{ task.deadline }}</span>
              </div>
              </el-card>
          </div>
        </div>
      </template>
    </div>

    <!-- 任务编辑/新建弹窗 -->
    <el-dialog
      :title="dialogType === 'create' ? '新建任务' : '编辑任务'"
      v-model="dialogVisible"
      width="50%"
    >
      <el-form :model="form" label-width="100px" ref="taskFormRef">
        <el-form-item label="所属项目" required>
          <el-select v-model="form.projectId" placeholder="请选择项目" style="width: 100%" :disabled="dialogType === 'edit'">
            <el-option
              v-for="item in projectOptions"
              :key="item.id"
              :label="item.name || item.projectName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务标题" required>
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="优先级">
              <el-select v-model="form.priority">
                <el-option label="紧急" :value="1" />
                <el-option label="高" :value="2" />
                <el-option label="中" :value="3" />
                <el-option label="低" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" :disabled="dialogType === 'edit'">
                <el-option label="TODO" value="TODO" />
                <el-option label="DOING" value="DOING" />
                <el-option label="DONE" value="DONE" />
                <el-option label="BLOCKED" value="BLOCKED" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="form.deadline"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="dialogType === 'create'" label="任务指派">
          <el-select
            v-model="form.assigneeIds"
            multiple
            filterable
            remote
            :remote-method="searchUsers"
            :loading="userLoading"
            style="width: 100%"
            @visible-change="(val) => val && searchUsers('')"
          >
            <el-option
              v-for="u in userOptions"
              :key="u.id"
              :label="u.name"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 任务指派弹窗 -->
    <el-dialog v-model="assignDialogVisible" title="任务指派" width="420px">
      <el-form label-width="90px">
        <el-form-item label="选择成员">
          <el-select
            v-model="assignSelectedIds"
            multiple
            filterable
            remote
            :remote-method="searchUsers"
            :loading="userLoading"
            style="width: 100%"
            @visible-change="(val) => val && searchUsers('')"
          >
            <el-option
              v-for="u in userOptions"
              :key="u.id"
              :label="u.name"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAssign">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getTaskList, createTask, updateTask, deleteTask, taskAssignee } from '@/api/task'
import { getProjectList } from '@/api/project'
import { queryUserInfoByList } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 数据定义 ---
const loading = ref(false)
const taskList = ref([])
const tableRef = ref(null)

const handleHeaderDragend = (newWidth, oldWidth, column, event) => {
  const delta = newWidth - oldWidth
  if (delta === 0) return

  const columns = tableRef.value?.store?.states?.columns?.value || []
  const idx = columns.findIndex(c => c.id === column.id)
  
  if (idx === -1 || idx === columns.length - 1) return

  const nextCol = columns[idx + 1]
  const nextWidth = nextCol.realWidth || nextCol.width || 0
  
  const minWidth = nextCol.minWidth || 40 
  const targetWidth = Math.max(minWidth, nextWidth - delta)
  
  nextCol.width = targetWidth
}

const projectOptions = ref([]) // 项目下拉框数据
const viewMode = ref('list') // 视图模式: 'list' | 'kanban'
const queryParams = reactive({
  projectId: null
})

// --- 弹窗控制 ---
const dialogVisible = ref(false)
const dialogType = ref('create') // 'create' | 'edit'
const form = reactive({
  id: null,
  projectId: null,
  title: '',
  description: '',
  priority: null,
  status: null,
  deadline: null
  , assigneeIds: []
})

// --- 状态常量（用于看板）---
const statusList = [
  { key: 'TODO', label: '待处理', type: 'primary' },
  { key: 'DOING', label: '进行中', type: 'primary' },
  { key: 'DONE', label: '已完成', type: 'success' },
  { key: 'BLOCKED', label: '阻塞', type: 'danger' }
]

// --- 初始化 ---
onMounted(async () => {
  await loadProjects()
  fetchTasks()
})

/**
 * 获取项目列表（用于下拉框）
 * 默认选中第一个项目
 */
const loadProjects = async () => {
  try {
    // 获取项目列表（下拉框用，获取第一页数据）
    const res = await getProjectList({ page: 1, limit: 100 })
    // 如果返回的是分页结构 { records: [], total: 0 }，取 records
    const list = res.records || res.data || res || []
    projectOptions.value = Array.isArray(list) ? list : []
    // 默认选中第一个项目（如果有）
    if (projectOptions.value.length > 0) {
      queryParams.projectId = projectOptions.value[0].id
      // 自动加载该项目的任务
      await fetchTasks()
    }
  } catch (error) {
    console.error('加载项目列表失败:', error)
    ElMessage.error('加载项目列表失败')
  }
}

/**
 * 获取任务数据
 * 根据 queryParams.projectId 查询
 */
const fetchTasks = async () => {
  // 如果没有选择项目，显示提示信息
  if (!queryParams.projectId) {
    taskList.value = []
    ElMessage.info('请先选择一个项目')
    return
  }
  
  loading.value = true
  try {
    const res = await getTaskList(queryParams)
    taskList.value = res || []
    
    // 如果切换到看板视图且没有任务，给出提示
    if (viewMode.value === 'kanban' && taskList.value.length === 0) {
      ElMessage.info('该项目暂无任务，可以点击"新建任务"来创建')
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
    taskList.value = []
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 看板辅助函数：按状态过滤任务
 * @param {string} status 
 */
const getTasksByStatus = (status) => {
  if (status === 'DOING') {
    return taskList.value.filter(t => t.status === 'DOING' || t.status === 'IN_PROGRESS')
  }
  return taskList.value.filter(t => t.status === status)
}

const statusOrder = { TODO: 0, DOING: 1, DONE: 2 }
const isStatusDisabled = (current, target) => {
  if (!current || !target) return false
  if (current === target) return true
  if (current === 'DONE') return true
  if (statusOrder[target] !== undefined && statusOrder[current] !== undefined && statusOrder[target] < statusOrder[current]) return true
  if (current === 'DONE' && target === 'BLOCKED') return true
  if (current === 'BLOCKED' && target === 'TODO') return true
  return false
}
const handleChangeStatus = async (row, nextStatus) => {
  if (isStatusDisabled(row.status, nextStatus)) return
  try {
    await updateTaskStatus(row.id, nextStatus)
    ElMessage.success('状态已更新')
    fetchTasks()
  } catch (e) {}
}

const userOptions = ref([])
const userLoading = ref(false)
const searchUsers = async (name) => {
  userLoading.value = true
  try {
    const res = await queryUserInfoByList({ name, page: 1, limit: 20 })
    const list = res?.records || res?.data || res || []
    userOptions.value = Array.isArray(list)
      ? list.map(x => ({ id: x.id, name: x.name || x.username || x.nickName || '' }))
      : []
  } finally {
    userLoading.value = false
  }
}

const assignDialogVisible = ref(false)
const assignRow = ref(null)
const assignSelectedIds = ref([])
const openAssign = (row) => {
  assignRow.value = row
  const ids = Array.isArray(row?.assigneeIds)
    ? row.assigneeIds
    : Array.isArray(row?.assignees)
      ? row.assignees.map(a => a.id)
      : []
  assignSelectedIds.value = ids
  assignDialogVisible.value = true
}
const submitAssign = async () => {
  if (!assignRow.value) return
  try {
    await taskAssignee(assignRow.value.id, assignSelectedIds.value)
    ElMessage.success('指派已更新')
    assignDialogVisible.value = false
    fetchTasks()
  } catch (e) {}
}

/**
 * 打开新建弹窗
 */
const handleCreate = () => {
  dialogType.value = 'create'
  // 重置表单，保留当前选中的 projectId
  Object.assign(form, {
    id: null,
    projectId: queryParams.projectId,
    title: '',
    description: '',
    priority: null,
    status: null,
    deadline: null,
    assigneeIds: []
  })
  dialogVisible.value = true
}

/**
 * 打开编辑弹窗
 * @param {Object} row 
 */
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

/**
 * 提交表单
 * 处理新建和更新逻辑
 */
const submitForm = async () => {
  if (!form.title || !form.projectId) {
    ElMessage.warning('请填写必要信息')
    return
  }
  
  try {
    if (dialogType.value === 'create') {
      // 创建任务时去掉 id 参数
      const { id, assigneeIds, ...createPayload } = form
      const res = await createTask(createPayload)
      const newId = res?.id ?? res?.data?.id ?? res?.taskId ?? res?.data?.taskId
      if (newId && Array.isArray(assigneeIds) && assigneeIds.length > 0) {
        await taskAssignee(newId, assigneeIds)
      }
      ElMessage.success('创建成功')
    } else {
      const { assigneeIds, ...payload } = form
      await updateTask(form.id, payload)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchTasks()
  } catch (error) {
    // 错误处理由拦截器统一完成
  }
}

/**
 * 删除任务
 * @param {number} id 
 */
const handleDelete = (id) => {
  ElMessageBox.confirm('确定删除该任务吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteTask(id)
    ElMessage.success('删除成功')
    fetchTasks()
  })
}

// --- 样式辅助 ---
const priorityMap = {
  1: { label: '紧急', type: 'danger' },
  2: { label: '高', type: 'warning' },
  3: { label: '中', type: 'primary' },
  4: { label: '低', type: 'info' }
}
const getPriorityLabel = (val) => {
  return priorityMap[val]?.label || val
}
const getPriorityType = (val) => {
  return priorityMap[val]?.type || ''
}

const getStatusType = (val) => {
  const map = { TODO: 'primary', DOING: 'primary', IN_PROGRESS: 'primary', DONE: 'success', BLOCKED: 'danger' }
  return map[val] || ''
}
</script>

<style scoped>
.app-container { padding: 20px; }
.filter-container { margin-bottom: 20px; }

/* 看板样式 */
.kanban-container {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px;
}
.kanban-column {
  flex: 1;
  min-width: 300px;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
}
.kanban-header {
  font-weight: bold;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  text-align: center;
  color: white;
}
.header-info { background-color: #909399; }
.header-primary { background-color: #409eff; }
.header-success { background-color: #67c23a; }
.header-danger { background-color: #F56C6C; }

.kanban-card {
  margin-bottom: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}
.kanban-card:hover {
  transform: translateY(-2px);
}
.card-title {
  font-weight: bold;
  margin-bottom: 8px;
}
.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
}

/* 空状态样式 */
.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
 
/* 操作列按钮间距与对齐 */
.op-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
/* 移除默认按钮/下拉外边距，确保统一由 gap 控制 */
.op-actions :deep(.el-button) {
  margin: 0 !important;
}
.op-actions :deep(.el-dropdown) {
  margin: 0 !important;
}
</style>
