<template>
  <div>
    <div class="container">
      <!-- 搜索和筛选区域 -->
      <div class="handle-box">
        <el-input v-model="query.searchText" placeholder="搜索申请" class="handle-input mr10"></el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <!-- 表格显示报销申请 -->
      <el-table :data="tableData" border class="table" ref="reimbursementTable">
        <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
        <el-table-column prop="applicantId" label="申请者ID"></el-table-column>
        <el-table-column prop="expenseType" label="支出类型"></el-table-column>
        <el-table-column prop="amount" label="金额"></el-table-column>
<!--        <el-table-column prop="proofInfo" label="证明信息"></el-table-column>-->
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column prop="status" label="状态"></el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template #default="scope">
            <div class="custom-button-container">
              <el-button @click="handleView(scope.row)">查看</el-button>
              <el-button type="success" @click="handleApprove(scope.row)">批准</el-button>
              <el-button type="danger" @click="handleReject(scope.row)">驳回</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 查看弹出框 -->
    <el-dialog title="查看报销申请" v-model="viewVisible" disabled width="50%">
      <el-form  label-width="150px" label-position="left" disabled>
<!--        label-width调整label的宽度-->
        <el-form-item label="申请者ID">
          <el-input v-model="form.applicantId"></el-input>
        </el-form-item>
        <el-form-item label="支出类型">
          <el-input v-model="form.expenseType"></el-input>
        </el-form-item>
        <el-form-item label="金额">
          <el-input v-model="form.amount"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-input v-model="form.status"></el-input>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-input v-model="form.submitTime"></el-input>
        </el-form-item>
        <!--        <el-form-item label="证明信息1">-->
        <!--          <el-input v-model="form.proofInfo"></el-input>-->
        <!--        </el-form-item>-->
        <el-form-item label="证明信息">
          <!-- 显示证明信息图片 -->
          <img :src="form.proofInfo" alt="证明信息" style="max-width: 100%; max-height: 300px;" />
        </el-form-item>

        <el-form-item label="财务干事处理时间" v-if="form.financeClerkId">
          <el-input v-model="form.financeClerkProcessTime"></el-input>
        </el-form-item>
        <el-form-item label="社长处理时间" v-if="form.presidentProcessTime">
          <el-input v-model="form.presidentProcessTime"></el-input>
        </el-form-item>
        <el-form-item label="驳回理由" v-if="form.rejectedReason">
          <el-input v-model="form.rejectedReason"></el-input>
        </el-form-item>



      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="viewVisible = false">关闭</el-button>
  </span>
    </el-dialog>


    <!-- 驳回弹出框 -->
    <el-dialog title="驳回理由" v-model="rejectVisible" width="40%">
      <el-form label-width="90px">
        <el-form-item label="驳回理由">
          <el-input type="textarea" v-model="rejectReason"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确认驳回</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import {axiosForFinance, axiosForFile, axiosForHuman, axiosForActivity} from '../main.js';

const query = reactive({
  searchText: ''
});

interface ReimbursementRecord {
  id: number;
  applicantId: number;
  expenseType: string;
  amount: number;
  proofInfo: string;
  remark: string;
  status: string;
  submitTime: string;
  financeClerkId: number;
  financeClerkProcessTime: string;
  presidentProcessTime: string;
  rejectedReason: string;
}

const tableData = ref<ReimbursementRecord[]>([]);
const viewVisible = ref(false);
const rejectVisible = ref(false);
const rejectReason = ref('');

let form = reactive<ReimbursementRecord>({
  id: 0,
  applicantId: 0,
  expenseType: '',
  amount: 0,
  proofInfo: '',
  remark: '',
  status: '',
  submitTime: '',
  financeClerkId: null,
  financeClerkProcessTime: null,
  presidentProcessTime: null,
  rejectedReason: null,
});

// 获取报销申请数据
const getAllReimbursementRecords = async () => {
  try {
    const response = await axiosForFinance.get('/api/finance/reimbursementRequests');
    console.log(response);
    console.log(response.data);
    tableData.value = response.data;
    console.log(tableData.value);
  } catch (error) {
    console.error(error);
  }
};

// 查看报销申请
const handleView = (row: ReimbursementRecord) => {
  form = { ...row };
  console.log("form:" , form);
  console.log("form.proofInfo:", form.proofInfo);
  viewVisible.value = true;
};

const handleApprove = async (row: ReimbursementRecord) => {
  try {
    const clerkType=localStorage.getItem("clerkType");
    console.log("clerkType",clerkType);
    // console.log("row:",row);
    // console.log("row.id:",row.id);
    row.status = "APPROVED"
    await axiosForFinance.put(`/api/finance/reimbursementRequests/${row.id}`,row);
    ElMessage.success('申请已批准');
    getAllReimbursementRecords();
  } catch (error) {
    ElMessage.error('操作失败');
    console.error(error);
  }
};

// 显示驳回对话框
const handleReject = (row: ReimbursementRecord) => {
  form = { ...row };
  rejectVisible.value = true;
};

// 确认驳回
const confirmReject = async () => {
  try {
    await axiosForFinance.put(`/api/finance/reimbursementRequests/${form.id}`, { reason: rejectReason.value });
    ElMessage.success('申请已驳回');
    rejectVisible.value = false;
    getAllReimbursementRecords();
  } catch (error) {
    ElMessage.error('操作失败');
    console.error(error);
  }
};


// 搜索报销申请
const handleSearch = () => {
  getAllReimbursementRecords();
};

getAllReimbursementRecords();
</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}

.handle-select {
  width: 200px;
  margin-right: 10px;
}

.handle-input {
  width: 200px;
  margin-right: 10px;
}

.custom-button-container {
  display: flex;
  align-items: center;
}

.view-button, .edit-button, .delete-button {
  width: 50px; /* 调整按钮宽度 */
  margin-right: 10px;
}

.red {
  color: red;
}
</style>
