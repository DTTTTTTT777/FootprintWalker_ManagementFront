<template>
	<div>
		<div class="container">
			<div class="handle-box">
				<!-- <el-select v-model="query.address" placeholder="地址" class="handle-select mr10">
					<el-option key="1" label="广东省" value="广东省"></el-option>
					<el-option key="2" label="湖南省" value="湖南省"></el-option>
				</el-select> -->
				<el-input v-model="query.name" placeholder="日期" class="handle-input mr10"></el-input>
				<div style="display: inline-block;"><el-button type="primary" :icon="Search" @click="handleSearch" >搜索</el-button></div>
				<!-- <el-button type="primary" :icon="Plus">新增</el-button> -->
			</div>
			<el-table :data="tableData.slice((query.pageIndex-1)*query.pageSize,query.pageIndex*query.pageSize)" border class="table" ref="multipleTable"  header-cell-class-name="table-header">
				<el-table-column prop="date" label="日期"></el-table-column>
				<el-table-column prop="totalTickets" label="总门票"></el-table-column>
				<el-table-column prop="soldTickets" label="已预约门票"></el-table-column>
				<el-table-column prop="resTickets" label="剩余门票"></el-table-column>

				
				<el-table-column label="操作" width="300" align="center">
					<template #default="scope">
						<el-button text class="green" @click="handleEdit(scope.$index, scope.row,1)" v-if="visArr[scope.$index]&&(query.pageIndex===1)" >
							<button  :icon="Edit" class="btnSty green"></button>
							修改剩余门票
						</el-button>
						<el-button text class="gray" @click="handleEdit(scope.$index, scope.row,1)" v-if="!visArr[scope.$index+(query.pageIndex-1)*query.pageSize]"  disabled>
							<button :icon="Edit" class="btnSty gray" ></button>
							修改剩余门票
						</el-button>
						<!-- <el-button text class="green" @click="handleEdit(scope.$index, scope.row,1)" v-if="visArr[scope.$index]&&(query.pageIndex===1)" >
							<button class="el-icon-lx-add btnSty green" ></button>
							增加门票
						</el-button>
						<el-button text class="gray" @click="handleEdit(scope.$index, scope.row,1)" v-if="!visArr[scope.$index+(query.pageIndex-1)*query.pageSize]"  disabled>
							<button class="el-icon-lx-add btnSty gray" ></button>
							增加门票
						</el-button>
						<el-button  text class="red" @click="handleEdit(scope.$index, scope.row, 0)" v-if="visArr[scope.$index]&&(query.pageIndex===1)" >
							<button class="el-icon-lx-move btnSty red" ></button>
							减少门票
						</el-button>
						<el-button  text class="gray" @click="handleEdit(scope.$index, scope.row, 0)" v-if="!visArr[scope.$index+(query.pageIndex-1)*query.pageSize]" disabled>
							<button class="el-icon-lx-move btnSty gray" ></button>
							减少门票
						</el-button> -->
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination" v-if="showTable.isFull">
				<el-pagination
					background
					layout="total, prev, pager, next"
					:current-page="query.pageIndex"
					:page-size="query.pageSize"
					:total="pageTotal"
					@current-change="handlePageChange"
					
				></el-pagination>
			</div>
			
		</div>

		<!-- 编辑弹出框 -->
		<el-dialog title="编辑" v-model="editVisible" width="30%">
			<el-form label-width="70px">
				<el-form-item label="修改为">
					<el-input v-model="form.residue"></el-input>
				</el-form-item>
				<!-- <el-form-item label="地址">
					<el-input v-model="form.address"></el-input>
				</el-form-item> -->
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"><el-button @click="editVisible = false">取 消</el-button></div>
					<div style="display: inline-block;margin:10px;"><el-button type="primary" @click="saveEdit">确 定</el-button></div>
				</span>
			</template>
		</el-dialog>
		<!-- <button @click="postData1">post数据</button> -->
		<!-- <button @click="putData">put数据</button> -->
	</div>
</template>

<script setup lang="ts" name="basetable">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue';
// import { fetchData } from '../api/index';
import axios from 'axios';
//{date: '2023-08-01T06:20:12.255', inMuseumCount: 2481, totalTickets: 3000, soldTickets: 1998}


const resTicket = ref(0);

const showTable = reactive({
	isFull:1,

});


let visArr= ref<number[]>([]);
let originDate= ref<string[]>([]);
interface TableItem2 {
	
	date: string;
	totM:number;
	residue :number;
	sale :number;
	
}
interface TableItem {
	date: string;
	inMuseumCount:number;
	totalTickets :number;
	soldTickets:number;
	resTickets:number;
}
const query = reactive({
	address: '',
	name: '',
	pageIndex: 1,
	pageSize: 10
});
const fetchData = async () => {
	try {
		const response = await axios.get('http://42.192.39.198:5000/api/TicketsStatistics');
		//console.log("zheli",response.data);
		return response.data;
	} catch (error) {
		console.error(error);
	}
};
fetchData();


const pageTotal = ref(0);
const tableData = ref<TableItem[]>([]);

const getData = async () => {
	const data = await fetchData();
	console.log(data); 
	// let arr=[{date:"7.10",inMuseumCount:0,resTickets:500,soldTickets:50,totalTickets:550},
	// {date:"7.9",inMuseumCount:0,resTickets:400,soldTickets:40,totalTickets:440},
	// {date:"7.8",inMuseumCount:100,resTickets:200,soldTickets:150,totalTickets:350},
	// {date:"7.7",inMuseumCount:0,resTickets:400,soldTickets:40,totalTickets:440},
	// {date:"7.6",inMuseumCount:100,resTickets:200,soldTickets:150,totalTickets:350},
	// {date:"7.5",inMuseumCount:0,resTickets:400,soldTickets:40,totalTickets:440},
	// {date:"7.4",inMuseumCount:100,resTickets:200,soldTickets:150,totalTickets:350},
	// {date:"7.3",inMuseumCount:0,resTickets:400,soldTickets:40,totalTickets:440},
	// {date:"7.2",inMuseumCount:100,resTickets:200,soldTickets:150,totalTickets:350},
	// {date:"7.1",inMuseumCount:0,resTickets:400,soldTickets:40,totalTickets:440},
	// {date:"6.30",inMuseumCount:100,resTickets:200,soldTickets:150,totalTickets:350},
	// {date:"6.29",inMuseumCount:0,resTickets:400,soldTickets:40,totalTickets:440},
	// {date:"6.28",inMuseumCount:100,resTickets:200,soldTickets:150,totalTickets:350},
	// {date:"6.27",inMuseumCount:0,resTickets:400,soldTickets:40,totalTickets:440},
	// {date:"6.26",inMuseumCount:100,resTickets:200,soldTickets:150,totalTickets:350},
	// ];
	
	let visTmp = [];
	let dateTmp=[];
	console.log(data); 
	tableData.value = data;

	for(let i=0;i<tableData.value.length;i++)
	{
		tableData.value[i].date = tableData.value[i].date.substring(0,10);
		tableData.value[i].resTickets = tableData.value[i].totalTickets-tableData.value[i].soldTickets;
	}
	

	tableData.value.sort((a, b) => {
		const dateA = parseInt(a.date.substring(5,7));
		const dateB = parseInt(b.date.substring(5,7));
		if(dateA > dateB)	return -1;
		if(dateA < dateB)	return 1;
		if(dateA === dateB){
			if(parseInt(a.date.substring(8,10))>parseInt(b.date.substring(8,10))){
				return -1;
			}
			else{
				return 1;
			}
		}
		return 0
	})
	for(let i=0;i<tableData.value.length;i++)
	{
		dateTmp.push(tableData.value[i].date);
	}
	
	//console.log("排序",tableData.value); 

	for(let i=0;i<tableData.value.length;i++)
	{
		if(i>=5){
			visTmp.push(0);
		}
		else{
			visTmp.push(1);
		}
		
	};
	visArr.value = visTmp;
	originDate.value = dateTmp;
	console.log("origindate",originDate.value);
	//console.log(visArr.value);
	pageTotal.value = tableData.value.length;

};
getData();



// 查询操作
const handleSearch = () => {
	for(let i=0;i<tableData.value.length;i++)
	{
		if(query.name===tableData.value[i].date){
			query.pageIndex = Math.trunc(i/10) +1;
			let a=0;
			
			console.log("pageIndex=",query.pageIndex);
			console.log("a=",a);
		}
	};
	 
	getData();
};

const handleCurrentChange = (val: number)=>{
	query.pageIndex = val;
	getData();
}
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
		.catch(() => {});
};

// 表格编辑时弹窗和保存
const editVisible = ref(false);
let form = reactive({
	residue:0
});
let idx: number = -1;
let flag1: number = -1;
const handleEdit = (index: number, row: any,flag:number) => {
	idx = index;
	flag1=flag;
	form.residue = row.residue;
	editVisible.value = true;
};

const postData1 = async () => {
	//let date1=
	try {
		const response = await axios({
                method: 'post',//请求方法
                data: {
					date:'2023-09-14T00:00:00',
  					totalTickets:43986,
  					soldTickets:42506,
				},
                url: 'http://42.192.39.198:5000/api/TicketsStatistics/',
            }).then(response => {
                //执行成功后代码处理
            })
	}
	catch (error) {
        ElMessage.error('数据上传失败');
    }
  
};
//向后端传输数据
const uploadData = async () => {
    try {
		axios.put(`http://42.192.39.198:5000/api/TicketsStatistics/${originDate.value[idx]}`,{
  		date:originDate.value[idx],
  		totalTickets:tableData.value[idx].totalTickets,
  		soldTickets:tableData.value[idx].soldTickets,
	}).then(
  	response => { console.log('成功了' + response.data); },
  	error => { console.log('失败了' + error); }
	)

    } catch (error) {
        ElMessage.error('数据上传失败');
    }
};
const putData = async () => {
    try {
		axios.put(`http://42.192.39.198:5000/api/TicketsStatistics/${originDate.value[11]}`,{
  		date:originDate.value[11],
  		totalTickets:50285,
  		soldTickets:49983,
	}).then(
  	response => { console.log('成功了' + response.data); },
  	error => { console.log('失败了' + error); }
	)

    } catch (error) {
        ElMessage.error('数据上传失败');
    }
};
//保存编辑的数据
const saveEdit = () => {
	editVisible.value = false;
	
	if(flag1===1){
			if(parseInt(form.residue.toString())<0){
			editVisible.value = false;
			ElMessageBox.confirm('剩余票数需大于0', {
		type: 'warning',
		callback: () => {}
		});
			return;
		}
		else if(parseInt(form.residue.toString())>100000){
			editVisible.value = false;
			ElMessageBox.confirm('增加票数过多', {
		type: 'warning',
		callback: () => {}
		});
			return;
		}
		}
	
	ElMessage.success(`修改第 ${idx + 1} 行成功`);
	let tmp: number = -1;
	tmp = parseInt(form.residue.toString())+parseInt(tableData.value[idx].soldTickets.toString());
	
	tableData.value[idx].resTickets = parseInt(form.residue.toString());
	tableData.value[idx].totalTickets = tmp;
	uploadData();

};
// if(flag1===1){
	// 	if(parseInt(form.residue.toString())<parseInt((tableData.value[idx].totalTickets-tableData.value[idx].soldTickets).toString())){
	// 	editVisible.value = false;
	// 	ElMessageBox.confirm('请大于原来剩余票数', {
    //   type: 'warning',
    //   callback: () => {}
    // });
	// 	return;
	// }
	// }
	// else{
	// 	if(parseInt(form.residue.toString())>parseInt((tableData.value[idx].totalTickets-tableData.value[idx].soldTickets).toString())){
	// 	editVisible.value = false;
	// 	ElMessageBox.confirm('请小于原来剩余票数', {
    //   type: 'warning',
    //   callback: () => {}
    // });
	// 	return;
	// }
	// }
// 获取表格数据
// const getData = () => {
// 	fetchData().then(res => {
// 		tableData.value = res.data.list;
// 		pageTotal.value = res.data.pageTotal || 50;
// 	});
// };
// getData();

</script>

<style scoped>

.el-table .warning-row {
    background: rgb(183, 153, 99);
  }
.el-table .success-row {
    background: #96d971;
	
  }
.handle-box {
	margin-bottom: 20px;
}
.test22{
	background-color: #7d7d7d;
	color: #F56C6C;
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
.green{
	color: rgb(6, 195, 100);
}
.gray{
	color: rgb(161, 161, 161);
}
.btnSty{
	
	border: none;
	font-size: 20px;
	font-weight: bold;
	background-color: white;
	margin-right: 10px;
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
