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
            <div class="custom-button-container">
              <el-button @click="handleView(scope.$index,scope.row)">查看</el-button>
              <el-button type="success" @click="handleApprove(scope.row)">批准</el-button>
              <el-button type="danger" @click="handleReject(scope.row)">驳回</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination background layout="total, prev, pager, next" :current-page="query.pageIndex"
                       :page-size="query.pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
      </div>
    </div>

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


<script setup lang="ts" name="basetable">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, Plus, View } from '@element-plus/icons-vue';
import {axiosForActivity, axiosForFinance, axiosForHuman} from '../main.js';
import{ formatDateTime , joinCampuses,formatActivityStatus ,getStatusType} from '@/tools/Format.js'
import { getClerkList } from '@/tools/apiRequest'

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
  rejectReason : string;
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
let clerksList = ref([])
const editFormRef = ref(null);
let rejectReason = ref({})

// 根据ID获取负责人的名字的方法
// 从ID映射到名字的计算属性
const clerksMap = computed(() => {
  const map = {};
  console.log(clerksList)
  clerksList.forEach(clerk => {
    map[clerk.id] = clerk.name;
  });
  return map;
});

// 根据ID获取负责人的名字的方法
function getClerkNameById(id) {
  return clerksMap.value[id] || '未知'; // 如果找不到ID，则返回'未知'
}

// 检查是否是最后一个ID，以避免在列表末尾添加逗号
function isLastClerkId(id) {
  return view.leaderIds.indexOf(id) === view.leaderIds.length - 1;
}

// 获取表格数据
const getData = async () => {
  try {
    const response = await axiosForActivity.get('/api/activity/activities/pending-review', {
      params: {
        page: query.pageIndex - 1, // Spring Data JPA 页码从0开始
        size: query.pageSize,
        search: query.value, // 这里是搜索条件，确保后端支持该参数
        // 可能还有其他过滤条件
      }
    });
    clerksList = await getClerkList()


    // 打印响应数据，便于调试
    console.log(response.data);
    console.log(clerksList);

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

const rejectVisible = ref(false);
const handleClose = () => {

  viewVisible.value = false;
};



//表单填写的内容
let form: {
  estimatedLimit: number;
  registrationEndTime: string;
  cost: number;
  campus: CampusData[];
  currentParticipants: number;
  organizeDetails: string;
  initiatorId: number;
  title: string;
  registrationStartTime: string;
  activityInfo: string;
  rejectReason: string;
  leaderIds: number[];
  activityStatus: ActivityStatus;
  startTime: string;
  location: string;
  participantIds: number[];
  id: number;
  endTime: string;
  adImages: string[]
};
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

const handleApprove = async (row: TableItem) => {
  try {
    const clerkType=localStorage.getItem("clerkType");
    console.log("clerkType",clerkType);
    console.log("row:",row);
    console.log("row.id:",row.id);

    row.activityStatus =  ActivityStatus.PUBLISHED;
    // 创建一个请求主体对象，其中包含新的活动状态
    const requestBody = {
      activityStatus: "PUBLISHED" // 假设这是您要设置的新状态
    };
    await axiosForActivity.put(`/api/activity/activities/${row.id}/status`, requestBody)

    ElMessage.success('申请已批准');
    getData();
  } catch (error) {
    ElMessage.error('操作失败');
    console.error(error);
  }
};

// 显示驳回对话框
const handleReject = (row: TableItem) => {
  form = { ...row };
  rejectVisible.value = true;
};

// 确认驳回
const confirmReject = async () => {
  try {
    const requestBody = {
      activityStatus: "REJECTED"
    };
    console.log(form.id)
    await axiosForActivity.put(`/api/activity/activities/${form.id}/status`, requestBody)
    ElMessage.success('申请已驳回');
    rejectVisible.value = false;
    getData();
  } catch (error) {
    ElMessage.error('操作失败');
    console.error(error);
  }
};

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

// 根据活动状态返回对应的 el-tag 类型
function getStatusType(status) {
  switch (status) {
    case 'PUBLISHED':
      return 'success'; // 绿色
    case 'DRAFT':
      return 'info'; // 蓝色
    case 'PENDING_REVIEW':
      return 'warning'; // 黄色
    case 'RETROSPECTIVE':
      return 'danger'; // 红色
    default:
      return 'default'; // 默认灰色
  }
}







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
