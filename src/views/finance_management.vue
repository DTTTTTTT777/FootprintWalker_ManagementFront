<template>
  <div>
    <div class="container">
      <div class="handle-box">
        <el-select v-model="query.type" placeholder="财务类型" class="handle-select mr10">
          <el-option label="全部条目" value="all"></el-option>
          <el-option label="支出条目" value="true"></el-option>
          <el-option label="收入条目" value="false"></el-option>
        </el-select>
        <el-input v-model="query.activityName" placeholder="关联活动" class="handle-input mr10"></el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="showAddIncomeDialog">新增财务收入</el-button>
      </div>
      <el-table :data="tableData" border class="table" ref="financialTable">
        <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
        <el-table-column label="财务类型">
          <template #default="{ row }">
            {{ displayFinanceType(row.financeType) }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型"></el-table-column>
        <el-table-column prop="activityName" label="活动名称"></el-table-column>
        <el-table-column prop="amount" label="金额"></el-table-column>
        <!--        <el-table-column prop="proofInfo" label="凭证信息"></el-table-column>-->
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column prop="officerName" label="负责人"></el-table-column>
        <el-table-column prop="handlerName" label="处理人"></el-table-column>
<!--        <el-table-column prop="time" label="时间"></el-table-column>-->
        <el-table-column label="操作" width="250" align="center">
          <template #default="scope">
            <div class="custom-button-container">
              <el-button text :icon="View" class="view-button" @click="handleView(scope.$index, scope.row)">查看</el-button>
              <el-button text :icon="Edit" class="edit-button" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button text :icon="Delete" class="red delete-button" @click="handleDelete(scope.$index)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑弹出框 -->
    <el-dialog title="编辑财务信息" v-model="editVisible" width="40%" v-if="editVisible">
      <el-form label-width="90px">
        <el-form-item label="财务类型">
          <el-input v-model="form.financeType"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="form.type"></el-input>
        </el-form-item>
        <el-form-item label="选择活动">
          <el-select v-model="addIncomeForm.activityId" placeholder="请选择相关活动">
            <el-option
                v-for="activity in activities"
                :key="activity.id"
                :label="activity.title"
                :value="activity.id">
            </el-option>
          </el-select>
        <!--        <el-form-item label="活动名称">-->
        <!--          <el-input v-model="form.activityName"></el-input>-->
        <!--        </el-form-item>-->
        </el-form-item>
        <el-form-item label="金额">
          <el-input v-model="form.amount"></el-input>
        </el-form-item>
        <el-form-item label="凭证信息">
          <el-input v-model="form.proofInfo"></el-input>
          <img :src="form.proofInfo" alt="证明信息" style="max-width: 100%; max-height: 300px;" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark"></el-input>
        </el-form-item>
        <el-form-item label="负责人ID">
          <el-input v-model="form.officerId"></el-input>
        </el-form-item>
        <el-form-item label="处理人ID">
          <el-input v-model="form.handlerId"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <div style="display: inline-block; margin: 10px;">
            <el-button @click="editVisible = false">取消</el-button>
          </div>
          <div style="display: inline-block; margin: 10px;">
            <el-button type="primary" @click="saveEdit">确定</el-button>
          </div>
        </span>
      </template>
    </el-dialog>
    <!-- 查看弹出框 -->
    <el-dialog title="查看财务信息" v-model="viewVisible" width="40%" v-if="viewVisible">
      <el-form label-width="90px" disabled >
        <el-form-item label="财务类型">
          <el-input v-model="form.financeType"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="form.type"></el-input>
        </el-form-item>
        <!--        <el-form-item label="活动名称">-->
        <!--          <el-input v-model="form.activityName"></el-input>-->
        <!--        </el-form-item>-->
        <el-form-item label="金额">
          <el-input v-model="form.amount"></el-input>
        </el-form-item>
        <el-form-item label="证明信息">
        <!-- 显示证明信息图片 -->
        <img :src="form.proofInfo" alt="证明信息" style="max-width: 100%; max-height: 300px;" />
      </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark"></el-input>
        </el-form-item>
        <el-form-item label="负责人ID">
          <el-input v-model="form.officerId"></el-input>
        </el-form-item>
        <el-form-item label="处理人ID">
          <el-input v-model="form.handlerId"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <div style="display: inline-block; margin: 10px;">
            <el-button @click="viewVisible = false">关闭</el-button>
          </div>
        </span>
      </template>
    </el-dialog>

    <!-- 添加收入弹出框 -->
    <el-dialog title="添加财务收入" v-model="addIncomeVisible" width="40%">
      <el-form label-width="90px" :model="addIncomeForm" ref="addIncomeFormRef">
        <!-- 支出类型 -->
<!--        <el-form-item label="财务类型" prop="financeType">-->
<!--          <el-select v-model="addIncomeForm.financeType" placeholder="请选择财务类型">-->
<!--            <el-option label="收入" value="INCOME"></el-option>-->
<!--          </el-select>-->
<!--        </el-form-item>-->

        <!-- 类型 -->
        <el-form-item label="类型" prop="type">
          <el-input v-model="addIncomeForm.type"></el-input>
        </el-form-item>
        <el-form-item label="选择活动">
          <el-select v-model="addIncomeForm.activityId" placeholder="请选择相关活动">
            <el-option
                v-for="activity in activities"
                :key="activity.id"
                :label="activity.title"
                :value="activity.id">
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 金额 -->
        <el-form-item label="金额" prop="amount">
          <el-input v-model.number="addIncomeForm.amount" type="number"></el-input>
        </el-form-item>

        <!-- 证明信息 -->
        <el-form-item label="证明信息" prop="proofInfo">
          <el-upload v-model:file-list="addIncomeFileList" class="upload-demo" multiple="false"
                     action="/foreignImage/upload" name="smfile"
                     :headers="{ Authorization: '36BZaEnY8eVdNuWGWhg0LgmSHByiHEGP' }"
                     :on-success="handleAddIncomeSuccess"
                     :on-error="handleAddIncomeError"
                     :before-upload="beforeAddIncomeUpload"
                     :limit="1"
                     :on-exceed="handleAddIncomeExceed"
                     prop="proofInfo">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
          <el-image v-if="addIncomeForm.proofInfo" class="CollectionImg" :src="addIncomeForm.proofInfo"
                    :z-index="10" :height="100">
          </el-image>
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注" prop="remark">
          <el-input v-model="addIncomeForm.remark" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addIncomeVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddIncomeForm">添加</el-button>
        </span>
      </template>
    </el-dialog>


  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {Delete, Edit, View} from '@element-plus/icons-vue';
import axios from 'axios';
import {axiosForFinance, axiosForFile, axiosForHuman, axiosForActivity} from '../main.js';



const query = reactive({
  type: 'all',
  activityName: '',
  pageIndex: 1,
  pageSize: 10
});

interface FinancialRecord {
  id: number;
  financeType: string;
  type: string;
  activityName: string;
  officerName: string,
  handlerName: string,
  amount: number;
  proofInfo: string;
  remark: string;
  officerId: number;
  handlerId: number;
  time: string;
}

const tableData = ref<FinancialRecord[]>([]);
const pageTotal = ref(0);

const addIncomeVisible = ref(false);
const addIncomeFormRef = ref(null);
const addIncomeForm = reactive({
  // 初始化添加财务收入表单的数据结构
  // 类似于报销申请的表单
  financeType: 'INCOME',
  activityId: 0,
  type: '',
  amount: null,
  proofInfo: '',
  remark: '',
  officerId: -1, // 根据需要设置
  handlerId: -1, // 根据需要设置
});


const activities = ref([]);
const fetchActivities = async () => {
  try {
    const response = await axiosForActivity.get('/api/activity/activities');
    activities.value = response.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
  }
};
onMounted(fetchActivities);


const showAddIncomeDialog = () => {
  addIncomeVisible.value = true;
};
const submitAddIncomeForm = async () => {
  // 表单验证逻辑
  addIncomeFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        addIncomeForm.officerId = addIncomeForm.handlerId = Number(localStorage.getItem('id'));
        // 发送 POST 请求创建新的财务收入记录
        const response = await axiosForFinance.post('/api/finance/financialRecords', addIncomeForm);
        console.log(response);
        if (response.status === 200 || response.status === 201) {
          ElMessage.success('财务收入添加成功');
          addIncomeVisible.value = false;
          getAllFinancialRecords(); // 重新获取财务记录
        } else {
          ElMessage.error('财务收入添加失败');
        }
      } catch (error) {
        console.error('添加财务收入出错:', error);
        ElMessage.error('财务收入添加失败');
      }
    } else {
      console.log('表单验证失败');
    }
  });
};

// 示例函数，根据 ID 获取名字
const getClerkNameById = async (id) => {
  try {
    // 替换为实际的 API 调用
    const response = await axiosForHuman.get(`api/human_management/clerks/${id}`);
    return response.data.name;
  } catch (error) {
    console.error(error);
    return '未知';
  }
};

const getActivityNameById = async (id) => {
  try {
    // 替换为实际的 API 调用
    const response = await axiosForActivity.get(`api/activity/activities/${id}`);
    return response.data.title;
  } catch (error) {
    console.error(error);
    return '未知';
  }
};


// 获取财务信息数据
const getAllFinancialRecords = async () => {
  try {
    const response = await axiosForFinance.get('/api/finance/financialRecords');
    let data = response.data;

    tableData.value = data;
    pageTotal.value = data.length;

    // tableData.value = data.records;
    // pageTotal.value = data.total;
    console.log(data);

    // 应用筛选条件
    if (query.type !== 'all') {
      data = data.filter(record =>
          (query.type === 'true' && record.financeType === 'EXPENSE') ||
          (query.type === 'false' && record.financeType === 'INCOME'));
    }

    // 异步获取额外信息
    for (const record of data) {
      record.activityName = await getActivityNameById(record.activityId);
      record.officerName = await getClerkNameById(record.officerId);
      record.handlerName = await getClerkNameById(record.handlerId);
      console.log(record.activityName, record.officerName, record.handlerName);
    }


    if (query.activityName) {
      data = data.filter(record => record.activityName.includes(query.activityName));
    }
    console.log(data);

    tableData.value = data;
    pageTotal.value = data.length;


  } catch (error) {
    console.error(error);
  }
};

// 查询操作
const handleSearch = () => {
    getAllFinancialRecords();
  };

getAllFinancialRecords();

// // 查询操作
// const handleSearch = () => {
//   query.pageIndex = 1;
//   getAllFinancialRecords();
// };
  const displayFinanceType = (financeType) => {
    return financeType === 'INCOME' ? '收入' : financeType === 'EXPENSE' ? '支出' : financeType;
  };

// 分页导航
const handlePageChange = (val: number) => {
  query.pageIndex = val;
  getAllFinancialRecords();
};

// 删除操作
const handleDelete = (index: number) => {
  const record = tableData.value[index];
  ElMessageBox.confirm('确定要删除该财务信息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
      .then(async () => {
        try {
          await axiosForFinance.delete(`/api/finance/financialRecords/${record.id}`);
          ElMessage.success('删除成功');
          tableData.value.splice(index, 1);
        } catch (error) {
          ElMessage.error('删除失败');
          console.error(error);
        }
      })
      .catch(() => {
        // 用户点击了取消按钮
        // 可以在这里添加逻辑处理
      });
};

// 编辑操作
const editVisible = ref(false);
let viewVisible = ref(false);


let form = reactive({
  id: 0,
  financeType: '',
  type: '',
  activityName: '', // 应该是字符串
  officerName: '',
  handlerName: '',
  amount: 0,
  proofInfo: '',
  remark: '',
  officerId: 0,
  handlerId: 0,
  time: '',
});

let editIndex = -1;

// const handleEdit = (index: number, row: FinancialRecord) => {
//   // form = JSON.parse(JSON.stringify(row));
//   form = { ...row };
//   editIndex = index;
//   console.log(form);
//   console.log(editIndex);
//   editVisible.value = true;
// };
const handleEdit = (index: number, row: FinancialRecord) => {
  form = row;
  editIndex = index;
  console.log(form);
  console.log(editIndex);
  editVisible.value = true;
};
  const handleView = (index: number, row: FinancialRecord) => {
    // 设置要显示的详细信息，你可以在这里根据需要填充弹窗中的内容
    // 例如：form = row;
    form = row;
    editIndex = index;
    viewVisible.value = true; // 显示弹窗
  };

// 保存编辑
const saveEdit = async () => {
  try {
    const response = await axiosForFinance.put(`/api/finance/financialRecords/${form.id}`, form);
    ElMessage.success('修改成功');
    tableData.value[editIndex] = form ;
    editVisible.value = false;
  } catch (error) {
    ElMessage.error('修改失败');
    console.error(error);
  }
};

const addIncomeFileList = ref([]);

// 处理上传成功
const handleAddIncomeSuccess = (response, file) => {
  console.log('上传成功', response);

  if(response.success == true)
    addIncomeForm.proofInfo = response.data.url;
  else
    addIncomeForm.proofInfo = response.images;

  console.log(addIncomeForm.proofInfo);

  // window.location.reload(); // 强制刷新页面
};

// 处理上传失败
const handleAddIncomeError = (err) => {
  console.error('上传失败', err);
  ElMessage.error('上传失败');
};

// 上传之前的处理
const beforeAddIncomeUpload = (file) => {
  // 您可以在此添加文件类型或大小检查
  return true; // 返回true表示继续上传，返回false表示取消上传
};

// 超出上传限制处理
const handleAddIncomeExceed = (files, uploadFiles) => {
  ElMessage.warning(`只能上传一个文件`);
};

</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}

.handle-select {
  width: 200px;
  margin-right: 10px;
}

.handle-input {
  width: 200px;
  margin-right: 10px;
}

.custom-button-container {
  display: flex;
  align-items: center;
}

.view-button, .edit-button, .delete-button {
  width: 50px; /* 调整按钮宽度 */
  margin-right: 10px;
}

.red {
  color: red;
}
.CollectionImg {
  margin-top: 10px;
  max-height: 100px;
  border: 1px solid #ddd;
}
</style>
