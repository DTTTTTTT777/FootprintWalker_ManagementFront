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
        <el-table-column prop="startTime" label="开始时间" align="center"></el-table-column>
        <el-table-column prop="endTime" label="结束时间" align="center"></el-table-column>
        <el-table-column prop="registrationStartTime" label="报名开始时间" align="center"></el-table-column>
        <el-table-column prop="registrationEndTime" label="报名结束时间" align="center"></el-table-column>
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
    <el-dialog title="修改文物状态" v-model="editVisible" width="60%">
      <!-- 表单内容 -->
      <el-form label-width="70px">
        <!-- 根据需要添加或修改表单项 -->
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>


<script setup lang="ts" name="basetable">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, Plus, View } from '@element-plus/icons-vue';
import { axiosForActivity } from '../main.js';
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
  id: number;
  title: string;
  startTime: string; // 假设使用 ISO 8601 字符串格式
  endTime: string;
  registrationStartTime: string;
  registrationEndTime: string;
  location: string;
  campus: CampusData[]; // CampusData 是一个枚举类型
  cost: number;
  activityInfo: string;
  currentParticipants: number;
  estimatedLimit: number;
  activityStatus: ActivityStatus; // ActivityStatus 是一个枚举类型
  leaderIds: number[];
  adImages: string[];
  feedbackImages: string[];
  feedbacks: Feedback[]; // Feedback 是另一个实体类
  organizeDetails: string;
  participantIds: number[];
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

interface Feedback {

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
    const deletedItemId = tableData.value[index].collectionId;
    await axiosInstance.delete(`http://42.192.39.198:5000/api/Collections/${deletedItemId}`);
    ElMessage.success('数据删除成功');
  } catch (error) {
    ElMessage.error('数据删除失败');
  }
};
// 处理删除操作
const handleDelete = (index: number) => {
  // 二次确认删除
  ElMessageBox.confirm('确定要删除吗？', '提示', {
    type: 'warning',customClass: 'my-message-box'
  })
      .then(() => {
        ElMessage.success('删除成功');
        // 在这里调用 saveDelete 并传递要删除的数据索引
        saveDelete(index);
        tableData.value.splice(index, 1);
      })
      .catch(() => { });
};

// 表格编辑时弹窗和保存
const editVisible = ref(false);
// 表格查看详细资料时弹窗和保存
const viewVisible = ref(false);
const view2WarehouseVisible = ref(false);
const view2ExhibitionVisible = ref(false);
//表单填写的内容
let form = reactive({
  area: '',
  collectInfo: {
    collectionId: '',
    source: '',
    collectMuseum: '',
    generalRegistrationId: '',
    collectTime: '',
    collectionLevel: ''
  },
  collectionId: '',
  collectionPhoto: '',
  collectionType: '',
  completeness: '',
  completenessType: '',
  dimensionInfo: {
    collectionId: '',
    dimension: '',
    dimensionUnit: '',
    weight: '',
    weightUnit: '',
    realQuantity: '',
    traditionalQuantity: ''
  },
  era: '',
  identificationComments: '',
  identificationDate: '',
  identificationStaffName: '',
  name: '',
  remark: '',
  storageInfo: {
    currentStatus: '',
    protectionLevel: ''
  },
  originalName: '',
  textureType: '',
  exhibitionHallId: '',
  warehouseId: '',
  containerId: ''
});
//查看的内容
let view = reactive({
  area: '',
  collectInfo: {
    collectionId: '',
    source: '',
    collectMuseum: '',
    generalRegistrationId: '',
    collectTime: '',
    collectionLevel: ''
  },
  collectionId: '',
  collectionPhoto: '',
  collectionType: '',
  completeness: '',
  completenessType: '',
  dimensionInfo: {
    collectionId: '',
    dimension: '',
    dimensionUnit: '',
    weight: '',
    weightUnit: '',
    realQuantity: '',
    traditionalQuantity: ''
  },
  era: '',
  identificationComments: '',
  identificationDate: '',
  identificationStaffName: '',
  name: '',
  remark: '',
  storageInfo: {
    currentStatus: '',
    protectionLevel: ''
  },
  originalName: '',
  textureType: ''
});

//处理编辑操作
let idx: number = -1;
//获取当前系统时间
let time: string = "";
//打开编辑框
const handleEdit = (index: number, row: any) => {
  //将目前表格中的内容先同步到编辑框内
  form.area = row.area;
  form.collectInfo = {
    collectionId: row.collectInfo.collectionId,
    source: row.collectInfo.source,
    collectMuseum: row.collectInfo.collectMuseum,
    generalRegistrationId: row.collectInfo.generalRegistrationId,
    collectTime: row.collectInfo.collectTime,
    collectionLevel: row.collectInfo.collectionLevel
  };
  form.collectionId = row.collectionId;
  form.collectionPhoto = row.collectionPhoto;
  form.collectionType = row.collectionType;
  form.completeness = row.completeness;
  form.completenessType = row.completenessType;
  form.dimensionInfo = {
    collectionId: row.dimensionInfo.collectionId,
    dimension: row.dimensionInfo.dimension,
    dimensionUnit: row.dimensionInfo.dimensionUnit,
    weight: row.dimensionInfo.weight,
    weightUnit: row.dimensionInfo.weightUnit,
    realQuantity: row.dimensionInfo.realQuantity,
    traditionalQuantity: row.dimensionInfo.traditionalQuantity
  };
  form.era = row.era;
  form.identificationComments = row.identificationComments;
  form.identificationDate = row.identificationDate;
  form.identificationStaffName = row.identificationStaffName;
  form.name = row.name;
  form.remark = row.remark;
  form.storageInfo = {
    currentStatus: row.storageInfo.currentStatus,
    protectionLevel: row.storageInfo.protectionLevel
  };
  form.originalName = row.originalName;
  form.textureType = row.textureType;
  form.exhibitionHallId = row.exhibitionHallId;
  form.warehouseId = row.warehouseId;
  form.containerId=row.containerId;
  editVisible.value = true;
  idx = index
};

//处理查看操作
let i: number = -1;
// const view = ref<TableItem[]>([]);
const handleDetails = (index: number, row: any) => {
  view.area = row.area;
  view.collectInfo = {
    collectionId: row.collectInfo.collectionId,
    source: row.collectInfo.source,
    collectMuseum: row.collectInfo.collectMuseum,
    generalRegistrationId: row.collectInfo.generalRegistrationId,
    collectTime: row.collectInfo.collectTime,
    collectionLevel: row.collectInfo.collectionLevel
  };
  view.collectionId = row.collectionId;
  view.collectionPhoto = row.collectionPhoto;
  view.collectionType = row.collectionType;
  view.completeness = row.completeness;
  view.completenessType = row.completenessType;
  view.dimensionInfo = {
    collectionId: row.dimensionInfo.collectionId,
    dimension: row.dimensionInfo.dimension,
    dimensionUnit: row.dimensionInfo.dimensionUnit,
    weight: row.dimensionInfo.weight,
    weightUnit: row.dimensionInfo.weightUnit,
    realQuantity: row.dimensionInfo.realQuantity,
    traditionalQuantity: row.dimensionInfo.traditionalQuantity
  };
  view.era = row.era;
  view.identificationComments = row.identificationComments;
  view.identificationDate = row.identificationDate;
  view.identificationStaffName = row.identificationStaffName;
  view.name = row.name;
  view.remark = row.remark;
  view.storageInfo = {
    currentStatus: row.storageInfo.currentStatus,
    protectionLevel: row.storageInfo.protectionLevel
  };
  view.originalName = row.originalName;
  view.textureType = row.textureType;
  viewVisible.value = true;
};

const handleDetails2Exhibition = (index: number, row: any) => {
  view.area = row.area;
  view.collectInfo = {
    collectionId: row.collectInfo.collectionId,
    source: row.collectInfo.source,
    collectMuseum: row.collectInfo.collectMuseum,
    generalRegistrationId: row.collectInfo.generalRegistrationId,
    collectTime: row.collectInfo.collectTime,
    collectionLevel: row.collectInfo.collectionLevel
  };
  view.collectionId = row.collectionId;
  view.collectionPhoto = row.collectionPhoto;
  view.collectionType = row.collectionType;
  view.completeness = row.completeness;
  view.completenessType = row.completenessType;
  view.dimensionInfo = {
    collectionId: row.dimensionInfo.collectionId,
    dimension: row.dimensionInfo.dimension,
    dimensionUnit: row.dimensionInfo.dimensionUnit,
    weight: row.dimensionInfo.weight,
    weightUnit: row.dimensionInfo.weightUnit,
    realQuantity: row.dimensionInfo.realQuantity,
    traditionalQuantity: row.dimensionInfo.traditionalQuantity
  };
  view.era = row.era;
  view.identificationComments = row.identificationComments;
  view.identificationDate = row.identificationDate;
  view.identificationStaffName = row.identificationStaffName;
  view.name = row.name;
  view.remark = row.remark;
  view.storageInfo = {
    currentStatus: row.storageInfo.currentStatus,
    protectionLevel: row.storageInfo.protectionLevel
  };
  view.originalName = row.originalName;
  view.textureType = row.textureType;
  view2ExhibitionVisible.value = true;
  print.time=getCurrentTime();
};

const handleDetails2Warehouse = (index: number, row: any) => {
  view.area = row.area;
  view.collectInfo = {
    collectionId: row.collectInfo.collectionId,
    source: row.collectInfo.source,
    collectMuseum: row.collectInfo.collectMuseum,
    generalRegistrationId: row.collectInfo.generalRegistrationId,
    collectTime: row.collectInfo.collectTime,
    collectionLevel: row.collectInfo.collectionLevel
  };
  view.collectionId = row.collectionId;
  view.collectionPhoto = row.collectionPhoto;
  view.collectionType = row.collectionType;
  view.completeness = row.completeness;
  view.completenessType = row.completenessType;
  view.dimensionInfo = {
    collectionId: row.dimensionInfo.collectionId,
    dimension: row.dimensionInfo.dimension,
    dimensionUnit: row.dimensionInfo.dimensionUnit,
    weight: row.dimensionInfo.weight,
    weightUnit: row.dimensionInfo.weightUnit,
    realQuantity: row.dimensionInfo.realQuantity,
    traditionalQuantity: row.dimensionInfo.traditionalQuantity
  };
  view.era = row.era;
  view.identificationComments = row.identificationComments;
  view.identificationDate = row.identificationDate;
  view.identificationStaffName = row.identificationStaffName;
  view.name = row.name;
  view.remark = row.remark;
  view.storageInfo = {
    currentStatus: row.storageInfo.currentStatus,
    protectionLevel: row.storageInfo.protectionLevel
  };
  view.originalName = row.originalName;
  view.textureType = row.textureType;
  view2WarehouseVisible.value = true;
  print.time=getCurrentTime();
};


function getCurrentTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

//将数据上传到数据库中
const uploadData = async () => {
  console.log(tableData.value[idx])
  try {

    const response= await axiosInstance.put('/Collections/' + tableData.value[idx].collectionId, tableData.value[idx]);
    //const response = await axios.put('http://42.192.39.198:5000/api/Collections/' + tableData.value[idx].collectionId, tableData.value[idx]);
    ElMessage.success('数据上传成功');
    getData();
  } catch (error) {
    ElMessage.error('数据上传失败');
  }
};

let radio = ref(3);
//存储编辑的内容
const saveEdit = async () => {
  editVisible.value = false;
  //遇事不决console.log
  console.log('saveEdit')
  console.log(tableData.value[idx].collectionId)
  console.log(radio)
  // ElMessage.success(`修改第 ${idx + 1} 行成功`);
  tableData.value[idx].name = form.name;        //将修改的文物姓名同步到表格当中
  tableData.value[idx].collectionType = form.collectionType;        //将修改的文物的种类同步到表格当中
  tableData.value[idx].era = form.era;          //将修改的文物的朝代同步到表格当中
  // tableData.value[idx].status = form.status;      //将修改的文物的状态同步到表格当中
  // tableData.value[idx].hall_name = form.hall_name;      //将修改的文物的展厅名称同步到表格当中
  if (radio.value == 1) {
    tableData.value[idx].storageInfo.currentStatus = "在展";
    tableData.value[idx].exhibitionHallId = form.exhibitionHallId;
  }
  else if (radio.value == 2) {
    tableData.value[idx].storageInfo.currentStatus = "在库";
    tableData.value[idx].warehouseId = form.warehouseId;
    tableData.value[idx].containerId = form.containerId;
  }
  else if (radio.value == 3)
    tableData.value[idx].storageInfo.currentStatus = "待鉴定";
  else if (radio.value == 4)
    tableData.value[idx].storageInfo.currentStatus = "修缮中";

  radio.value = 3;

  tableData.value[idx].storageInfo.protectionLevel = form.storageInfo.protectionLevel;
  tableData.value[idx].textureType = form.textureType;
  tableData.value[idx].area = form.area;
  tableData.value[idx].collectInfo.source = form.collectInfo.source;
  tableData.value[idx].completeness = form.completeness;
  tableData.value[idx].dimensionInfo.dimension = form.dimensionInfo.dimension;
  tableData.value[idx].dimensionInfo.weight = form.dimensionInfo.weight;
  tableData.value[idx].dimensionInfo.traditionalQuantity = form.dimensionInfo.traditionalQuantity;
  tableData.value[idx].dimensionInfo.realQuantity = form.dimensionInfo.realQuantity;
  tableData.value[idx].identificationComments = form.identificationComments
  tableData.value[idx].remark = form.remark
  console.log(tableData.value);

  // Update frontend table data
  // tableData.value[idx] = updatedData;
  ElMessage.success(`修改第 ${idx + 1} 行成功`);  //弹出弹窗提示用户修改成功
  uploadData();

};
//关闭“查看详细信息”的弹窗
const closeView = () => {
  viewVisible.value = false;                    //editVisible.value被用来控制编辑界面或对话框的显示与隐藏
};
const closeView2Warehouse = () => {
  view2WarehouseVisible.value = false;                    //editVisible.value被用来控制编辑界面或对话框的显示与隐藏
};
const closeView2Exhibition = () => {
  view2ExhibitionVisible.value = false;                    //editVisible.value被用来控制编辑界面或对话框的显示与隐藏
};

// 文物种类下拉菜单的属性
interface TypeSelectItem {
  value: string
  index: number
}
const toSelectType = ref<TypeSelectItem[]>([])

//搜索符合条件的选项
const typeQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectType.value.filter(typeCreateFilter(queryString))
      : toSelectType.value
  cb(results)
}
const typeCreateFilter = (queryString: string) => {
  return (restaurant: TypeSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const typeLoadAll = () => {
  return [
    { value: '石器', index: 1 },
    { value: '陶器', index: 2 },
    { value: '石刻、造像', index: 3 },
    { value: '骨角器', index: 4 },
    { value: '俑', index: 5 },
    { value: '铜器', index: 6 },
    { value: '铁器', index: 7 },
    { value: '银器', index: 8 },
    { value: '金器', index: 9 },
    { value: '其他金属器（锡、铅等）', index: 10 },
    { value: '瓷器', index: 11 },
    { value: '玉器', index: 12 },
    { value: '宝石', index: 13 },
    { value: '珐琅', index: 14 },
    { value: '紫砂', index: 15 },
    { value: '玻璃器', index: 16 },
    { value: '书画', index: 17 },
    { value: '图书、文献', index: 18 },
    { value: '甲骨、简牍', index: 19 },
    { value: '文房用具', index: 20 },
    { value: '铭刻、印章、符牌', index: 21 },
    { value: '货币、票据', index: 22 },
    { value: '织绣', index: 23 },
    { value: '竹、木、匏、核、漆器', index: 24 },
    { value: '民间艺术品', index: 25 },
    { value: '家具', index: 26 },
    { value: '仪器、仪表', index: 27 },
    { value: '生产机械', index: 28 },
    { value: '建筑资料', index: 29 },
    { value: '化石', index: 30 },
    { value: '其他', index: 31 },
  ]
}

//处理选择的项，比如说给一个东西赋值
const typeHandleSelect = (item: TypeSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectType.value = typeLoadAll()
})

interface protectLevelSelectItem {
  value: string
  index: number
}
const toSelectprotectLevel = ref<protectLevelSelectItem[]>([])

//搜索符合条件的选项
const protectLevelQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectprotectLevel.value.filter(protectLevelCreateFilter(queryString))
      : toSelectprotectLevel.value
  cb(results)
}
const protectLevelCreateFilter = (queryString: string) => {
  return (restaurant: protectLevelSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const protectLevelLoadAll = () => {
  return [
    { value: '一级', index: 1 },
    { value: '二级', index: 2 },
    { value: '三级', index: 3 },
  ]
}
//处理选择的项，比如说给一个东西赋值
const protectLevelSelect = (item: protectLevelSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectprotectLevel.value = protectLevelLoadAll()
})



interface levelSelectItem {
  value: string
  index: number
}
const toSelectlevel = ref<levelSelectItem[]>([])

//搜索符合条件的选项
const levelQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectlevel.value.filter(levelCreateFilter(queryString))
      : toSelectlevel.value
  cb(results)
}
const levelCreateFilter = (queryString: string) => {
  return (restaurant: levelSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const levelLoadAll = () => {
  return [
    { value: '一级', index: 1 },
    { value: '二级', index: 2 },
    { value: '三级', index: 3 },
  ]
}
//处理选择的项，比如说给一个东西赋值
const levelSelect = (item: levelSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectlevel.value = levelLoadAll()
})


const size = ref('')

// 文物时期下拉菜单的属性
interface EraSelectItem {
  value: string
  index: number
}
const toSelectEra = ref<EraSelectItem[]>([])

//搜索符合条件的选项
const eraQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectEra.value.filter(eraCreateFilter(queryString))
      : toSelectEra.value
  cb(results)
}
const eraCreateFilter = (queryString: string) => {
  return (restaurant: TypeSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const EraloadAll = () => {
  return [
    { value: '史前文明', index: 1 },
    { value: '夏代', index: 2 },
    { value: '商代', index: 3 },
    { value: '周代', index: 4 },
    { value: '春秋战国', index: 5 },
    { value: '秦代', index: 6 },
    { value: '汉代', index: 7 },
    { value: '三国', index: 8 },
    { value: '魏晋南北朝', index: 9 },
    { value: '隋代', index: 10 },
    { value: '唐代', index: 11 },
    { value: '五代十国', index: 12 },
    { value: '宋代', index: 13 },
    { value: '元代', index: 14 },
    { value: '明代', index: 15 },
    { value: '清代', index: 16 },
    { value: '民国', index: 17 },
  ];
};

//处理选择的项，比如说给一个东西赋值
const eraHandleSelect = (item: EraSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectEra.value = EraloadAll()
})

interface textureSelectItem {
  value: string
  index: number
}
const toSelecttexture = ref<textureSelectItem[]>([])

//搜索符合条件的选项
const textureQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelecttexture.value.filter(textureCreateFilter(queryString))
      : toSelecttexture.value
  cb(results)
}
const textureCreateFilter = (queryString: string) => {
  return (restaurant: textureSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const textureloadAll = () => {
  return [
    { value: '无机质类', index: 1 },
    { value: '有机质类', index: 2 },
    { value: '复合材料类', index: 3 },
    { value: '组合材料类', index: 4 },
  ]
}

//处理选择的项，比如说给一个东西赋值
const textureHandleSelect = (item: textureSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelecttexture.value = textureloadAll()
})

interface weightUnitSelectItem {
  value: string
  index: number
}
const toSelectweightUnit = ref<weightUnitSelectItem[]>([])

//搜索符合条件的选项
const weightUnitQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectweightUnit.value.filter(weightUnitCreateFilter(queryString))
      : toSelectweightUnit.value
  cb(results)
}
const weightUnitCreateFilter = (queryString: string) => {
  return (restaurant: weightUnitSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const weightUnitloadAll = () => {
  return [
    { value: '克', index: 1 },
    { value: '千克', index: 2 },
    { value: '两', index: 3 },
  ]
}

//处理选择的项，比如说给一个东西赋值
const weightUnitHandleSelect = (item: weightUnitSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectweightUnit.value = weightUnitloadAll()
})


interface sourceSelectItem {
  value: string
  index: number
}
const toSelectsource = ref<sourceSelectItem[]>([])

//搜索符合条件的选项
const sourceQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectsource.value.filter(sourceCreateFilter(queryString))
      : toSelectsource.value
  cb(results)
}
const sourceCreateFilter = (queryString: string) => {
  return (restaurant: sourceSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const sourceloadAll = () => {
  return [
    { value: '旧藏', index: 1 },
    { value: '拨交', index: 2 },
    { value: '移交', index: 3 },
    { value: '交换', index: 4 },
    { value: '拣选', index: 5 },
    { value: '捐赠', index: 6 },
    { value: '收购', index: 7 },
    { value: '征集', index: 8 },
    { value: '采集', index: 9 },
    { value: '发掘', index: 10 },
    { value: '寄存', index: 11 },
    { value: '制作', index: 12 },
    { value: '其他', index: 13 }
  ]
}

//处理选择的项，比如说给一个东西赋值
const sourceHandleSelect = (item: sourceSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectsource.value = sourceloadAll()
})

interface completenessTypeSelectItem {
  value: string
  index: number
}
const toSelectcompletenessType = ref<completenessTypeSelectItem[]>([])

//搜索符合条件的选项
const completenessTypeQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectcompletenessType.value.filter(completenessTypeCreateFilter(queryString))
      : toSelectcompletenessType.value
  cb(results)
}
const completenessTypeCreateFilter = (queryString: string) => {
  return (restaurant: completenessTypeSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const completenessTypeloadAll = () => {
  return [
    { value: '完', index: 1 },
    { value: '残', index: 2 },
    { value: '缺', index: 3 },
    { value: '失', index: 4 },
  ]
}

//处理选择的项，比如说给一个东西赋值
const completenessTypeHandleSelect = (item: sourceSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectcompletenessType.value = completenessTypeloadAll()
})

interface traditionalQuantityUnitSelectItem {
  value: string
  index: number
}
const toSelecttraditionalQuantityUnit = ref<traditionalQuantityUnitSelectItem[]>([])

//搜索符合条件的选项
const traditionalQuantityUnitQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelecttraditionalQuantityUnit.value.filter(traditionalQuantityUnitCreateFilter(queryString))
      : toSelecttraditionalQuantityUnit.value
  cb(results)
}
const traditionalQuantityUnitCreateFilter = (queryString: string) => {
  return (restaurant: traditionalQuantityUnitSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const traditionalQuantityUnitloadAll = () => {
  return [
    { value: '个', index: 1 },
    { value: '副', index: 2 },
    { value: '套', index: 3 },
    { value: '对', index: 4 },
    { value: '封', index: 5 },
    { value: '只', index: 6 },
    { value: '件', index: 7 }, //默认
    { value: '双', index: 8 }
  ]
}

//处理选择的项，比如说给一个东西赋值
const traditionalQuantityUnitHandleSelect = (item: sourceSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelecttraditionalQuantityUnit.value = traditionalQuantityUnitloadAll()
})

interface realQuantityUnitSelectItem {
  value: string
  index: number
}
const toSelectrealQuantityUnit = ref<realQuantityUnitSelectItem[]>([])

//搜索符合条件的选项
const realQuantityUnitQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectrealQuantityUnit.value.filter(realQuantityUnitCreateFilter(queryString))
      : toSelectrealQuantityUnit.value
  cb(results)
}
const realQuantityUnitCreateFilter = (queryString: string) => {
  return (restaurant: realQuantityUnitSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const realQuantityUnitloadAll = () => {
  return [
    { value: '个', index: 1 },
    { value: '副', index: 2 },
    { value: '套', index: 3 },
    { value: '对', index: 4 },
    { value: '封', index: 5 },
    { value: '只', index: 6 },
    { value: '件', index: 7 }, //默认
    { value: '双', index: 8 }
  ]
}

//处理选择的项，比如说给一个东西赋值
const realQuantityUnitHandleSelect = (item: sourceSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectrealQuantityUnit.value = realQuantityUnitloadAll()
})

interface dimensionUnitSelectItem {
  value: string
  index: number
}
const toSelectdimensionUnit = ref<dimensionUnitSelectItem[]>([])

//搜索符合条件的选项
const dimensionUnitQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectdimensionUnit.value.filter(dimensionUnitCreateFilter(queryString))
      : toSelectdimensionUnit.value
  cb(results)
}
const dimensionUnitCreateFilter = (queryString: string) => {
  return (restaurant: dimensionUnitSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const dimensionUnitloadAll = () => {
  return [
    { value: '毫米', index: 1 },//默认
    { value: '厘米', index: 2 },
    { value: '米', index: 3 },
  ]
}

//处理选择的项，比如说给一个东西赋值
const dimensionUnitHandleSelect = (item: sourceSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectdimensionUnit.value = dimensionUnitloadAll()
})



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
