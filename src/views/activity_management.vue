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

        <!-- 添加负责人ID列 -->
        <el-table-column label="负责人ID" align="center">
          <template #default="scope">
            <div v-for="id in scope.row.leaderIds" :key="id">{{ id }}</div>
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
            <el-option label="待审核" value="PENDING_REVIEW"></el-option>
            <el-option label="往期回顾" value="RETROSPECTIVE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="活动收费" prop="cost">
          <el-input-number v-model="form.cost" :min="0" controls-position="right" style="width: 40%;"></el-input-number>
        </el-form-item>
        <el-form-item label="人数上限" prop="estimatedLimit">
          <el-input-number v-model="form.estimatedLimit" :min="1" controls-position="right" style="width: 40%;"></el-input-number>
        </el-form-item>
        <el-form-item label="负责人ID" prop="leaderIds">
          <el-input v-model="form.leaderIds" placeholder="请输入负责人ID，多个ID以逗号分隔"></el-input>
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
      <el-descriptions bordered column="1">
        <el-descriptions-item label="活动ID">{{ view.id }}</el-descriptions-item>
        <el-descriptions-item label="活动标题">{{ view.title }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ formatDateTime(view.startTime) }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ formatDateTime(view.endTime) }}</el-descriptions-item>
        <el-descriptions-item label="报名开始时间">{{ formatDateTime(view.registrationStartTime) }}</el-descriptions-item>
        <el-descriptions-item label="报名结束时间">{{ formatDateTime(view.registrationEndTime) }}</el-descriptions-item>
        <el-descriptions-item label="活动地点">{{ view.location }}</el-descriptions-item>
        <el-descriptions-item label="校区">{{ joinCampuses(view.campus) }}</el-descriptions-item>
        <el-descriptions-item label="费用">{{ view.cost }}</el-descriptions-item>
        <el-descriptions-item label="活动信息">{{ view.activityInfo }}</el-descriptions-item>
        <el-descriptions-item label="当前参与人数">{{ view.currentParticipants }}</el-descriptions-item>
        <el-descriptions-item label="预计参与人数上限">{{ view.estimatedLimit }}</el-descriptions-item>
        <el-descriptions-item label="活动状态">{{ formatActivityStatus(view.activityStatus) }}</el-descriptions-item>
        <el-descriptions-item label="负责人ID">{{ view.leaderIds.join(', ') }}</el-descriptions-item>
        <el-descriptions-item label="图片">
          <div v-for="image in view.adImages" :key="image">
            <img :src="image" alt="图片" style="max-width: 100px; max-height: 100px;">
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="组织细节">{{ view.organizeDetails }}</el-descriptions-item>
        <el-descriptions-item label="参与者ID">{{ view.participantIds.join(', ') }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

  </div>
</template>


<script setup lang="ts" name="basetable">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, Plus, View } from '@element-plus/icons-vue';
import { axiosForActivity } from '../main.js';
import{ formatDateTime , joinCampuses,formatActivityStatus} from '@/tools/Format.js'
// import { fetchData } from '../api/index';
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

function getToken() {
  // 替换为获取token的逻辑
  const UserInfo = useUserInfo();
  return UserInfo.userToken;

}

// 创建一个具有默认头的Axios实例
const axiosInstance = axios.create({
  baseURL: 'http://42.192.39.198:5000/api',
});

const print = ({
  time: "",
})

// 拦截器：将token添加到每个请求中
// axiosInstance.interceptors.request.use((config) => {
//   const token = getToken();
//
//   console.log(token);
//
//   if (token) {
//     if (config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     } else {
//       config.headers = {
//         Authorization: `Bearer ${token}`,
//       };
//     }
//   }
//
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });
const tableData = ref<TableItem[]>([]);


//获取后端数据库的数据
const fetchData = async () => {
  try {

    axiosForActivity.get('/api/activity/activities').then(response => {
      console.log('Response from Service B:', response.data);
      tableData.value = response.data;
      console.log(tableData);
    });

  } catch (error) {
    console.error(error);
  }
};

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
  collectionType: ' ',        //文物类别
  era: ' ',         //文物的朝代
  status: ' ',      //藏品状态
  excavation_site: ' ',    //出土地
  excavation_date: ' ',   //出土日期
  collectTime: '',	//收藏的时间
  pageIndex: 1,      //所在页面
  pageSize: 10,       //总页面
  storageInfo: {
    currentStatus: '',
    protectionLevel: ''
  },
  value: '',
});
//文物展示表格的数据

const pageTotal = ref(0);
let filteredData = ref<TableItem[]>([]); // 保存筛选的数据

const editFormRef = ref(null);

// 获取表格数据
const getData = () => {
  fetchData();
};
getData();

// 查询操作
const handleSearch = () => {
  query.pageIndex = 1;
  getData();
};
// 分页导航
const handlePageChange = (val: number) => {
  query.pageIndex = val;
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
    cost:0
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
  console.log(viewVisible.value)
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








</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}

.handle-select {
  width: 120px;
}

.handle-input {
  width: 300px;
}

.table {
  width: 100%;
  font-size: 14px;
}

.red {
  color: #F56C6C;
}

.mr10 {
  margin-right: 10px;
}

.mr11 {
  width: 150px;
  margin-right: 10px;
}

.table-td-thumb {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}

.el-descriptions {
  margin-top: 20px;
}

.cell-item {
  display: flex;
  align-items: center;
}

.margin-top {
  margin-top: 20px;
}

.CollectionImg {
  float: left;
  width: 200px;
  height: 130px;
  margin: 10px;

}
.my-message-box {
  /* 自定义样式 */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
