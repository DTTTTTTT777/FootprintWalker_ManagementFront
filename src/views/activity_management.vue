<template>
  <div>
    <div class="container">
      <!-- 查询部分 -->
      <div class="handle-box">
        <el-input v-model="query.value" placeholder="搜索内容" class="handle-input mr10"></el-input>
        <div style="display: inline-block;"><el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button></div>
      </div>

      <!-- 活动详细信息的表格界面 -->
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column prop="id" label="活动ID" width="110" align="center" sortable></el-table-column>
        <el-table-column prop="title" label="活动标题" align="center"></el-table-column>
        <el-table-column prop="startTime" label="开始时间" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="registrationStartTime" label="报名开始时间" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.registrationStartTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="registrationEndTime" label="报名结束时间" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.registrationEndTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="活动地点" align="center"></el-table-column>

        <!-- 合并当前参与者数和预计参与上限 -->
        <el-table-column label="参与者数 (当前/上限)" align="center">
          <template #default="scope">
            {{ scope.row.currentParticipants + '/' + scope.row.estimatedLimit }}
          </template>
        </el-table-column>

        <!-- 添加负责人名字列 -->
        <el-table-column label="负责人" align="center">
          <template #default="scope">
            <div v-for="id in scope.row.leaderIds" :key="id">
              {{ getClerkNameById(id) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="活动发起人" align="center">
          <template #default="scope">
            {{ getClerkNameById(scope.row.initiatorId) }}
          </template>
        </el-table-column>


        <el-table-column label="活动状态" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.activityStatus)">
              {{ formatActivityStatus(scope.row.activityStatus) }}
            </el-tag>
          </template>
        </el-table-column>



        <!-- 操作列 -->
        <el-table-column label="操作" width="400" align="center">
          <template #default="scope">
            <el-button text :icon="Edit" @click="handleEdit(scope.$index, scope.row)">修改活动</el-button>
            <el-button text :icon="Delete" @click="handleDelete(scope.$index, scope.row)">删除活动</el-button>
            <el-button text :icon="View" @click="handleView(scope.$index, scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination background layout="total, prev, pager, next" :current-page="query.pageIndex"
                       :page-size="query.pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
      </div>
    </div>

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
        <el-form-item>
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
                    v-for="(image, index) in form.adImages"
                    :key="index"
                    class="collection-img"
                    :src="image"
                    :fit="'cover'">
                </el-image>
              </div>
            </el-form-item>
          </div>
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
        <!-- ...根据需要添加其他表单项... -->
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">确定</el-button>
      </span>
      </template>
    </el-dialog>

    <!-- 查看弹出框 -->
    <el-dialog title="查看活动详情" v-model="viewVisible" width="80%" :before-close="handleClose">
      <div class="dialog-content">
        <el-descriptions bordered column="1" class="descriptions">
          <el-descriptions-item label="活动ID">{{ view.id }}</el-descriptions-item>
          <el-descriptions-item label="活动标题">{{ view.title }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ formatDateTime(view.startTime) }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ formatDateTime(view.endTime) }}</el-descriptions-item>
          <el-descriptions-item label="报名开始时间">{{ formatDateTime(view.registrationStartTime) }}</el-descriptions-item>
          <el-descriptions-item label="报名结束时间">{{ formatDateTime(view.registrationEndTime) }}</el-descriptions-item>
          <el-descriptions-item label="活动地点">{{ view.location }}</el-descriptions-item>
          <el-descriptions-item label="校区">{{ joinCampuses(view.campus) }}</el-descriptions-item>
          <el-descriptions-item label="费用">{{ view.cost }}</el-descriptions-item>
          <el-descriptions-item label="活动信息">
            <div style="white-space: pre-wrap;">{{ view.activityInfo }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="当前参与人数">{{ view.currentParticipants }}</el-descriptions-item>
          <el-descriptions-item label="预计参与人数上限">{{ view.estimatedLimit }}</el-descriptions-item>
          <el-descriptions-item label="活动状态">{{ formatActivityStatus(view.activityStatus) }}</el-descriptions-item>
          <el-descriptions-item label="负责人">
            <template v-for="id in view.leaderIds" :key="id">
              {{ getClerkNameById(id) }}<span v-if="!isLastClerkId(id)">, </span>
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="图片" class="activity-images">
            <div v-for="image in view.adImages" :key="image">
              <img :src="image" alt="活动图片" style="max-width: 100px; max-height: 100px; margin-right: 10px;">
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="组织细节">{{ view.organizeDetails }}</el-descriptions-item>
          <el-descriptions-item label="参与者ID">{{ view.participantIds.join(', ') }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

  </div>
</template>


<script setup lang="ts" name="basetable">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, Plus, View } from '@element-plus/icons-vue';
import { axiosForActivity , axiosForHuman} from '../main.js';
import{ formatDateTime , joinCampuses,formatActivityStatus ,getStatusType} from '@/tools/Format.js';
import { getClerkList } from '@/tools/apiRequest.js';
import qs from 'qs'

import EditActivityDialog from '@/components/editActivity.vue';

import { onMounted } from 'vue'
import {
  Iphone,
  Location,
  OfficeBuilding,
  Tickets,
  User,
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'; // 导入useRouter
import axios from 'axios'

import { useUserInfo } from "@/store/userInfo";
import { useBaseUrl } from "@/store/baseUrl";

const tableData = ref<TableItem[]>([]);

//表格中展示的数据
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
  initiatorId : number;
  files: string[],
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

//请求数据
const query = reactive({
  name: '',         //文物姓名
  id: '',           //文物id

  pageIndex: 1,      //所在页面
  pageSize: 10,       //总页面

  value: '',
});


const pageTotal = ref(0);
let filteredData = ref<TableItem[]>([]); // 保存筛选的数据
let clerksList = ref([])
const editFormRef = ref(null);
let clerksMap = {}


// 获取表格数据
const getData = async () => {
  try {
    const response = await axiosForActivity.get('/api/activity/activities/status', {
      params: {
        statuses: ['PUBLISHED', 'RETROSPECTIVE'],
        page: query.pageIndex - 1, // Spring Data JPA 页码从0开始
        size: query.pageSize,
        search: query.value, // 这里是搜索条件，确保后端支持该参数
        // 可能还有其他过滤条件
      },
      paramsSerializer: params => {
        // 使用 qs 自定义序列化参数
        return qs.stringify(params, { arrayFormat: 'repeat' })
      }
    });
    clerksList = await getClerkList();


    // 打印响应数据，便于调试
    console.log(response.data);
    console.log(clerksList);

// 根据ID获取负责人的名字的方法
// 从ID映射到名字的计算属性
    clerksMap = computed(() => {
        const map = {};
        if (!clerksList || !Array.isArray(clerksList)) {
          console.error('clerksList is invalid:', clerksList);
          return map; // 返回一个空的映射
        }
        console.log(clerksList)
        console.log(clerksList.value)
        clerksList.forEach(clerk => {
          if (clerk && clerk.id != null && clerk.name) {
            console.log(clerk)
            map[clerk.id] = clerk.name;
          } else {
            console.warn('Invalid clerk data:', clerk);
          }
        });

        return map;
    });

    tableData.value = response.data.content.map(activity => {
      // 将 participantIds 数组长度设置为 currentParticipants
      activity.currentParticipants = activity.participantIds.length;
      return activity;
    });
    // 更新表格数据
    pageTotal.value = response.data.totalElements; // 总条目数在totalElements字段中
  } catch (error) {
    console.error(error);
  }
};



getData();



// 根据ID获取负责人的名字的方法
function getClerkNameById(id) {
  return clerksMap.value[id] || '未知'; // 如果找不到ID，则返回'未知'
}

// 检查是否是最后一个ID，以避免在列表末尾添加逗号
function isLastClerkId(id) {
  return view.leaderIds.indexOf(id) === view.leaderIds.length - 1;
}


// 分页导航
const handlePageChange = (val: number) => {
  query.pageIndex = val;
  getData();
};

// 查询操作
const handleSearch = () => {
  query.pageIndex = 1; // 从第一页开始显示搜索结果
  getData();
};



const saveDelete = async (index: number) => {
  try {
    const id = tableData.value[index].id;
    await axiosForActivity.delete(`/api/activity/activities/${id}`);
    ElMessage.success('数据删除成功');
  } catch (error) {
    ElMessage.error('数据删除失败');
  }
};
// 处理删除操作
const handleDelete = (index: number, row: any) => {
  // 二次确认删除
  ElMessageBox.confirm('确定要删除吗？', '提示', {
    type: 'warning',customClass: 'my-message-box'
  })
      .then(async () => {

        // 在这里调用 saveDelete 并传递要删除的数据索引
        await saveDelete(index);
        getData();
      })
      .catch(() => { });
};


// 表格编辑时弹窗和保存
const editVisible = ref(false);
// 表格查看详细资料时弹窗和保存
const viewVisible = ref(false);


const handleClose = () => {

  viewVisible.value = false;
};



//表单填写的内容
let form = reactive({
    id: 0,
    title: '',
    startTime: '',
    endTime: '',
    registrationStartTime: '',
    registrationEndTime: '',
    location: '',
    activityInfo: '',
    activityStatus: '',
    estimatedLimit: null,
    leaderIds: [],
    cost:0,
    initiatorId: -1,
    files: [],
    adImages:[]

});
//查看的内容
let view = reactive({
    id: 0,
    title: '',
    startTime: '',
    endTime: '',
    campus:[],
    registrationStartTime: '',
    registrationEndTime: '',
    location: '',
    cost:0,
    activityInfo: '',
    activityStatus: '',
    estimatedLimit: null,
    currentParticipants:null,
    organizeDetails: '',
    adImages:[],
    participantIds: [],
    leaderIds: [],
    initiatorId: -1,
});

//处理编辑操作
let idx: number = -1;
//获取当前系统时间
let time: string = "";
//打开编辑框
const handleEdit = (index: number, row: any) => {
  //将目前表格中的内容先同步到编辑框内
  Object.assign(form, row);
  editVisible.value = true;
  idx = index
};

const handleView = (index: number, row: any) => {
  //将目前表格中的内容先同步到编辑框内
  Object.assign(view, row);
  viewVisible.value = true;
  idx = index;
};

//处理查看操作
let i: number = -1;
// const view = ref<TableItem[]>([]);


const sendUpdateRequest = async (data) => {

  console.log('正在提交数据:', data);
  await axiosForActivity.put('/api/activity/activities/' + data.id, data);

  // 模拟等待响应
  await new Promise(resolve => setTimeout(resolve, 1000));
};

let radio = ref(3);

async function uploadData(submitData) {
  try {
    const response = await axiosForActivity.post('/api/activities', submitData);
    return response.data;
  } catch (error) {
    // 错误处理
    throw error; // 或者返回错误信息，取决于您如何处理这些错误
  }
}

//存储编辑的内容
const saveEdit = async () => {
  // 首先验证表单
  console.log(editFormRef)
  const isFormValid = await editFormRef.value.validate();
  if (!isFormValid) {
    ElMessage.error('表单数据有误，请检查后再提交！');
    return;
  }

  // 表单验证通过后，转换数据（例如，leaderIds数组转为字符串）
  const submitData = {
    ...form,
  };

  // 提交数据到服务器
  try {
    // 假设有一个函数 sendUpdateRequest 来处理实际的API调用
    await sendUpdateRequest(submitData);
    ElMessage.success('活动更新成功！');
    // 成功后的处理，比如关闭弹窗
    editVisible.value = false;
    getData();
  } catch (error) {
    // 处理错误
    ElMessage.error('更新活动失败！');
  }


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
const handleSuccess = (response, file) => {
  // 处理上传成功后的回调
  console.log('上传成功', response);

  console.log(response.success);
  if(response.success == true)
    form.adImages.push(response.data.url);
  else
    form.adImages.push(response.images);
  console.log(form.adImages);
  // 在回调中处理SM.MS返回的数据，可以获取图片链接等信息
};

const handleError = (err, file, fileList) => {
  // 处理上传失败
  ElMessage.error('图片上传失败');
};

</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}

.dialog-content {
  background-color: #f5f5f5; /* 轻微灰色背景 */
  padding: 15px; /* 内边距 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* 轻微阴影效果 */
}


.handle-input {
  width: 300px;
}

.table {
  width: 100%;
  font-size: 14px;
}

.mr10 {
  margin-right: 10px;
}

.descriptions .el-descriptions-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.descriptions .el-descriptions-item label {
  font-weight: bold;
  color: #333;
  min-width: 150px; /* 确保标签宽度一致 */
  text-align: right; /* 标签文字右对齐 */
  margin-right: 16px; /* 标签和内容之间的间距 */
}

.descriptions .el-descriptions-item .content {
  flex-grow: 1;
  text-align: left; /* 内容文字左对齐 */
  color: #666; /* 内容文字颜色 */
}
.activity-images img {
  border-radius: 4px;
  margin-right: 10px;
}
</style>
