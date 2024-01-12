<template>
  <div>
    <div class="container">
      <div class="handle-box">
        <el-input v-model="query.value" placeholder="搜索内容" class="handle-input mr10"></el-input>
        <div style="display: inline-block;margin:10px;">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </div>
        <div style="display: inline-block;margin:10px;">
          <el-button type="primary" :icon="Plus" @click="handlenew">新增</el-button>
        </div>
      </div>
      <el-table :data="pageData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <!-- 学号 -->
        <el-table-column prop="id" label="学号" width="120" align="center" sortable></el-table-column>
        <!-- 姓名 -->
        <el-table-column prop="name" label="姓名" width="110" align="center" sortable></el-table-column>
        <!-- 性别 -->
        <el-table-column prop="gender" label="性别" width="90" align="center" sortable
        :formatter="genderFormatter"></el-table-column>
        <!-- 年级 -->
        <el-table-column prop="level" label="年级" align="center" sortable
        :formatter="levelFormatter"></el-table-column>
        <!-- 学院 -->
        <el-table-column prop="institute" label="学院" align="center" sortable
        :formatter="instituteFormatter"></el-table-column>

        <el-table-column prop="major" label="专业" align="center" sortable></el-table-column>
        <!-- 校区 -->
        <el-table-column prop="campus" label="校区" width="120" align="center" sortable
        :formatter="campusTypeFormatter"></el-table-column>
        <!-- 干事类型 -->
        <el-table-column prop="clerkType" label="干事类型" width="120" align="center" sortable
          :formatter="clerkTypeFormatter">
        </el-table-column>

        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button text :icon="Edit" @click="handleCheck(scope.row)">
              详情
            </el-button>
            <el-button text :icon="Edit" @click="handleModifyStatus(scope.$index, scope.row)">
              职务调整
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

    <!-- 对话框用于显示详情 -->
  <el-dialog v-model="detailsVisible" title="详细信息">
    <div class="cardContainer" id="container">
    <el-descriptions title="职员信息" border>
      <el-descriptions-item label="ID">{{ details.id }}</el-descriptions-item>
      <el-descriptions-item label="姓名">{{ details.name }}</el-descriptions-item>
      <el-descriptions-item label="性别">{{ genderFormatter(0,0,details.gender) }}</el-descriptions-item>
      <el-descriptions-item label="年级">{{ details.grade }}</el-descriptions-item>
      <el-descriptions-item label="手机号">{{ details.phoneNumber }}</el-descriptions-item>
      <el-descriptions-item label="学院">{{ instituteFormatter(0,0,details.institute)}}</el-descriptions-item>
      <el-descriptions-item label="专业">{{ details.major }}</el-descriptions-item>
      <el-descriptions-item label="干事类型">{{ clerkTypeFormatter(0,0,details.clerkType) }}</el-descriptions-item>
      <el-descriptions-item label="政治面貌">{{ politicalStatusFormatter(details.politicalStatus) }}</el-descriptions-item>
      <el-descriptions-item label="微信号">{{ details.wechatId }}</el-descriptions-item>
      <el-descriptions-item label="成绩">{{ details.grade }}</el-descriptions-item>
      <el-descriptions-item label="排名">{{ details.ranking }}</el-descriptions-item>

      
    </el-descriptions>
    <div style="height: 20px;"></div> <!-- 这是一个空行 -->
    <span class="dialog-footer" style="display: flex; justify-content: center;">
  <el-button @click="detailsVisible = false">关闭</el-button>
</span>
    </div>
  </el-dialog>

  <el-dialog v-model="modifyStatusVisible" title="修改干事类型">
  <el-select v-model="selectedClerkType" placeholder="请选择干事类型">
    <el-option label="社长" value="PRESIDENT"></el-option>
    <el-option label="财务干事" value="FINANCIAL_CLERK"></el-option>
    <el-option label="副社长" value="VICE_PRESIDENT"></el-option>
    <el-option label="干事" value="GENERAL_CLERK"></el-option>
    <el-option label="团支书" value="TUANZHISHU"></el-option>
    <!-- 其他选项 -->
  </el-select>
  <div style="height: 20px;"></div> <!-- 这是一个空行 -->
  <span class="dialog-footer" style="display: flex; justify-content: center;">
    <el-button @click="modifyStatusVisible = false">取消</el-button>
    <el-button type="primary" @click="saveClerkTypeChange">保存</el-button>
  </span>
</el-dialog>

<el-dialog v-model="newVisible" title="新增人员" width="30%">
    <el-form ref="newEmployeeForm" :model="newEmployee" label-width="100px">
      <el-form-item label="学号">
        <el-input v-model="newEmployee.id"></el-input>
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="newEmployee.name"></el-input>
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="newEmployee.gender" placeholder="请选择">
          <el-option label="男" value="MALE"></el-option>
          <el-option label="女" value="FEMALE"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="newEmployee.email"></el-input>
      </el-form-item>
      <el-form-item label="电话">
        <el-input v-model="newEmployee.phoneNumber"></el-input>
      </el-form-item>
      <el-form-item label="年级">
    <el-select v-model="newEmployee.level" placeholder="请选择年级">
      <el-option label="大一" value="U1"></el-option>
      <el-option label="大二" value="U2"></el-option>
      <el-option label="大三" value="U3"></el-option>
      <el-option label="大四" value="U4"></el-option>
      <el-option label="大五" value="U5"></el-option>
      <el-option label="研一" value="P1"></el-option>
      <el-option label="研二" value="P2"></el-option>
      <el-option label="研三" value="P3"></el-option>
      <el-option label="博士及以上" value="D_plus"></el-option>
    </el-select>
  </el-form-item>
  <el-form-item label="学院">
  <el-select v-model="newEmployee.institute" placeholder="请选择学院">
    <el-option label="机械与能源学院" value="MECHANICAL_AND_ENERGY_ENGINEERING"></el-option>
    <el-option label="生命科学与技术学院" value="LIFE_SCIENCES_AND_TECHNOLOGY"></el-option>
    <el-option label="铁道与城市轨道交通研究院" value="RAIL_TRANSIT_RESEARCH_INSTITUTE"></el-option>
    <el-option label="物理科学与工程学院" value="PHYSICAL_SCIENCE_AND_ENGINEERING"></el-option>
    <el-option label="建筑与城市规划学院" value="ARCHITECTURE_AND_URBAN_PLANNING"></el-option>
    <el-option label="汽车学院" value="AUTOMOTIVE_COLLEGE"></el-option>
    <el-option label="数学科学学院" value="MATHEMATICAL_SCIENCES"></el-option>
    <el-option label="土木工程学院" value="CIVIL_ENGINEERING"></el-option>
    <el-option label="海洋与地球科学学院" value="MARINE_AND_EARTH_SCIENCES"></el-option>
    <el-option label="设计创意学院" value="DESIGN_AND_CREATIVE_COLLEGE"></el-option>
    <el-option label="医学院" value="MEDICAL_COLLEGE"></el-option>
    <el-option label="新生院" value="FRESHMAN_COLLEGE"></el-option>
    <el-option label="电子信息与工程学院" value="ELECTRONIC_INFORMATION_ENGINEERING"></el-option>
    <el-option label="法学院" value="LAW_SCHOOL"></el-option>
    <el-option label="人文学院" value="COLLEGE_OF_HUMANITIES"></el-option>
    <el-option label="外国语学院" value="SCHOOL_OF_FOREIGN_LANGUAGES"></el-option>
    <el-option label="环境科学与工程学院" value="ENVIRONMENTAL_SCIENCE_AND_ENGINEERING"></el-option>
    <el-option label="体育教学部" value="PHYSICAL_EDUCATION_DEPARTMENT"></el-option>
    <el-option label="艺术与传媒学院" value="ART_AND_MEDIA_COLLEGE"></el-option>
    <el-option label="经济与管理学院" value="ECONOMICS_AND_MANAGEMENT"></el-option>
    <el-option label="马克思主义学院" value="MARXISM_COLLEGE"></el-option>
    <el-option label="政治与国际关系学院" value="POLITICAL_SCIENCE_AND_INTERNATIONAL_RELATIONS"></el-option>
    <el-option label="中德工程学院" value="SINO_GERMAN_COLLEGE_OF_ENGINEERING"></el-option>
    <el-option label="测绘与地理信息学院" value="GEOMATICS_AND_GEOINFORMATION_COLLEGE"></el-option>
    <el-option label="航空航天与力学学院" value="AERONAUTICS_AND_ASTRONAUTICS"></el-option>
    <el-option label="软件学院" value="SOFTWARE_COLLEGE"></el-option>
    <el-option label="中德学院" value="SINO_GERMAN_COLLEGE"></el-option>
    <el-option label="材料科学与工程学院" value="MATERIALS_SCIENCE_AND_ENGINEERING"></el-option>
    <el-option label="化学科学与工程学院" value="CHEMICAL_SCIENCE_AND_ENGINEERING"></el-option>
    <el-option label="交通运输工程学院" value="TRANSPORTATION_ENGINEERING_COLLEGE"></el-option>
    <el-option label="口腔医学院" value="COLLEGE_OF_STOMATOLOGY"></el-option>
    <el-option label="上海国际知识产权学院" value="SHANGHAI_INTELLECTUAL_PROPERTY_COLLEGE"></el-option>
    <el-option label="同济大学附属医院" value="TONGJI_UNIVERSITY_AFFILIATED_HOSPITAL"></el-option>
    <el-option label="校医院" value="UNIVERSITY_HOSPITAL"></el-option>
    <!-- 如果还有其他学院，请继续添加 -->
  </el-select>
</el-form-item>
      <el-form-item label="校区">
    <el-select v-model="newEmployee.campus" placeholder="请选择校区">
      <el-option label="嘉定校区" value="JIADING"></el-option>
      <el-option label="四平路校区" value="SIPING"></el-option>
      <el-option label="沪西校区" value="HUXI"></el-option>
      <el-option label="沪北校区" value="HUBEI"></el-option>
    </el-select>
  </el-form-item>
      <el-form-item label="专业">
        <el-input v-model="newEmployee.major"></el-input>
      </el-form-item>
      <el-form-item label="政治面貌">
    <el-select v-model="newEmployee.politicalStatus" placeholder="请选择">
      <el-option
        v-for="(label, value) in politicalStatusOptions"
        :key="value"
        :label="label"
        :value="value">
      </el-option>
    </el-select>
  </el-form-item>
      <el-form-item label="微信号">
        <el-input v-model="newEmployee.wechatId"></el-input>
      </el-form-item>
      <el-form-item label="成绩">
        <el-input v-model="newEmployee.grade"></el-input>
      </el-form-item>
      <el-form-item label="排名">
        <el-input v-model="newEmployee.ranking"></el-input>
      </el-form-item>
      <el-form-item label="干事类型">
        <el-select v-model="newEmployee.clerkType" placeholder="请选择">
          <el-option label="社长" value="PRESIDENT"></el-option>
          <el-option label="财务干事" value="FINANCIAL_CLERK"></el-option>
          <el-option label="副社长" value="VICE_PRESIDENT"></el-option>
          <el-option label="干事" value="GENERAL_CLERK"></el-option>
          <el-option label="团支书" value="TUANZHISHU"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div style="height: 60px;"></div> <!-- 这是一个空行 -->
  <span class="dialog-footer" style="display: flex; justify-content: center;">
      <el-button @click="newVisible = false">取消</el-button>
      <el-button type="primary" @click="submitNewEmployee">提交</el-button>
    </span>
  </el-dialog>

    <!-- 编辑弹出框 -->
    <!-- <el-dialog title="详细信息" v-model="editVisible" width="30%">
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
    </el-dialog> -->

    <!-- 新增弹出框 -->
    <!-- <el-dialog title="新增人员信息" v-model="newVisible" width="30%">
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
    </el-dialog> -->
  </div>
</template>

<script setup lang="ts" name="basetable">
import {ref, reactive} from 'vue';
import {ElMessage, ElMessageBox, Table} from 'element-plus';
import {Delete, Edit, Search, Plus, More} from '@element-plus/icons-vue';
import axios from 'axios';
import { SelectProps } from 'element-plus/es/components/select-v2/src/defaults';
import { axiosForHuman } from '../main';

const clerkTypeFormatter = (row,column, cellValue)=>{
  const clerkTypeMap={
    "PRESIDENT":"社长",
    "FINANCIAL_CLERK":"财务干事",
    "VICE_PRESIDENT":"副社长",
    "GENERAL_CLERK":"干事",
    "TUANZHISHU":"团支书"
  }
  return clerkTypeMap[cellValue] || cellValue;
}
const campusTypeFormatter = (row,column,cellValue)=>{
  const campusTypeMap={
    "JIADING":"嘉定校区",
    "SIPING":"四平路校区",
    "HUXI":"沪西校区",
    "HUBEI":"沪北校区"
  }
  return campusTypeMap[cellValue] || cellValue;
}
// 政治面貌选项
const politicalStatusOptions = {
  CPC_MEMBER: '中共党员',
  CPC_PROBATIONARY_MEMBER: '中共预备党员',
  CYL_MEMBER: '共青团员',
  MINMENG_MEMBER: '民盟盟员',
  MINJIN_MEMBER: '民进会员',
  MINZHU_MEMBER: '民主党派成员',
  NONGGONG_MEMBER: '农工党党员',
  NON_PARTY: '无党派人士',
  MASSES: '群众'
};

const politicalStatusFormatter = (value) => {
  const statusMap = {
    CPC_MEMBER: '中共党员',
    CPC_PROBATIONARY_MEMBER: '中共预备党员',
    CYL_MEMBER: '共青团员',
    MINMENG_MEMBER: '民盟盟员',
    MINJIN_MEMBER: '民进会员',
    MINZHU_MEMBER: '民主党派成员',
    NONGGONG_MEMBER: '农工党党员',
    NON_PARTY: '无党派人士',
    MASSES: '群众'
  };
  return statusMap[value] || value;
};
const levelFormatter = (row, column, cellValue) => {
  const levelMap = {
    U1: '大一',
    U2: '大二',
    U3: '大三',
    U4: '大四',
    U5: '大五',
    P1: '研一',
    P2: '研二',
    P3: '研三',
    D_plus: '博士及以上'
  };
  return levelMap[cellValue] || cellValue;
};

const genderFormatter = (row, column, cellValue) => {
  const genderMap = {
    MALE:"男",
    FEMALE:"女"
  };
  return genderMap[cellValue] || cellValue;
};

const instituteFormatter = (row, column, cellValue) => {
  const instituteMap = {
    MECHANICAL_AND_ENERGY_ENGINEERING: '机械与能源学院',
    LIFE_SCIENCES_AND_TECHNOLOGY: '生命科学与技术学院',
    RAIL_TRANSIT_RESEARCH_INSTITUTE: '铁道与城市轨道交通研究院',
    PHYSICAL_SCIENCE_AND_ENGINEERING: '物理科学与工程学院',
    ARCHITECTURE_AND_URBAN_PLANNING: '建筑与城市规划学院',
    AUTOMOTIVE_COLLEGE: '汽车学院',
    MATHEMATICAL_SCIENCES: '数学科学学院',
    CIVIL_ENGINEERING: '土木工程学院',
    MARINE_AND_EARTH_SCIENCES: '海洋与地球科学学院',
    DESIGN_AND_CREATIVE_COLLEGE: '设计创意学院',
    MEDICAL_COLLEGE: '医学院',
    FRESHMAN_COLLEGE: '新生院',
    ELECTRONIC_INFORMATION_ENGINEERING: '电子信息与工程学院',
    LAW_SCHOOL: '法学院',
    COLLEGE_OF_HUMANITIES: '人文学院',
    SCHOOL_OF_FOREIGN_LANGUAGES: '外国语学院',
    ENVIRONMENTAL_SCIENCE_AND_ENGINEERING: '环境科学与工程学院',
    PHYSICAL_EDUCATION_DEPARTMENT: '体育教学部',
    ART_AND_MEDIA_COLLEGE: '艺术与传媒学院',
    ECONOMICS_AND_MANAGEMENT: '经济与管理学院',
    MARXISM_COLLEGE: '马克思主义学院',
    POLITICAL_SCIENCE_AND_INTERNATIONAL_RELATIONS: '政治与国际关系学院',
    SINO_GERMAN_COLLEGE_OF_ENGINEERING: '中德工程学院',
    GEOMATICS_AND_GEOINFORMATION_COLLEGE: '测绘与地理信息学院',
    AERONAUTICS_AND_ASTRONAUTICS: '航空航天与力学学院',
    SOFTWARE_COLLEGE: '软件学院',
    SINO_GERMAN_COLLEGE: '中德学院',
    MATERIALS_SCIENCE_AND_ENGINEERING: '材料科学与工程学院',
    CHEMICAL_SCIENCE_AND_ENGINEERING: '化学科学与工程学院',
    TRANSPORTATION_ENGINEERING_COLLEGE: '交通运输工程学院',
    COLLEGE_OF_STOMATOLOGY: '口腔医学院',
    SHANGHAI_INTELLECTUAL_PROPERTY_COLLEGE: '上海国际知识产权学院',
    TONGJI_UNIVERSITY_AFFILIATED_HOSPITAL: '同济大学附属医院',
    UNIVERSITY_HOSPITAL: '校医院'
    // ... 其他映射 ...
  };
  return instituteMap[cellValue] || cellValue;
};
const fetchData = async () => {
  try {
    
    const response = await axiosForHuman.get('/api/human_management/clerks');
    return response.data
  } catch (error) {
    console.error("Error in grant:", error);
  }
};



interface TableItem {
  id: number;
  name: string;
  gender: string;
  level: string;
  institute: string;
  major: string;
  campus: string;
  clerkType: string;
}

const modifyStatusVisible = ref(false);
const selectedClerkType = ref('');
const currentRowData = ref({});

// 定义响应式变量来控制对话框的显示状态
const detailsVisible = ref(false);

// handleCheck 函数用于打开对话框并设置详细信息
const handleCheck = (row) => {
  details.value = { ...row }; // 使用展开运算符来复制行对象
  detailsVisible.value = true;
};

// 定义要显示的详细信息
const details = ref({
  id:0,
  name:'',
  gender:'',
  email:'',
  phoneNumber:'',
  level:'',
  institute:'',
  campus:'',

  major:'',
  politicalStatus:'',
  wechatId:'',
  grade:'',
  ranking:'',
  clerkType:'',
});

const handleModifyStatus = (index, row) => {
  currentRowData.value = row;
  console.log(row);
  selectedClerkType.value = row.clerkType; // 假设 row 对象有 clerkType 属性
  modifyStatusVisible.value = true;
};

const saveClerkTypeChange = async () => {
  try {
    // 假设 currentRowData.value 包含了当前行的完整数据，并且你想要更新 clerkType 字段
    const response = await axiosForHuman.put(`/api/human_management/clerks/${currentRowData.value.id}`, {
      ...currentRowData.value,
      clerkType: selectedClerkType.value
    });

    if (response && response.data) {
      // 这里可以添加逻辑来处理响应数据，例如更新本地的数据视图
      ElMessage.success('干事类型更新成功');
    } else {
      // 如果响应数据不是预期的，可以在这里处理
      ElMessage.warning('服务器返回了未知的响应');
    }
  } catch (error) {
    // 处理请求错误
    console.error('更新干事类型失败:', error);
    ElMessage.error('干事类型更新失败');
  } finally {
    // 不管请求成功还是失败，都会执行这里的代码
    modifyStatusVisible.value = false;
    // 可能需要刷新表格数据
    window.location.reload(); // 强制刷新页面
  }
};

let newEmployee = reactive({
  id: 0,
  password:"000",
  name:'',
  gender:'',
  email:'',
  phoneNumber:'',
  level:'',
  institute:'',
  campus:'',
  major:'',
  politicalStatus:'',
  wechatId:'',
  grade:'',
  ranking:'',
  clerkType:'',
});

const query = reactive({
  value: '',
  id: 0,
  name: '',
  gender: '',
  level: '',
  institute: '',
  major: '',
  campus: '',
  clerkType:'',
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
  return a.id < b.id ? -1 : 1;
}


// 获取表格数据及筛选
const getData = async () => {
  const res = await fetchData();

  HumantableData.value = res;  //記錄全部數據

  filteredData.value = res.concat(addedData.value);

  //if (query.designIdea !== '') {
  //filteredData = filteredData.filter((item: TableItem) => item.designIdea === query.designIdea);
  //}

  filteredData.value = filteredData.value.filter((item: TableItem) =>
      String(item.id).includes(query.value) ||
      item.name.includes(query.value) ||
      item.gender.includes(query.value) ||
      item.level.includes(query.value) ||
      item.institute.includes(query.value) ||
      item.major.includes(query.value)||
      item.campus.includes(query.value)||
      item.clerkType.includes(query.value)
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


const uploadData = async (newEmployee) => {
  try {
    console.log(newEmployee);
    const response = await axiosForHuman.post('/api/human_management/clerks/', newEmployee);

    ElMessage.success('数据上传成功');
    PageSizeChange();
  } catch (error) {
    ElMessage.error('数据上传失败');
  }
};

const deleteData = async () => {
  try {
 
    console.log(idx, pageData.value[idx]);
    const response = await axiosForHuman.delete('/api/human_management/clerks/' + pageData.value[idx].id);
    ElMessage.success('删除成功');
    PageSizeChange();
  } catch (error) {
    ElMessage.error('删除失败');
  }
};


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
  // 重置 newEmployee 对象的所有属性为初始值
  Object.keys(newEmployee).forEach(key => {
    newEmployee[key] = key === 'id' ? 0 : ''; // 假设id默认为0，其他字段为空字符串
  });

  // 显示新增人员的对话框或表单
  newVisible.value = true;
};

const submitNewEmployee = async () => {

    try {
      const response = await axiosForHuman.post('/api/human_management/clerks', newEmployee);
      // 处理响应
      console.log(response.data);
      // 可能还需要其他操作，比如关闭模态框或清空表单
      ElMessage.success('数据上传成功');
    } catch (error) {
      // 处理错误
      ElMessage.success('数据上传失败');
      console.error(error);
    }
    newVisible.value = false;
    window.location.reload(); // 强制刷新页面
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


// const saveEdit = async () => {

//   let Nametested = testStaffName();
//   if (Nametested != true) {
//     ElMessage.error(Nametested);
//     return;
//   }
//   let Agetested = testStaffAge();
//   if (Agetested != true) {
//     ElMessage.error(Agetested);
//     return;
//   }
//   let Salarytested = testStaffSalary();
//   if (Salarytested != true) {
//     ElMessage.error(Salarytested);
//     return;
//   }
//   let Jobtested = testJob();
//   if (Jobtested != true) {
//     ElMessage.error(Jobtested);
//     return;
//   }
//   let PostRanktested = testStaffPostRank();
//   if (PostRanktested != true) {
//     ElMessage.error(PostRanktested);
//     return;
//   }
//   let WorkTypetested = testWorkType();
//   if (WorkTypetested != true) {
//     //ElMessage.error(WorkTypetested);
//     return;
//   }

//   editVisible.value = false;
//   ElMessage.success(`修改第 ${idx + 1} 行成功`);
//   console.log(idx, pageData);
//   let OldWorkType = pageData.value[idx].workType;
//   pageData.value[idx].staffId = form.staffId;
//   pageData.value[idx].staffName = form.staffName;
//   pageData.value[idx].staffAge = form.staffAge;
//   pageData.value[idx].staffGender = form.staffGender;
//   pageData.value[idx].staffPostRank = form.staffPostRank;
//   pageData.value[idx].staffSalary = Number(form.staffSalary);
//   pageData.value[idx].workType = String(form.workTypeSelect);
//   pageData.value[idx].job = form.job; //应该要至后端修改之
//   editData();

//   const NewWorkType = pageData.value[idx].workType;

//   const oldWorkTypeArray = OldWorkType?OldWorkType.split(","):[];
//   const newWorkTypeArray = NewWorkType?NewWorkType.split(","):[];
//   for (let i =0;i<oldWorkTypeArray.length;i++) {
//     console.log(oldWorkTypeArray[i])
//     await deleteByAspNetUserPk(oldWorkTypeArray[i], pageData.value[idx].aspNetUserPk);
//   }

//   // Grant roles that exist in NewWorkType but not in OldWorkType
//   for (const workType of newWorkTypeArray) {
//     console.log(workType)
//     await grantByAspNetUserPk(workType, pageData.value[idx].aspNetUserPk);
//   }
//      // Delete roles that exist in OldWorkType but not in NewWorkType

// };


// const savenew = () => {         //保存新增人员

//   //检查各项输入值是否符合条件
//   let IDtested = testId();
//   if (IDtested != true) {
//     ElMessage.error(IDtested);
//     return;
//   }
//   let Nametested = testStaffName();
//   if (Nametested != true) {
//     ElMessage.error(Nametested);
//     return;
//   }
//   let Agetested = testStaffAge();
//   if (Agetested != true) {
//     ElMessage.error(Agetested);
//     return;
//   }
//   let Salarytested = testStaffSalary();
//   if (Salarytested != true) {
//     ElMessage.error(Salarytested);
//     return;
//   }
//   let Jobtested = testJob();
//   if (Jobtested != true) {
//     ElMessage.error(Jobtested);
//     return;
//   }
//   let PostRanktested = testStaffPostRank();
//   if (PostRanktested != true) {
//     ElMessage.error(PostRanktested);
//     return;
//   }
//   let WorkTypetested = testWorkType();
//   if (WorkTypetested != true) {
//   //  ElMessage.error(WorkTypetested);
//     return;
//   }

//   newVisible.value = false;
//   ElMessage.success(`添加成功`);
//   console.log(idx, HumantableData);
//   newEmployee.staffId = form.staffId;
//   newEmployee.staffName = form.staffName;
//   newEmployee.staffAge = form.staffAge;
//   newEmployee.staffGender = form.staffGender;
//   newEmployee.staffPostRank = form.staffPostRank;
//   newEmployee.staffSalary = Number(form.staffSalary);
//   newEmployee.workType = String(form.workTypeSelect);
//   newEmployee.job = form.job;
//   newEmployee.userId = form.userId;
//   newEmployee.userPassword = "Bestjiaoao0!";
//   uploadData(newEmployee);             //上传
// };

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
