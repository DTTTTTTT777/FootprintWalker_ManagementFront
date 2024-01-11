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
      </div>
      <el-table :data="tableData" border class="table" ref="financialTable">
        <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
        <el-table-column prop="financeType" label="财务类型"></el-table-column>
        <el-table-column prop="type" label="类型"></el-table-column>
        <el-table-column prop="activityName" label="活动名称"></el-table-column>
        <el-table-column prop="amount" label="金额"></el-table-column>
<!--        <el-table-column prop="proofInfo" label="凭证信息"></el-table-column>-->
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column prop="officerId" label="负责人"></el-table-column>
        <el-table-column prop="handlerId" label="处理人"></el-table-column>
        <el-table-column prop="time" label="时间"></el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <div class="custom-button-container">
              <el-button text :icon="Edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button text :icon="Delete" class="red" @click="handleDelete(scope.$index)">删除</el-button>
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
<!--        <el-form-item label="活动名称">-->
<!--          <el-input v-model="form.activityName"></el-input>-->
<!--        </el-form-item>-->
        <el-form-item label="金额">
          <el-input v-model="form.amount"></el-input>
        </el-form-item>
        <el-form-item label="凭证信息">
          <el-input v-model="form.proofInfo"></el-input>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit } from '@element-plus/icons-vue';
import axios from 'axios';
import { axiosForFinance } from '../main.js';



const query = reactive({
  type: '',
  activityName: '',
  pageIndex: 1,
  pageSize: 10
});

interface FinancialRecord {
  id: number;
  financeType: string;
  type: string;
  activityName: string;
  amount: number;
  proofInfo: string;
  remark: string;
  officerId: number;
  handlerId: number;
  time: string;
}

const tableData = ref<FinancialRecord[]>([]);
const pageTotal = ref(0);

// 获取财务信息数据
const getAllFinancialRecords = async () => {
  try {
    // 构建查询参数
    const params = {
      // type: query.type,
      // activityName: query.activityName,
      // pageIndex: query.pageIndex,
      // pageSize: query.pageSize
    };
    const response = await axiosForFinance.get('/api/finance/financialRecords', { params });
    console.log(response.data);
    const data = response.data;

    tableData.value = data;
    pageTotal.value = data.length;

    // tableData.value = data.records;
    // pageTotal.value = data.total;

  } catch (error) {
    console.error(error);
  }
};

getAllFinancialRecords();

// 查询操作
const handleSearch = () => {
  query.pageIndex = 1;
  getAllFinancialRecords();
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



let form = reactive<FinancialRecord>({
  id: 0,
  financeType: '',
  type: '',
  activityName: '', // 应该是字符串
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
  form = JSON.parse(JSON.stringify(row)); // 使用深拷贝
  editIndex = index;
  editVisible.value = true;
};


// 保存编辑
const saveEdit = async () => {
  try {
    const response = await axiosForFinance.put(`/api/finance/financialRecords/${form.id}`, form);
    ElMessage.success('修改成功');
    tableData.value[editIndex] = { ...form };
    editVisible.value = false;
  } catch (error) {
    ElMessage.error('修改失败');
    console.error(error);
  }
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

.red {
  color: red;
}
</style>
