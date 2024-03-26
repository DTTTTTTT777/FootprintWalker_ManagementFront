<template>
  <!-- 编辑弹出框 -->
  <el-dialog title="修改活动内容" v-model="editVisible" width="60%">
    <!-- 表单内容 -->
    <el-form :model="form" ref="editFormRef" label-width="120px">
      <el-form-item label="活动标题" prop="title">
        <el-input v-model="form.title"></el-input>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
      </el-form-item>
      <el-form-item label="报名开始时间" prop="registrationStartTime">
        <el-date-picker v-model="form.registrationStartTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
      </el-form-item>
      <el-form-item label="报名结束时间" prop="registrationEndTime">
        <el-date-picker v-model="form.registrationEndTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
      </el-form-item>
      <el-form-item label="活动地点" prop="location">
        <el-input v-model="form.location"></el-input>
      </el-form-item>
      <el-form-item label="活动描述" prop="activityInfo">
        <el-input type="textarea" v-model="form.activityInfo"></el-input>
      </el-form-item>
      <el-form-item label="活动状态" prop="activityStatus">
        <el-select v-model="form.activityStatus" placeholder="请选择">
          <el-option label="已发布" value="PUBLISHED"></el-option>
          <el-option label="草稿" value="DRAFT"></el-option>
          <el-option label="往期回顾" value="RETROSPECTIVE"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="活动收费" prop="cost">
        <el-input-number v-model="form.cost" :min="0" controls-position="right" style="width: 40%;"></el-input-number>
      </el-form-item>
      <el-form-item label="人数上限" prop="estimatedLimit">
        <el-input-number v-model="form.estimatedLimit" :min="1" controls-position="right" style="width: 40%;"></el-input-number>
      </el-form-item>
      <el-form-item label="负责人" prop="leaderIds">
        <el-select v-model="form.leaderIds" multiple placeholder="请选择负责人">
          <el-option
              v-for="clerk in clerksList"
              :key="clerk.id"
              :label="clerk.name"
              :value="clerk.id">
          </el-option>
        </el-select>
      </el-form-item>

    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">确定</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script>
import { ref} from 'vue';
import { getClerkList } from'@/tools/apiRequest.js'
import { axiosForActivity } from '../main.js';
export default {
  name: 'EditActivityDialog',
  props: {
    activityData: Object,
  },
  data() {
    return {
      editVisible: false,
      form: {}, // 初始化为空对象
      editFormRef: null,
      clerksList:[]

    };
  },

  mounted() {
    this.openDialog();
    this.clerksList = getClerkList();
  },
  methods: {
    openDialog() {
      this.editVisible = true;
      this.form =  this.activityData 
    },
    closeDialog() {
      this.editVisible = false;
    },
    async saveEdit() {
      // 验证表单
      const isFormValid = await this.$refs.editFormRef.validate();
      if (!isFormValid) return;

      await this.updateActivity(this.form);
      this.closeDialog();

    },
    async updateActivity(activityData) {
      try {
        // 发送 PUT 请求到后端服务器以更新活动
        const response = await axiosForActivity.put(`/api/activity/activities/${activityData.id}`, activityData);

        // 检查响应状态并处理结果
        if (response.status === 200) {
          // 假设成功的话，可以发出一个成功的提示
          this.$emit('update-success', response.data); // 发射一个事件通知父组件更新成功
          ElMessage.success('活动更新成功');
        } else {
          // 如果状态码不是 200，处理错误情况
          ElMessage.error('活动更新失败: ' + response.statusText);
        }
      } catch (error) {
        // 捕获并处理请求过程中的异常
        console.error('更新活动时出错:', error);
        ElMessage.error('更新活动时发生错误: ' + error.message);
      }
    }

  }
};


// const saveEdit = async () => {
//   // 首先验证表单
//   const isFormValid = await editFormRef.value.validate();
//   if (!isFormValid) {
//     ElMessage.error('表单数据有误，请检查后再提交！');
//     return;
//   }

//   // 表单验证通过后，转换数据（例如，leaderIds数组转为字符串）
//   const submitData = {
//     ...form,
//   };

//   // 提交数据到服务器
//   try {
//     // 假设有一个函数 sendUpdateRequest 来处理实际的API调用
//     await sendUpdateRequest(submitData);
//     ElMessage.success('活动更新成功！');
//     // 成功后的处理，比如关闭弹窗
//     editVisible.value = false;
//     getData();
//   } catch (error) {
//     // 处理错误
//     ElMessage.error('更新活动失败！');
//   }


// };
</script>