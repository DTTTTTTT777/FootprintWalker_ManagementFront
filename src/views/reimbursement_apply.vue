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
          <el-option label="餐饮费" value="餐饮费"></el-option>
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

<script setup>
import { reactive, ref } from 'vue';

const form = reactive({
  applicantId: '',
  expenseType: '',
  amount: null,
  proofInfo: '',
  remark: ''
});

const rules = {
  applicantId: [{ required: true, message: '请输入申请者ID', trigger: 'blur' }],
  expenseType: [{ required: true, message: '请选择支出类型', trigger: 'change' }],
  amount: [{ required: true, type: 'number', message: '请输入金额', trigger: 'blur' }],
  proofInfo: [{ required: true, message: '请输入证明信息', trigger: 'blur' }],
};

const formRef = ref(null);

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      alert('提交成功');
    } else {
      console.log('表单验证失败');
      return false;
    }
  });
};

const resetForm = () => {
  formRef.value.resetFields();
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
