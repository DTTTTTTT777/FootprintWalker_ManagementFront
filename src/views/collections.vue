<template>
  <div>
    <div class="charts-container">
      <!-- 添加 chart1、chart2、chart3 的容器并设置样式 -->
      <div class="chart" id="chart2"></div>
      <div class="chart" id="chart1"></div>
      <div class="chart" id="chart3"></div>
    </div>
    <div id="chart" style="width: 100%; height: 10px;"></div>
    <div class="container">
      <!-- 查询的部分 -->
      <div class="handle-box">
        <el-input v-model="query.name" placeholder="文物名称" class="handle-input mr10"></el-input>
        <!--显示一个输入框，用户可以输入名称进行搜索。v-model="query.name"将输入的值绑定到query.name变量上。-->
        <el-input v-model="query.id" placeholder="文物ID" class="handle-input mr10"></el-input>
        <br><br>
        <el-select v-model="query.collectionType" placeholder="文物种类" class="handle-select mr10" clearable="true">
          <el-option key="1" label="瓷器" value="瓷器"></el-option>
          <el-option key="2" label="青铜器" value="青铜器"></el-option>
        </el-select>
        <el-select v-model="query.era" placeholder="文物年代" class="handle-select mr10" clearable="true">
          <el-option key="1" label="唐代" value="唐代"></el-option>
          <el-option key="2" label="清代" value="清代"></el-option>
        </el-select>
        <el-select v-model="query.status" placeholder="藏品状态" class="handle-select mr10" clearable="true">
          <el-option key="1" label="在库" value="在库"></el-option>
          <el-option key="2" label="在展" value="在展"></el-option>
        </el-select>
        <el-select v-model="query.excavation_site" placeholder="出土地" class="handle-select mr10" clearable="true">
          <el-option key="1" label="三星堆" value="三星堆"></el-option>
          <el-option key="2" label="北首岭遗址" value="北首岭遗址"></el-option>
        </el-select>
        <el-input v-model="query.excavation_date" placeholder="出土日期" class="handle-input mr11"></el-input>
        <div style="display: inline-block;margin:10px;">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </div>
        <div style="display: inline-block;margin:10px;">
          <el-button type="primary" @click="goToExhibitionHall">返回展厅</el-button>
        </div>
        <!--显示一个搜索按钮，用户点击按钮时触发handleSearch函数。-->
      </div>
      <!-- 显示文物详细信息的表格界面 -->
      <el-table :data="pageData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column prop="collectionId" label="ID" width="110" align="center"></el-table-column>
        <el-table-column prop="name" label="文物名称" align="center"></el-table-column>
        <el-table-column label="文物图片(查看大图)" align="center">
          <template #default="scope">
            <el-image class="table-td-thumb" :src="scope.row.collectionPhoto" :z-index="10"
                      :preview-src-list="[scope.row.thumb]" preview-teleported>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="collectionType" label="文物种类" align="center"></el-table-column>
        <el-table-column prop="era" label="文物年代" align="center"></el-table-column>
        <!--<el-table-column prop="address" label="地址"></el-table-column>-->
        <el-table-column prop="storageInfo.currentStatus" label="藏品状态" align="center">
          <template #default="scope">
            <el-tag
                :type="scope.row.storageInfo.currentStatus === '在展' ? 'success' : scope.row.storageInfo.currentStatus === '修缮中' ? 'danger' : ''">
              {{ scope.row.storageInfo.currentStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="collectInfo.collectTime" label="入藏时间" align="center"></el-table-column>
        <!--<el-table-column prop="date" label="注册时间"></el-table-column>-->
        <el-table-column label="操作" width="170" align="center">
          <template #default="scope">
            <div style="display: inline-block;">
              <el-button text :icon="View" @click="handleDetails(scope.$index, scope.row)">
                查看
              </el-button>
            </div>

            <div style="display: inline-block;">
              <el-button text :icon="Edit" @click="handleDetails2Repair(scope.$index, scope.row)">
                打印出展修缮单
              </el-button>
            </div>

            <div style="display: inline-block;">
              <el-button text :icon="Edit" @click="handleDetails2Warehouse(scope.$index, scope.row)">
                打印出展入库单
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination" style="display: flex; align-items: center;">
        <el-select v-model="query.tempPageSize" @change="applyPageSize" placeholder="每页个数"
                   size="small" style="width: 100px;" clearable="true">
          <el-option label="5" value="5"></el-option>
          <el-option label="10" value="10"></el-option>
          <el-option label="20" value="20"></el-option>
          <el-option label="50" value="50"></el-option>
        </el-select>
        <el-pagination background layout="total, prev, pager, next" :current-page="query.pageIndex"
                       :page-size="query.pageSize" :total="filteredData.length"
                       @current-change="handlePageChange"
                       @update:page-size="handleSearch">
        </el-pagination>
      </div>
    </div>

    <!-- 查看的弹出框 -->
    <el-dialog title="查看" v-model="viewVisible" width="60%">
      <!-- <div>文物名称：{{ view.name }}</div>
      <div>文物种类：{{ view.collectionType }}</div>
      <div>文物年代：{{ view.era }}</div>
      <div>藏品状态：{{ view.storageInfo.currentStatus }}</div> -->
      <div class="cardContainer" id="container">

        <el-descriptions class="margin-top" title="藏品编目卡" :column="2" :size="size" border>
          <!-- 收藏单位 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item" :style="{ minWidth: view.collectInfo.collectMuseum.length * 12 + 'px' }">
                <el-icon :style="iconStyle">
                  <user/>
                </el-icon>
                收藏单位
              </div>
            </template>
            {{ view.collectInfo.collectMuseum }}
          </el-descriptions-item>
          <!-- 现登记号 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <EditPen/>
                </el-icon>
                现登记号
              </div>
            </template>
            {{ view.collectionId }}
          </el-descriptions-item>
          <!-- 藏品图片 -->
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Picture/>
                </el-icon>
                藏品图片
              </div>
            </template>
            <template #default="scope">
              <el-image class="CollectionImg" :src="view.collectionPhoto" :z-index="10">
              </el-image>
            </template>
          </el-descriptions-item>
          <!-- 名称 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <tickets/>
                </el-icon>
                名称
              </div>
            </template>
            {{ view.name }}
          </el-descriptions-item>
          <!-- 文物原名 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <tickets/>
                </el-icon>
                原名
              </div>
            </template>
            {{ view.originalName }}
          </el-descriptions-item>
          <!-- 文物级别 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Medal/>
                </el-icon>
                文物级别
              </div>
            </template>
            {{ view.storageInfo.protectionLevel }}
          </el-descriptions-item>
          <!-- 文物类别 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Grid/>
                </el-icon>
                文物类别
              </div>
            </template>
            {{ view.collectionType }}
          </el-descriptions-item>
          <!-- 质地 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Pointer/>
                </el-icon>
                质地
              </div>
            </template>
            {{ view.textureType }}
          </el-descriptions-item>
          <!--年代 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Calendar/>
                </el-icon>
                年代
              </div>
            </template>
            {{ view.era }}
          </el-descriptions-item>
          <!-- 地域 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <LocationInformation/>
                </el-icon>
                地域
              </div>
            </template>
            {{ view.area }}
          </el-descriptions-item>
          <!-- 来源 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <MapLocation/>
                </el-icon>
                来源
              </div>
            </template>
            {{ view.collectInfo.source }}
          </el-descriptions-item>
          <!-- 保存状况 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Collection/>
                </el-icon>
                保存状况
              </div>
            </template>
            {{ view.storageInfo.currentStatus }}
            <span v-if="view.storageInfo.currentStatus == '在展'">所在展厅：{{ view.exhibitionHallId }}</span>
            <span v-if="view.storageInfo.currentStatus == '在库'">所在仓库：{{ view.storageId }}</span>
          </el-descriptions-item>
          <!-- 完残程度 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Box/>
                </el-icon>
                完残程度
              </div>
            </template>
            {{ view.completeness }}
          </el-descriptions-item>
          <!-- 尺寸 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <FullScreen/>
                </el-icon>
                尺寸
              </div>
            </template>
            {{ view.dimensionInfo.dimension + view.dimensionInfo.dimensionUnit }}
          </el-descriptions-item>
          <!-- 质量-->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Coin/>
                </el-icon>
                质量
              </div>
            </template>
            {{ view.dimensionInfo.weight + view.dimensionInfo.weightUnit }}
          </el-descriptions-item>
          <!-- 传统数量 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Histogram/>
                </el-icon>
                传统数量
              </div>
            </template>
            {{ view.dimensionInfo.traditionalQuantity + "个" }}
          </el-descriptions-item>
          <!-- 实际数量 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Histogram/>
                </el-icon>
                实际数量
              </div>
            </template>
            {{ view.dimensionInfo.realQuantity + "个" }}
          </el-descriptions-item>
          <!-- 入藏时间 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <AlarmClock/>
                </el-icon>
                入藏时间
              </div>
            </template>
            {{ view.collectInfo.collectTime }}
          </el-descriptions-item>
          <!-- 保护等级 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Trophy/>
                </el-icon>
                保护等级
              </div>
            </template>
            {{ view.storageInfo.protectionLevel }}
          </el-descriptions-item>
          <!-- 鉴定意见 -->
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <EditPen/>
                </el-icon>
                鉴定意见
              </div>
            </template>
            {{ view.identificationComments }}
            <div style="margin-top: 10px">鉴定人：{{ view.identificationStaffName }} &nbsp &nbsp &nbsp 鉴定时间:{{
                view.identificationDate
              }}
            </div>
          </el-descriptions-item>
          <!-- 备注 -->
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook/>
                </el-icon>
                备注
              </div>
            </template>
            {{ view.remark }}
          </el-descriptions-item>
        </el-descriptions>

      </div>
      <template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"><el-button type="primary" @click="closeView">关 闭</el-button></div>
					<div style="display: inline-block;margin:10px;"><el-button type="success"
                                                                     v-print="'#container'">打 印</el-button></div>
				</span>
      </template>
    </el-dialog>

    <!-- 打印出展修缮单的弹出框 -->
    <el-dialog title="打印出展修缮单" v-model="view2RepairVisible" width="60%">
      <div class="cardContainer" id="container2W">

        <el-descriptions class="margin-top" title="出展修缮单" :column="2" :size="size" border>
          <!-- 收藏单位 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item" :style="{ minWidth: view.collectInfo.collectMuseum.length * 12 + 'px' }">
                <el-icon :style="iconStyle">
                  <user/>
                </el-icon>
                收藏单位
              </div>
            </template>
            {{ view.collectInfo.collectMuseum }}
          </el-descriptions-item>
          <!-- 现登记号 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <EditPen/>
                </el-icon>
                现登记号
              </div>
            </template>
            {{ view.collectionId }}
          </el-descriptions-item>
          <!-- 藏品图片 -->
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Picture/>
                </el-icon>
                藏品图片
              </div>
            </template>
            <template #default="scope">
              <el-image class="CollectionImg" :src="view.collectionPhoto" :z-index="10">
              </el-image>
            </template>
          </el-descriptions-item>
          <!-- 名称 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <tickets/>
                </el-icon>
                名称
              </div>
            </template>
            {{ view.name }}
          </el-descriptions-item>
          <!-- 文物原名 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <tickets/>
                </el-icon>
                原名
              </div>
            </template>
            {{ view.originalName }}
          </el-descriptions-item>
          <!-- 文物级别 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Medal/>
                </el-icon>
                文物级别
              </div>
            </template>
            {{ view.storageInfo.protectionLevel }}
          </el-descriptions-item>
          <!-- 文物类别 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Grid/>
                </el-icon>
                文物类别
              </div>
            </template>
            {{ view.collectionType }}
          </el-descriptions-item>
          <!-- 质地 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Pointer/>
                </el-icon>
                质地
              </div>
            </template>
            {{ view.textureType }}
          </el-descriptions-item>
          <!--年代 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Calendar/>
                </el-icon>
                年代
              </div>
            </template>
            {{ view.era }}
          </el-descriptions-item>
          <!-- 地域 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <LocationInformation/>
                </el-icon>
                地域
              </div>
            </template>
            {{ view.area }}
          </el-descriptions-item>
          <!-- 来源 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <MapLocation/>
                </el-icon>
                来源
              </div>
            </template>
            {{ view.collectInfo.source }}
          </el-descriptions-item>
          <!-- 保存状况 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Collection/>
                </el-icon>
                保存状况
              </div>
            </template>
            {{ view.storageInfo.currentStatus }}
          </el-descriptions-item>
          <!-- 完残程度 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Box/>
                </el-icon>
                完残程度
              </div>
            </template>
            {{ view.completeness }}
          </el-descriptions-item>
          <!-- 尺寸 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <FullScreen/>
                </el-icon>
                尺寸
              </div>
            </template>
            {{ view.dimensionInfo.dimension + view.dimensionInfo.dimensionUnit }}
          </el-descriptions-item>
          <!-- 质量-->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Coin/>
                </el-icon>
                质量
              </div>
            </template>
            {{ view.dimensionInfo.weight + view.dimensionInfo.weightUnit }}
          </el-descriptions-item>
          <!-- 传统数量 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Histogram/>
                </el-icon>
                传统数量
              </div>
            </template>
            {{ view.dimensionInfo.traditionalQuantity + "个" }}
          </el-descriptions-item>
          <!-- 实际数量 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Histogram/>
                </el-icon>
                实际数量
              </div>
            </template>
            {{ view.dimensionInfo.realQuantity + "个" }}
          </el-descriptions-item>
          <!-- 入藏时间 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <AlarmClock/>
                </el-icon>
                入藏时间
              </div>
            </template>
            {{ view.collectInfo.collectTime }}
          </el-descriptions-item>
          <!-- 保护等级 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Trophy/>
                </el-icon>
                保护等级
              </div>
            </template>
            {{ view.storageInfo.protectionLevel }}
          </el-descriptions-item>
          <!-- 鉴定意见 -->
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <EditPen/>
                </el-icon>
                鉴定意见
              </div>
            </template>
            {{ view.identificationComments }}
            <div style="margin-top: 10px">鉴定人：{{ view.identificationStaffName }} &nbsp &nbsp &nbsp 鉴定时间:{{
                view.identificationDate
              }}
            </div>
          </el-descriptions-item>
          <!-- 备注 -->
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook/>
                </el-icon>
                备注
              </div>
            </template>
            {{ view.remark }}
          </el-descriptions-item>

          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook/>
                </el-icon>
                申请时间
              </div>
            </template>
            {{ print.time }}
          </el-descriptions-item>


          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook/>
                </el-icon>
                展厅管理员签字
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook/>
                </el-icon>
                修缮管理员签字
              </div>
            </template>
          </el-descriptions-item>


        </el-descriptions>


      </div>
      <template #footer>
				<span class="dialog-footer">
					<el-button type="primary" @click="closeView2Repair">关 闭</el-button>
					<el-button type="success" v-print="'#container2W'">打 印</el-button>
				</span>
      </template>
    </el-dialog>

    <!-- 打印出展入库单的弹出框 -->
    <el-dialog title="打印出展入库单" v-model="view2WarehouseVisible" width="60%">
      <div class="cardContainer" id="container2E">

        <el-descriptions class="margin-top" title="出展入库单" :column="2" :size="size" border>
          <!-- 收藏单位 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item" :style="{ minWidth: view.collectInfo.collectMuseum.length * 12 + 'px' }">
                <el-icon :style="iconStyle">
                  <user/>
                </el-icon>
                收藏单位
              </div>
            </template>
            {{ view.collectInfo.collectMuseum }}
          </el-descriptions-item>
          <!-- 现登记号 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <EditPen/>
                </el-icon>
                现登记号
              </div>
            </template>
            {{ view.collectionId }}
          </el-descriptions-item>
          <!-- 藏品图片 -->
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Picture/>
                </el-icon>
                藏品图片
              </div>
            </template>
            <template #default="scope">
              <el-image class="CollectionImg" :src="view.collectionPhoto" :z-index="10">
              </el-image>
            </template>
          </el-descriptions-item>
          <!-- 名称 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <tickets/>
                </el-icon>
                名称
              </div>
            </template>
            {{ view.name }}
          </el-descriptions-item>
          <!-- 文物原名 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <tickets/>
                </el-icon>
                原名
              </div>
            </template>
            {{ view.originalName }}
          </el-descriptions-item>
          <!-- 文物级别 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Medal/>
                </el-icon>
                文物级别
              </div>
            </template>
            {{ view.storageInfo.protectionLevel }}
          </el-descriptions-item>
          <!-- 文物类别 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Grid/>
                </el-icon>
                文物类别
              </div>
            </template>
            {{ view.collectionType }}
          </el-descriptions-item>
          <!-- 质地 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Pointer/>
                </el-icon>
                质地
              </div>
            </template>
            {{ view.textureType }}
          </el-descriptions-item>
          <!--年代 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Calendar/>
                </el-icon>
                年代
              </div>
            </template>
            {{ view.era }}
          </el-descriptions-item>
          <!-- 地域 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <LocationInformation/>
                </el-icon>
                地域
              </div>
            </template>
            {{ view.area }}
          </el-descriptions-item>
          <!-- 来源 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <MapLocation/>
                </el-icon>
                来源
              </div>
            </template>
            {{ view.collectInfo.source }}
          </el-descriptions-item>
          <!-- 保存状况 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Collection/>
                </el-icon>
                保存状况
              </div>
            </template>
            {{ view.storageInfo.currentStatus }}
          </el-descriptions-item>
          <!-- 完残程度 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Box/>
                </el-icon>
                完残程度
              </div>
            </template>
            {{ view.completeness }}
          </el-descriptions-item>
          <!-- 尺寸 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <FullScreen/>
                </el-icon>
                尺寸
              </div>
            </template>
            {{ view.dimensionInfo.dimension + view.dimensionInfo.dimensionUnit }}
          </el-descriptions-item>
          <!-- 质量-->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Coin/>
                </el-icon>
                质量
              </div>
            </template>
            {{ view.dimensionInfo.weight + view.dimensionInfo.weightUnit }}
          </el-descriptions-item>
          <!-- 传统数量 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Histogram/>
                </el-icon>
                传统数量
              </div>
            </template>
            {{ view.dimensionInfo.traditionalQuantity + "个" }}
          </el-descriptions-item>
          <!-- 实际数量 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Histogram/>
                </el-icon>
                实际数量
              </div>
            </template>
            {{ view.dimensionInfo.realQuantity + "个" }}
          </el-descriptions-item>
          <!-- 入藏时间 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <AlarmClock/>
                </el-icon>
                入藏时间
              </div>
            </template>
            {{ view.collectInfo.collectTime }}
          </el-descriptions-item>
          <!-- 保护等级 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Trophy/>
                </el-icon>
                保护等级
              </div>
            </template>
            {{ view.storageInfo.protectionLevel }}
          </el-descriptions-item>
          <!-- 鉴定意见 -->
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <EditPen/>
                </el-icon>
                鉴定意见
              </div>
            </template>
            {{ view.identificationComments }}
            <div style="margin-top: 10px">鉴定人：{{ view.identificationStaffName }} &nbsp &nbsp &nbsp 鉴定时间:{{
                view.identificationDate
              }}
            </div>
          </el-descriptions-item>
          <!-- 备注 -->
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook/>
                </el-icon>
                备注
              </div>
            </template>
            {{ view.remark }}
          </el-descriptions-item>

          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook/>
                </el-icon>
                申请时间
              </div>
            </template>
            {{ print.time }}
          </el-descriptions-item>

          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook/>
                </el-icon>
                入库ID
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook/>
                </el-icon>
                货柜ID
              </div>
            </template>
          </el-descriptions-item>


          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook/>
                </el-icon>
                展厅管理员签字
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook/>
                </el-icon>
                仓库管理员签字
              </div>
            </template>
          </el-descriptions-item>

        </el-descriptions>


      </div>
      <template #footer>
				<span class="dialog-footer">
					<el-button type="primary" @click="closeView2Warehouse">关 闭</el-button>
					<el-button type="success" v-print="'#container2E'">打 印</el-button>
				</span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts" name="basetable">
import {ref, reactive, computed, onMounted, onBeforeUnmount} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {Delete, Edit, Search, Plus, View} from '@element-plus/icons-vue';
// import { fetchData } from '../api/index';
import {

  Tickets,
  User,
} from '@element-plus/icons-vue'
import {useRouter, useRoute} from 'vue-router';// 导入useRouter
import axios from 'axios'
import * as echarts from 'echarts';
import {useUserInfo} from '../store/userInfo';


function getToken() {
  // 替换为获取token的逻辑
  const UserInfo = useUserInfo();
  return UserInfo.userToken;

}

// 创建一个具有默认头的Axios实例
const axiosInstance = axios.create({
  baseURL: 'http://42.192.39.198:5000/api',
});

const print = ({
  time: "",
})

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

const hallId = ref(0); // 初始化 hallId 为 0，或者根据您的需求选择其他默认值
let temperature: string = "0";
let humidity: string = "0";
let Co2: string = "0";
let router = useRouter();

// 在组件加载时，初始化 hallId
onMounted(() => {
  updateHallIdFromRoute();
});

// 监听路由变化，实时更新 hallId
router.afterEach(() => {
  updateHallIdFromRoute();
  getData();
});

function updateHallIdFromRoute() {
  const exhibitionHallId = router.currentRoute.value.query.exhibitionHallId as string;
  hallId.value = exhibitionHallId ? parseInt(exhibitionHallId, 10) : 0;
}

const goToExhibitionHall = () => {
  // 使用 router.push() 方法导航到展厅界面
  router.push({path: 'table'});
};

//获取后端数据库的数据
const fetchData = async () => {
  try {
    const response = await axiosInstance.get('/ExhibitionHall');
    console.log(response.data);
    console.log("数据库连接成功！");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

//表格中展示的数据
interface TableItem {
  collectionId: number;
  name: string;
  money: string;
  date: string;
  collectionType: string;
  collectInfo: {
    collectTime: string;	//收藏的时间
    source: string;
  }
  era: string;
  status: string;
  hall_name: string;
  storageInfo: {
    currentStatus: string;
    protectionLevel: string;
  }
  textureType: string;
  area: string;
  completeness: string;
  dimensionInfo: {
    collectionId: string;
    dimension: string;
    dimensionUnit: string;
    weight: string;
    weightUnit: string;
    realQuantity: string;
    traditionalQuantity: string;
  },
  exhibitionHallId: string;
  storageId: string;
}

//请求数据
const query = reactive({
  name: '',         //文物姓名
  id: '',           //文物id
  collectionType: '',        //文物类别
  era: '',         //文物的朝代
  status: '',      //藏品状态
  excavation_site: '',    //出土地
  excavation_date: '',   //出土日期
  collectTime: '',	//收藏的时间
  pageIndex: 1,      //所在页面
  pageSize: 10,       //一页最多拥有的条目个数
  tempPageSize: '', //中间变量，存储用户选择的PageSize
  storageInfo: {
    currentStatus: '',
    protectionLevel: ''
  }
});
//文物展示表格的数据
const tableData = ref<TableItem[]>([]);
const pageData = ref<TableItem[]>([]);   //
let filteredData = ref<TableItem[]>([]); // 保存筛选的数据


const getData = () => {
  fetchData().then(res => {
    // 扁平化数据并保留展品数组
    const exhibitions = res.filter(item => item.collections && item.collections.length > 0 && item.exhibitionHallId === hallId.value);
    const collections = exhibitions.map(item => item.collections).flat();
    console.log(collections);
    temperature = exhibitions.map(item => item.exhibitionHallTemperature).flat();
    humidity = exhibitions.map(item => item.exhibitionHallHumidity).flat();
    Co2 = exhibitions.map(item => item.exhibitionHallCo2).flat();


    // 过滤数据
    filteredData.value = collections.filter(item => item.storageInfo.currentStatus !== '待鉴定');
    filteredData.value = filteredData.value.filter(item => item.name.includes(query.name));
    filteredData.value = filteredData.value.filter(item => String(item.collectionId).includes(query.id));
    filteredData.value = filteredData.value.filter(item => item.textureType.includes(query.collectionType));
    filteredData.value = filteredData.value.filter(item => item.era.includes(query.era));
    filteredData.value = filteredData.value.filter(item => item.storageInfo.currentStatus.includes(query.status));
    filteredData.value = filteredData.value.filter(item => item.area.includes(query.excavation_site));
    filteredData.value = filteredData.value.filter(item => item.collectInfo.collectTime.includes(query.excavation_date));

    tableData.value = filteredData.value;

    const startIndex = (query.pageIndex - 1) * query.pageSize;
    const endIndex = query.pageIndex * query.pageSize;

    // 截取当前页的数据
    const pagedData = filteredData.value.slice(startIndex, endIndex);

    // 将截取的数据赋值给 pagedData
    pageData.value = pagedData;

    // 格式化 collectTime 以进行显示
    for (var i = 0; i < pageData.value.length; i++) {
      var T = pageData.value[i].collectInfo.collectTime;
      var dest = '';
      for (var j = 0; j < T.length; j++) {
        if (T[j] == 'T')
          break;
        dest += T[j];
      }
      pageData.value[i].collectInfo.collectTime = dest;
    }
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

//改变页面大小
const applyPageSize = () => {
  if (query.tempPageSize != '') {
    query.pageSize = Number(query.tempPageSize);
  } else {
    query.pageSize = 10;
  }
  console.log(query.pageSize);
  query.pageIndex = 1;
  getData();
}

// 表格查看详细资料时弹窗和保存
const viewVisible = ref(false);
const view2RepairVisible = ref(false);
const view2WarehouseVisible = ref(false);

//查看的内容
let view = reactive({
  area: '',
  collectInfo: {
    collectionId: '',
    source: '',
    collectMuseum: '',
    generalRegistrationId: '',
    collectTime: '',
    collectionLevel: ''
  },
  collectionId: '',
  collectionPhoto: '',
  collectionType: '',
  completeness: '',
  completenessType: '',
  dimensionInfo: {
    collectionId: '',
    dimension: '',
    dimensionUnit: '',
    weight: '',
    weightUnit: '',
    realQuantity: '',
    traditionalQuantity: ''
  },
  era: '',
  identificationComments: '',
  identificationDate: '',
  identificationStaffName: '',
  name: '',
  remark: '',
  storageInfo: {
    currentStatus: '',
    protectionLevel: ''
  },
  originalName: '',
  textureType: '',
  exhibitionHallId: '',
  storageId: '',

});

//处理查看操作
let i: number = -1;
// const view = ref<TableItem[]>([]);
const handleDetails = (index: number, row: any) => {
  view.area = row.area;
  view.collectInfo = {
    collectionId: row.collectInfo.collectionId,
    source: row.collectInfo.source,
    collectMuseum: row.collectInfo.collectMuseum,
    generalRegistrationId: row.collectInfo.generalRegistrationId,
    collectTime: row.collectInfo.collectTime,
    collectionLevel: row.collectInfo.collectionLevel
  };
  view.collectionId = row.collectionId;
  view.collectionPhoto = row.collectionPhoto;
  view.collectionType = row.collectionType;
  view.completeness = row.completeness;
  view.completenessType = row.completenessType;
  view.dimensionInfo = {
    collectionId: row.dimensionInfo.collectionId,
    dimension: row.dimensionInfo.dimension,
    dimensionUnit: row.dimensionInfo.dimensionUnit,
    weight: row.dimensionInfo.weight,
    weightUnit: row.dimensionInfo.weightUnit,
    realQuantity: row.dimensionInfo.realQuantity,
    traditionalQuantity: row.dimensionInfo.traditionalQuantity
  };
  view.era = row.era;
  view.identificationComments = row.identificationComments;
  view.identificationDate = row.identificationDate;
  view.identificationStaffName = row.identificationStaffName;
  view.name = row.name;
  view.remark = row.remark;
  view.storageInfo = {
    currentStatus: row.storageInfo.currentStatus,
    protectionLevel: row.storageInfo.protectionLevel
  };
  view.originalName = row.originalName;
  view.textureType = row.textureType;
  view.exhibitionHallId = row.exhibitionHallId;
  view.storageId = row.storageId;
  viewVisible.value = true;
};


const handleDetails2Warehouse = (index: number, row: any) => {
  view.area = row.area;
  view.collectInfo = {
    collectionId: row.collectInfo.collectionId,
    source: row.collectInfo.source,
    collectMuseum: row.collectInfo.collectMuseum,
    generalRegistrationId: row.collectInfo.generalRegistrationId,
    collectTime: row.collectInfo.collectTime,
    collectionLevel: row.collectInfo.collectionLevel
  };
  view.collectionId = row.collectionId;
  view.collectionPhoto = row.collectionPhoto;
  view.collectionType = row.collectionType;
  view.completeness = row.completeness;
  view.completenessType = row.completenessType;
  view.dimensionInfo = {
    collectionId: row.dimensionInfo.collectionId,
    dimension: row.dimensionInfo.dimension,
    dimensionUnit: row.dimensionInfo.dimensionUnit,
    weight: row.dimensionInfo.weight,
    weightUnit: row.dimensionInfo.weightUnit,
    realQuantity: row.dimensionInfo.realQuantity,
    traditionalQuantity: row.dimensionInfo.traditionalQuantity
  };
  view.era = row.era;
  view.identificationComments = row.identificationComments;
  view.identificationDate = row.identificationDate;
  view.identificationStaffName = row.identificationStaffName;
  view.name = row.name;
  view.remark = row.remark;
  view.storageInfo = {
    currentStatus: row.storageInfo.currentStatus,
    protectionLevel: row.storageInfo.protectionLevel
  };
  view.originalName = row.originalName;
  view.textureType = row.textureType;
  view2WarehouseVisible.value = true;
  print.time = getCurrentTime();
};

const handleDetails2Repair = (index: number, row: any) => {
  view.area = row.area;
  view.collectInfo = {
    collectionId: row.collectInfo.collectionId,
    source: row.collectInfo.source,
    collectMuseum: row.collectInfo.collectMuseum,
    generalRegistrationId: row.collectInfo.generalRegistrationId,
    collectTime: row.collectInfo.collectTime,
    collectionLevel: row.collectInfo.collectionLevel
  };
  view.collectionId = row.collectionId;
  view.collectionPhoto = row.collectionPhoto;
  view.collectionType = row.collectionType;
  view.completeness = row.completeness;
  view.completenessType = row.completenessType;
  view.dimensionInfo = {
    collectionId: row.dimensionInfo.collectionId,
    dimension: row.dimensionInfo.dimension,
    dimensionUnit: row.dimensionInfo.dimensionUnit,
    weight: row.dimensionInfo.weight,
    weightUnit: row.dimensionInfo.weightUnit,
    realQuantity: row.dimensionInfo.realQuantity,
    traditionalQuantity: row.dimensionInfo.traditionalQuantity
  };
  view.era = row.era;
  view.identificationComments = row.identificationComments;
  view.identificationDate = row.identificationDate;
  view.identificationStaffName = row.identificationStaffName;
  view.name = row.name;
  view.remark = row.remark;
  view.storageInfo = {
    currentStatus: row.storageInfo.currentStatus,
    protectionLevel: row.storageInfo.protectionLevel
  };
  view.originalName = row.originalName;
  view.textureType = row.textureType;
  view2RepairVisible.value = true;
  print.time = getCurrentTime();
};


function getCurrentTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}


//关闭“查看详细信息”的弹窗
const closeView = () => {
  viewVisible.value = false;                    //editVisible.value被用来控制编辑界面或对话框的显示与隐藏
};
const closeView2Repair = () => {
  view2RepairVisible.value = false;                    //editVisible.value被用来控制编辑界面或对话框的显示与隐藏
};
const closeView2Warehouse = () => {
  view2WarehouseVisible.value = false;                    //editVisible.value被用来控制编辑界面或对话框的显示与隐藏
};


const size = ref('')
const iconStyle = computed(() => {
  const marginMap = {
    large: '8px',
    default: '6px',
    small: '4px',
  }
  return {
    marginRight: marginMap.default,
  }
})

onMounted(async () => {
  try {
    // 获取图表容器
    const chartDom = document.getElementById('chart1');

    // 使用 ECharts 初始化图表
    const myChart = echarts.init(chartDom);


    // ECharts 配置选项
    const option = {
      series: [
        {
          type: 'gauge',
          center: ['50%', '60%'],
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 60,
          splitNumber: 12,
          itemStyle: {
            color: '#FFAB91'
          },
          progress: {
            show: true,
            width: 30
          },
          pointer: {
            show: false
          },
          axisLine: {
            lineStyle: {
              width: 30
            }
          },
          axisTick: {
            distance: -45,
            splitNumber: 5,
            lineStyle: {
              width: 2,
              color: '#999'
            }
          },
          splitLine: {
            distance: -52,
            length: 14,
            lineStyle: {
              width: 3,
              color: '#999'
            }
          },
          axisLabel: {
            distance: -20,
            color: '#999',
            fontSize: 20
          },
          anchor: {
            show: false
          },
          title: {
            show: false
          },
          detail: {
            valueAnimation: true,
            width: '60%',
            lineHeight: 40,
            borderRadius: 8,
            offsetCenter: [0, '-15%'],
            fontSize: 60,
            fontWeight: 'bolder',
            formatter: '{value} °C',
            color: 'inherit'
          },
          data: [
            {
              value: 30
            }
          ]
        },
        {
          type: 'gauge',
          center: ['50%', '60%'],
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 60,
          itemStyle: {
            color: '#FD7347'
          },
          progress: {
            show: true,
            width: 8
          },
          pointer: {
            show: false
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            show: false
          },
          detail: {
            show: false
          },
          data: [
            {
              value: 30
            }
          ]
        }
      ]
    };

    option && myChart.setOption(option);

    // 在组件销毁前销毁 ECharts 实例
    onBeforeUnmount(() => {
      console.log('Component is unmounted. Disposing ECharts instance.');
      myChart.dispose();
    });
  } catch (error) {
    console.error('Error initializing chart1:', error);
  }
});


onMounted(async () => {
  try {
    // 获取图表容器
    const chartDom = document.getElementById('chart2');

    // 使用 ECharts 初始化图表
    const myChart = echarts.init(chartDom);

    // ECharts 配置选项
    const option = {
      tooltip: {
        formatter: '{a} <br/>{b} : {c}%'
      },
      series: [
        {
          name: 'Pressure',
          type: 'gauge',
          progress: {
            show: true
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}'
          },
          data: [
            {
              value: 30,
              name: 'Humidity'
            }
          ]
        }
      ]
    };

    option && myChart.setOption(option);

    // 在组件销毁前销毁 ECharts 实例
    onBeforeUnmount(() => {
      console.log('Component is unmounted. Disposing ECharts instance.');
      myChart.dispose();
    });
  } catch (error) {
    console.error('Error initializing chart1:', error);
  }
});

onMounted(async () => {
  try {
    // 获取图表容器
    const chartDom = document.getElementById('chart3');

    // 使用 ECharts 初始化图表
    const myChart = echarts.init(chartDom);

    // ECharts 配置选项
    const option = {
      tooltip: {
        formatter: '{a} <br/>{b} : {c}%'
      },
      series: [
        {
          name: 'Pressure',
          type: 'gauge',
          progress: {
            show: true
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}'
          },
          data: [
            {
              value: 30,
              name: 'CO2'
            }
          ]
        }
      ]
    };

    option && myChart.setOption(option);

    // 在组件销毁前销毁 ECharts 实例
    onBeforeUnmount(() => {
      console.log('Component is unmounted. Disposing ECharts instance.');
      myChart.dispose();
    });
  } catch (error) {
    console.error('Error initializing chart1:', error);
  }
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

.mr11 {
  width: 150px;
  margin-right: 10px;
}

.table-td-thumb {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}

.el-descriptions {
  margin-top: 20px;
}

.cell-item {
  display: flex;
  align-items: center;
}

.margin-top {
  margin-top: 20px;
}

.CollectionImg {
  float: left;
  width: 200px;
  height: 130px;
  margin: 10px;

}

.charts-container {
  display: flex; /* 使用 Flex 布局 */
  justify-content: space-between; /* 横向平分空间 */
  align-items: center; /* 垂直居中对齐 */
  flex-wrap: wrap; /* 当空间不足时换行显示 */
}

.chart {
  width: calc(33.33% - 10px); /* 每个图表容器占据横向空间的 33.33%（减去一些间距） */
  height: 400px;
  margin-right: 10px; /* 为了在图表之间添加一些间距 */
  box-sizing: border-box; /* 防止外边距溢出 */
}
</style>
