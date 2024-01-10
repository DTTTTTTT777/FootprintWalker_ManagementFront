<template>
	<div>
		<div id="chart" style="width: 100%; height: 600px;"></div>
		<div class="container">
			<div class="handle-box">
				<div style="display: inline-block;margin:10px;"><el-input v-model="query.name" placeholder="展厅名称" class="handle-input mr10"></el-input></div>
				<div style="display: inline-block;margin:10px;"><el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button></div>
			</div>
			<el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
				<el-table-column prop="exhibitionHallId" label="展厅ID" width="55" align="center"></el-table-column>
				<el-table-column prop="exhibitionHallName" label="展厅名称" align="center"></el-table-column>
				<el-table-column prop="exhibitionHallTheme" label="展厅主题" align="center"></el-table-column>
				<el-table-column label="展厅状态" align="center">
					<template #default="scope">
						<el-tag
							:type="scope.row.exhibitionHallStatus === '运营中' ? 'success' : scope.row.exhibitionHallStatus === '修缮中' ? 'danger' : ''"
						>
							{{ scope.row.exhibitionHallStatus }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="exhibitionHallVisitor" label="访客人数" align="center"></el-table-column>
				<el-table-column prop="exhibitionHallTemperature" label="温度" align="center"></el-table-column>
				<el-table-column prop="exhibitionHallCo2" label="CO2浓度" align="center"></el-table-column>
				<el-table-column prop="exhibitionHallHumidity" label="湿度" align="center"></el-table-column>
				<el-table-column label="操作" align="center">
					<template #default="scope">
						<div style="display: inline-block;margin:10px;"><el-button text :icon="Edit" @click="handleEdit(scope.$index, scope.row)" >
							编辑
						</el-button></div>	
					</template>
				</el-table-column>
			</el-table>
		</div>

		<!-- 编辑弹出框 -->
		<el-dialog title="编辑" v-model="editVisible" width="30%">
			<el-form label-width="70px">
				<el-form-item label="展厅主题">
					<el-input v-model="editForm.theme"></el-input>
				</el-form-item>
				<el-form-item label="展厅状态">
					<el-select v-model="editForm.state" placeholder="状态">
						<el-option key="1" label="营业中" value="营业中"></el-option>
						<el-option key="2" label="修缮中" value="修缮中"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"><el-button @click="editVisible = false">取 消</el-button></div>
					<div style="display: inline-block;margin:10px;"><el-button type="primary" @click="saveEdit">确 定</el-button></div>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="basetable">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, Plus, Sort, More } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import axios from 'axios'
import * as echarts from 'echarts';
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


const fetchData = async () => {
	try {
		const response = await axiosInstance.get('/ExhibitionHall');
		return response.data;
	} catch (error) {
		console.error(error);
	}
};

interface TableItem {
	exhibitionHallId: number;
	exhibitionHallName: string;
	exhibitionHallTheme:string;
	exhibitionHallState: string;
	exhibitionHallVisitor: number;
	exhibitionHallTemperature:string;
	exhibitionHallCo2:string;
	exhibitionHallHumidity:string;
}

const query = reactive({
	name: '',
});

const tableData = ref<TableItem[]>([]);
const addedData = ref<TableItem[]>([]); // 保存新增的数据

const compare = (a:TableItem,b:TableItem)=>{
	return a.exhibitionHallId < b.exhibitionHallId ? -1:1;
}

// 获取表格数据
const getData = async () => {
	const res = await fetchData();
	let filteredData = res.concat(addedData.value);
	if (query.name !== '') {
		filteredData = filteredData.filter((item: TableItem) => item.exhibitionHallName.includes(query.name));
	}
	tableData.value = filteredData.sort(compare);

};
getData();

// 查询操作
const handleSearch = () => {
	getData();
};

const uploadData = async (id:number, data:any) => {
    try {
		const response = await axiosInstance.put(`/ExhibitionHall/${id}`, data);
        ElMessage.success('数据上传成功');
    } catch (error) {
		console.error('数据上传失败:', error);
        ElMessage.error('数据上传失败');
    }
};

// 表格编辑时弹窗和保存
const editVisible = ref(false);
let editForm = reactive({
    name: '',
    theme: '',
    state: '',
	visitor:0,
    temperature: '',
	humidity: '',
	Co2: '',
});

let idx: number = -1;
const handleEdit = (index: number, row: any) => {
	idx = index;
	editForm.theme = row.exhibitionHallTheme;
	editForm.state = row.exhibitionHallState;
	editVisible.value = true;
};

const saveEdit = async () => {
	editVisible.value = false;
	ElMessage.success(`修改第 ${idx + 1} 行成功`);
	tableData.value[idx].exhibitionHallTheme = editForm.theme;
	tableData.value[idx].exhibitionHallState = editForm.state;
	await uploadData(tableData.value[idx].exhibitionHallId, tableData.value[idx]);
};

let router = useRouter();

onMounted(() => {
    const selectedBlock = ref('展厅1');
    var chartDom = document.getElementById('chart');
    var myChart = echarts.init(chartDom);
    fetch('src/assets/img/Museumizer.svg').then(response => response.text()).then(svg => {
        echarts.registerMap('Hall', { svg: svg });
        const option = {
            tooltip: {},
            label: {
                show: true,
                fontSize: 20,
                color: 'black',
                formatter: function (params) {
                    return params.name;
                }
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 20,
                    color: 'black',
                    formatter: function (params) {
                        return params.name;
                    }
                }
            },
            
            series: [
                {
                    name: 'Hall',
                    type: 'map',
                    map: 'Hall',
                    zoom:1,
                    roam: true,
                    data: [
                        
                    ],
                }
            ]
        };
        myChart.setOption(option);
        myChart.on('click', function (params) {
          const exhibitionHallName = params.name;

// Find the corresponding exhibition hall ID based on the name
const exhibitionHall = tableData.value.find(item => item.exhibitionHallName === exhibitionHallName);
console.log(exhibitionHall.exhibitionHallId)
if (exhibitionHall) {
    // Navigate to collection.vue with the exhibition hall ID as a parameter
    router.push({ path: 'collections', query: { exhibitionHallId: exhibitionHall.exhibitionHallId } });
}
        });
    });

});
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