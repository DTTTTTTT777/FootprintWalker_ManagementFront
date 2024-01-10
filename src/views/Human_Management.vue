<template>
  <div>
    <div class="container">
      <div class="handle-box">
        <el-input v-model="query.value" placeholder="搜索内容" class="handle-input mr10"></el-input>
        <div style="display: inline-block;margin:10px;">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </div>
        <div style="display: inline-block;margin:10px;">
          <el-button type="primary" :icon="Plus" @click="handlenew" v-permiss="16">新增</el-button>
        </div>
      </div>
      <el-table :data="pageData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column prop="staffId" label="职工ID" width="170" align="center"  sortable></el-table-column>
        <el-table-column prop="staffName" label="姓名" width="110" align="center"  sortable>
          <template v-slot:default="scope">
            <el-tooltip :content="scope.row.staffName" placement="top">
              <span>{{
                  scope.row.staffName.length > 4 ? scope.row.staffName.substring(0, 4) + '...' : scope.row.staffName
                }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="staffAge" label="年龄" align="center"  sortable></el-table-column>
        <el-table-column prop="staffGender" label="性别" width="120" align="center"  sortable></el-table-column>
        <el-table-column prop="staffPostRank" label="职级" align="center"  sortable></el-table-column>
        <el-table-column prop="staffSalary" label="薪资" align="center"  sortable></el-table-column>
        <el-table-column prop="workType" label="工作方向" width="120" align="center"  sortable></el-table-column>
        <el-table-column prop="job" label="工作内容" width="120" align="center"  sortable>
          <template v-slot:default="scope">
            <el-tooltip :content="scope.row.job" placement="top">
              <span>{{ scope.row.job.length > 4 ? scope.row.job.substring(0, 4) + '...' : scope.row.job }}</span>
            </el-tooltip>
          </template>
        </el-table-column>


        <el-table-column label="操作" width="320" align="center">
          <template #default="scope">
            <el-button text :icon="Edit" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button text :icon="Delete" class="red" @click="handleDelete(scope.$index)">
              删除
            </el-button>
            <!--<el-button text :icon="More"  @click="" >
              详细信息
            </el-button>-->
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination" style="display: flex; align-items: center;">
        <el-select v-model="query.tempPageSize" @change="applyPageSize" placeholder="每页个数"
                   size="small" style="width: 100px;" clearable>
          <el-option label="5" value="5"></el-option>
          <el-option label="10" value="10"></el-option>
          <el-option label="20" value="20"></el-option>
          <el-option label="50" value="50"></el-option>
        </el-select>

        <el-pagination
            background
            layout="total, prev, pager, next"
            :current-page="query.pageIndex"
            :page-size="query.pageSize"
            :total="filteredData.length"
            @current-change="handlePageChange"
            @update:page-size="PageSizeChange"
        ></el-pagination>
      </div>
    </div>

    <!-- 编辑弹出框 -->
    <el-dialog title="编辑信息" v-model="editVisible" width="30%">
      <el-form label-width="70px">
        <el-form-item label="姓名">
          <el-input v-model="form.staffName"></el-input>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input v-model="form.staffAge"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.staffGender" placeholder="请选择性别" class="full-width-select">
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="职级">
          <el-input v-model="form.staffPostRank"></el-input>
        </el-form-item>
        <el-form-item label="薪资">
          <el-input v-model="form.staffSalary"></el-input>
        </el-form-item>
        <el-form-item label="工作方向">
          <el-select v-model="form.workTypeSelect" placeholder="请选择工作方向" class="full-width-select" multiple>
            <el-option
            v-for="item in WorkTypeOptions"
            :key="item.value"
            :label="item.value"
            :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工作内容">
          <el-input v-model="form.job"></el-input>
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
    <el-dialog title="新增人员信息" v-model="newVisible" width="30%">
      <el-form label-width="70px">
        <el-form-item label="ID">
          <el-input v-model="form.staffId"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.staffName"></el-input>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input v-model="form.staffAge"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.staffGender" placeholder="请选择性别" class="full-width-select">
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="职级">
          <el-input v-model="form.staffPostRank"></el-input>
        </el-form-item>
        <el-form-item label="薪资">
          <el-input v-model="form.staffSalary"></el-input>
        </el-form-item>
        <el-form-item label="工作方向">
          <el-select v-model="form.workTypeSelect" placeholder="请选择工作方向" class="full-width-select" multiple>
            <el-option
            v-for="item in WorkTypeOptions"
            :key="item.value"
            :label="item.value"
            :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工作内容">
          <el-input v-model="form.job"></el-input>
        </el-form-item>
        <el-form-item label="用户Id">
          <el-input v-model="form.userId"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"><el-button @click="newVisible = false">取 消</el-button></div>
					<div style="display: inline-block;margin:10px;"><el-button type="primary" @click="savenew">确 定</el-button></div>
				</span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="basetable">
import {ref, reactive} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {Delete, Edit, Search, Plus, More} from '@element-plus/icons-vue';
import axios from 'axios';
import {useUserInfo} from "@/store/userInfo";
import { SelectProps } from 'element-plus/es/components/select-v2/src/defaults';


const fetchData = async () => {
  try {
    // 设置请求头，包括 Bearer Token
    let token = useUserInfo().userToken;
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    const response = await axios.get('/api/Staffs', config);
    return response.data
  } catch (error) {
    console.error("Error in grant:", error);
  }
};

interface TableItem {
  staffId: string;
  staffName: string;
  staffAge: string;
  staffGender: string;
  staffPostRank: string;
  staffSalary: number;
  workType: string;
  job: string;
  userId: string;
  aspNetUserPk: string;
}

let newEmployee = reactive({
  staffId: '',
  staffName: '',
  staffAge: '',
  staffGender: '',
  staffPostRank: '',
  staffSalary: 0,
  workType: '',
  job: '',
  userId: '',
  userPassword: '',
});

const query = reactive({
  value: '',
  staffId: 0,
  staffName: '',
  staffAge: '',
  staffGender: '',
  staffPostRank: '',
  staffSalary: 0,
  workType: '',
  job: '',
  pageIndex: 1,
  pageSize: 10,
  userId: '',
  tempPageSize: ''
});
const HumantableData = ref<TableItem[]>([]);
const pageData = ref<TableItem[]>([]);   //
const addedData = ref<TableItem[]>([]); // 保存新增的数据
let filteredData = ref<TableItem[]>([]); // 保存筛选的数据
const compare = (a: TableItem, b: TableItem) => {
  return a.staffId < b.staffId ? -1 : 1;
}

const WorkTypeOptions = [
  {
    label: '考古学家',
    value: 'Archaeologist',
  },
  {
    label: '藏品管理员',
    value: 'CollectionManager',
  },
  {
    label: '藏品研究员',
    value: 'CollectionResearcher',
  },
  {
    label: '藏品修缮员',
    value: 'CollectionRepairer',
  },
  {
    label: '展厅管理员',
    value: 'ExhibitionHallAdmin',
  },
  {
    label: '文创产品管理员',
    value: 'ProductAdmin',
  },
  {
    label: '反馈信息管理员',
    value: 'FeedbackAdmin',
  },
  {
    label: '人事管理员',
    value: 'StaffAdmin',
  },
  {
    label: '仓库管理员',
    value: 'WarehouseAdmin',
  },
  {
    label: '日常管理员',
    value: 'RoutineAdmin',
  },
  {
    label: '待定',
    value: 'User',
  },
];


// 获取表格数据及筛选
const getData = async () => {
  const res = await fetchData();

  HumantableData.value = res;  //記錄全部數據

  filteredData.value = res.concat(addedData.value);

  //if (query.designIdea !== '') {
  //filteredData = filteredData.filter((item: TableItem) => item.designIdea === query.designIdea);
  //}
  console.log(query.value);
  filteredData.value = filteredData.value.filter((item: TableItem) =>
      item.staffName.includes(query.value) ||
      item.staffGender.includes(query.value) ||
      item.staffPostRank.includes(query.value) ||
      item.job.includes(query.value) ||
      item.workType.includes(query.value) ||
      String(item.staffId).includes(query.value) ||
      String(item.staffSalary).includes(query.value)
  );

  filteredData.value = filteredData.value.sort(compare);

  // 分页逻辑
  const startIndex = (query.pageIndex - 1) * query.pageSize;
  const endIndex = query.pageIndex * query.pageSize;

  // 截取当前页的数据
  const pagedData = filteredData.value.slice(startIndex, endIndex);
  
  // 将截取的数据赋值给 pagedData
  pageData.value = pagedData;
  console.log(pageData.value);

};
getData();


const editData = async () => {
  try {
    let token = useUserInfo().userToken;
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const EditValue = reactive({
      staffId: '',
      staffName: '',
      staffAge: '',
      staffGender: '',
      staffPostRank: '',
      staffSalary: 0,
      workType: '',
      job: '',
      aspNetUserPk: '',
    });

    EditValue.staffId = pageData.value[idx].staffId ;
    EditValue.staffName = pageData.value[idx].staffName ;
    EditValue.staffAge = pageData.value[idx].staffAge;
    EditValue.staffGender = pageData.value[idx].staffGender ;
    EditValue.staffPostRank = pageData.value[idx].staffPostRank ;
    EditValue.staffSalary = pageData.value[idx].staffSalary;
    EditValue.workType = String(pageData.value[idx].workType) ;
    EditValue.job = pageData.value[idx].job;
    EditValue.aspNetUserPk = pageData.value[idx].aspNetUserPk;

    console.log(idx, EditValue.staffId, EditValue);
    const response = await axios.put('/api/Staffs/' + EditValue.staffId, EditValue, config);
    ElMessage.success('数据修改成功');
    PageSizeChange();
  } catch (error) {
    ElMessage.error('数据修改失败');
  }
};
const uploadData = async (newEmployee) => {
  try {
    console.log(newEmployee);
    let token = useUserInfo().userToken;
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    console.log(config)
    const response = await axios.post('/api/Staffs', newEmployee, config);
    grant(response.data.workType, newEmployee.userId);
    ElMessage.success('数据上传成功');
    PageSizeChange();
  } catch (error) {
    ElMessage.error('数据上传失败');
  }
};

const deleteData = async () => {
  try {
    let token = useUserInfo().userToken;
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    console.log(idx, pageData.value[idx]);
    const response = await axios.delete('/api/Staffs/' + pageData.value[idx].staffId, config);
    ElMessage.success('删除成功');
    PageSizeChange();
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

const grant = async (WorkType, userId) => {
  try {
    // 设置请求头，包括 Bearer Token
    let token = useUserInfo().userToken;
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    const username = {
      "userId": userId,
    }
    console.log(token);
    const workTypesArray = WorkType?WorkType.split(","):[];
    console.log(workTypesArray,userId)
    for(const item of workTypesArray){
      const response = await axios.post('/api/Authenticate/Grant/' + item, username, config);
    }
  } catch (error) {
    console.error("Error in grant:", error);
  }
}
const deleteByAspNetUserPk = async (WorkType,userId) => {
  try {
      // 设置请求头，包括 Bearer Token
    let token = useUserInfo().userToken
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    const username = {
      "userId": userId,
    }
    console.log(token);
    const workTypesArray = WorkType?WorkType.split(","):[];
    console.log(workTypesArray,userId)
    for(const item of workTypesArray){
      const response = await axios.post('/api/Authenticate/CancelByAspNetUserPk/' + item, username, config);
    }
  }catch(error){
    console.error("Error in grant:", error);
  }
}
const grantByAspNetUserPk = async (WorkType, userId) => {
  try {
    // 设置请求头，包括 Bearer Token
    let token = useUserInfo().userToken
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    const username = {
      "userId": userId,
    }
    console.log(token);
    console.log(WorkType, userId);
    const workTypesArray = WorkType?WorkType.split(","):[];
    console.log(workTypesArray,userId)
    for(const item of workTypesArray){
      const response = await axios.post('/api/Authenticate/GrantByAspNetUserPk/' + item, username, config);
    }
  }catch (error) {
    console.error("Error in grant:", error);
  }
}
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

//改变大小
const applyPageSize = () => {
  if (query.tempPageSize != '') {
    query.pageSize = Number(query.tempPageSize);
  } else {
    query.pageSize = 1;
  }
  console.log(query.pageSize);
  query.pageIndex = 1;
  getData();
}

const PageSizeChange = () => {
  query.pageIndex = 1;
  getData();
}

// 删除操作
// const handleDelete = (index: number) => {
//   // 二次确认删除
//   idx = index;
//   ElMessageBox.confirm('确定要删除吗？', '提示', {
//     type: 'warning',customClass: 'my-message-box'
//   })
//       .then(() => {
//         deleteData();
//       })
//       .catch(() => {
//       });
// };
const handleDelete = (index: number) => {
  // 二次确认删除
  idx = index;
  const result = window.confirm('确定要删除吗？');
  if (result) {
    // 用户点击了确定按钮
    deleteData();
  } else {
    // 用户点击了取消按钮
    // 可以在这里添加逻辑处理
  }
};

//新增操作
const handlenew = () => {
  idx = HumantableData.value.length;
  form.staffId = '';
  form.staffName = '';
  form.staffAge = '',
      form.staffGender = '',
      form.staffPostRank = '',
      form.staffSalary = '',
      form.workType = '',
      form.job = '',
      form.userId = '',
      newVisible.value = true;
};


// 表格编辑时弹窗和保存
const editVisible = ref(false);
const newVisible = ref(false);
let form = reactive({
  staffId: '',
  staffName: '',
  staffAge: '',
  staffGender: '',
  staffPostRank: '',
  staffSalary: '',
  workType: '',
  workTypeSelect: [],
  job: '',
  userId: '',
});
let idx: number = -1;
const handleEdit = (index: number, row: any) => {
  idx = index;

  form.staffId = row.staffId;
  form.staffName = row.staffName;
  form.staffAge = String(row.staffAge),
      form.staffGender = row.staffGender,
      form.staffPostRank = row.staffPostRank,
      form.staffSalary = String(row.staffSalary),
      console.log(typeof row.workType);
      form.workTypeSelect = row.workType?row.workType.split(","):[],
      form.job = row.job,
      editVisible.value = true;
};

const testId = () => {
  // 检查 form.staffId 是否存在以及是否是一个字符串
  if (!form.staffId || typeof form.staffId !== 'string') {
    return "ID 不能为空！";
  }
  // 去除前后空白，然后检查长度
  const trimmedId = form.staffId.trim();
  if (trimmedId.length !== 18) {
    return "ID 必须是 18 位数字！";
  }
  // 使用正则表达式检查是否仅由数字组成
  const isIdDigits = /^[0-9]+$/.test(trimmedId);
  if (!isIdDigits) {
    return "ID 必须仅由数字组成！";
  }
  // 如果所有条件都满足，返回 true
  return true;
};

const testStaffName = () => {
  // 首先检查 form.staffName 是否存在以及是否是一个字符串
  if (!form.staffName || typeof form.staffName !== 'string') {
    return "姓名不能为空！";
  }
  // 去除前后空白，然后检查长度
  const trimmedName = form.staffName.trim();
  if (trimmedName.length === 0) {
    return "姓名不能为空！";
  }
  if (trimmedName.length > 15) {
    return "姓名不能超过 15 个字符！";
  }
  // 如果所有条件都满足，返回 true
  return true;
};
const testStaffAge = () => {
  // 首先检查 form.staffAge 是否存在以及是否是一个字符串
  if (!form.staffAge || typeof form.staffAge !== 'string') {
    console.log(typeof form.staffAge);
    return "年龄不能为空";
  }
  // 去除前后空白，然后检查是否为数字和长度
  const trimmedAge = form.staffAge.trim();
  if (trimmedAge.length === 0) {
    return "年龄不能为空";
  }
  // 使用正则表达式检查是否仅由数字组成
  const isAgeDigits = /^[0-9]+$/.test(trimmedAge);
  if (!isAgeDigits) {
    return "年龄必须仅由数字组成";
  }
  // 检查数字长度是否超过10位
  if (trimmedAge.length > 10) {
    return "年龄不能超过 10 位数字";
  }
  // 如果所有条件都满足，返回 true
  return true;
};
const testStaffGender = () => {
  // 首先检查 form.staffGender 是否存在以及是否是一个字符串
  if (!form.staffGender || typeof form.staffGender !== 'string') {
    return "性别不能为空";
  }

  // 去除前后空白，然后检查是否为空
  const trimmedGender = form.staffGender.trim();
  if (trimmedGender.length === 0) {
    return "性别不能为空";
  }

  // 如果所有条件都满足，返回 true
  return true;
};
const testStaffSalary = () => {
  // 首先检查 form.staffSalary 是否存在以及是否是一个字符串
  if (!form.staffSalary || typeof form.staffSalary !== 'string') {
    return "薪资不能为空";
  }

  // 去除前后空白，然后检查是否为数字和长度
  const trimmedSalary = form.staffSalary.trim();
  if (trimmedSalary.length === 0) {
    return "薪资不能为空";
  }

  // 使用正则表达式检查是否仅由数字组成
  const isSalaryDigits = /^[0-9]+$/.test(trimmedSalary);
  if (!isSalaryDigits) {
    return "薪资必须仅由数字组成";
  }

  // 检查数字长度是否超过10位
  if (trimmedSalary.length >= 10) {
    return "薪资不能超过 10 位数字";
  }

  // 如果所有条件都满足，返回 true
  return true;
};


const testFieldNotEmpty = (field, fieldName) => {
  // 首先检查 field 是否存在以及是否是一个字符串
  if (!field || typeof field !== 'string') {
    return `${fieldName}不能为空`;
  }

  // 去除前后空白，然后检查是否为空
  const trimmedField = field.trim();
  if (trimmedField.length === 0) {
    return `${fieldName}不能为空`;
  }

  // 如果所有条件都满足，返回 true
  return true;
};

const testStaffPostRank = () => testFieldNotEmpty(form.staffPostRank, "职级");
//const testWorkType = () => testFieldNotEmpty(form.workType, "工作方向");
const testWorkType = () => {return true;}
const testJob = () => testFieldNotEmpty(form.job, "工作内容");


const saveEdit = async () => {

  let Nametested = testStaffName();
  if (Nametested != true) {
    ElMessage.error(Nametested);
    return;
  }
  let Agetested = testStaffAge();
  if (Agetested != true) {
    ElMessage.error(Agetested);
    return;
  }
  let Salarytested = testStaffSalary();
  if (Salarytested != true) {
    ElMessage.error(Salarytested);
    return;
  }
  let Jobtested = testJob();
  if (Jobtested != true) {
    ElMessage.error(Jobtested);
    return;
  }
  let PostRanktested = testStaffPostRank();
  if (PostRanktested != true) {
    ElMessage.error(PostRanktested);
    return;
  }
  let WorkTypetested = testWorkType();
  if (WorkTypetested != true) {
    //ElMessage.error(WorkTypetested);
    return;
  }

  editVisible.value = false;
  ElMessage.success(`修改第 ${idx + 1} 行成功`);
  console.log(idx, pageData);
  let OldWorkType = pageData.value[idx].workType;
  pageData.value[idx].staffId = form.staffId;
  pageData.value[idx].staffName = form.staffName;
  pageData.value[idx].staffAge = form.staffAge;
  pageData.value[idx].staffGender = form.staffGender;
  pageData.value[idx].staffPostRank = form.staffPostRank;
  pageData.value[idx].staffSalary = Number(form.staffSalary);
  pageData.value[idx].workType = String(form.workTypeSelect);
  pageData.value[idx].job = form.job; //应该要至后端修改之
  editData();

  const NewWorkType = pageData.value[idx].workType;

  const oldWorkTypeArray = OldWorkType?OldWorkType.split(","):[];
  const newWorkTypeArray = NewWorkType?NewWorkType.split(","):[];
  for (let i =0;i<oldWorkTypeArray.length;i++) {
    console.log(oldWorkTypeArray[i])
    await deleteByAspNetUserPk(oldWorkTypeArray[i], pageData.value[idx].aspNetUserPk);

  }

  // Grant roles that exist in NewWorkType but not in OldWorkType
  for (const workType of newWorkTypeArray) {
    console.log(workType)
    await grantByAspNetUserPk(workType, pageData.value[idx].aspNetUserPk);
  }
     // Delete roles that exist in OldWorkType but not in NewWorkType

};


/*const generatePassword = () =>{
      const length = 10;
      const charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~';
      let retVal = '';
      for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      let password = retVal;
	  return password;
};*/

const savenew = () => {         //保存新增人员

  //检查各项输入值是否符合条件
  let IDtested = testId();
  if (IDtested != true) {
    ElMessage.error(IDtested);
    return;
  }
  let Nametested = testStaffName();
  if (Nametested != true) {
    ElMessage.error(Nametested);
    return;
  }
  let Agetested = testStaffAge();
  if (Agetested != true) {
    ElMessage.error(Agetested);
    return;
  }
  let Salarytested = testStaffSalary();
  if (Salarytested != true) {
    ElMessage.error(Salarytested);
    return;
  }
  let Jobtested = testJob();
  if (Jobtested != true) {
    ElMessage.error(Jobtested);
    return;
  }
  let PostRanktested = testStaffPostRank();
  if (PostRanktested != true) {
    ElMessage.error(PostRanktested);
    return;
  }
  let WorkTypetested = testWorkType();
  if (WorkTypetested != true) {
  //  ElMessage.error(WorkTypetested);
    return;
  }

  newVisible.value = false;
  ElMessage.success(`添加成功`);
  console.log(idx, HumantableData);
  newEmployee.staffId = form.staffId;
  newEmployee.staffName = form.staffName;
  newEmployee.staffAge = form.staffAge;
  newEmployee.staffGender = form.staffGender;
  newEmployee.staffPostRank = form.staffPostRank;
  newEmployee.staffSalary = Number(form.staffSalary);
  newEmployee.workType = String(form.workTypeSelect);
  newEmployee.job = form.job;
  newEmployee.userId = form.userId;
  newEmployee.userPassword = "Bestjiaoao0!";
  uploadData(newEmployee);             //上传
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

.full-width-select {
  width: 100%;
}
.my-message-box {
  /* 自定义样式 */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
}
</style>
