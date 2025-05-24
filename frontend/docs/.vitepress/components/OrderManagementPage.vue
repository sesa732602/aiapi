/**
 * 订单管理页面组件
 */
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';

// 国际化
const { t } = useI18n();

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
  total: 0
});

// 订单详情对话框
const orderDetailVisible = ref(false);
const currentOrder = ref({
  id: '',
  apiName: '',
  planName: '',
  amount: 0,
  status: '',
  paymentMethod: '',
  transactionId: '',
  createdAt: '',
  updatedAt: ''
});

// 支付对话框
const payDialogVisible = ref(false);
const paymentInfo = ref({
  orderId: '',
  transactionId: ''
});

// 订单状态选项
const statusOptions = [
  { value: '', label: t('common.all') },
  { value: 'pending', label: t('order.pending') },
  { value: 'paid', label: t('order.paid') },
  { value: 'cancelled', label: t('order.cancelled') },
  { value: 'refunded', label: t('order.refunded') }
];

// 加载订单列表
const loadOrderList = async () => {
  loading.value = true;
  try {
    // 这里应该调用实际的API
    // const response = await api.getOrders({
    //   page: pagination.value.currentPage,
    //   pageSize: pagination.value.pageSize,
    //   keyword: searchKeyword.value,
    //   status: statusFilter.value || undefined
    // });
    
    // 模拟数据
    setTimeout(() => {
      const mockData = [
        {
          id: '1',
          apiId: '1',
          apiName: '用户认证API',
          planId: '1',
          planName: '基础套餐',
          amount: 99,
          status: 'pending',
          paymentMethod: '支付宝',
          transactionId: '',
          createdAt: '2025-05-20T10:30:00Z',
          updatedAt: '2025-05-20T10:30:00Z'
        },
        {
          id: '2',
          apiId: '2',
          apiName: '产品API',
          planId: '2',
          planName: '专业套餐',
          amount: 299,
          status: 'paid',
          paymentMethod: '微信支付',
          transactionId: 'wx123456789',
          createdAt: '2025-05-19T09:15:00Z',
          updatedAt: '2025-05-19T09:20:00Z'
        },
        {
          id: '3',
          apiId: '3',
          apiName: '订单API',
          planId: '3',
          planName: '企业套餐',
          amount: 999,
          status: 'cancelled',
          paymentMethod: '银行转账',
          transactionId: '',
          createdAt: '2025-05-18T14:25:00Z',
          updatedAt: '2025-05-18T15:30:00Z'
        }
      ];
      
      orderList.value = mockData;
      pagination.value.total = mockData.length;
      loading.value = false;
    }, 1000);
  } catch (error) {
    ElMessage.error(t('common.error'));
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
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page;
  loadOrderList();
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1;
  loadOrderList();
};

// 查看订单详情
const viewOrderDetail = (order) => {
  currentOrder.value = { ...order };
  orderDetailVisible.value = true;
};

// 打开支付对话框
const openPayDialog = (order) => {
  paymentInfo.value = {
    orderId: order.id,
    transactionId: ''
  };
  payDialogVisible.value = true;
};

// 支付订单
const payOrder = async () => {
  try {
    // 这里应该调用实际的API
    // await api.payOrder(paymentInfo.value.orderId, { transactionId: paymentInfo.value.transactionId });
    
    // 模拟支付成功
    setTimeout(() => {
      ElMessage.success(t('order.paySuccess'));
      payDialogVisible.value = false;
      loadOrderList();
    }, 500);
  } catch (error) {
    ElMessage.error(t('order.payFailed'));
  }
};

// 取消订单
const cancelOrder = async (id: string) => {
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
    
    // 这里应该调用实际的API
    // await api.cancelOrder(id);
    
    // 模拟取消成功
    setTimeout(() => {
      ElMessage.success(t('order.cancelSuccess'));
      loadOrderList();
    }, 500);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('order.cancelFailed'));
    }
  }
};

// 获取订单状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'paid':
      return 'success';
    case 'cancelled':
      return 'info';
    case 'refunded':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取订单状态显示文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return t('order.pending');
    case 'paid':
      return t('order.paid');
    case 'cancelled':
      return t('order.cancelled');
    case 'refunded':
      return t('order.refunded');
    default:
      return status;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadOrderList();
});
</script>

<template>
  <div class="order-management-container">
    <div class="page-header">
      <h1>{{ t('order.management') }}</h1>
    </div>
    
    <el-card shadow="never" class="filter-card">
      <div class="filter-container">
        <el-input
          v-model="searchKeyword"
          :placeholder="t('common.search')"
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
          :placeholder="t('order.status')"
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
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('order.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" :label="t('order.paymentMethod')" width="120" />
        <el-table-column prop="createdAt" :label="t('order.createTime')" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
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
          <span class="value">¥{{ currentOrder.amount?.toFixed(2) }}</span>
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
          <span class="label">{{ t('order.paymentMethod') }}:</span>
          <span class="value">{{ currentOrder.paymentMethod }}</span>
        </div>
        <div class="detail-item" v-if="currentOrder.transactionId">
          <span class="label">{{ t('order.transactionId') }}:</span>
          <span class="value">{{ currentOrder.transactionId }}</span>
        </div>
        <div class="detail-item">
          <span class="label">{{ t('order.createTime') }}:</span>
          <span class="value">{{ new Date(currentOrder.createdAt).toLocaleString() }}</span>
        </div>
        <div class="detail-item">
          <span class="label">{{ t('order.updateTime') }}:</span>
          <span class="value">{{ new Date(currentOrder.updatedAt).toLocaleString() }}</span>
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
        <el-form-item :label="t('order.transactionId')">
          <el-input v-model="paymentInfo.transactionId" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="payDialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="payOrder">
          {{ t('order.pay') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
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
