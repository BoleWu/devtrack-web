<template>
  <div class="project-create-container">
    <el-card shadow="hover" class="create-card">
      <template #header>
        <div class="card-header">
          <span>创建新项目</span>
        </div>
      </template>
      
      <el-form 
        :model="projectForm" 
        :rules="rules" 
        ref="projectFormRef"
        label-width="100px"
      >
        <el-form-item label="项目名称" prop="name">
          <el-input 
            v-model="projectForm.name" 
            placeholder="请输入项目名称"
            maxlength="50"
          />
        </el-form-item>
        
        <el-form-item label="项目描述" prop="description">
          <el-input 
            v-model="projectForm.description" 
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
            maxlength="200"
          />
        </el-form-item>
        
        <el-form-item label="项目状态">
          <el-select 
            v-model="projectForm.status" 
            placeholder="请选择状态"
            clearable
          >
            <el-option 
              v-for="item in statusOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleCreateProject">创建项目</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { createProject } from '@/api/project'

// 表单数据
const projectForm = reactive({
  name: '',
  description: '',
  status: '' // 可选，不传则后端默认ACTIVE
})

// 状态选项
const statusOptions = [
  { value: 'ACTIVE', label: '进行中' },
  { value: 'DONE', label: '已完成' },
  { value: 'ARCHIVED', label: '已归档' }
]

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '项目名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 表单引用
const projectFormRef = ref(null)

// 创建项目
const handleCreateProject = async () => {
  try {
    // 表单验证
    await projectFormRef.value.validate()
    
    // 调用API创建项目
    const response = await createProject({
      name: projectForm.name,
      description: projectForm.description,
      status: projectForm.status || undefined // 如果为空则不传递，让后端用默认值
    })
    
    ElMessage.success('项目创建成功！')
    
    // 成功后可以：
    // 1. 重置表单
    resetForm()
    // 2. 刷新项目列表
    // 3. 跳转到项目详情页
    
  } catch (error) {
    console.error('创建项目失败:', error)
    ElMessage.error(error.response?.data?.message || '创建项目失败，请重试')
  }
}

// 重置表单
const resetForm = () => {
  projectForm.name = ''
  projectForm.description = ''
  projectForm.status = ''
  projectFormRef.value?.resetFields()
}
</script>

<style scoped>
.project-create-container {
  padding: 20px;
}
.create-card {
  max-width: 600px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>