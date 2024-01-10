<template>
  <el-dialog
      :title="dialogTitle"
      v-model="viewVisible" width="60%">
    <!-- <div>文物名称：{{ view.name }}</div>
    <div>文物种类：{{ view.collectionType }}</div>
    <div>文物年代：{{ view.era }}</div>
    <div>藏品状态：{{ view.storageInfo.currentStatus }}</div> -->
    <div class="cardContainer" id="container">

      <el-descriptions class="margin-top" title="藏品编目卡" :column="2" :size="size" border>
        <!-- 收藏单位 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item" :style="{ minWidth: view.collectInfo.collectMuseum.length * 12 + 'px' }">
              <el-icon :style="iconStyle">
                <user/>
              </el-icon>
              收藏单位
            </div>
          </template>
          {{ view.collectInfo.collectMuseum }}
        </el-descriptions-item>
        <!-- 现登记号 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <EditPen/>
              </el-icon>
              现登记号
            </div>
          </template>
          {{ view.collectionId }}
        </el-descriptions-item>
        <!-- 藏品图片 -->
        <el-descriptions-item :span="2">
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Picture/>
              </el-icon>
              藏品图片
            </div>
          </template>
          <template #default="scope">
            <el-image
                style = "width:200px;height:200px" fit = "contain"
                class="CollectionImg" :src="view.collectionPhoto" :z-index="10">
            </el-image>
          </template>
        </el-descriptions-item>
        <!-- 名称 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <tickets/>
              </el-icon>
              名称
            </div>
          </template>
          {{ view.name }}
        </el-descriptions-item>
        <!-- 文物原名 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <tickets/>
              </el-icon>
              原名
            </div>
          </template>
          {{ view.originalName }}
        </el-descriptions-item>
        <!-- 文物级别 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Medal/>
              </el-icon>
              文物级别
            </div>
          </template>
          {{ view.storageInfo.protectionLevel }}
        </el-descriptions-item>
        <!-- 文物类别 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Grid/>
              </el-icon>
              文物类别
            </div>
          </template>
          {{ view.collectionType }}
        </el-descriptions-item>
        <!-- 质地 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Pointer/>
              </el-icon>
              质地
            </div>
          </template>
          {{ view.textureType }}
        </el-descriptions-item>
        <!--年代 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Calendar/>
              </el-icon>
              年代
            </div>
          </template>
          {{ view.era }}
        </el-descriptions-item>
        <!-- 地域 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <LocationInformation/>
              </el-icon>
              地域
            </div>
          </template>
          {{ view.area }}
        </el-descriptions-item>
        <!-- 来源 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <MapLocation/>
              </el-icon>
              来源
            </div>
          </template>
          {{ view.collectInfo.source }}
        </el-descriptions-item>
        <!-- 保存状况 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Collection/>
              </el-icon>
              保存状况
            </div>
          </template>
          {{ view.storageInfo.currentStatus }}
          <span v-if="view.storageInfo.currentStatus == '在展'">所在展厅：{{ view.exhibitionHallId }}</span>
          <span v-if="view.storageInfo.currentStatus == '在库'">所在仓库：{{ view.storageId }}</span>
        </el-descriptions-item>
        <!-- 完残程度 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Box/>
              </el-icon>
              完残程度
            </div>
          </template>
          {{ view.completeness }}
        </el-descriptions-item>
        <!-- 尺寸 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <FullScreen/>
              </el-icon>
              尺寸
            </div>
          </template>
          {{ view.dimensionInfo.dimension + view.dimensionInfo.dimensionUnit }}
        </el-descriptions-item>
        <!-- 质量-->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Coin/>
              </el-icon>
              质量
            </div>
          </template>
          {{ view.dimensionInfo.weight + view.dimensionInfo.weightUnit }}
        </el-descriptions-item>
        <!-- 传统数量 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Histogram/>
              </el-icon>
              传统数量
            </div>
          </template>
          {{ view.dimensionInfo.traditionalQuantity + "个" }}
        </el-descriptions-item>
        <!-- 实际数量 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Histogram/>
              </el-icon>
              实际数量
            </div>
          </template>
          {{ view.dimensionInfo.realQuantity + "个" }}
        </el-descriptions-item>
        <!-- 入藏时间 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <AlarmClock/>
              </el-icon>
              入藏时间
            </div>
          </template>
          {{ view.collectInfo.collectTime }}
        </el-descriptions-item>
        <!-- 保护等级 -->
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Trophy/>
              </el-icon>
              保护等级
            </div>
          </template>
          {{ view.storageInfo.protectionLevel }}
        </el-descriptions-item>
        <!-- 鉴定意见 -->
        <el-descriptions-item :span="2">
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <EditPen/>
              </el-icon>
              鉴定意见
            </div>
          </template>
          {{ view.identificationComments }}
          <div style="margin-top: 10px">鉴定人：{{ view.identificationStaffName }} &nbsp &nbsp &nbsp 鉴定时间:{{
              view.identificationDate
            }}
          </div>
        </el-descriptions-item>
        <!-- 备注 -->
        <el-descriptions-item :span="2">
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Notebook/>
              </el-icon>
              备注
            </div>
          </template>
          {{ view.remark }}
        </el-descriptions-item>
        <el-descriptions-item :span="2" v-if = "view2RepairVisible||view2WarehouseVisible">
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Notebook/>
              </el-icon>
              申请时间
            </div>
          </template>
          {{ print.time }}
        </el-descriptions-item>

        <el-descriptions-item :span="2" v-if = "view2WarehouseVisible">
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Notebook/>
              </el-icon>
              展厅管理员签字
            </div>
          </template>
        </el-descriptions-item>
        <el-descriptions-item :span="2" v-if = "view2RepairVisible">
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Notebook/>
              </el-icon>
              藏品修缮员签字
            </div>
          </template>
        </el-descriptions-item>
        <el-descriptions-item :span="2" v-if = "view2RepairVisible||view2WarehouseVisible">
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Notebook/>
              </el-icon>
              仓库管理员签字
            </div>
          </template>
        </el-descriptions-item>
      </el-descriptions>

    </div>
    <template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"><el-button type="primary" @click="closeView">关 闭</el-button></div>
					<div style="display: inline-block;margin:10px;"><el-button type="success"
                                                                     v-print="'#container'">打 印</el-button></div>
				</span>
    </template>
  </el-dialog>

  <div>
    <div class="container">
      <div class="handle-box">
        <el-input v-model="query.name" placeholder="库房名称" class="handle-input mr10"></el-input>
        <el-input v-model="query.address" placeholder="库房地址" class="handle-input mr10"></el-input>
        <div style="display: inline-block;margin:10px;">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </div>
        <div style="display: inline-block;margin:10px;">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增仓库</el-button>
        </div>
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column type="expand">
          <template #default="props">
<!--            <el-button type="primary" :icon="Plus" @click="ctHandleAdd(props.$index)">新增货柜</el-button>-->
            <el-table :data="props.row.containers">
              <!--:border="childBorder"-->
              <el-table-column type="expand">
                <template #default="scope">
                  <el-table :data="scope.row.collections"><!--:border="childBorder">-->
                    <el-table-column prop="collectionId" label="ID" width="110"
                                     align="center"></el-table-column>
                    <el-table-column prop="name" label="文物名称" align="center"></el-table-column>
                    <el-table-column label="文物图片(查看大图)" align="center">
                      <template #default="scope">
                        <el-image class="table-td-thumb" :src="scope.row.collectionPhoto"
                                  :z-index="10" :preview-src-list="[scope.row.collectionPhoto]" preview-teleported>
                        </el-image>
                      </template>
                    </el-table-column>
                    <el-table-column prop="collectionType" label="文物种类"
                                     align="center"></el-table-column>
                    <el-table-column prop="era" label="文物年代" align="center"></el-table-column>
                    <!--<el-table-column prop="address" label="地址"></el-table-column>-->
                    <el-table-column prop="storageInfo.currentStatus" label="藏品状态" align="center">
                      <template #default="scope">
                        <el-tag
                            :type="scope.row.storageInfo.currentStatus === '在展' ? 'success' : scope.row.storageInfo.currentStatus === '修缮中' ? 'danger' : ''">
                          {{ scope.row.storageInfo.currentStatus }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="collectInfo.collectTime" label="入藏时间"
                                     align="center"></el-table-column>
                    <el-table-column label="操作" width="170" align="center">
                      <template #default="scope">
                        <div style="display: inline-block;">
                          <el-button text :icon="View" @click="handleDetails(scope.$index, scope.row,0)">
                            查看
                          </el-button>
                        </div>

                        <div style="display: inline-block;">
                          <el-button text :icon="Edit" @click="handleDetails(scope.$index, scope.row,1)">
                            打印离库入展单
                          </el-button>
                        </div>

                        <div style="display: inline-block;">
                          <el-button text :icon="Edit" @click="handleDetails(scope.$index, scope.row,2)">
                            打印离库修缮单
                          </el-button>
                        </div>
                      </template>
                    </el-table-column>
                    <!--<el-table-column prop="date" label="注册时间"></el-table-column>-->
                  </el-table>
                </template>
              </el-table-column>
              <el-table-column prop="containerId" label="货柜ID"/>
              <el-table-column prop="warehouseId" label="库房ID"/>
              <el-table-column prop="containerSize" label="货柜大小"/>
            </el-table>
            <div class="pagination">
              <el-pagination background layout="total, prev, pager, next" :current-page="query.pageIndex"
                             :page-size="query.pageSize" :total="pageTotal"
                             @current-change="handlePageChange"></el-pagination>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="warehouseId" label="库房ID" width="55" align="center"></el-table-column>
        <el-table-column prop="warehouseName" label="库房名称"></el-table-column>
        <el-table-column prop="warehouseLocation" label="库房地址"></el-table-column>
        <el-table-column prop="warehouseCapacity" label="库房容量"></el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background layout="total, prev, pager, next" :current-page="query.pageIndex"
                       :page-size="query.pageSize" :total="pageTotal"
                       @current-change="handlePageChange"></el-pagination>
      </div>
    </div>

    <!-- 编辑弹出框 -->
    <el-dialog title="编辑" v-model="editVisible" width="30%">
      <el-form label-width="70px">
        <el-form-item label="库房名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="库房地址">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item label="库房容量">
          <el-input v-model="form.capacity"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"><el-button
              @click="editVisible = false">取 消</el-button></div>
					<div style="display: inline-block;margin:10px;"><el-button type="primary" @click="saveEdit">确 定</el-button></div>
				</span>
      </template>
    </el-dialog>
    <!-- 新增弹出框 -->
    <el-dialog title="新增" v-model="addVisible" width="30%">
      <el-form label-width="70px">
        <el-form-item label="库房ID">
          <el-input v-model="addForm.id"></el-input>
        </el-form-item>
        <el-form-item label="库房名称">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="库房地址">
          <el-input v-model="addForm.address"></el-input>
        </el-form-item>
        <el-form-item label="库房容量">
          <el-input v-model="addForm.capacity"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"><el-button @click="addVisible = false">取 消</el-button></div>
					<div style="display: inline-block;margin:10px;"><el-button type="primary"
                                                                     @click="saveAdd">确 定</el-button></div>
				</span>
      </template>
    </el-dialog>
    <!-- 货柜编辑弹出框 -->
    <el-dialog title="编辑" v-model="ctEditVisible" width="30%">
      <el-form label-width="70px">
        <el-form-item label="货柜大小">
          <el-input v-model="ctForm.size"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"><el-button
              @click="ctEditVisible = false">取 消</el-button></div>
					<div style="display: inline-block;margin:10px;"><el-button type="primary"
                                                                     @click="ctSaveEdit">确 定</el-button></div>
				</span>
      </template>
    </el-dialog>
    <!-- 货柜新增弹出框 -->
    <el-dialog title="新增" v-model="ctAddVisible" width="30%">
      <el-form label-width="70px">
        <el-form-item label="货柜ID">
          <el-input v-model="ctAddForm.id"></el-input>
        </el-form-item>
        <el-form-item label="货柜大小">
          <el-input v-model="ctAddForm.size"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"><el-button
              @click="ctAddVisible = false">取 消</el-button></div>
					<div style="display: inline-block;margin:10px;"><el-button type="primary" @click="ctSaveAdd">确 定</el-button></div>
				</span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="basetable">
import {ref, reactive} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {Delete, Edit, Search, Plus, Tickets, User, View} from '@element-plus/icons-vue';
import axios from 'axios';
import {useUserInfo} from "@/store/userInfo";
import {computed} from "vue";
const size = ref('')
const dialogTitle = ref("View")
const viewVisible = ref(false);
const view2RepairVisible = ref(false);
const view2WarehouseVisible = ref(false);

function getCurrentTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString()
  const day = now.getDate().toString()
  const hours = now.getHours().toString()
  const minutes = now.getMinutes().toString()
  const seconds = now.getSeconds().toString()
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
const print = ({
  time: "",
})
let view = ref();
const handleDetails = (index: number, row: any, type: number) => {
  view.value = row;
  viewVisible.value = true;
  print.time = getCurrentTime()
  switch (type) {
    case 0:
      dialogTitle.value = "查看"
      break;
    case 1:
      dialogTitle.value = "打印离库入展单"
      view2WarehouseVisible.value = true
      break;
    case 2:
      dialogTitle.value = "打印离库修缮单"

      view2RepairVisible.value = true
      break;
  }

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
const closeView = () => {
  viewVisible.value = false;//editVisible.value被用来控制编辑界面或对话框的显示与隐藏
  view2RepairVisible.value = false;
  view2WarehouseVisible.value = false;
};

function getToken() {
  // 替换为获取token的逻辑
  const UserInfo = useUserInfo();
  return UserInfo.userToken;

}

// 创建一个具有默认头的Axios实例
const axiosInstance = axios.create({
  baseURL: '/api',
});

// 拦截器：将token添加到每个请求中
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();

  console.log(token);

  if (token) {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      config.headers = {
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

const fetchData = async () => {
  try {
    const response = await axiosInstance.get('/WareHouses');
    console.log("打印仓库信息");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

interface TableItem {
  warehouseId: number,
  warehouseName: string,
  warehouseLocation: string,
  warehouseCapacity: number,
  warehouseTypes: string
  containers: [
    {
      containerId: number,
      warehouseId: number,
      containerSize: string,
      collections: [
        {
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
          collectionAudio: string,   //音频

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
      ]
    }
  ]
}

const query = reactive({
  name: '',
  address: '',
  pageIndex: 1,
  pageSize: 10
});
const tableData = ref<TableItem[]>([]);
const addedData = ref<TableItem[]>([]);
const pageTotal = ref(0);
const compare = (a: TableItem, b: TableItem) => {
  return a.warehouseId < b.warehouseId ? -1 : 1;
}

// 获取表格数据
const getData = async () => {
  const res = await fetchData();
  let filteredData = res.concat(addedData.value);
  //if (query.designIdea !== '') {
  //filteredData = filteredData.filter((item: TableItem) => item.designIdea === query.designIdea);
  //}
  if (query.name !== '') {
    filteredData = filteredData.filter((item: TableItem) => item.warehouseName.includes(query.name));
  }
  if (query.address !== '') {
    filteredData = filteredData.filter((item: TableItem) => item.warehouseLocation.includes(query.address));
  }
  tableData.value = filteredData.sort(compare);
  console.log(tableData.value);
};
getData();

const editData = async () => {
  try {
    console.log(idx, tableData.value[idx].warehouseId, tableData.value[idx]);
    const response = await axiosInstance.put('/WareHouses/' + tableData.value[idx].warehouseId, tableData.value[idx]);
    ElMessage.success('数据上传成功');
  } catch (error) {
    ElMessage.error('数据上传失败');
  }
};

const uploadData = async () => {
  try {
    console.log(tableData.value[tableData.value.length - 1]);
    const response = await axiosInstance.post('/WareHouses', tableData.value[tableData.value.length - 1]);
    ElMessage.success('数据上传成功');
  } catch (error) {
    ElMessage.error('数据上传失败');
  }
};

const deleteData = async () => {
  try {
    console.log(idx, tableData.value[idx]);
    const response = await axiosInstance.delete('/WareHouses/' + tableData.value[idx].warehouseId);
    ElMessage.success('删除成功');
    ElMessage.success('数据上传成功');
    getData();
  } catch (error) {
    ElMessage.error('数据上传失败');
  }
};

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
  const result = window.confirm('确定要删除吗？');
  if (result) {
    // 在这里调用 saveDelete 并传递要删除的数据索引
    ElMessage.success('删除成功');
    deleteData();
  } else {
    // 用户点击了取消按钮
    // 可以在这里添加逻辑处理
  }
};

// 表格编辑时弹窗和保存
const editVisible = ref(false);
let form = reactive({
  name: '',
  address: '',
  capacity: 0,
});
let idx: number = -1;
const handleEdit = (index: number, row: any) => {
  idx = index;
  form.name = row.name;
  form.address = row.address;
  form.capacity = row.capacity;
  editVisible.value = true;
};
const saveEdit = () => {
  editVisible.value = false;
  ElMessage.success(`修改第 ${idx + 1} 行成功`);
  console.log(idx, tableData);
  tableData.value[idx].warehouseName = form.name;
  tableData.value[idx].warehouseLocation = form.address;
  tableData.value[idx].warehouseCapacity = form.capacity;
  editData();
};
// 新增弹窗和保存
const addVisible = ref(false);
let addForm = reactive({
  id: 0,
  name: '',
  address: '',
  capacity: 0,
});
const handleAdd = () => {
  console.log(1);
  addVisible.value = true;
};
const saveAdd = () => {
  addVisible.value = false;
  const newItem = {
    warehouseId: addForm.id,
    warehouseName: addForm.name,
    warehouseLocation: addForm.address,
    warehouseCapacity: addForm.capacity,
    warehouseTypes: "0000000000000000000000000000000",
    containers: null
  };
  console.log(idx, tableData);
  addedData.value.push(newItem); // 将新增的数据保存到addedData数组中
  tableData.value.push(newItem);
  ElMessage.success('新增成功');
  uploadData();
};
// 货柜表格编辑时弹窗和保存
const ctEditVisible = ref(false);
let ctForm = reactive({
  size: "",
});
let ctIdx: number = -1;
let whIdx: number = -1;
const ctHandleEdit = (index1: number, index2: number, row: any) => {
  whIdx = index1;
  ctIdx = index2;
  ctForm.size = row.size;
  ctEditVisible.value = true;
};
const ctSaveEdit = () => {
  ctEditVisible.value = false;
  ElMessage.success(`修改第 ${ctIdx + 1} 行成功`);
  tableData.value[whIdx].containers[ctIdx].containerSize = ctForm.size;
  editData();
};
// 货柜表格新增弹窗和保存
const ctAddVisible = ref(false);
let ctAddForm = reactive({
  id: 0,
  size: "",
});
let whaddIdx: number = -1;
const ctHandleAdd = (index3: number) => {
  whaddIdx = index3;
  console.log(1);
  ctAddVisible.value = true;
};
const ctSaveAdd = () => {
  ctAddVisible.value = false;
  const ctNewItem = {
    containerId: ctAddForm.id,
    warehouseId: tableData.value[whaddIdx].warehouseId,
    containerSize: ctAddForm.size,
    collections: null
  };
  addedData.value[whaddIdx].containers.push(ctNewItem);
  tableData.value[whaddIdx].containers.push(ctNewItem);
  ElMessage.success('新增成功');
  uploadData();
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

.table-td-thumb {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}
</style>