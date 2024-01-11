<template>
    <div title="新增活动"  width="100%">
      <el-form :model="form" ref="addFormRef" label-width="120px" label-position="right">
        <el-row :gutter="20">
          <el-col :span="12">
            <!-- 活动标题 -->
            <el-form-item label="活动标题" prop="title" required>
              <el-input v-model="form.title"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 活动地点 -->
            <el-form-item label="活动地点" prop="location" required>
              <el-input v-model="form.location"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 时间选择器 -->
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

        <el-descriptions :span="2">
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Picture />
                </el-icon>
                活动图片*
              </div>
            </template>

            <el-upload
                v-model:file-list="form.adImages"
                class="upload-demo"
                multiple="false"
                action="/foreignImage/upload"
                name="smfile"
                :headers="{ Authorization: '36BZaEnY8eVdNuWGWhg0LgmSHByiHEGP' }"
                :on-success="handleSuccess"
                :on-error="handleError"
                :before-upload="beforeUpload"
                :limit="10"
                :on-exceed="handleExceed"
                prop="adImages"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
            <!-- 显示已上传的图片 -->
            <div v-if="form.adImages.length > 0">
              <el-image
                  v-for="(image, index) in form.adImages"
                  :key="index"
                  class="collection-img"
                  :src="image"
                  :fit="'cover'"
              ></el-image>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 活动描述 -->
        <el-form-item label="活动描述" prop="activityInfo">
          <el-input type="textarea" v-model="form.activityInfo"></el-input>
        </el-form-item>

        <!-- 活动收费 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动收费" prop="cost">
              <el-input-number v-model="form.cost" :min="0" controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计参与人数上限" prop="estimatedLimit">
              <el-input-number v-model="form.estimatedLimit" :min="1" controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">提交</el-button>
        </div>
      </el-form>
    </div>

</template>

<script setup lang="ts" name="basetable">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
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


const form = reactive({
  id: 0, // 初始值为 0，但实际上应由数据库或其他来源生成
  title: '',
  startTime: '', // 格式为 'YYYY-MM-DDTHH:mm:ss'
  endTime: '',
  registrationStartTime: '',
  registrationEndTime: '',
  location: '',
  campus: [], // 根据实际的 CampusData 枚举值来填充
  cost: 0.0,
  activityInfo: '',
  currentParticipants: 0,
  estimatedLimit: 0,
  activityStatus: '', // 这应该是 ActivityStatus 枚举的一个值
  leaderIds: [],
  adImages: [],
  organizeDetails: '',
  participantIds: [],
});

const handleSuccess = (response, file, fileList) => {
  // 处理上传成功
  form.adImages = [response.url];
};

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


</script>


<style scoped>

</style>


