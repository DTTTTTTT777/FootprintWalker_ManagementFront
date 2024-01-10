<template>
  <div>
    <div class="container">
      <div class="handle-box">
        <el-input
          v-model="query.activityName"
          placeholder="活动名称"
          class="handle-input mr10"
        ></el-input>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
      </div>
      <el-table
        :data="tableData"
        border
        class="table"
        ref="multipleTable"
        header-cell-class-name="table-header"
      >
        <el-table-column prop="activityName" label="活动名称"></el-table-column>
        <el-table-column prop="activityId" label="活动id"></el-table-column>
        <el-table-column
          prop="exhibitionHallName"
          label="所属展厅"
        ></el-table-column>
        <el-table-column prop="activityType" label="类型"></el-table-column>
        <el-table-column prop="activityTheme" label="主题"></el-table-column>
        <el-table-column prop="participants" label="参与人数"></el-table-column>
        <el-table-column prop="startDate" label="开始日期"></el-table-column>
        <el-table-column prop="endDate" label="结束日期"></el-table-column>
        <el-table-column prop="startTime" label="开始时间"></el-table-column>
        <el-table-column prop="endTime" label="结束时间"></el-table-column>

        <el-table-column label="操作" width="220" align="center">
          <template #default="scope">
            <el-button
              text
              :icon="Edit"
              @click="handleEdit(scope.$index, scope.row)"
              v-permiss="15"
            >
              编辑
            </el-button>
            <el-button
              text
              :icon="Delete"
              class="red"
              @click="handleDelete(scope.$index)"
              v-permiss="16"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          background
          layout="total"
          :total="pageTotal"
        ></el-pagination>
      </div>
    </div>

    <!-- 编辑弹出框 -->
    <el-dialog title="编辑" v-model="editVisible" width="30%">
      <el-form label-width="70px">
        <el-form-item label="活动名称">
          <el-input v-model="form.activityName"></el-input>
        </el-form-item>
        <el-form-item label="活动id">
          <el-input v-model="form.activityId"></el-input>
        </el-form-item>
        <el-form-item label="所属展厅">
          <select v-model="form.exhibitionHallName">
            <option value="常驻展厅A">常驻展厅A</option>
            <option value="常驻展厅B">常驻展厅B</option>
            <option value="常驻展厅C">常驻展厅C</option>
            <option value="常驻展厅D">常驻展厅D</option>
            <option value="活动展厅">活动展厅</option>
            <option value="临时展厅">临时展厅</option>
          </select>
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="form.activityType"></el-input>
        </el-form-item>
        <el-form-item label="主题">
          <el-input v-model="form.activityTheme"></el-input>
        </el-form-item>
        <el-form-item label="参与人数">
          <el-input v-model="form.participants"></el-input>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="form.startDate"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="form.endDate"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker
            v-model="form.startTime"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          ></el-time-picker>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker
            v-model="form.endTime"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          ></el-time-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <div style="display: inline-block;margin:10px;"><el-button @click="editVisible = false">取 消</el-button></div>
          <div style="display: inline-block;margin:10px;"><el-button type="primary" @click="saveEdit">确 定</el-button></div>
        </span>
      </template>
    </el-dialog>

    <!-- 新增弹出框 -->
    <el-dialog
      title="新增"
      v-model="addVisible"
      width="30%"
    >
      <el-form label-width="100px" ref="formRef" :rules="rules" :model="addForm">
        <el-form-item
          :render-header="addRedStar"
          label="活动名称"
          prop="activityName"
        >
          <el-input v-model="addForm.activityName" required></el-input>
        </el-form-item>
        <el-form-item :render-header="addRedStar" label="活动id" prop="activityId">
          <el-input v-model="addForm.activityId" required></el-input>
        </el-form-item>
        <el-form-item :render-header="addRedStar" label="所属展厅" prop="exhibitionHallName">
          <select v-model="addForm.exhibitionHallName" required>
            <option value="常驻展厅A">常驻展厅A</option>
            <option value="常驻展厅B">常驻展厅B</option>
            <option value="常驻展厅C">常驻展厅C</option>
            <option value="常驻展厅D">常驻展厅D</option>
            <option value="活动展厅">活动展厅</option>
            <option value="临时展厅">临时展厅</option>
          </select>
        </el-form-item>
        <el-form-item label="类型" prop="activityType">
          <el-input v-model="addForm.activityType"></el-input>
        </el-form-item>
        <el-form-item label="主题" prop="activityTheme">
          <el-input v-model="addForm.activityTheme"></el-input>
        </el-form-item>
        <el-form-item :render-header="addRedStar" label="参与人数" prop="participants">
          <el-input v-model="addForm.participants"></el-input>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="addForm.startDate"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="addForm.endDate"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker
            v-model="addForm.startTime"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          ></el-time-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker
            v-model="addForm.endTime"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          ></el-time-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <div style="display: inline-block;margin:10px;"><el-button @click="addVisible = false">取 消</el-button></div>
          <div style="display: inline-block;margin:10px;"><el-button type="primary" @click="saveAdd">确 定</el-button></div>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="activity">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import {
  Delete,
  Edit,
  Search,
  Plus,
  Sort,
  More,
} from "@element-plus/icons-vue";
import { fetchActivityData } from "../api/index";
import { useRouter } from "vue-router";

import axios from "axios";
import { useUserInfo } from "../store/userInfo";

function getToken() {
	// 替换为获取token的逻辑
	const UserInfo = useUserInfo();
	return UserInfo.userToken;

	}

// 创建一个具有默认头的Axios实例
const axiosInstance = axios.create({
	baseURL: 'http://42.192.39.198:5000/api',
});

// 拦截器：将token添加到每个请求中
axiosInstance.interceptors.request.use((config) => {
	const token = getToken();

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
		const response = await axiosInstance.get('/Activities');
		return response.data;
	} catch (error) {
		console.error(error);
	}
};

interface TableItem {
  activityName: string;
  activityId: string;
  exhibitionHallName: string;
  activityType: string;
  activityTheme: string;
  participants: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

const query = reactive({
  activityName: "",
  activityId: "",
  exhibitionHallName: "",
  activityType: "",
  activityTheme: "",
  participants: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  pageIndex: 1,
  pageSize: 10,
});

const tableData = ref<TableItem[]>([]);
const pageTotal = ref(0);
const addedData = ref<TableItem[]>([]); // 保存新增的数据
const formRef = ref<FormInstance>();
const rules :FormRules={
  activityName: [
    { required: true, message: "请输入活动名称", trigger: "blur" },
  ],
  activityId: [
    { required: true, message: "请输入活动id", trigger: "blur" },
  ],
  exhibitionHallName: [
    { required: true, message: "请选择所选展厅", trigger: "blur" },
  ],
  activityType: [
    { required: true, message: "请输入类型", trigger: "blur" },
  ],
  activityTheme: [
    { required: true, message: "请输入主题", trigger: "blur" },
  ],
  participants: [
    { required: true, message: "请输入参与人数", trigger: "blur" },
  ],
  startDate: [
    { required: true, message: "请选择开始日期", trigger: "blur" },
  ],
  endDate: [
    { required: true, message: "请选择结束日期", trigger: "blur" },
  ],
  startTime: [
    { required: true, message: "请选择开始时间", trigger: "blur" },
  ],
  endTime: [
    { required: true, message: "请选择结束时间", trigger: "blur" },
  ],
};

// 获取表格数据
const getData = () => {
fetchData().then(res => {
//   let filteredData = res.data.list.concat(addedData.value);
let filteredData = res.concat(addedData.value);
  if (query.activityName !== '') {
      filteredData = filteredData.filter((item: TableItem) => item.activityName.includes(query.activityName));
  }
  if (query.activityId !== '') {
      filteredData = filteredData.filter((item: TableItem) => item.activityId.includes(query.activityId));
  }
  if (query.exhibitionHallName !== '') {
      filteredData = filteredData.filter((item: TableItem) => item.exhibitionHallName.includes(query.exhibitionHallName));
  }
  if (query.activityType !== '') {
      filteredData = filteredData.filter((item: TableItem) => item.activityType.includes(query.activityType));
  }
  if (query.activityTheme !== '') {
      filteredData = filteredData.filter((item: TableItem) => item.activityTheme.includes(query.activityTheme));
  }
  if (query.participants !== '') {
      filteredData = filteredData.filter((item: TableItem) => item.participants.includes(query.participants));
  }
  if (query.startDate !== '') {
      filteredData = filteredData.filter((item: TableItem) => item.startDate.includes(query.startDate));
  }
  if (query.endDate !== '') {
      filteredData = filteredData.filter((item: TableItem) => item.endDate.includes(query.endDate));
  }
  if (query.startTime !== '') {
      filteredData = filteredData.filter((item: TableItem) => item.startTime.includes(query.startTime));
  }
  if (query.endTime !== '') {
      filteredData = filteredData.filter((item: TableItem) => item.endTime.includes(query.endTime));
  }
  tableData.value = filteredData;
//   pageTotal.value = res.data.pageTotal || 50;
	pageTotal.value = res.length || 50;
  });
};
getData();

const editData = async () => {
  try {
    console.log(idx, tableData.value[idx].activityId, tableData.value[idx]);
    const response = await axiosInstance.put("http://42.192.39.198:5000/api/Activities/" +tableData.value[idx].activityId,tableData.value[idx]);
    ElMessage.success("数据处理成功");
  } catch (error) {
    ElMessage.error("数据处理失败");
  }
};

const uploadData = async () => {
  try {
    console.log(tableData.value[tableData.value.length - 1]);
    const response = await axiosInstance.post("http://42.192.39.198:5000/api/Activities",tableData.value[tableData.value.length - 1]);
    ElMessage.success("数据处理成功");
  } catch (error) {
    ElMessage.error("数据处理失败");
  }
};

const deleteData = async () => {
    try {
		  console.log(idx,tableData.value[idx]);
      const response = await axiosInstance.delete("http://42.192.39.198:5000/api/Activities/"+tableData.value[idx].activityId);
      ElMessage.success('数据处理成功');
		  getData();
    } catch (error) {
        ElMessage.error('数据处理失败');
    }
};

// 根据活动名称的查询操作
const handleSearch = () => {
  // 获取输入框中的查询值
  const searchValue = query.activityName;

  // 设置查询条件
  query.activityName = searchValue;

  // 发起查询请求
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
  activityName: "",
  activityId: "",
  exhibitionHallName: "",
  activityType: "",
  activityTheme: "",
  participants: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
});
let idx: number = -1;
const handleEdit = (index: number, row: any) => {
  idx = index;
  form.activityName = row.activityName;
  form.activityId = row.activityId;
  form.exhibitionHallName = row.exhibitionHallName;
  form.activityType = row.activityType;
  form.activityTheme = row.activityTheme;
  form.participants = row.participants;
  form.startDate = row.startDate;
  form.endDate = row.endDate;
  form.startTime = row.startTime;
  form.endTime = row.endTime;
  editVisible.value = true;
};

const saveEdit = () => {
  editVisible.value = false;
  ElMessage.success(`成功修改第 ${idx + 1} 行`);
  tableData.value[idx].activityName = form.activityName;
  tableData.value[idx].activityId = form.activityId;
  tableData.value[idx].exhibitionHallName = form.exhibitionHallName;
  tableData.value[idx].activityType = form.activityType;
  tableData.value[idx].activityTheme = form.activityTheme;
  tableData.value[idx].participants = form.participants;
  tableData.value[idx].startDate = form.startDate;
  tableData.value[idx].endDate = form.endDate;
  tableData.value[idx].startTime = form.startTime;
  tableData.value[idx].endTime = form.endTime;
  editData();
};

// 新增弹窗和保存
const addVisible = ref(false);
let addForm = reactive({
  activityName: "",
  activityId: "",
  exhibitionHallName: "",
  activityType: "",
  activityTheme: "",
  participants: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
});

const handleAdd = () => {
  addVisible.value = true;
};

const saveAdd = () => {
  addVisible.value = false;
  const newItem = {
    id: tableData.value.length + 1,
    activityName: addForm.activityName,
    activityId: addForm.activityId,
    exhibitionHallName: addForm.exhibitionHallName,
    activityType: addForm.activityType,
    activityTheme: addForm.activityTheme,
    participants: addForm.participants,
    startDate: addForm.startDate,
    endDate: addForm.endDate,
    startTime: addForm.startTime,
    endTime: addForm.endTime,
  };
  addedData.value.push(newItem); // 将新增的数据保存到addedData数组中
  tableData.value.push(newItem);
  // ElMessage.success('新增成功');
  uploadData();
};

// 返回展厅
const router = useRouter();
const goback = () => {
  router.push("table");
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
  color: #f56c6c;
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