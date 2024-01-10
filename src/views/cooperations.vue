<template>
	<div>
		<div class="container">
			<div class="handle-box">

				<el-input v-model="query.name" placeholder="联名名称" class="handle-input mr10"></el-input>


				<div style="display: inline-block;margin:10px;"><el-button type="primary" :icon="Search" @click="handleSearch" >搜索</el-button></div>
				<div style="display: inline-block;margin:10px;"><el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button></div>


			</div>
			<el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
				<el-table-column prop="id" label="ID" width="100" align="center"></el-table-column>
				<el-table-column prop="name" label="联名名称"></el-table-column>
				<el-table-column label="联名金额（万元）">
					<template #default="scope">￥{{ scope.row.price }}</template>
				</el-table-column>
				<el-table-column prop="partner" label="合作方"></el-table-column>
				<el-table-column prop="timeStamp_start" label="合作时间（始）"></el-table-column>
				<el-table-column prop="timeStamp_end" label="合作时间（终）"></el-table-column>
				<el-table-column label="操作" width="220" align="center">
					<template #default="scope">
						<el-button text :icon="Edit" @click="handleEdit(scope.$index, scope.row)">
							编辑
						</el-button>
						<el-button text :icon="Delete" class="red" @click="handleDelete(scope.$index)">
							删除
						</el-button>
					</template>
				</el-table-column>

			</el-table>
			<div class="pagination">
				<el-pagination background layout="total, prev, pager, next" :current-page="query.pageIndex"
					:page-size="query.pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
			</div>
		</div>

		<!-- 编辑弹出框 -->
		<el-dialog title="编辑" v-model="editVisible" width="30%">
			<el-form label-width="200px">
				<el-form-item label="联名名称">
					<el-input v-model="form.name"></el-input>
				</el-form-item>
				<el-form-item label="联名金额（万元）">
					<el-input v-model="form.price"></el-input>
				</el-form-item>
				<el-form-item label="合作方">
					<el-input v-model="form.partner"></el-input>
				</el-form-item>
				<el-form-item label="合作时间（始）">
					<el-input v-model="form.timeStamp_start"></el-input>
				</el-form-item>
				<el-form-item label="合作时间（终）">
					<el-input v-model="form.timeStamp_end"></el-input>
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
		<el-dialog title="新增" v-model="addVisible" width="30%">
			<el-form label-width="200px">
				<el-form-item label="联名名称">
					<el-input v-model="addForm.name"></el-input>
				</el-form-item>
				<el-form-item label="联名金额（万元）">
					<el-input v-model="addForm.price"></el-input>
				</el-form-item>
				<el-form-item label="合作方">
					<el-input v-model="addForm.partner"></el-input>
				</el-form-item>
				<el-form-item label="合作时间（始）">
					<el-input v-model="addForm.timeStamp_start"></el-input>
				</el-form-item>
				<el-form-item label="合作时间（终）">
					<el-input v-model="addForm.timeStamp_end"></el-input>
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

<script setup lang="ts" name="basetable">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue';
import axios from 'axios'

const fetchData = async () => {
	try {
		const response = await axios.get('http://42.192.39.198:5000/api/Cooperations');
		console.log(response.data); 
		return response.data;
	} catch (error) {
		console.error(error);
	}
};

interface TableItem {
	id: number;
	name: string;
	price: number;
	partner: string;
	timeStamp_start: string;
	timeStamp_end: string;
}

const query = reactive({
	address: '',
	name: '',
	pageIndex: 1,
	pageSize: 10
});
const tableData = ref<TableItem[]>([]);
const pageTotal = ref(0);
const addedData = ref<TableItem[]>([]); // 保存新增的数据
const compare = (a:TableItem,b:TableItem)=>{
	return a.id < b.id ? -1:1;
}
// 获取表格数据
const getData = () => {
	fetchData().then(res => {
		let filteredData = res.data.list.concat(addedData.value);
		if (query.name !== '') {
			filteredData = filteredData.filter((item: TableItem) => item.name.includes(query.name));
		}
		tableData.value = filteredData;
		pageTotal.value = res.data.pageTotal || 50;
	});
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

const uploadData = async () => {
    try {
        const response = await axios.put('http://42.192.39.198:5000/api/Cooperations/'+tableData.value[idx].id, tableData.value[idx]);
        ElMessage.success('数据上传成功');
    } catch (error) {
        ElMessage.error('数据上传失败');
    }
};

const uploadData1 = async () => {
    try {
        const response = await axios.post('http://42.192.39.198:5000/api/Cooperations/', tableData.value[tableData.value.length-1]);
		console.log(tableData.value[tableData.value.length-1]);
        ElMessage.success('数据上传成功');
    } catch (error) {
        ElMessage.error('数据上传失败');
    }
};



// 表格编辑时弹窗和保存
const editVisible = ref(false);
let form = reactive({
	name: '',
	price: 0,
	partner: '',
	timeStamp_start: '',
	timeStamp_end: '',
});
let idx: number = -1;
const handleEdit = (index: number, row: any) => {
	idx = index;
	form.name = row.name;
	form.price = row.price;
	form.partner = row.partner;
	form.timeStamp_start = row.timeStamp_start;
	form.timeStamp_end = row.timeStamp_end;
	editVisible.value = true;
};
const saveEdit = () => {
	editVisible.value = false;
	ElMessage.success(`修改第 ${idx + 1} 行成功`);
	tableData.value[idx].name = form.name;
	tableData.value[idx].price = form.price;
	tableData.value[idx].partner = form.partner;
	tableData.value[idx].timeStamp_start = form.timeStamp_start;
	tableData.value[idx].timeStamp_end = form.timeStamp_end;
	uploadData();
};

// 新增弹窗和保存
const addVisible = ref(false);
let addForm = reactive({
	name: '',
	price: 0,
	partner: '',
	timeStamp_start: '',
	timeStamp_end: '',
});
const handleAdd = () => {
	addVisible.value = true;
};
const saveAdd = () => {
	addVisible.value = false;
	const newItem = {
		id: tableData.value.length + 1,
		name: addForm.name,
		price: addForm.price,
		partner: addForm.partner,
		timeStamp_start: addForm.timeStamp_start,
		timeStamp_end: addForm.timeStamp_end,
	};
	addedData.value.push(newItem); // 将新增的数据保存到addedData数组中
	tableData.value.push(newItem);
	ElMessage.success('新增成功');
	uploadData1();
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
