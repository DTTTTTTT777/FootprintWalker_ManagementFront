<template>

  <div>
    <div class="container">
      <!-- 查询部分 -->
      <div class="handle-box">
        <el-input v-model="query.value" placeholder="搜索内容" class="handle-input mr10"></el-input>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button type="primary" :icon="Plus" @click="openAddDialog">新增</el-button>
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
  </div>


  <!-- 新增活动对话框 -->
  <el-dialog title="新增活动" v-model="addDialogVisible">
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
          <!-- 新增负责人ID输入 -->
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
                  v-for="(image, index) in form.adImages"
                  :key="index"
                  class="collection-img"
                  :src="image"
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

        <!-- 组织细节表单项 -->
        <div class="section">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="组织细节" prop="organizeDetails">
                <el-input type="textarea" v-model="form.organizeDetails"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 操作按钮 -->
        <div class="section action-buttons">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button type="default" @click="saveAsDraft">存为草稿</el-button>
        </div>
      </el-form>
    </div>
  </el-dialog>

  <edit-activity-dialog
    v-if="editVisible"
    :activityData="form"
    v-model="editVisible"
    @close="handleEditClose"
  ></edit-activity-dialog>

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

</template>


<script setup lang="ts" name="basetable">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { axiosForActivity } from '../main.js';
import { getClerkList } from '@/tools/apiRequest.js'
import {Delete, Edit, Search, Plus, View} from '@element-plus/icons-vue';
import{ formatDateTime , joinCampuses,formatActivityStatus ,getStatusType} from '@/tools/Format.js'
import qs from 'qs'
import EditActivityDialog from '@/components/editActivity.vue';



// 表格编辑时弹窗和保存
const editVisible = ref(false);
// 表格查看详细资料时弹窗和保存
const viewVisible = ref(false);
let idx: number = -1;



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

const tableData = ref<TableItem[]>([]);
const pageTotal = ref(0);
let clerksMap = {}
const editFormRef = ref(null);

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

const addDialogVisible = ref(false);
const addFormRef = ref(null);

let clerksList =ref([]);

let form = reactive({
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
  activityStatus: 'DRAFT', // 这应该是 ActivityStatus 枚举的一个值
  leaderIds: [],
  adImages: [],
  organizeDetails: '',
  participantIds: [],
  files: [],
  initiatorId : -1,
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


console.log("adImages", form.adImages)

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
const getClerkData = async () => {
    clerksList = await getClerkList();
    console.log(clerksList)
}

getClerkData()


const handleError = (err, file, fileList) => {
  // 处理上传失败
  ElMessage.error('图片上传失败');
};
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


const getData = async () => {
  try {
    const response = await axiosForActivity.get('/api/activity/activities/status', {
      params: {
        statuses: ['DRAFT', 'REJECTED'],
        page: query.pageIndex - 1, // Spring Data JPA 页码从0开始
        size: query.pageSize,
        search: query.value, // 搜索条件

      },
      paramsSerializer: params => {
        // 使用 qs 自定义序列化参数
        return qs.stringify(params, { arrayFormat: 'repeat' })
      }
    });
    clerksList = await getClerkList();

    // 根据ID获取负责人的名字的方法
    // 从ID映射到名字的计算属性
    clerksMap = computed(() => {
          const map = {};
          if (!clerksList || !Array.isArray(clerksList)) {
            console.error('clerksList is invalid:', clerksList);
            return map; // 返回一个空的映射
          }
          // console.log(clerksList)
          // console.log(clerksList.value)
          clerksList.forEach(clerk => {
            if (clerk && clerk.id != null && clerk.name) {
              // console.log(clerk)
              map[clerk.id] = clerk.name;
            } else {
              console.warn('Invalid clerk data:', clerk);
            }
          });

          return map;
        });
        
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

function getClerkNameById(id) {
  return clerksMap.value[id] || '未知'; // 如果找不到ID，则返回'未知'
}


const handleEditClose = ()=>{
    editVisible.value = false;
    console.log("成功关闭新增页面")
    getData();
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
    form.activityStatus = "PENDING_REVIEW";
    const id=localStorage.getItem("id");
    console.log("clerkId",id);
    form.initiatorId = Number(id);

    // 假设使用 axios 发送 POST 请求
    // 替换 URL 和 post 数据结构为您的实际需求
    const response = await axiosForActivity.post('/api/activity/activities', form);
    // 根据响应处理结果
    if (response.status === 200) {
      ElMessage.success('活动提交成功');
      addDialogVisible.value = false; // 关闭对话框
    } else {
      ElMessage.error('活动提交失败');
    }
  } catch (error) {
    // 处理错误情况
    console.error('提交活动时出错:', error);
    ElMessage.error('提交活动时发生错误');
  }
};

const saveAsDraft= async () =>  {
    try {
      form.activityStatus = 'DRAFT';
      const response = await axiosForActivity.post('/api/activity/activities', form);
      if (response.status === 200) {
        ElMessage.success('活动提交成功');
        addDialogVisible.value = false; // 关闭对话框
      } else {
        ElMessage.error('活动提交失败');
      }
    }catch (error)
    {
      console.error('提交活动时出错:', error);
      ElMessage.error('提交活动时发生错误');
    }
}

// 打开新增对话框的方法
function openAddDialog() {
  addDialogVisible.value = true;
}

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


const saveDelete = async (index: number) => {
  try {
    const id = tableData.value[index].id;
    await axiosForActivity.delete(`/api/activity/activities/${id}`);
    ElMessage.success('数据删除成功');
  } catch (error) {
    ElMessage.error('数据删除失败');
  }
};

// 检查是否是最后一个ID，以避免在列表末尾添加逗号
function isLastClerkId(id) {
  return view.leaderIds.indexOf(id) === view.leaderIds.length - 1;
}



const sendUpdateRequest = async (data) => {

  console.log('正在提交数据:', data);
  await axiosForActivity.put('/api/activity/activities/' + data.id, data);

  // 模拟等待响应
  await new Promise(resolve => setTimeout(resolve, 1000));
};

const handleClose = () => {

  viewVisible.value = false;
};


</script>


<style scoped>

.handle-box {
  margin-bottom: 20px;
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


