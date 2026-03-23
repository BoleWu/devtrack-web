<template>
  <div class="api-debug-page animate-fade-in-up">
    <el-row :gutter="20">
      <el-col :span="10">
        <el-card class="glass-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">接口调试</span>
            </div>
          </template>

          <el-form label-position="top" class="api-form">
            <el-form-item label="请求方式">
              <el-select v-model="form.method" class="w-full">
                <el-option label="GET" value="get" />
                <el-option label="POST" value="post" />
                <el-option label="PUT" value="put" />
                <el-option label="DELETE" value="delete" />
              </el-select>
            </el-form-item>

            <el-form-item label="接口地址">
              <el-input v-model="form.url" placeholder="/dashboard/stats 或 https://example.com/api/xxx" clearable />
            </el-form-item>

            <el-form-item :label="paramLabel">
              <el-input
                v-model="form.payloadText"
                type="textarea"
                :rows="10"
                :placeholder="paramPlaceholder"
              />
            </el-form-item>

            <div class="actions">
              <el-button type="primary" :loading="loading" @click="runRequest">执行</el-button>
              <el-button :disabled="loading" @click="fillExample">填充示例</el-button>
              <el-button :disabled="loading" @click="clearAll">清空</el-button>
            </div>

            <div class="meta" v-if="lastMeta">
              <el-tag type="info" effect="dark" round>耗时 {{ lastMeta.ms }} ms</el-tag>
              <el-tag v-if="lastMeta.status" type="info" effect="dark" round>HTTP {{ lastMeta.status }}</el-tag>
              <el-tag v-if="lastMeta.ok" type="success" effect="dark" round>成功</el-tag>
              <el-tag v-else type="danger" effect="dark" round>失败</el-tag>
            </div>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="14">
        <el-card class="glass-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">响应结果</span>
              <el-button link type="primary" :disabled="!responseText" @click="copyResponse">复制</el-button>
            </div>
          </template>

          <pre class="result">{{ responseText || '暂无结果' }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const responseText = ref('')
const lastMeta = ref(null)

const form = reactive({
  method: 'get',
  url: '/dashboard/stats',
  payloadText: '{}'
})

const isQueryMethod = computed(() => {
  return form.method === 'get' || form.method === 'delete'
})

const paramLabel = computed(() => {
  return isQueryMethod.value ? '查询参数 (Query Params)' : '请求体 (Request Body)'
})

const paramPlaceholder = computed(() => {
  return isQueryMethod.value
    ? '例如：{"page":1,"limit":10} (将自动拼接到 URL)'
    : '例如：{"name":"New Project","desc":"..."}'
})

const rawService = axios.create({
  baseURL: '/api',
  timeout: 5000,
  validateStatus: () => true
})

rawService.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const normalizedToken = typeof token === 'string' ? token.trim() : ''
  if (normalizedToken && normalizedToken !== 'undefined' && normalizedToken !== 'null') {
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + normalizedToken
  }
  return config
})

const normalizeUrl = (raw) => {
  const v = (raw || '').trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v
  let path = v
  if (path.startsWith('/api/')) path = path.slice(4)
  if (!path.startsWith('/')) path = '/' + path
  return path
}

const parseJson = (txt) => {
  const v = (txt || '').trim()
  if (!v) return {}
  return JSON.parse(v)
}

const formatAny = (val) => {
  if (val == null) return ''
  if (typeof val === 'string') return val
  try {
    return JSON.stringify(val, null, 2)
  } catch (_) {
    return String(val)
  }
}

const runRequest = async () => {
  const url = normalizeUrl(form.url)
  if (!url) {
    ElMessage.warning('请输入接口地址')
    return
  }

  let payload
  try {
    payload = parseJson(form.payloadText)
  } catch (e) {
    ElMessage.error('参数必须是合法的 JSON')
    return
  }

  loading.value = true
  responseText.value = ''
  const started = performance.now()
  try {
    const method = form.method
    const config = { url, method }
    if (method === 'get' || method === 'delete') {
      config.params = payload
    } else {
      config.data = payload
    }
    const resp = await rawService.request(config)
    const ok = resp.status >= 200 && resp.status < 300
    responseText.value = formatAny(resp.data)
    lastMeta.value = { ok, ms: Math.round(performance.now() - started), status: resp.status }
  } catch (e) {
    const status = e?.response?.status
    const data = e?.response?.data
    const errMsg = e?.message || '请求失败'
    responseText.value = formatAny(data ?? { error: errMsg })
    lastMeta.value = { ok: false, ms: Math.round(performance.now() - started), status }
  } finally {
    loading.value = false
  }
}

const fillExample = () => {
  if (!form.url) form.url = '/dashboard/stats'
  if ((form.method === 'get' || form.method === 'delete') && (!form.payloadText || form.payloadText.trim() === '{}')) {
    form.payloadText = '{}'
  } else if (!form.payloadText || form.payloadText.trim() === '{}' || form.payloadText.trim() === '') {
    form.payloadText = '{\n  \"page\": 1,\n  \"limit\": 10\n}'
  }
}

const clearAll = () => {
  form.method = 'get'
  form.url = ''
  form.payloadText = '{}'
  responseText.value = ''
  lastMeta.value = null
}

const copyResponse = async () => {
  if (!responseText.value) return
  try {
    await navigator.clipboard.writeText(responseText.value)
    ElMessage.success('已复制')
  } catch (_) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.api-debug-page {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.api-form {
  width: 100%;
}

.w-full {
  width: 100%;
}

.actions {
  display: flex;
  gap: 10px;
}

.meta {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.result {
  margin: 0;
  padding: 14px;
  min-height: 420px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #303133;
}
</style>
