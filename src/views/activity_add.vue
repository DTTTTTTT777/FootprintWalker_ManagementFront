<template>
  <el-dialog title="新增活动" :visible.sync="addVisible" width="60%" :before-close="handleClose">
    <el-form :model="addForm" ref="addFormRef" label-width="120px" label-position="right">
      <el-form-item label="活动标题" prop="title" required>
        <el-input v-model="addForm.title"></el-input>
      </el-form-item>
      <!-- 时间选择器 -->
      <el-form-item label="开始时间" prop="startTime" required>
        <el-date-picker v-model="addForm.startTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime" required>
        <el-date-picker v-model="addForm.endTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
      </el-form-item>

      <el-upload v-model:file-list="fileList" class="upload-demo" multiple="false"
                 action="/foreignImage/upload" name="smfile"
                 :headers="{ Authorization: 'kydXBqSSWZNb12Q25q6OmXGGSKwajXXk' }" :on-success="handleSuccess"
                 :on-error="handleError" :before-upload="beforeUpload" :limit="1" :on-exceed="handleExceed"
                 prop="collectionPhoto">
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
      <!-- 显示已上传的图片 -->
      <el-image v-if="form.collectionPhoto" class="CollectionImg" :src="form.collectionPhoto"
                :z-index="10" :height="10">
      </el-image>


      <!-- 更多表单项 -->
      <el-form-item label="活动地点" prop="location" required>
        <el-input v-model="addForm.location"></el-input>
      </el-form-item>
      <el-form-item label="活动描述" prop="activityInfo">
        <el-input type="textarea" v-model="addForm.activityInfo"></el-input>
      </el-form-item>
      <el-form-item label="活动收费" prop="cost">
        <el-input-number v-model="addForm.cost" :min="0" controls-position="right" class="wide-input"></el-input-number>
      </el-form-item>
      <el-form-item label="预计参与人数上限" prop="estimatedLimit">
        <el-input-number v-model="addForm.estimatedLimit" :min="1" controls-position="right" class="wide-input"></el-input-number>
      </el-form-item>
      <!-- 操作按钮 -->
      <div class="dialog-footer">
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </div>
    </el-form>
  </el-dialog>
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


/*const userInfo = useUserInfo();
const token=userInfo.userToken;
console.log("打印用户信息")
console.log(userInfo)
console.log("打印token")
console.log(token)*/

function getToken() {
  // 替换为获取token的逻辑
  const UserInfo = useUserInfo();
  return UserInfo.userToken;

}

// 创建一个具有默认头的Axios实例
const axiosInstance = axios.create({
  baseURL: 'api',
});

// // 拦截器：将token添加到每个请求中
// axiosInstance.interceptors.request.use((config) => {
//   const token = getToken();
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


interface TableItem {
  collectionId: number,      //ID
  originalName: string,      //原名
  name: string,              //名称，默认为"未知"，可以等到鉴定之后再填写
  collectionType: string,    //类别（如石器、陶器等）
  era: string,               //年代
  area: string,              //地域
  textureType: string,       //质地类别（例如有机质类、无机质类）
  completeness: string,      //完残程度
  completenessType: string,  //完残程度类别：完、残、缺、失

  collectionPhoto: string,   //图片

  collectInfo: {             //收藏组
    collectionId: number,  //ID
    source: string,        //来源，如旧藏、拨交、移交
    collectMuseum: string, //收藏博物馆
    collectTime: string,            //入藏时间
    collectionLevel: string         //藏品级别
  },
  dimensionInfo: {           //计量组
    collectionId: number,  //ID
    dimension: string,     //尺寸
    dimensionUnit: string, //尺寸单位，默认为毫米
    weight: number,             //质量
    weightUnit: string,         //质量单位，默认为克
    realQuantity: number,       //实际数量
    realQuantityUnit: string,   //实际数量单位，默认为件
    traditionalQuantity: number, //传统数量
    traditionalQuantityUnit: string//传统数量单位
  },
  storageInfo: {                  //保存组
    collectionId: number,       //ID
    currentStatus: string,      //当前状况
    protectionLevel: string     //保护优先等级
  },
  exhibitionHallId: number,  //展厅ID
  warehouseId: number,       //仓库ID
  containerId: number,       //库架ID

  identificationStaffName: string, //鉴别人员名称
  identificationComments: string,  //鉴别结果
  identificationDate: string,      //鉴别日期
  remark: string                   //备注
}

let newCollection: TableItem = {
  //collectionId: null,
  originalName: "",
  name: "未定",
  collectionType: "",
  era: "待鉴定",
  area: "待鉴定",
  textureType: "",
  completeness: "待鉴定",
  completenessType: "",
  collectionPhoto: "",
  collectInfo: {
    //collectionId: null,
    source: "",
    collectMuseum: "博数博物馆",
    collectTime: "",//这里要么就是 yyyy-mm-ddT+时间(**:**:**)，要么就是只有日期yyyy-mm-dd
    collectionLevel: "待鉴定"
  },
  dimensionInfo: {
    //collectionId: null,
    dimension: "待鉴定",
    dimensionUnit: "毫米",
    weight: 0,
    weightUnit: "克",
    realQuantity: 0,
    realQuantityUnit: "件",
    traditionalQuantity: 0,
    traditionalQuantityUnit: "件"
  },
  storageInfo: {
    //collectionId: null,
    currentStatus: "待鉴定",
    protectionLevel: "待鉴定"
  },
  exhibitionHallId: null,
  warehouseId: null,
  containerId: null,
  identificationStaffName: null,
  identificationComments: null,
  identificationDate: null,
  remark: "无"

};

const form = reactive({
  collectionId: null,
  originalName: "",
  name: "",
  collectionType: "",
  era: "",
  area: "",
  textureType: "",
  completeness: "",
  completenessType: "",
  collectionPhoto: "",
  collectInfo: {
    collectionId: null,
    source: "",
    collectMuseum: "博数博物馆",
    collectTime: "",//这里要么就是 yyyy-mm-ddT+时间(**:**:**)，要么就是只有日期yyyy-mm-dd
    collectionLevel: ""
  },
  dimensionInfo: {
    collectionId: null,
    dimension: "",
    dimensionUnit: "毫米",
    weight: null,
    weightUnit: "克",
    realQuantity: 1,
    realQuantityUnit: "件",
    traditionalQuantity: 1,
    traditionalQuantityUnit: "件"
  },
  storageInfo: {
    collectionId: null,
    currentStatus: "待鉴定",
    protectionLevel: ""
  },
  exhibitionHallId: null,
  warehouseId: null,
  containerId: null,
  identificationStaffName: null,
  identificationComments: null,
  identificationDate: null,
  remark: ""


});

/*const rules = reactive<FormRules<TableItem>>({

	originalName: [
		{ required: true, message: '文物原名不能为空', trigger: 'blur' },
	],
	CollectionType: [
		{ required: true, message: '文物类别不能为空', trigger: 'change' },
	],
	collectionPhoto: [
		{ required: true, message: '文物图片不能为空', trigger: 'change' },
	]
	// 其他表单项的验证规则...
});*/



const submitForm = async (newCollection: TableItem) => {
  try {
    console.log(newCollection);

    const headers = {
      'Authorization': `Bearer ${getToken()}`
    };

    //const response = await axios.post('http://42.192.39.198:5000/api/Collections', newCollection, { headers });

    const response= await axiosInstance.post('/Collections', newCollection);

    ElMessage.success('数据上传成功');
  } catch (error) {
    ElMessage.error('数据上传失败');
  }
};

const submitnew = () => {


  if (form.originalName == "") {
    ElMessage.error('文物原名不能为空');
  }
  else if (form.collectionPhoto == "") {
    ElMessage.error('藏品图片不能为空');
  }
  else if (form.collectionType == "") {
    ElMessage.error('文物类别不能为空');
  }
  else if (form.textureType == "") {
    ElMessage.error('文物质地不能为空');
  }
  else if (form.collectInfo.source == "") {
    ElMessage.error('文物来源不能为空');
  }
  else if (form.completenessType == "") {
    ElMessage.error('完残程度类别不能为空');
  }
  else if (form.dimensionInfo.traditionalQuantity == null) {
    ElMessage.error('传统数量不能为空');
  }
  else if (form.dimensionInfo.traditionalQuantityUnit == "") {
    ElMessage.error('传统数量单位不能为空');
  }
  else if (form.dimensionInfo.realQuantity == null) {
    ElMessage.error('实际数量不能为空');
  }
  else if (form.dimensionInfo.realQuantityUnit == "") {
    ElMessage.error('实际数量单位不能为空');
  }
  else {

    //newCollection.collectionId = form.collectionId;
    newCollection.originalName = form.originalName;
    if (form.name != "")
      newCollection.name = form.name;
    newCollection.collectionType = form.collectionType;
    if (form.era != "")
      newCollection.era = form.era;
    if (form.area != "")
      newCollection.area = form.area;
    newCollection.textureType = form.textureType;
    if (form.completeness != "")
      newCollection.completeness = form.completeness;
    newCollection.completenessType = form.completenessType;
    newCollection.collectionPhoto = form.collectionPhoto;
    //newCollection.collectInfo.collectionId = form.collectInfo.collectionId;
    newCollection.collectInfo.source = form.collectInfo.source;
    newCollection.collectInfo.collectMuseum = form.collectInfo.collectMuseum;
    newCollection.collectInfo.collectTime = form.collectInfo.collectTime;
    if (form.collectInfo.collectionLevel != "")
      newCollection.collectInfo.collectionLevel = form.collectInfo.collectionLevel;

    //newCollection.dimensionInfo.collectionId = form.dimensionInfo.collectionId;

    if (form.dimensionInfo.dimension != "")
      newCollection.dimensionInfo.dimension = form.dimensionInfo.dimension;
    if (form.dimensionInfo.dimensionUnit != "")
      newCollection.dimensionInfo.dimensionUnit = form.dimensionInfo.dimensionUnit;
    if (form.dimensionInfo.weight != null)
      newCollection.dimensionInfo.weight = form.dimensionInfo.weight;
    if (form.dimensionInfo.weightUnit != "")
      newCollection.dimensionInfo.weightUnit = form.dimensionInfo.weightUnit;
    newCollection.dimensionInfo.realQuantity = form.dimensionInfo.realQuantity;
    newCollection.dimensionInfo.realQuantityUnit = form.dimensionInfo.realQuantityUnit;
    newCollection.dimensionInfo.traditionalQuantity = form.dimensionInfo.traditionalQuantity;
    newCollection.dimensionInfo.traditionalQuantityUnit = form.dimensionInfo.traditionalQuantityUnit;

    //newCollection.storageInfo.collectionId = form.storageInfo.collectionId;
    newCollection.storageInfo.currentStatus = form.storageInfo.currentStatus;
    if (form.storageInfo.protectionLevel != "")
      newCollection.storageInfo.protectionLevel = form.storageInfo.protectionLevel;

    if (form.remark != "")
      newCollection.remark = form.remark;


    submitForm(newCollection);
  }

}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}


const query = reactive({
  address: '',
  name: '',
  pageIndex: 1,
  pageSize: 10
});
const tableData = ref<TableItem[]>([]);
const pageTotal = ref(0);

// //获取后端数据库的数据
// const fetchData = async () => {
// 	// try {
// 		/*const headers = {
// 			'Authorization': `Bearer ${token}`
// 		};

// 		const response = await axios.get(' http://42.192.39.198:5000/api/Collections', {headers});*/

// 		// const response= await axiosInstance.get('/Collections');

// 		// console.log(response.data);
// 		// console.log("数据库连接成功！");
// 		// return response.data;
// 	// } catch (error) {
// 		// console.error(error);
// 	// }
// };

// const getData = () => {
// 	fetchData().then(res => {
// 		//自动生成collectionId
// 		// form.collectionId = Object.keys(res).length + 1;
// 		//自动生成collectionId逻辑，取已有的最大的collectionId+1
// 		// form.collectionId=Max+1;
// 		console.log(form.collectionId);
// 		form.collectInfo.collectionId = form.collectionId;
// 		form.storageInfo.collectionId = form.collectionId;
// 		form.dimensionInfo.collectionId = form.collectionId;
// 	});
// };
// getData();


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

// 删除操作
const handleDelete = (index: number) => {
  // 二次确认删除
  ElMessageBox.confirm('确定要删除吗？', '提示', {
    type: 'warning'
  })
      .then(() => {
        ElMessage.success('删除成功');
        tableData.value.splice(index, 1);
      })
      .catch(() => { });
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


// 在组件创建时获取当前时间并填充到 collectTime
form.collectInfo.collectTime = getCurrentTime();

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

// 处理上传成功后的响应
/*function handleSuccess(response, file) {
	// 在这里获取上传成功后的图片地址，并更新 form.collectionPhoto
	if (response && response.code === 0) { // 根据实际返回数据判断上传是否成功
		form.collectionPhoto = response.data.imageUrl; // 假设响应中包含了图片的地址
	}
}*/

/*const upload = (file) => {
	const formData = new FormData();
	formData.append("smfile", file.file);
	axios
		.post("https://sm.ms/api/v2/", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
				"Authorization": "14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf",
			},
		})
		.then((res) => {
			console.log(res);
		});
};*/


const handleSuccess = (response, file) => {
  // 处理上传成功后的回调
  console.log('上传成功', response);
  form.collectionPhoto = response.data.url;
  // 在回调中处理SM.MS返回的数据，可以获取图片链接等信息
};
const handleError = (err) => {
  // 处理上传失败后的回调
  console.error('上传失败', err);
};
const beforeUpload = (file) => {

  return true; // 返回true表示继续上传，返回false表示取消上传
};

import type { UploadProps, UploadUserFile } from 'element-plus'

const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  console.log(uploadFile)
}


const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  ElMessage.warning(
      `The limit is 1, you selected ${files.length} files this time, add up to ${files.length + uploadFiles.length
      } totally`
  )
}


const fileList = ref<UploadUserFile[]>([

])

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

.table-td-thumb {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}

.centered-button {
  display: flex;
  justify-content: center;
  margin-top: 20px; /* 调整按钮与上方内容的间距 */
}
</style>


