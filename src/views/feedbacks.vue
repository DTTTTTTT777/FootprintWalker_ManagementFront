<template>
	<div class="container">

		<el-tabs v-model="message">
			<el-tab-pane :label="`未解决反馈(${state.unread.length})`" name="first">
				<el-table :data="state.unread" :show-header="false" style="width: 100%">
					<el-table-column>
						<template #default="scope">
							<span v-if="!scope.row.edit" class="message-feedbackTitle">{{ scope.row.feedbackTitle }}</span>
							<el-input v-else v-model="scope.row.feedbackTitle"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="feedbackSendTime" width="180"></el-table-column>
					<el-table-column width="120">
						<template #default="scope">
							<el-button size="small" @click="handleRead(scope.$index)">标为已解决</el-button>
						</template>
					</el-table-column>
					<el-table-column width="60">
						<template #default="scope">
							<el-button size="small" @click="handleView(scope.$index)">查看</el-button>
						</template>
					</el-table-column>

					<el-table-column width="60">
						<template #default="scope">
							<el-button size="small" @click="handleReply(scope.$index)">回复</el-button>
							<el-input v-if="showReplyBox && currentReplyIndex === scope.$index" v-model="currentReply"
								:style="{ width: '300px', height: '100px' }"></el-input>
						</template>
					</el-table-column>

				</el-table>
			</el-tab-pane>
			<el-tab-pane :label="`已解决反馈(${state.read.length})`" name="second">
				<template v-if="message === 'second'">
					<el-table :data="state.read" :show-header="false" style="width: 100%">
						<el-table-column>
							<template #default="scope">
								<span class="message-feedbackTitle">{{ scope.row.feedbackTitle }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="feedbackSendTime" width="180"></el-table-column>
						<el-table-column label="回复内容">
							<template #default="scope">
								{{ scope.row.replyContent }}
							</template>
						</el-table-column>
						<el-table-column width="120">
							<template #default="scope">
								<div style="display: inline-block;margin:10px;"><el-button type="danger" @click="handleDel(scope.$index)">删除</el-button></div>
							</template>
						</el-table-column>
					</el-table>
					<div class="handle-row">
						<div style="display: inline-block;margin:10px;"><el-button type="danger">删除全部</el-button></div>
					</div>
				</template>
			</el-tab-pane>

			<el-tab-pane :label="`回收站(${state.recycle.length})`" name="third">
				<template v-if="message === 'third'">
					<el-table :data="state.recycle" :show-header="false" style="width: 100%">
						<el-table-column>
							<template #default="scope">
								<span class="message-feedbackTitle">{{ scope.row.feedbackTitle }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="feedbackSendTime" width="180"></el-table-column>
						<el-table-column width="160">
							<template #default="scope">
								<div class="button-group">
									<div style="display: inline-block;margin:10px;"><el-button @click="handleRestore(scope.$index)">还原</el-button></div>
									<div style="display: inline-block;margin:10px;"><el-button type="danger" @click="handleRecycleDelete(scope.$index)">删除</el-button></div>
								</div>
							</template>
						</el-table-column>
					</el-table>
				</template>
			</el-tab-pane>
		</el-tabs>

		<el-dialog title="回复反馈" v-model="editVisible" width="30%">
			<el-form label-width="70px">

				<el-form-item label="回复内容">
					<el-input type="textarea" v-model="currentReply"
						:style="{ width: '300px', height: '100px' }"></el-input>
				</el-form-item>
			</el-form>
			<div style="display: inline-block;margin:10px;"><el-button @click="saveReply">保存</el-button></div>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="tabs">
import { ref, reactive } from 'vue';
import axios from 'axios';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useUserInfo } from '../store/userInfo';
interface Message {
	feedbackID: number;
	feedbackTitle: string;
	feedbackType: string;
	feedbackContent: string;
	replyContent?: string;
	feedbackSendTime: string;
	replyTime: string;
	userId: string;
	isReply: number;
}

const editVisible = ref(false);
const message = ref('first');
const state = reactive({
	unread: [] as Message[],
	read: [] as Message[],
	recycle: [] as Message[]
});

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


// 获取数据
axiosInstance.get('/Feedback')
	.then(response => {
		state.unread = [];
		state.read = [];

		response.data.forEach(item => {
			const feedbackData = {
				feedbackID: item.feedbackID,
				feedbackTitle: item.feedbackTitle,
				feedbackType: item.type,
				feedbackContent: item.feedbackContent,
				replyContent: item.replyContent,
				feedbackSendTime: item.feedbackSendTime,
				replyTime: item.replyTime,
				userId: item.userId,
				isReply: item.isReply
			};

			if (item.isReply === 0) {
				state.unread.push(feedbackData);
			} else {
				state.read.push(feedbackData);
			}
		});
	})
	.catch(error => {
		console.log(error);
	});


let currentReplyIndex = -1;
const handleRead = (index: number) => {

	const item = state.unread.splice(index, 1);
	state.read = item.concat(state.read);
	saveReply();
};

const handleReply = (index: number) => {
	if (!editVisible.value) {
		editVisible.value = true;
		currentReply.value = state.unread[index].replyContent || '';
		currentReplyIndex = index;
	} else {
		editVisible.value = false;
	}
}


const handleView = (index: number) => {
	const feedback = state.unread[index];
	ElMessageBox.alert(
		`<div>
      <div>用户ID: ${feedback.userId}</div>
      <div>反馈内容: ${feedback.feedbackContent}</div>
    </div>`,
		'反馈详情',
		{ dangerouslyUseHTMLString: true,customClass: 'my-message-box' } // This is important to allow HTML
	);
}



const handleDel = (index: number) => {
	const item = state.read.splice(index, 1);
	state.recycle = item.concat(state.recycle);
};
const handleRestore = (index: number) => {
	const item = state.recycle.splice(index, 1);
	state.read = item.concat(state.read);
};

const showReplyBox = ref(false);
const currentReply = ref('');
const saveReply = async () => {
	try {
		for (let index = 0; index < state.unread.length; index++) {
			const item = state.unread[index];
			if (item.replyContent) {
				const data = {
					feedbackID: item.feedbackID,
					
					isReply: item.isReply,
					userId: item.userId,
					feedbackTitle: item.feedbackTitle,
					feedbackType: item.feedbackType,
					feedbackContent: item.feedbackContent,
					feedbackSendTime: item.feedbackSendTime,
					replyTime: item.replyTime,
				};

				// Update the replyContent of the corresponding item in state.unread
				state.unread[index].replyContent = currentReply.value; // Update the replyContent with the edited content

				const response = await axiosInstance.put(`/Feedback/${item.feedbackID}`, data);
			}
		}
		ElMessage.success('数据上传成功');
	} catch (error) {
		ElMessage.error('数据上传失败');
	}
};


const handleRecycleDelete = async (index: number) => {
	try {
		const item = state.recycle[index];
		await axiosInstance.delete(`/Feedback/${item.feedbackID}`);
		state.recycle.splice(index, 1);
		ElMessage.success('删除成功');
	} catch (error) {
		ElMessage.error('删除失败');
	}
};


const query = reactive({
	designIdea: '',
	productName: '',
	pageIndex: 1,
	pageSize: 10
});

</script>

<style>
.message-feedbackTitle {
	cursor: pointer;
}

.handle-row {
	margin-top: 30px;
}

.button-group {
	display: flex;
	gap: 8px;
}

.my-message-box {
  /* 自定义样式 */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

</style>