<template>
	<div>
		<el-row :gutter="20">
			<!-- <el-col :span="8">
				<el-card shadow="hover" class="mgb20" style=" height: 220px">
					<div class="user-info">
						<el-avatar :size="100" :src="imgurl" />
						<div class="user-info-cont">
							<div class="user-info-name">{{ name }}</div>
							<div>{{ role }}</div>
						</div>
					</div>
					<div class="user-info-list">
						上次登录时间：
						<span>{{ new Date().toDateString() }}</span>
					</div>
					<div class="user-info-list">
						上次登录地点：
						<span>深圳</span>
					</div>
				</el-card>
			</el-col> -->
			<el-col :span="8"><onsitestatistics :onSet="IOInfo.inMuseumCount - IOInfo.outMuseumCount"></onsitestatistics></el-col>
			<el-col :span="8"><ticketsstatistics :total-tickets="TicketsInfo.totalTickets" :sold-tickets="TicketsInfo.soldTickets"></ticketsstatistics></el-col>
		</el-row>
		<el-row><iostatistics :inData="IOInfo.inMuseumCount" :outData="IOInfo.outMuseumCount"></iostatistics></el-row>
		
	</div>
</template>

<script setup lang="ts" name="dashboard">
import { onMounted, reactive, ref, watch } from 'vue';
// import imgurl from '../assets/img/img.jpg';
import { CENTERED_ALIGNMENT } from 'element-plus/es/components/virtual-list/src/defaults';
import iostatistics from '../components/IOStatistics.vue';
import onsitestatistics from '../components/OnSiteStatistics.vue';
import ticketsstatistics from '../components/TicketStatistics.vue';
import axios from 'axios';


const name = localStorage.getItem('ms_username');
const role: string = name === 'admin' ? '超级管理员' : '普通用户';



const fetchData = async (date) => {
	
	try {
		const response = await axios.get('http://42.192.39.198:5000/api/IOStatistics/' + date);
		//console.log(response.data); 
		return response.data;
	} catch (error) {
		console.error(error);
	}
};
const fetchTicketsData = async (date)=> {
	try{
		const response = await axios.get('http://42.192.39.198:5000/api/TicketsStatistics/' + date);
		return response.data;
	}catch(error){
		console.error(error);
	}
}
/**
 * IOStatistics
 */
interface IO {
    date?: Date;
    inMuseumCount?: number;
    outMuseumCount?: number;
}
interface Ticktes{
	date?:Date;
	totalTickets?:number;
	soldTickets?:number;
}

const IOInfo = ref<IO>({
	date: new Date(),
	inMuseumCount: 0,
	outMuseumCount: 0,
});

const TicketsInfo = ref<Ticktes>({
	date: new Date(),
	totalTickets: 0,
	soldTickets: 0,
});  // 这个一定要命名为小驼峰！
const getCurrentDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1 and pad with leading zero if necessary
  const day = String(currentDate.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}T00:00:00`;
  return formattedDate;
};


const getData = async () => {
  const currentDate = getCurrentDate();
  fetchData(currentDate).then(res => {
    IOInfo.value = res;
	//console.log("人流信息", IOInfo.value);
  });
};
const getTicketsData = ()=> {
	const currentDate = getCurrentDate();
	fetchTicketsData(currentDate).then(res => {
		TicketsInfo.value = res;
		//console.log("门票信息", TicketsInfo.value);
	});
};
onMounted( () => {
	setInterval(() => {
	getTicketsData();
	getData();
	}, 3000) });

</script>

<style scoped>


.el-row {
	margin-bottom: 20px;
}

.grid-content {
	display: flex;
	align-items: center;
	height: 100px;
}

.grid-cont-right {
	flex: 1;
	text-align: center;
	font-size: 14px;
	color: #999;
}

.grid-num {
	font-size: 30px;
	font-weight: bold;
}

.grid-con-icon {
	font-size: 50px;
	width: 100px;
	height: 100px;
	text-align: center;
	line-height: 100px;
	color: #fff;
}

.grid-con-1 .grid-con-icon {
	background: rgb(45, 140, 240);
}

.grid-con-1 .grid-num {
	color: rgb(45, 140, 240);
}

.grid-con-2 .grid-con-icon {
	background: rgb(100, 213, 114);
}

.grid-con-2 .grid-num {
	color: rgb(100, 213, 114);
}

.grid-con-3 .grid-con-icon {
	background: rgb(242, 94, 67);
}

.grid-con-3 .grid-num {
	color: rgb(242, 94, 67);
}

.user-info {
	display: flex;
	align-items: center;
	padding-bottom: 20px;
	border-bottom: 2px solid #ccc;
	margin-bottom: 20px;
}

.user-info-cont {
	padding-left: 50px;
	flex: 1;
	font-size: 14px;
	color: #999;
}

.user-info-cont div:first-child {
	font-size: 30px;
	color: #222;
}

.user-info-list {
	font-size: 14px;
	color: #999;
	line-height: 25px;
}

.user-info-list span {
	margin-left: 70px;
}

.mgb20 {
	margin-bottom: 20px;
}

.todo-item {
	font-size: 14px;
}

.todo-item-del {
	text-decoration: line-through;
	color: #999;
}

.ringbox {}

.ringschart {
	left: 22%;
	width: 250px;
	height: 250px;
	position: relative;
}

.btn {

	height: 30px;
	width: 150px;
	position: relative;
	top: 15px;
	left: 32%;
	background-color: rgb(45, 140, 240);
	border: none;
	text-align: center;
	border-radius: 8px;
	color: white;
	font-size: 15px;

}</style>