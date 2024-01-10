<template>
	<div>
		<div class="container">
			<div class="handle-box">
				<el-select v-model="query.isRelated" placeholder="产品关系" class="handle-select mr10">
					<el-option label="全部产品" value="all"></el-option>
					<el-option label="文创产品" value="true"></el-option>
					<el-option label="非文创产品" value="false"></el-option>
				</el-select>

				<el-input v-model="query.productName" placeholder="商品名称" class="handle-input mr10"></el-input>

				<div style="display: inline-block;margin:10px;"><el-button type="primary" :icon="Search"
						@click="handleSearch">搜索</el-button></div>
				<div style="display: inline-block;margin:10px;"><el-button type="primary"
						@click="handleAddNormal">新增普通商品</el-button></div>
				<div style="display: inline-block;margin:10px;"><el-button type="primary"
						@click="handleAddCreative">新增文创产品</el-button></div>

			</div>
			<el-table :data="tableData" border class="table" ref="multipleTable"
				header-cell-class-productName="table-header">
				<el-table-column prop="productId" label="ID   " width="55" align="center"></el-table-column>
				<el-table-column prop="productName" label="商品名称"></el-table-column>
				<el-table-column label="商品价格">
					<template #default="scope">￥{{ scope.row.price }}</template>
				</el-table-column>

				<el-table-column prop="monthlySale" label="月销量"></el-table-column>
				<el-table-column label="操作" width="300" align="center">
					<template #default="scope">
						<div class="custom-button-container">
							<el-button text :icon="Edit" @click="handleEditNormal(scope.$index, scope.row)"
								v-if="!scope.row.isRelated">
								编辑
							</el-button>
							<el-button text :icon="Edit" @click="handleEditCreative(scope.$index, scope.row)"
								v-if="scope.row.isRelated">
								编辑
							</el-button>

							<el-button text :icon="Delete" class="red" @click="handleDelete(scope.$index)">
								删除
							</el-button>
							<el-button @click="viewCreativeProduct(scope.$index)"
								v-if="scope.row.isRelated === true">查看</el-button>
						</div>
					</template>
				</el-table-column>

			</el-table>
			<div class="pagination">
				<el-pagination background layout="total, prev, pager, next" v-model="query.pageIndex"
					:page-size="query.pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>

			</div>
		</div>

		<!-- 编辑弹出框 -->
		<!-- 编辑普通商品弹出框 -->
		<el-dialog title="编辑普通商品" v-model="editNormalVisible" width="40%" v-if="editNormalVisible">
			<el-form label-width="90px">
				<el-form-item label="商品名称">
					<el-input v-model="form.productName"></el-input>
				</el-form-item>
				<el-form-item label="商品价格">
					<el-input v-model="form.price"></el-input>
				</el-form-item>
				<el-form-item label="月销量">
					<el-input v-model="form.monthlySale"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"> <el-button @click="editCreativeVisible = false">取
							消</el-button></div>
					<div style="display: inline-block;margin:10px;"> <el-button type="primary" @click="saveEdit">确
							定</el-button></div>
				</span>
			</template>
		</el-dialog>

		<!-- 编辑文创产品弹出框 -->
		<el-dialog title="编辑文创产品" v-model="editCreativeVisible" width="40%" v-if="editCreativeVisible">
			<el-form label-width="90px">
				<el-form-item label="商品名称">
					<el-input v-model="form.productName"></el-input>
				</el-form-item>
				<el-form-item label="商品价格">
					<el-input v-model="form.price"></el-input>
				</el-form-item>
				<el-form-item label="月销量">
					<el-input v-model="form.monthlySale"></el-input>
				</el-form-item>
				<el-form-item label="相关文物Id">
					<el-input v-model="form.relatedCollectionId"></el-input>
				</el-form-item>
				<el-form-item label="设计理念">
					<el-input v-model="form.designIdea"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"><el-button @click="editCreativeVisible = false">取
							消</el-button></div>
					<div style="display: inline-block;margin:10px;"><el-button type="primary" @click="saveEdit">确
							定</el-button></div>
				</span>
			</template>
		</el-dialog>

		<!-- 查看文创产品弹出框 -->
		<el-dialog title="查看文创产品" v-model="viewVisible" width="40%">
			<el-form label-width="90px">
				<el-form-item label="相关文物Id">
					<el-input v-model="viewForm.relatedCollectionId" disabled></el-input>
				</el-form-item>
				<el-form-item label="设计理念">
					<el-input v-model="viewForm.designIdea" disabled></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"><el-button @click="viewVisible = false">关闭</el-button>
					</div>
				</span>
			</template>
		</el-dialog>

		<!-- 新增弹出框 -->
		<el-dialog title="新增" v-model="addVisible" width="40%">
			<el-form label-width="90px">
				<el-form-item label="商品名称">
					<el-input v-model="addForm.productName"></el-input>
				</el-form-item>
				<el-form-item label="商品价格">
					<el-input v-model="addForm.price"></el-input>
				</el-form-item>
				<el-form-item label="月销量">
					<el-input v-model="addForm.monthlySale"></el-input>
				</el-form-item>
				<el-form-item label="相关文物Id" v-if="addForm.isRelated">
					<el-input v-model="addForm.relatedCollectionId"></el-input>
				</el-form-item>
				<el-form-item label="设计理念" v-if="addForm.isRelated">
					<el-input v-model="addForm.designIdea"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"><el-button @click="addVisible = false">取 消</el-button>
					</div>
					<div style="display: inline-block;margin:10px;"><el-button type="primary" @click="saveAdd">确
							定</el-button></div>
				</span>
			</template>
		</el-dialog>

	</div>
</template>
	  
<script setup lang="ts" productName="basetable">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue';

import axios from 'axios'
import { useUserInfo } from '../store/userInfo';

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

interface TableItem {
	productId: number;
	productName: string;
	price: number;
	monthlySale: number;
	isRelated: boolean; // 修改为boolean类型
}

const query = reactive({
	isRelated: 'all', // 默认值为 'all' 表示全部产品
	productName: '',
	pageIndex: 1,
	pageSize: 10
});

const tableData = ref<TableItem[]>([]);
const pageTotal = ref(0);

const selectedCategory = ref('all');
// 获取表格数据
const getAllProducts = async () => {
	try {
		const response = await axiosInstance.get('/Products');
		const data = response.data;

		// 根据查询条件过滤产品列表
		const filteredData = data
			.filter((item: any) => {
				const isRelatedFilter = query.isRelated === 'all' ? true : item.isRelated === (query.isRelated === 'true');
				const productNameFilter = query.productName ? item.productName.includes(query.productName) : true;
				return isRelatedFilter && productNameFilter;
			})
			.map((item: any) => ({
				productId: item.productId,
				productName: item.productName,
				price: item.price,
				monthlySale: item.monthlySale,
				isRelated: item.isRelated,
			}));

		// 计算总页数
		const totalItems = filteredData.length;
		pageTotal.value = totalItems;

		// 根据当前页码和每页显示数量切片数据
		const startIndex = (query.pageIndex - 1) * query.pageSize;
		const endIndex = startIndex + query.pageSize;
		tableData.value = filteredData.slice(startIndex, endIndex);
	} catch (error) {
		console.error(error);
	}
};

getAllProducts();

// 查询操作
const handleSearch = () => {
	query.pageIndex = 1;
	getAllProducts();
};
// 分页导航
const handlePageChange = (val: number) => {
	query.pageIndex = val;
	getAllProducts();
	query.pageIndex = val;
};

// 上传普通商品信息
const uploadNormalData = async () => {
	try {
		const response = await axiosInstance.put(`/Products/${tableData.value[idx].productId}`, {
			productId: tableData.value[idx].productId,
			productName: form.productName,
			price: form.price,
			monthlySale: form.monthlySale,
			isRelated: false
		});
		ElMessage.success('数据上传成功');
	} catch (error) {
		ElMessage.error('数据上传失败');
	}
};

// 上传文创产品信息
const uploadCreativeData = async () => {
	try {
		const response = await axiosInstance.put(`/CulturalProducts/${tableData.value[idx].productId}`, {
			designIdea: form.designIdea,
			relatedCollectionId: form.relatedCollectionId,
			relatedProduct: {
				productId: tableData.value[idx].productId,
				productName: form.productName,
				price: form.price,
				monthlySale: form.monthlySale,
				isRelated: true
			}
		});
		ElMessage.success('数据上传成功');
	} catch (error) {
		ElMessage.error('数据上传失败');
	}
};

const viewVisible = ref(false);
let viewForm = reactive({
	relatedCollectionId: 0,
	designIdea: '',
	isRelated: 0
});
const viewCreativeProduct = async (index: number) => {
	if (tableData.value[index].isRelated) {
		try {
			const productId = tableData.value[index].productId;
			const response = await axiosInstance.get(`/CulturalProducts/${productId}`);
			const data = response.data;
			viewForm.relatedCollectionId = data.relatedCollectionId || 0;
			viewForm.designIdea = data.designIdea || '';
			viewVisible.value = true;
		} catch (error) {
			console.error(error);
		}
	}
};

// 删除操作
const handleDelete = (index: number) => {
	// 二次确认删除
	const result = window.confirm('确定要删除吗？');
	if (result) {
		ElMessage.success('删除成功');
			// 在这里调用 saveDelete 并传递要删除的数据索引
			saveDelete(index);
			tableData.value.splice(index, 1);
	} else {
		// 用户点击了取消按钮
		// 可以在这里添加逻辑处理
	}
};

const saveDelete = async (index: number) => {
	try {
		const deletedItemId = tableData.value[index].productId;
		await axiosInstance.delete(`/Products/${deletedItemId}`);
		ElMessage.success('数据删除成功');
	} catch (error) {
		ElMessage.error('数据删除失败');
	}
};

// 表格编辑时弹窗和保存
const editNormalVisible = ref(false);
const editCreativeVisible = ref(false);
let form = reactive({
	productName: '',
	price: 0,
	monthlySale: 0,
	designIdea: '',
	isRelated: false,
	relatedCollectionId: 0
});
let idx: number = -1;
// 编辑普通商品
const handleEditNormal = (index: number, row: any) => {
	idx = index;
	form.productName = row.productName;
	form.price = row.price;
	form.monthlySale = row.monthlySale;
	form.isRelated = false;
	editNormalVisible.value = true; // 打开编辑普通商品的弹出框
};

// 编辑文创产品
const handleEditCreative = async (index: number, row: any) => {
	idx = index;
	form.productName = row.productName;
	form.price = row.price;
	form.monthlySale = row.monthlySale;
	form.isRelated = row.isRelated;
	form.relatedCollectionId = row.relatedCollectionId || 0;

	if (form.isRelated) {
		try {
			// 获取文创产品的信息
			const productId = row.productId;
			const response = await axiosInstance.get(`/CulturalProducts/${productId}`);
			const data = response.data;

			// 填充文创产品的信息到编辑表单
			form.designIdea = data.designIdea || '';
			form.relatedCollectionId = data.relatedCollectionId || 0;
			editCreativeVisible.value = true; // 打开编辑文创产品的弹出框
		} catch (error) {
			console.error(error);
			// 处理错误情况
		}
	}
};

// 保存编辑
const saveEdit = () => {
	if (form.isRelated) {
		// 编辑文创产品信息
		uploadCreativeData();
		editCreativeVisible.value = false;
	} else {
		// 编辑普通商品信息
		uploadNormalData();
		editNormalVisible.value = false;
	}

	ElMessage.success(`修改成功`);
	getAllProducts();

};

// 新增弹窗和保存
const addVisible = ref(false);
let addForm = reactive({
	productName: '',
	price: 0,
	monthlySale: 0,
	designIdea: '',
	isRelated: false, // 默认选择非文创产品
	relatedCollectionId: 0
});

const resetAddForm = () => {
	// 重置新增表单的属性为初始状态
	addForm.productName = '';
	addForm.price = 0;
	addForm.monthlySale = 0;
	addForm.designIdea = '';
	addForm.isRelated = false;
	addForm.relatedCollectionId = 0;
};

const handleAddNormal = () => {
	resetAddForm(); // 在点击新增普通商品时调用恢复函数
	addForm.isRelated = false;
	addVisible.value = true;
};

const handleAddCreative = () => {
	resetAddForm(); // 在点击新增文创产品时调用恢复函数
	addForm.isRelated = true;
	addVisible.value = true;
};

// 保存新增数据
const saveAdd = async () => {
	addVisible.value = false;

	if (addForm.isRelated) {
		// 新增文创产品
		try {
			const response = await axiosInstance.post('/CulturalProducts/', {
				designIdea: addForm.designIdea,
				relatedCollectionId: addForm.relatedCollectionId,
				relatedProduct: {
					productId: tableData.value.length + 1,
					productName: addForm.productName,
					price: addForm.price,
					monthlySale: addForm.monthlySale,
					isRelated: true
				}
			});
			ElMessage.success('新增文创产品成功');
			// 刷新文创产品数据或其他操作
		} catch (error) {
			ElMessage.error('新增文创产品失败');
		}
	} else {
		// 新增普通商品
		try {
			const response = await axiosInstance.post('/Products/', {
				productId: tableData.value.length + 1,
				productName: addForm.productName,
				price: addForm.price,
				monthlySale: addForm.monthlySale,
				isRelated: false
			});
			ElMessage.success('新增普通商品成功');
			// 刷新普通商品数据或其他操作
		} catch (error) {
			ElMessage.error('新增普通商品失败');
		}
	}
	getAllProducts();
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

.my-message-box {
	/* 自定义样式 */
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.my-message-box .el-message-box__btns {
	display: inline-block !important;
	margin: 10px !important;
}</style>
	