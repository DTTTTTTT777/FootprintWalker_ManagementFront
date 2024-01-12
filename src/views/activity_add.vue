<template>
  <div class="activity-form-container">
    <el-form :model="form" ref="addFormRef" label-width="120px" label-position="right">
      <!-- 活动基本信息 -->
      <div class="section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动标题" prop="title" required>
              <el-input v-model="form.title"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动地点" prop="location" required>
              <el-input v-model="form.location"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime" required>
              <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime" required>
              <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始报名时间" prop="registrationStartTime" required>
              <el-date-picker v-model="form.registrationStartTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束报名时间" prop="registrationEndTime" required>
              <el-date-picker v-model="form.registrationEndTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="校区选择" prop="campus" required>
              <el-select v-model="form.campus" multiple placeholder="选择校区">
                <el-option label="四平路校区" value="四平路校区"></el-option>
                <el-option label="嘉定校区" value="嘉定校区"></el-option>
                <el-option label="沪西校区" value="沪西校区"></el-option>
                <el-option label="沪北校区" value="沪北校区"></el-option>
                <!-- 添加其他校区选项 -->
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 新增负责人ID输入 -->
        <el-row :gutter="20">
          <el-col :span="12">
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
          </el-col>
        </el-row>

      </div>

      <!-- 图片上传区域 -->
      <div class="section upload-section">
        <el-form-item label="活动图片" prop="adImages">
          <el-upload
              v-model:file-list="form.files"
              class="upload-demo"
              action="/foreignImage/upload"
              name="smfile"
              :headers="{ Authorization: 'kydXBqSSWZNb12Q25q6OmXGGSKwajXXk' }"
              :on-success="handleSuccess"
              :on-error="handleError"
              :before-upload="beforeUpload"
              :limit="10"
              :on-exceed="handleExceed"
              list-type="picture-card"
              prop="proofInfo">
            <i class="el-icon-plus"></i>
          </el-upload>
          <div class="image-preview" v-if="form.adImages.length > 0">
            <el-image
                v-for="(image, index) in form.files"
                :key="index"
                class="collection-img"
                :src="image.response.data.url"
                :fit="'cover'">
            </el-image>
          </div>
        </el-form-item>
      </div>

      <!-- 更多表单项 -->
      <div class="section">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="活动描述" prop="activityInfo">
              <el-input type="textarea" v-model="form.activityInfo"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动收费" prop="cost" :min="0" controls-position="right">
              <el-input-number v-model="form.cost" :min="0" controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="人数上限" prop="estimatedLimit">
              <el-input-number v-model="form.estimatedLimit" :min="1" controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 操作按钮 -->
      <div class="section action-buttons">
        <el-button type="primary" @click="submitForm">提交</el-button>
      </div>
    </el-form>
  </div>
</template>


<script setup lang="ts" name="basetable">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { axiosForActivity } from '../main.js';
import { getClerkList } from'@/tools/apiRequest.js'
import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue';
import {
  Iphone,
  Location,
  OfficeBuilding,
  Tickets,
  User,
} from '@element-plus/icons-vue'

//import { fetchData } from '../api/index';
import { onMounted } from 'vue'
import axios from 'axios';
import type { FormInstance, FormRules } from 'element-plus'

import { useBaseUrl } from "@/store/baseUrl";
import { useUserInfo } from "@/store/userInfo";



interface TableItem {
  id: number; // 活动的唯一标识
  title: string; // 活动标题
  startTime: string; // 活动开始时间，ISO 8601 字符串格式
  endTime: string; // 活动结束时间，ISO 8601 字符串格式
  registrationStartTime: string; // 报名开始时间，ISO 8601 字符串格式
  registrationEndTime: string; // 报名结束时间，ISO 8601 字符串格式
  location: string; // 活动地点
  campus: CampusData[]; // 参与的校区，枚举类型数组
  cost: number; // 活动费用
  activityInfo: string; // 活动详细信息
  currentParticipants: number; // 当前参与人数
  estimatedLimit: number; // 预计参与人数上限
  activityStatus: ActivityStatus; // 活动状态，枚举类型
  leaderIds: number[]; // 负责人的ID列表
  adImages: string[]; // 活动广告图片的URL列表
  organizeDetails: string; // 组织细节
  participantIds: number[]; // 参与者ID列表
  initiatorId : number; // 活动发起人的用户ID

}

enum ActivityStatus {
  PUBLISHED,
  DRAFT,
  PENDING_REVIEW,
  RETROSPECTIVE,
}

enum CampusData {
  SIPING = "四平路校区",
  JIADING = "嘉定校区",
  HUXI = "沪西校区",
  HUBEI = "沪北校区",
}

const addFormRef = ref(null);

let clerksList =ref([]);
const form = reactive({
  id: 0, // 初始值为 0，但实际上应由数据库或其他来源生成
  title: '',
  startTime: '', // 格式为 'YYYY-MM-DDTHH:mm:ss'
  endTime: '',
  registrationStartTime: '',
  registrationEndTime: '',
  location: '',
  campus: ["四平路校区"], // 根据实际的 CampusData 枚举值来填充
  cost: 0.0,
  activityInfo: '',
  currentParticipants: 0,
  estimatedLimit: 0,
  activityStatus: 'PENDING_REVIEW', // 这应该是 ActivityStatus 枚举的一个值
  leaderIds: [],
  adImages: [],
  organizeDetails: '',
  participantIds: [],
  files: [],
  initiatorId : -1,
});
console.log("adImages", form.adImages)
const handleSuccess = (response, file, fileList) => {
  // 处理上传成功
  if(response.code == "success") {
  }
  else
  {

  }
};
const getData = async () => {
    clerksList = await getClerkList();
    console.log(clerksList)
}
getData()
const handleError = (err, file, fileList) => {
  // 处理上传失败
  ElMessage.error('图片上传失败');
};

const beforeUpload = (file) => {
  // 上传前的校验
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isImage) {
    ElMessage.error('上传图片只能是 JPG 或 PNG 格式!');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

const handleExceed = (files, fileList) => {
  // 文件超出限制时的处理
  ElMessage.warning('只能上传一张图片');
};

const iconStyle = computed(() => {
  const marginMap = {
    large: '8px',
    default: '6px',
    small: '4px',
  }
  return {
    marginRight: marginMap.default,
  }
})

const submitForm = async () => {
  // 首先，确保表单引用已定义
  if (!addFormRef.value) {
    ElMessage.error('表单引用未定义');
    return;
  }

  // 验证表单
  const isValid = await addFormRef.value.validate();
  if (!isValid) {
    ElMessage.error('表单数据有误，请检查输入');
    return;
  }

  // 提交表单数据
  try {

    form.adImages = form.files.map(file => file.response && file.response.data ? file.response.data.url : null);
    const id=localStorage.getItem("id");
    console.log("clerkId",id);
    form.initiatorId = Number(id);

    // 假设使用 axios 发送 POST 请求
    // 替换 URL 和 post 数据结构为您的实际需求
    const response = await axiosForActivity.post('/api/activity/activities', form);
    // 根据响应处理结果
    if (response.status === 200) {
      ElMessage.success('活动提交成功');
      // 可能还需要进行一些操作，比如清空表单或跳转到其他页面
    } else {
      ElMessage.error('活动提交失败');
    }
  } catch (error) {
    // 处理错误情况
    console.error('提交活动时出错:', error);
    ElMessage.error('提交活动时发生错误');
  }
};


</script>


<style scoped>
.activity-form-container {
  max-width: 800px;
  margin: auto;
  background: #f5f5f5; /* 浅灰色背景 */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); /* 添加轻微阴影效果 */
}

.section {
  margin-bottom: 30px;
}

.upload-section .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  padding: 10px;
}

.upload-section .image-preview {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.collection-img {
  width: 100px;
  height: 100px;
  margin-right: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}

.action-buttons {
  text-align: right;
}


</style>


