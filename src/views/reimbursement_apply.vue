<template>
  <div class="reimbursement-container">
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
<!--        <el-input v-model="form.proofInfo" type="textarea"></el-input>-->
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
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts" productName="basetable">
import { reactive, ref } from 'vue';
import {ElMessage, UploadProps, UploadUserFile} from "element-plus";
import {axiosForFinance, axiosForFile, axiosForHuman, axiosForActivity} from '../main.js';


const form = reactive({
  applicantId: -1,
  expenseType: '',
  amount: null,
  proofInfo: '',
  remark: '',
  status: "待处理",
  submitTime: '',
  financeClerkId: null,
  financeClerkProcessTime: null,
  presidentProcessTime: null,
  rejectedReason: null,

});

const rules = {
  applicantId: [{ required: true, message: '请输入申请者ID', trigger: 'blur' }],
  expenseType: [{ required: true, message: '请选择支出类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  proofInfo: [{ required: true, message: '请输入证明信息', trigger: 'blur' }],
};

const formRef = ref(null);
const fileList = ref([]);
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      // 表单验证通过，发送POST请求创建报销申请
      await createReimbursementRequest();
    } else {
      console.log('表单验证失败');
    }
  });
};



const resetForm = () => {
  formRef.value.resetFields();
};

const createReimbursementRequest = async () => {
  try {
    form.submitTime = new Date().toISOString();
    const clerkId=localStorage.getItem('id');
    form.applicantId = Number(clerkId);
    console.log(clerkId);
    console.log(form.applicantId);
    console.log("form:",form);
    const response = await axiosForFinance.post('http://localhost:6547/api/finance/reimbursementRequests', form);
    if (response.status === 200) {
      // 请求成功，可以处理成功后的逻辑，例如清空表单等
      alert('报销申请已成功提交');
      resetForm();
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
.handle-select {
  width: 200px;
  margin-right: 10px;
}
.handle-input-amount {
  width: 200px;
  margin-right: 10px;
}

.handle-input {
  width: 800px;
  margin-right: 10px;
}
.reimbursement-container {
  margin: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}
</style>
