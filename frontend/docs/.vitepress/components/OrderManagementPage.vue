/**
 * 订单管理页面组件
 */
<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

// 国际化
const { t } = useI18n();
const elementLocale = inject('elementLocale');

// 订单列表
const orderList = ref([]);

// 加载状态
const loading = ref(true);

// 搜索关键词
const searchKeyword = ref('');

// 订单状态筛选
const statusFilter = ref('');

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
});

// 订单详情对话框
const orderDetailVisible = ref(false);
const currentOrder = ref({
  id: '',
  apiId: '',
  apiName: '',
  planId: '',
  planName: '',
  amount: 0,
  status: '',
  callLimit: 0,
  concurrencyLimit: 0,
  validityDays: 0,
  paidAt: null,
  cancelledAt: null,
  createdAt: '',
  updatedAt: ''
});

// 支付对话框
const payDialogVisible = ref(false);
const paymentInfo = ref({
  orderId: '',
  transactionId: '',
  paymentMethod: '支付宝'
});

// 支付方式选项
const paymentMethods = [
  { value: '支付宝', label: t('order.alipay') },
  { value: '微信支付', label: t('order.wechatPay') },
  { value: '银行转账', label: t('order.bankTransfer') }
];

// 订单状态选项
const statusOptions = [
  { value: '', label: t('common.all') },
  { value: 'pending', label: t('order.pending') },
  { value: 'paid', label: t('order.paid') },
  { value: 'cancelled', label: t('order.cancelled') }
];

// API基础URL
const API_BASE_URL = '/api';

// 获取Token
const getToken = () => {
  return localStorage.getItem('token');
};

// API请求配置
const getRequestConfig = () => {
  return {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  };
};

// 加载订单列表
const loadOrderList = async () => {
  loading.value = true;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/orders`, 
      { 
        ...getRequestConfig(),
        params: {
          page: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          status: statusFilter.value || undefined,
          keyword: searchKeyword.value || undefined
        }
      }
    );
    
    if (response.data.success) {
      orderList.value = response.data.data.orders;
      pagination.value.total = response.data.data.pagination.total;
      pagination.value.totalPages = response.data.data.pagination.totalPages;
    } else {
      ElMessage.error(response.data.message || t('common.error'));
    }
  } catch (error) {
    console.error('加载订单列表失败:', error);
    ElMessage.error(t('order.loadFailed'));
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1;
  loadOrderList();
};

// 处理状态筛选
const handleStatusChange = () => {
  pagination.value.currentPage = 1;
  loadOrderList();
};

// 处理分页变化
const handlePageChange = (page) => {
  pagination.value.currentPage = page;
  loadOrderList();
};

// 处理每页条数变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1;
  loadOrderList();
};

// 查看订单详情
const viewOrderDetail = async (order) => {
  try {
    loading.value = true;
    const response = await axios.get(
      `${API_BASE_URL}/orders/${order.id}`,
      getRequestConfig()
    );
    
    if (response.data.success) {
      currentOrder.value = response.data.data;
      orderDetailVisible.value = true;
    } else {
      ElMessage.error(response.data.message || t('common.error'));
    }
  } catch (error) {
    console.error('获取订单详情失败:', error);
    ElMessage.error(t('order.detailFailed'));
  } finally {
    loading.value = false;
  }
};

// 打开支付对话框
const openPayDialog = (order) => {
  paymentInfo.value = {
    orderId: order.id,
    transactionId: '',
    paymentMethod: '支付宝'
  };
  payDialogVisible.value = true;
};

// 支付订单
const payOrder = async () => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/orders/${paymentInfo.value.orderId}/pay`,
      {
        transactionId: paymentInfo.value.transactionId,
        paymentMethod: paymentInfo.value.paymentMethod
      },
      getRequestConfig()
    );
    
    if (response.data.success) {
      ElMessage.success(t('order.paySuccess'));
      payDialogVisible.value = false;
      loadOrderList();
    } else {
      ElMessage.error(response.data.message || t('order.payFailed'));
    }
  } catch (error) {
    console.error('支付订单失败:', error);
    ElMessage.error(t('order.payFailed'));
  }
};

// 取消订单
const cancelOrder = async (id) => {
  try {
    await ElMessageBox.confirm(
      t('order.cancelConfirm'),
      t('common.confirm'),
      {
        confirmButtonText: t('common.yes'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    );
    
    const response = await axios.put(
      `${API_BASE_URL}/orders/${id}/cancel`,
      {},
      getRequestConfig()
    );
    
    if (response.data.success) {
      ElMessage.success(t('order.cancelSuccess'));
      loadOrderList();
    } else {
      ElMessage.error(response.data.message || t('order.cancelFailed'));
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error);
      ElMessage.error(t('order.cancelFailed'));
    }
  }
};

// 获取订单状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'paid':
      return 'success';
    case 'cancelled':
      return 'info';
    default:
      return 'info';
  }
};

// 获取订单状态显示文本
const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return t('order.pending');
    case 'paid':
      return t('order.paid');
    case 'cancelled':
      return t('order.cancelled');
    default:
      return status;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
};

// 组件挂载时加载数据
onMounted(() => {
  loadOrderList();
});
</script>

<template>
  <el-config-provider :locale="elementLocale">
    <div class="order-management-container">
      <div class="page-header">
        <h1>{{ t('order.management') }}</h1>
      </div>
      
      <el-card shadow="never" class="filter-card">
        <div class="filter-container">
          <el-input
            v-model="searchKeyword"
            :placeholder="t('order.searchPlaceholder')"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
          
          <el-select
            v-model="statusFilter"
            :placeholder="t('order.statusFilter')"
            clearable
            class="status-select"
            @change="handleStatusChange"
          >
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
      </el-card>
      
      <el-card shadow="never" class="order-list-card">
        <el-table
          v-loading="loading"
          :data="orderList"
          border
          style="width: 100%"
        >
          <el-table-column prop="id" :label="t('order.id')" width="80" />
          <el-table-column prop="apiName" :label="t('order.api')" min-width="150" />
          <el-table-column prop="planName" :label="t('order.plan')" min-width="150" />
          <el-table-column prop="amount" :label="t('order.amount')" width="100">
            <template #default="{ row }">
              ¥{{ Number(row.amount).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="t('order.status')" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" :label="t('order.createTime')" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column :label="t('common.actions')" width="250" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="viewOrderDetail(row)">
                {{ t('order.detail') }}
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                size="small"
                type="primary"
                @click="openPayDialog(row)"
              >
                {{ t('order.pay') }}
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                size="small"
                type="danger"
                @click="cancelOrder(row.id)"
              >
                {{ t('order.cancel') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
      
      <!-- 订单详情对话框 -->
      <el-dialog
        v-model="orderDetailVisible"
        :title="t('order.detail')"
        width="600px"
      >
        <div class="order-detail">
          <div class="detail-item">
            <span class="label">{{ t('order.id') }}:</span>
            <span class="value">{{ currentOrder.id }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t('order.api') }}:</span>
            <span class="value">{{ currentOrder.apiName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t('order.plan') }}:</span>
            <span class="value">{{ currentOrder.planName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t('order.amount') }}:</span>
            <span class="value">¥{{ Number(currentOrder.amount).toFixed(2) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t('order.status') }}:</span>
            <span class="value">
              <el-tag :type="getStatusTagType(currentOrder.status)">
                {{ getStatusText(currentOrder.status) }}
              </el-tag>
            </span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t('order.callLimit') }}:</span>
            <span class="value">{{ currentOrder.callLimit }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t('order.concurrencyLimit') }}:</span>
            <span class="value">{{ currentOrder.concurrencyLimit }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t('order.validityDays') }}:</span>
            <span class="value">{{ currentOrder.validityDays }} {{ t('order.days') }}</span>
          </div>
          <div class="detail-item" v-if="currentOrder.paidAt">
            <span class="label">{{ t('order.paidAt') }}:</span>
            <span class="value">{{ formatDate(currentOrder.paidAt) }}</span>
          </div>
          <div class="detail-item" v-if="currentOrder.cancelledAt">
            <span class="label">{{ t('order.cancelledAt') }}:</span>
            <span class="value">{{ formatDate(currentOrder.cancelledAt) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t('order.createTime') }}:</span>
            <span class="value">{{ formatDate(currentOrder.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ t('order.updateTime') }}:</span>
            <span class="value">{{ formatDate(currentOrder.updatedAt) }}</span>
          </div>
        </div>
        
        <template #footer>
          <el-button @click="orderDetailVisible = false">
            {{ t('common.close') }}
          </el-button>
        </template>
      </el-dialog>
      
      <!-- 支付对话框 -->
      <el-dialog
        v-model="payDialogVisible"
        :title="t('order.pay')"
        width="500px"
      >
        <el-form :model="paymentInfo" label-width="120px">
          <el-form-item :label="t('order.paymentMethod')">
            <el-select v-model="paymentInfo.paymentMethod" style="width: 100%">
              <el-option
                v-for="method in paymentMethods"
                :key="method.value"
                :label="method.label"
                :value="method.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('order.transactionId')">
            <el-input v-model="paymentInfo.transactionId" :placeholder="t('order.transactionIdPlaceholder')" />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="payDialogVisible = false">
            {{ t('common.cancel') }}
          </el-button>
          <el-button type="primary" @click="payOrder">
            {{ t('order.confirmPay') }}
          </el-button>
        </template>
      </el-dialog>
    </div>
  </el-config-provider>
</template>

<style scoped>
.order-management-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.status-select {
  width: 150px;
}

.order-list-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.order-detail {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-item {
  display: flex;
}

.label {
  font-weight: 500;
  width: 120px;
  color: #606266;
}

.value {
  flex: 1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-input,
  .status-select {
    width: 100%;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
