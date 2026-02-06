<template>
  <div class="project-page">
    <div class="toolbar">
      <el-input
        v-model="query.keyword"
        placeholder="搜索项目"
        clearable
        class="toolbar-item"
        @keyup.enter="fetchProjects"
        @clear="fetchProjects"
      />
      <el-select
        v-model="query.status"
        placeholder="状态"
        clearable
        class="toolbar-item"
        @change="fetchProjects"
      >
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button type="primary" @click="openCreate">新增项目</el-button>
      <el-button @click="fetchProjects">刷新</el-button>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="filteredProjects" row-key="id" style="width: 100%">
        <el-table-column prop="name" label="项目名称" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="260" show-overflow-tooltip />
        <el-table-column label="成员" width="100" align="center">
          <template #default="{ row }">
            {{ getMemberCount(row.id) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer v-model="detailVisible" title="项目详情" size="420px">
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

        <div class="section">
          <div class="section-title">项目成员</div>
          <div class="member-input">
            <el-input v-model="memberInput" placeholder="输入成员标识（用户名/邮箱）" @keyup.enter="addMember" />
            <el-button type="primary" @click="addMember">添加</el-button>
          </div>
          <div class="member-tags">
            <el-tag
              v-for="m in members"
              :key="m"
              closable
              @close="removeMember(m)"
              class="member-tag"
            >
              {{ m }}
            </el-tag>
            <el-empty v-if="members.length === 0" description="暂无成员" />
          </div>
        </div>

        <div class="detail-actions">
          <el-button type="primary" @click="openEdit(currentProject)">编辑项目</el-button>
          <el-button type="danger" @click="handleDelete(currentProject)">删除项目</el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog v-model="formVisible" :title="formMode === 'create' ? '新增项目' : '编辑项目'" width="520px">
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createProject, deleteProject, getProjectList, updateProject } from '@/api/project'

const loading = ref(false)
const saving = ref(false)
const projectsRaw = ref([])
const query = reactive({ keyword: '', status: '' })

const statusOptions = [
  { value: 'ACTIVE', label: '进行中' },
  { value: 'DONE', label: '已完成' },
  { value: 'ARCHIVED', label: '已归档' }
]

const getStatusLabel = (status) => {
  const match = statusOptions.find(s => s.value === status)
  return match?.label || status || '-'
}

const getStatusType = (status) => {
  if (status === 'DONE') return 'success'
  if (status === 'ARCHIVED') return 'info'
  return 'primary'
}

const normalizeProject = (p) => {
  const id = p?.id ?? p?.projectId
  const name = p?.name ?? p?.projectName ?? ''
  const description = p?.description ?? ''
  const status = p?.status ?? ''
  return { id, name, description, status, raw: p }
}

const projects = computed(() => (Array.isArray(projectsRaw.value) ? projectsRaw.value : []).map(normalizeProject).filter(p => p.id != null))

const filteredProjects = computed(() => {
  const keyword = query.keyword.trim().toLowerCase()
  const status = query.status
  return projects.value.filter(p => {
    if (status && p.status !== status) return false
    if (!keyword) return true
    return (p.name || '').toLowerCase().includes(keyword) || (p.description || '').toLowerCase().includes(keyword)
  })
})

const detailVisible = ref(false)
const currentProjectId = ref(null)

const currentProject = computed(() => {
  if (currentProjectId.value == null) return null
  return projects.value.find(p => p.id === currentProjectId.value) || null
})

const formVisible = ref(false)
const formMode = ref('create')
const formRef = ref(null)
const form = reactive({ id: null, name: '', description: '', status: '' })

const rules = {
  name: [
    { required: true, message: '项目名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

const members = ref([])
const memberInput = ref('')

const getMembersKey = (projectId) => `projectMembers:${projectId}`

const loadMembers = (projectId) => {
  if (projectId == null) {
    members.value = []
    return
  }
  const raw = localStorage.getItem(getMembersKey(projectId))
  if (!raw) {
    members.value = []
    return
  }
  try {
    const parsed = JSON.parse(raw)
    members.value = Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch (_) {
    members.value = []
  }
}

const saveMembers = (projectId, list) => {
  if (projectId == null) return
  localStorage.setItem(getMembersKey(projectId), JSON.stringify(list))
}

const getMemberCount = (projectId) => {
  const raw = localStorage.getItem(getMembersKey(projectId))
  if (!raw) return 0
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(Boolean).length : 0
  } catch (_) {
    return 0
  }
}

watch(currentProjectId, (id) => loadMembers(id), { immediate: true })

const fetchProjects = async () => {
  loading.value = true
  try {
    const res = await getProjectList()
    projectsRaw.value = Array.isArray(res) ? res : []
  } catch (e) {
    ElMessage.error(e?.message || '加载项目失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchProjects)

const openDetail = (row) => {
  currentProjectId.value = row.id
  detailVisible.value = true
}

const openCreate = () => {
  formMode.value = 'create'
  form.id = null
  form.name = ''
  form.description = ''
  form.status = ''
  formVisible.value = true
  formRef.value?.clearValidate?.()
}

const openEdit = (row) => {
  formMode.value = 'edit'
  form.id = row.id
  form.name = row.name
  form.description = row.description
  form.status = row.status
  formVisible.value = true
  formRef.value?.clearValidate?.()
}

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
    if (currentProjectId.value === row.id) {
      detailVisible.value = false
      currentProjectId.value = null
    }
    localStorage.removeItem(getMembersKey(row.id))
    await fetchProjects()
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
  }
}

const addMember = () => {
  const value = memberInput.value.trim()
  if (!value) return
  if (!currentProjectId.value) return
  if (members.value.includes(value)) {
    memberInput.value = ''
    return
  }
  const next = [...members.value, value]
  members.value = next
  saveMembers(currentProjectId.value, next)
  memberInput.value = ''
}

const removeMember = (m) => {
  if (!currentProjectId.value) return
  const next = members.value.filter(x => x !== m)
  members.value = next
  saveMembers(currentProjectId.value, next)
}
</script>

<style scoped>
.project-page {
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.toolbar-item {
  width: 240px;
}

.table-card {
  border: none;
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
</style>
