<template>
  <div class="role-page animate-fade-in-up">
    <!-- 工具栏 -->
    <div class="toolbar glass-card">
      <div class="toolbar-left">
        <el-input 
          v-model="query.name" 
          placeholder="搜索角色名称..." 
          clearable 
          class="search-input" 
          prefix-icon="Search"
          @keyup.enter="handleSearch"
          @clear="handleSearch" 
        />
        <el-select v-model="query.status" placeholder="状态" clearable class="status-select" @change="handleSearch">
          <el-option label="启用" :value="0" />
          <el-option label="禁用" :value="1" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="openCreate" class="action-btn">新增角色</el-button>
        <el-button icon="Refresh" @click="handleSearch" circle class="action-btn" />
      </div>
    </div>

    <!-- 表格 -->
    <el-card shadow="hover" class="table-card glass-card" :body-style="{ padding: '0px' }">
      <el-table 
        v-loading="loading" 
        :data="roleList" 
        style="width: 100%" 
        :header-cell-style="{ background: 'transparent' }"
        :row-class-name="tableRowClassName"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="name" label="角色名称" min-width="120" align="center" />
        <el-table-column prop="code" label="角色编码" min-width="120" align="center" />
        <el-table-column prop="description" label="描述" min-width="180" align="center" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="0"
              :inactive-value="1"
              inline-prompt
              active-text="启"
              inactive-text="禁"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div class="op-actions">
              <el-button link type="primary" @click="openMembers(row)">成员管理</el-button>
              <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
              <el-popconfirm title="确认删除该角色吗？" @confirm="handleDelete(row)">
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
      :title="dialogType === 'create' ? '新增角色' : '编辑角色'" 
      width="500px"
      append-to-body
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" placeholder="如：ADMIN" />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio-button :value="0">启用</el-radio-button>
            <el-radio-button :value="1">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 成员管理弹窗 -->
    <el-dialog 
      v-model="memberDialogVisible" 
      title="角色成员管理" 
      width="850px"
      append-to-body
      destroy-on-close
      class="custom-dialog"
    >
      <div class="dialog-header-info">
        <el-alert
          :title="`正在管理角色【${currentRole?.name || ''}】的成员`"
          type="info"
          show-icon
          :closable="false"
          class="role-info-alert"
        />
      </div>
      <div class="member-toolbar" style="margin-top: 15px;">
        <div style="display: flex; gap: 10px;">
          <el-button type="primary" icon="Plus" @click="openAddMember">添加人员</el-button>
          <el-button type="danger" icon="Delete" plain :disabled="selectedMembers.length === 0" @click="handleBatchRemoveMembers">批量移除</el-button>
          <el-button type="warning" icon="DeleteFilled" plain @click="handleRemoveAllMembers">一键移除所有</el-button>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
             <el-input 
               v-model="memberSearchName" 
               placeholder="搜索成员姓名..." 
               clearable 
               style="width: 240px;" 
               prefix-icon="Search"
               @keyup.enter="handleMemberSearch" 
               @clear="handleMemberSearch" 
             />
             <el-button type="primary" @click="handleMemberSearch">搜索</el-button>
        </div>
      </div>
      <el-table 
        :data="memberList" 
        v-loading="memberLoading" 
        style="width: 100%" 
        height="400" 
        @selection-change="handleMemberSelectionChange"
        stripe
        border
        :header-cell-style="{ background: '#f8f9fa', color: '#606266' ,textAlign: 'center' }"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="name" label="姓名" min-width="120" align="center" show-overflow-tooltip />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
             <el-popconfirm title="确认移除该成员吗？" @confirm="handleRemoveMember(row)" width="200px">
                <template #reference>
                  <el-button link type="danger">移除</el-button>
                </template>
              </el-popconfirm>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无成员数据" :image-size="80" />
        </template>
      </el-table>
      <div class="dialog-pagination">
         <el-pagination 
          v-model:current-page="memberPagination.currentPage" 
          v-model:page-size="memberPagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="memberPagination.total" 
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchMembers"
          @current-change="fetchMembers" 
        />
      </div>
    </el-dialog>

    <!-- 添加人员选择弹窗 -->
    <el-dialog
      v-model="userSelectVisible"
      title="选择人员"
      width="800px"
      append-to-body
      class="custom-dialog"
    >
      <div class="member-toolbar search-bar" style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 10px; flex: 1;">
          <el-input 
            v-model="userSearchQuery" 
            placeholder="搜索用户名或姓名..." 
            clearable 
            prefix-icon="Search"
            style="width: 280px;"
            @keyup.enter="fetchUserOptions"
            @clear="fetchUserOptions"
          />
          <el-button type="primary" @click="fetchUserOptions">搜索</el-button>
        </div>
        <el-button type="success" plain icon="Check" @click="handleSelectAll" :loading="selectAllLoading">一键全选</el-button>
      </div>
      <el-table 
        ref="userTableRef"
        :data="userOptions" 
        v-loading="userOptionsLoading" 
        height="380"
        row-key="id"
        @selection-change="handleSelectionChange"
        stripe
        border
        :header-cell-style="{ background: '#f8f9fa', color: '#606266' }"
      >
        <el-table-column type="selection" width="55" :reserve-selection="true" align="center" :selectable="checkSelectable" />
        <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="name" label="姓名" min-width="120" show-overflow-tooltip />
        <template #empty>
          <el-empty description="未搜索到可选人员" :image-size="80" />
        </template>
      </el-table>
       <div class="dialog-pagination">
         <el-pagination 
          v-model:current-page="userOptionsPagination.currentPage" 
          v-model:page-size="userOptionsPagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="userOptionsPagination.total" 
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchUserOptions"
          @current-change="fetchUserOptions" 
        />
      </div>
      <template #footer>
        <div class="dialog-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 14px; color: #606266;">
            已选择 <span style="color: #409eff; font-weight: bold; font-size: 16px; margin: 0 4px;">{{ selectedUsers.length }}</span> 名成员
          </div>
          <div>
            <el-button @click="userSelectVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmAddMembers" :loading="addMemberLoading" :disabled="selectedUsers.length === 0">确定添加</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { queryRoleByList, createRole, updateRole, updateRoleStatus, deleteRole } from '@/api/role'
import { queryUserRoleList, addUserRole, deleteUserRole } from '@/api/userRole'
import { queryUserInfoByList } from '@/api/user' // 用于选择人员弹窗
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Refresh, Delete, Check } from '@element-plus/icons-vue'

// --- 角色列表相关 ---
const loading = ref(false)
const roleList = ref([])
const query = reactive({
  name: '',
  status: 0
})
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const fetchRoles = async () => {
  loading.value = true
  try {
    const params = {
      name: query.name,
      status: query.status,
      page: pagination.currentPage,
      limit: pagination.pageSize
    }
    const res = await queryRoleByList(params)
    if (res && (res.records || res.data)) {
      roleList.value = res.records || res.data
      pagination.total = res.total || 0
    } else {
      roleList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  fetchRoles()
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchRoles()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchRoles()
}

// --- 状态变更 ---
const handleStatusChange = async (row) => {
  try {
    await updateRoleStatus({ roleId: row.id, status: row.status })
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === 0 ? 1 : 0 // 恢复原状
    console.error('更新状态失败', error)
  }
}

// --- 删除角色 ---
const handleDelete = async (row) => {
  try {
    await deleteRole({ id: row.id })
    ElMessage.success('删除成功')
    fetchRoles()
  } catch (error) {
    console.error('删除失败', error)
  }
}

// --- 新增/编辑弹窗 ---
const dialogVisible = ref(false)
const dialogType = ref('create')
const submitLoading = ref(false)
const formRef = ref(null)
const form = reactive({
  id: undefined,
  code: '',
  name: '',
  description: '',
  status: 0
})
const rules = {
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const openCreate = () => {
  dialogType.value = 'create'
  form.id = undefined
  form.code = ''
  form.name = ''
  form.description = ''
  form.status = 0
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

const openEdit = (row) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.code = row.code
  form.name = row.name
  form.description = row.description
  form.status = row.status
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
          await createRole(form)
          ElMessage.success('新增成功')
        } else {
          await updateRole(form)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchRoles()
      } catch (error) {
        console.error('提交失败', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// --- 成员管理 ---
const memberDialogVisible = ref(false)
const currentRole = ref(null)
const memberList = ref([])
const memberLoading = ref(false)
const memberSearchName = ref('')
const selectedMembers = ref([])
const memberPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const openMembers = (row) => {
  currentRole.value = row
  memberDialogVisible.value = true
  memberPagination.currentPage = 1
  memberSearchName.value = ''
  selectedMembers.value = []
  fetchMembers()
}

const handleMemberSearch = () => {
  memberPagination.currentPage = 1
  fetchMembers()
}

const handleMemberSelectionChange = (val) => {
  selectedMembers.value = val
}

const handleBatchRemoveMembers = () => {
   if (selectedMembers.value.length === 0) return
   ElMessageBox.confirm(
     `确认移除选中的 ${selectedMembers.value.length} 名成员吗？`,
     '批量移除',
     {
       confirmButtonText: '确定',
       cancelButtonText: '取消',
       type: 'warning'
     }
   ).then(async () => {
     try {
       const userIdList = selectedMembers.value.map(u => u.id)
       await deleteUserRole({ 
         roleId: currentRole.value.id, 
         userIdList 
       })
       ElMessage.success('批量移除成功')
       selectedMembers.value = []
       fetchMembers()
     } catch (error) {
       console.error('批量移除失败', error)
     }
   }).catch(() => {})
 }

const handleRemoveAllMembers = () => {
  ElMessageBox.confirm(
    `确认移除角色【${currentRole.value.name}】下的所有成员吗？此操作不可恢复！`,
    '一键移除所有',
    {
      confirmButtonText: '确定移除',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(async () => {
    try {
      // 先获取所有成员
      let allMembers = []
      let page = 1
      const limit = 500
      while (true) {
        const res = await queryUserRoleList({
          roleId: currentRole.value.id,
          page,
          limit
        })
        const list = res?.records || res?.data || []
        allMembers = allMembers.concat(list)
        if (list.length < limit || list.length === 0) break
        page++
      }
      
      if (allMembers.length === 0) {
         ElMessage.warning('当前角色没有成员');
         return;
      }
      
      const allIds = allMembers.map(u => u.id);
      for (let i = 0; i < allIds.length; i += 500) {
        const batchIds = allIds.slice(i, i + 500);
        await deleteUserRole({ 
          roleId: currentRole.value.id, 
          userIdList: batchIds
        });
      }
      
      ElMessage.success('一键移除所有成员成功');
      selectedMembers.value = [];
      fetchMembers();
    } catch (error) {
      console.error('一键移除所有成员失败', error);
      ElMessage.error('一键移除所有成员失败');
    }
  }).catch(() => {});
}

const fetchMembers = async () => {
  memberLoading.value = true
  try {
    const params = {
      roleId: currentRole.value.id,
      name: memberSearchName.value, // 增加了 name 参数
      page: memberPagination.currentPage,
      limit: memberPagination.pageSize
    }
    const res = await queryUserRoleList(params)
    if (res && (res.records || res.data)) {
      memberList.value = res.records || res.data
      memberPagination.total = res.total || 0
    } else {
      memberList.value = []
      memberPagination.total = 0
    }
  } catch (error) {
    console.error('获取成员失败', error)
  } finally {
    memberLoading.value = false
  }
}

const handleRemoveMember = async (row) => {
  try {
    await deleteUserRole({ 
      roleId: currentRole.value.id, 
      userIdList: [row.id] 
    })
    ElMessage.success('移除成功')
    fetchMembers()
  } catch (error) {
    console.error('移除失败', error)
  }
}

// --- 添加人员弹窗 ---
const userSelectVisible = ref(false)
const userSearchQuery = ref('')
const userOptions = ref([])
const userOptionsLoading = ref(false)
const selectedUsers = ref([])
const addMemberLoading = ref(false)
const selectAllLoading = ref(false)
const userTableRef = ref(null)
const userOptionsPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const allRoleMemberIds = ref(new Set())

const openAddMember = async () => {
  userSelectVisible.value = true
  userSearchQuery.value = ''
  selectedUsers.value = []
  userOptionsPagination.currentPage = 1
  nextTick(() => {
    userTableRef.value?.clearSelection()
  })
  
  // 预先获取当前角色下的所有成员ID
  try {
    allRoleMemberIds.value = new Set()
    let page = 1
    const limit = 500
    while (true) {
      const res = await queryUserRoleList({
        roleId: currentRole.value.id,
        page,
        limit
      })
      const list = res?.records || res?.data || []
      list.forEach(m => allRoleMemberIds.value.add(m.id))
      if (list.length < limit || list.length === 0) break
      page++
    }
  } catch(e) {
    console.error('获取现有成员失败', e)
  }
  
  fetchUserOptions()
}

const checkSelectable = (row) => {
  return !allRoleMemberIds.value.has(row.id)
}

const fetchUserOptions = async () => {
  userOptionsLoading.value = true
  try {
    const params = {
      name: userSearchQuery.value,
      page: userOptionsPagination.currentPage,
      limit: userOptionsPagination.pageSize,
      status: 0
    }
    const res = await queryUserInfoByList(params)
    if (res && (res.records || res.data)) {
      userOptions.value = res.records || res.data
      userOptionsPagination.total = res.total || 0
      
      nextTick(() => {
        userOptions.value.forEach(row => {
          if (allRoleMemberIds.value.has(row.id)) {
            userTableRef.value?.toggleRowSelection(row, true)
          }
        })
      })
      
    } else {
      userOptions.value = []
      userOptionsPagination.total = 0
    }
  } catch (error) {
    console.error('获取用户失败', error)
  } finally {
    userOptionsLoading.value = false
  }
}

const handleSelectAll = async () => {
  selectAllLoading.value = true
  try {
    let allUsers = []
    let page = 1
    const limit = 500
    while (true) {
      const res = await queryUserInfoByList({
        name: userSearchQuery.value,
        page,
        limit,
        status: 0
      })
      const list = res?.records || res?.data || []
      allUsers = allUsers.concat(list)
      if (list.length < limit || list.length === 0) break
      page++
    }
    
    // 过滤出未被添加的成员
    const newUsersToAdd = allUsers.filter(u => !allRoleMemberIds.value.has(u.id))
    
    if (newUsersToAdd.length === 0) {
      ElMessage.warning('当前搜索结果中没有未添加的人员')
      return
    }
    
    newUsersToAdd.forEach(row => {
      const existingRow = userOptions.value.find(u => u.id === row.id)
      if (existingRow) {
         userTableRef.value?.toggleRowSelection(existingRow, true)
      } else {
         userTableRef.value?.toggleRowSelection(row, true)
      }
    })
    ElMessage.success(`已选中 ${newUsersToAdd.length} 名未添加成员`)
  } catch (error) {
    console.error('一键全选失败', error)
    ElMessage.error('一键全选失败')
  } finally {
    selectAllLoading.value = false
  }
}

const handleSelectionChange = (val) => {
  selectedUsers.value = val
}

const confirmAddMembers = async () => {
  // 从 selectedUsers 中剔除掉已经在角色中的成员，只提交真正需要新增的成员
  const newSelectedUsers = selectedUsers.value.filter(u => !allRoleMemberIds.value.has(u.id))
  
  if (newSelectedUsers.length === 0) {
    ElMessage.warning('请选择未添加的人员')
    return
  }
  
  addMemberLoading.value = true
  try {
    const allIds = newSelectedUsers.map(u => u.id)
    const batchSize = 500;
    
    for (let i = 0; i < allIds.length; i += batchSize) {
      const batchIds = allIds.slice(i, i + batchSize);
      await addUserRole({
        roleId: currentRole.value.id,
        userIdList: batchIds
      })
    }
    
    ElMessage.success('添加成功')
    userSelectVisible.value = false
    fetchMembers()
  } catch (error) {
    console.error('添加失败', error)
    ElMessage.error('部分或全部添加失败')
  } finally {
    addMemberLoading.value = false
  }
}

const tableRowClassName = ({ rowIndex }) => {
  return 'animated-row'
}

onMounted(() => {
  fetchRoles()
})
</script>

<style scoped>
.role-page {
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

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-pagination {
  padding-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.member-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.role-tag {
  font-weight: bold;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.op-actions {
  display: inline-flex;
  gap: 8px;
}

/* 弹窗自定义样式 */
:deep(.custom-dialog .el-dialog__header) {
  margin-right: 0;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}
:deep(.custom-dialog .el-dialog__body) {
  padding: 20px;
}
:deep(.custom-dialog .el-dialog__footer) {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}
.role-info-alert {
  margin-bottom: 15px;
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
