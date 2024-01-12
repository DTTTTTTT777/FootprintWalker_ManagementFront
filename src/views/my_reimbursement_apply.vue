<template>
  <div>
    <div class="container">
      <!-- 搜索和筛选区域 -->
      <div class="handle-box">
        <el-input v-model="query.searchText" placeholder="搜索申请" class="handle-input-narrow mr10"></el-input>
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
        <el-table-column prop="submitTime" label="申请时间" width="200px">
          <template #default="scope">
            {{ formatDateTime(scope.row.submitTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template #default="scope">
            <div class="custom-button-container" >
              <el-button @click="handleView(scope.row)">查看详情</el-button>
<!--              <el-button @click="handleResubmit(scope.row)">重新提交</el-button>-->
              <el-button v-if="scope.row.status === '已驳回'" @click="handleResubmit(scope.row)">重新提交</el-button>
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
          <!--          <el-input v-model="form.submitTime"></el-input>-->
          <template #default="scope">
            {{ formatDateTime(form.submitTime) }}
          </template>
        </el-form-item>
        <!--        <el-form-item label="证明信息1">-->
        <!--          <el-input v-model="form.proofInfo"></el-input>-->
        <!--        </el-form-item>-->
        <el-form-item label="证明信息">
          <!-- 显示证明信息图片 -->
          <img :src="form.proofInfo" alt="证明信息" style="max-width: 100%; max-height: 300px;" />
        </el-form-item>

        <el-form-item label="财务干事处理时间" v-if="form.financeClerkId">

          <template #default="scope">
            {{ formatDateTime(form.financeClerkId) }}
          </template>
        </el-form-item>
        <el-form-item label="社长处理时间" v-if="form.presidentProcessTime">

          <template #default="scope">
            {{ formatDateTime(form.presidentProcessTime) }}
          </template>
        </el-form-item>
        <el-form-item label="驳回理由" v-if="form.rejectReason">
          <el-input v-model="form.rejectReason"></el-input>
        </el-form-item>



      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="viewVisible = false">关闭</el-button>
  </span>
    </el-dialog>

    <!-- 重新提交弹出框 -->
    <el-dialog title="重新提交报销申请" v-model="reEditVisible" disabled width="50%">
      <el-form label-width="100px" label-position="left" :model="form" :rules="rules" ref="formRef">
        <!-- 申请者信息 -->
        <!--      <el-form-item label="申请者ID" prop="applicantId">-->
        <!--        <el-input v-model="form.applicantId"></el-input>-->
        <!--      </el-form-item>-->

        <!-- 支出类型 -->
        <el-form-item label-width="100px" class = "handle-select" label="支出类型" prop="expenseType">
          <el-select v-model="form.expenseType" placeholder="请选择支出类型">
            <el-option label="交通费" value="交通费"></el-option>
            <el-option label="住宿费" value="住宿费"></el-option>
            <el-option label="餐费" value="餐费"></el-option>
            <el-option label="保险费" value="保险费"></el-option>
            <el-option label="景点门票费" value="景点门票费"></el-option>
            <el-option label="活动费" value="活动费"></el-option>
            <el-option label="其他" value="其他"></el-option>
            <!-- 更多选项 -->
          </el-select>
        </el-form-item>

        <!-- 报销金额 -->
        <el-form-item label-width="100px" class = "handle-input-amount" label="金额" prop="amount">
          <el-input v-model="form.amount" label="金额"></el-input>
        </el-form-item>

        <!-- 证明信息 -->
        <el-form-item label-width="100px" class = "handle-input" label="证明信息" prop="proofInfo">
          <el-input v-model="form.proofInfo" type="textarea"></el-input>
          <el-upload v-model:file-list="fileList" class="upload-demo" multiple="false"
                     action="/foreignImage/upload" name="smfile"
                     :headers="{ Authorization: '36BZaEnY8eVdNuWGWhg0LgmSHByiHEGP' }"
                     :on-success="handleSuccess"
                     :on-error="handleError"
                     :before-upload="beforeUpload"
                     :limit="1"
                     :on-exceed="handleExceed"
                     prop="proofInfo">

            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
          <!-- 显示已上传的图片 -->
          <el-image v-if="form.proofInfo" class="CollectionImg" :src="form.proofInfo"
                    :z-index="10" :height="10">
          </el-image>
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label-width="100px" class = "handle-input" label="备注">
          <el-input v-model="form.remark" type="textarea"></el-input>
        </el-form-item>

        <!-- 提交按钮 -->
<!--        <el-form-item>-->
<!--        </el-form-item>-->
      </el-form>

      <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
    <el-button @click="reEditVisible = false">关闭</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive,watchEffect } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import {axiosForFinance, axiosForFile, axiosForHuman, axiosForActivity} from '../main.js';
import { nextTick } from 'vue';
import {formatDateTime} from '../tools/Format.js'

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
  presidentId: number;
  financeClerkId: number;
  financeClerkProcessTime: string;
  presidentProcessTime: string;
  rejectReason: string;
}

const tableData = ref<ReimbursementRecord[]>([]);
const viewVisible = ref(false);
const reEditVisible = ref(false);
const rejectVisible = ref(false);
const rejectReason = ref('');
const fileList = ref([]);

const rules = {
  applicantId: [{ required: true, message: '请输入申请者ID', trigger: 'blur' }],
  expenseType: [{ required: true, message: '请选择支出类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  proofInfo: [{ required: true, message: '请输入证明信息', trigger: 'blur' }],
};


const formRef = ref(null);

let form = reactive<ReimbursementRecord>({
  id: 0,
  applicantId: 0,
  expenseType: '',
  amount: 0,
  proofInfo: '',
  remark: '',
  status: '',
  submitTime: '',
  presidentId: null,
  financeClerkId: null,
  financeClerkProcessTime: null,
  presidentProcessTime: null,
  rejectReason: null,
});

// 获取报销申请数据
const getAllReimbursementRecords = async () => {
  try {
    const id = localStorage.getItem('id');
    const response = await axiosForFinance.get(`/api/finance/reimbursementRequests/ByApplicant/${id}`);
    console.log(response);
    console.log(response.data);
    tableData.value = response.data;
    console.log(tableData.value);
  } catch (error) {
    console.error(error);
  }
};

// 查看报销申请
const handleView = async (row: ReimbursementRecord) => {
  form = row;
  console.log("handleEdit-form:", form);
  console.log("handleEdit-form.status:", form.status);
  console.log("handleEdit-form.proof:", form.proofInfo);
  // await nextTick(); // 确保视图更新完成
  viewVisible.value = true;
};

// 重新提交
const handleResubmit = async (row: ReimbursementRecord) => {
  form = row;
  console.log("handleEdit-form:", form);
  console.log("handleEdit-form.status:", form.status);
  console.log("handleEdit-form.proof:", form.proofInfo);
  // await nextTick(); // 确保视图更新完成
  if (form.proofInfo) {
    fileList.value = [{
      name: 'proof', // 这里的 'proof' 可以替换为任何文件名
      url: form.proofInfo
    }];
  } else {
    fileList.value = [];
  }

  reEditVisible.value = true;
  getAllReimbursementRecords();
};

watchEffect(() => {
  if (fileList.value.length === 0) {
    form.proofInfo = '';
  }
});


// 搜索报销申请
const handleSearch = () => {
  getAllReimbursementRecords();
};

getAllReimbursementRecords();

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      // 表单验证通过，发送POST请求创建报销申请
      await resubmitReimbursementRequest();
    } else {
      console.log('表单验证失败');
    }
  });
};



const resetForm = () => {
  formRef.value.resetFields();
};

const resubmitReimbursementRequest = async () => {
  try {
    form.submitTime = new Date().toISOString();
    const clerkId=localStorage.getItem('id');
    form.applicantId = Number(clerkId);
    console.log(clerkId);
    console.log(form.applicantId);
    const response = await axiosForFinance.put(`http://localhost:6547/api/finance/reimbursementRequests/${form.id}/resubmit`, form);
    if (response.status === 200) {
      // 请求成功，可以处理成功后的逻辑，例如清空表单等
      alert('报销申请已成功提交');
      resetForm();
      getAllReimbursementRecords();
    } else {
      // 请求失败，处理失败逻辑
      alert('报销申请提交失败');
    }
  } catch (error) {
    console.error('发生错误:', error);
    alert('报销申请提交失败');
  }
};



const handleSuccess = (response, file) => {
  // 处理上传成功后的回调
  console.log('上传成功', response);
  console.log(response.success);
  if(response.success == true)
    form.proofInfo = response.data.url;
  else
    form.proofInfo = response.images;
  console.log(form.proofInfo);
  // 在回调中处理SM.MS返回的数据，可以获取图片链接等信息
};
const handleError = (err) => {
  // 处理上传失败后的回调
  console.error('上传失败', err);
};
const beforeUpload = (file) => {

  return true; // 返回true表示继续上传，返回false表示取消上传
};


const handlePreview = (uploadFile) => {
  console.log(uploadFile);
};

const handleExceed = (files, uploadFiles) => {
  ElMessage.warning(
      `The limit is 1, you selected ${files.length} files this time, add up to ${files.length + uploadFiles.length} totally`
  );
};


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
  //width: 500px;
  margin-right: 10px;
}
.handle-input-amount,.handle-input-narrow {
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
