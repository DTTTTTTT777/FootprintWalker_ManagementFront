<template>
  <div>
    <div class="container">
      <!-- 查询的部分 -->
      <div class="handle-box">
        <el-input v-model="query.value" placeholder="搜索内容" class="handle-input mr10"></el-input>
        <div style="display: inline-block;"><el-button type="primary" :icon="Search" @click="handleSearch" >搜索</el-button></div>
      </div>
      <!-- 显示文物详细信息的表格界面 -->
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column prop="collectionId" label="ID" width="110" align="center" sortable></el-table-column>
        <el-table-column prop="name" label="文物名称" align="center"></el-table-column>
        <el-table-column label="文物图片(查看大图)" align="center">
          <template #default="scope">
            <el-image class="table-td-thumb" :src="scope.row.collectionPhoto" :z-index="10"
                      :preview-src-list="[scope.row.collectionPhoto]" preview-teleported>
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
        <el-table-column prop="collectInfo.collectTime" label="入藏时间" align="center" sortable></el-table-column>
        <!--<el-table-column prop="date" label="注册时间"></el-table-column>-->
        <el-table-column label="操作" width="400" align="center">
          <template #default="scope">
            <!--el-button text :icon="Edit" @click="handleEdit(scope.$index, scope.row)">
              修改文物状态
            </el-button-->

            <el-button text :icon="View" @click="handleDetails(scope.$index, scope.row)">
              查看
            </el-button>

            <el-button text :icon="Edit" @click="handleDetails2Warehouse(scope.$index, scope.row)">
              打印入库单
            </el-button>

            <el-button text :icon="Edit" @click="handleDetails2Exhibition(scope.$index, scope.row)">
              打印入展单
            </el-button>

          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background layout="total, prev, pager, next" :current-page="query.pageIndex"
                       :page-size="query.pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
      </div>
    </div>

    <!-- 编辑的弹出框 -->
    <el-dialog title="修改文物状态" v-model="editVisible" width="60%">
      <el-form label-width="70px">
        <el-form-item label="藏品状态">
          <el-select v-model="form.storageInfo.currentStatus" placeholder="藏品状态" class="handle-select mr10">
            <el-option key="1" label="在展" value="在展"></el-option>
            <el-option key="2" label="在库" value="在库"></el-option>
            <el-option key="3" label="修缮中" value="修缮中"></el-option>
            <el-option key="4" label="待鉴定" value="待鉴定"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.storageInfo.currentStatus === '在展'" label="展厅名称">
          <el-input v-if="form.storageInfo.currentStatus === '在展'" v-model="form.exhibitionHallId"
                    class="handle-input mr10"></el-input>
        </el-form-item>
        <el-form-item v-if="form.storageInfo.currentStatus === '在库'" label="库房Id">
          <el-input v-if="form.storageInfo.currentStatus === '在库'" v-model="form.warehouseId"
                    class="handle-input mr10"></el-input>
        </el-form-item>
        <el-form-item v-if="form.storageInfo.currentStatus === '在库'" label="货架Id">
          <el-input v-if="form.storageInfo.currentStatus === '在库'" v-model="form.containerId"
                    class="handle-input mr10"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
				<span class="dialog-footer">
					<div style="display: inline-block;margin:10px;"><el-button @click="editVisible = false">取 消</el-button></div>
					<div style="display: inline-block;margin:10px;"><el-button type="primary" @click="saveEdit">确 定</el-button></div>
				</span>
      </template>
    </el-dialog>



    <!-- 查看的弹出框 -->
    <el-dialog title="查看" v-model="viewVisible" width="60%">
      <div class="cardContainer" id="container">

        <el-descriptions class="margin-top" title="藏品编目卡" :column="2" :size="size" border>
          <!-- 收藏单位 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item" :style="{ minWidth: view.collectInfo.collectMuseum.length * 12 + 'px' }">
                <el-icon :style="iconStyle">
                  <user />
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
                  <EditPen />
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
                  <Picture />
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
                  <tickets />
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
                  <tickets />
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
                  <Medal />
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
                  <Grid />
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
                  <Pointer />
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
                  <Calendar />
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
                  <LocationInformation />
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
                  <MapLocation />
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
                  <Collection />
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
                  <Box />
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
                  <FullScreen />
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
                  <Coin />
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
                  <Histogram />
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
                  <Histogram />
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
                  <AlarmClock />
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
                  <Trophy />
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
                  <EditPen />
                </el-icon>
                鉴定意见
              </div>
            </template>
            {{ view.identificationComments }}
            <div style="margin-top: 10px">鉴定人：{{ view.identificationStaffName }} &nbsp &nbsp &nbsp 鉴定时间:{{
                view.identificationDate }}</div>
          </el-descriptions-item>
          <!-- 备注 -->
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook />
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
					<el-button type="primary" @click="closeView">关 闭</el-button>
					<el-button type="success" v-print="'#container'">打 印</el-button>
				</span>
      </template>
    </el-dialog>

    <!-- 打印入库单的弹出框 -->
    <el-dialog title="打印入库单" v-model="view2WarehouseVisible" width="60%">
      <div class="cardContainer" id="container2W">

        <el-descriptions class="margin-top" title="入库单" :column="2" :size="size" border>
          <!-- 收藏单位 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item" :style="{ minWidth: view.collectInfo.collectMuseum.length * 12 + 'px' }">
                <el-icon :style="iconStyle">
                  <user />
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
                  <EditPen />
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
                  <Picture />
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
                  <tickets />
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
                  <tickets />
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
                  <Medal />
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
                  <Grid />
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
                  <Pointer />
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
                  <Calendar />
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
                  <LocationInformation />
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
                  <MapLocation />
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
                  <Collection />
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
                  <Box />
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
                  <FullScreen />
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
                  <Coin />
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
                  <Histogram />
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
                  <Histogram />
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
                  <AlarmClock />
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
                  <Trophy />
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
                  <EditPen />
                </el-icon>
                鉴定意见
              </div>
            </template>
            {{ view.identificationComments }}
            <div style="margin-top: 10px">鉴定人：{{ view.identificationStaffName }} &nbsp &nbsp &nbsp 鉴定时间:{{
                view.identificationDate }}</div>
          </el-descriptions-item>
          <!-- 备注 -->
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook />
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
                  <Notebook />
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
                  <Notebook />
                </el-icon>
                入库ID
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook />
                </el-icon>
                货柜ID
              </div>
            </template>
          </el-descriptions-item>


          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook />
                </el-icon>
                修缮管理员签字
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook />
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
					<el-button type="success" v-print="'#container2W'">打 印</el-button>
				</span>
      </template>
    </el-dialog>

    <!-- 打印入展单的弹出框 -->
    <el-dialog title="打印入展单" v-model="view2ExhibitionVisible" width="60%">
      <div class="cardContainer" id="container2E">

        <el-descriptions class="margin-top" title="入展单" :column="2" :size="size" border>
          <!-- 收藏单位 -->
          <el-descriptions-item>
            <template #label>
              <div class="cell-item" :style="{ minWidth: view.collectInfo.collectMuseum.length * 12 + 'px' }">
                <el-icon :style="iconStyle">
                  <user />
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
                  <EditPen />
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
                  <Picture />
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
                  <tickets />
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
                  <tickets />
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
                  <Medal />
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
                  <Grid />
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
                  <Pointer />
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
                  <Calendar />
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
                  <LocationInformation />
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
                  <MapLocation />
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
                  <Collection />
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
                  <Box />
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
                  <FullScreen />
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
                  <Coin />
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
                  <Histogram />
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
                  <Histogram />
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
                  <AlarmClock />
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
                  <Trophy />
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
                  <EditPen />
                </el-icon>
                鉴定意见
              </div>
            </template>
            {{ view.identificationComments }}
            <div style="margin-top: 10px">鉴定人：{{ view.identificationStaffName }} &nbsp &nbsp &nbsp 鉴定时间:{{
                view.identificationDate }}</div>
          </el-descriptions-item>
          <!-- 备注 -->
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook />
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
                  <Notebook />
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
                  <Notebook />
                </el-icon>
                入展ID
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook />
                </el-icon>
                修缮管理员签字
              </div>
            </template>
          </el-descriptions-item>

          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Notebook />
                </el-icon>
                展厅管理员签字
              </div>
            </template>
          </el-descriptions-item>

        </el-descriptions>



      </div>
      <template #footer>
				<span class="dialog-footer">
					<el-button type="primary" @click="closeView2Exhibition">关 闭</el-button>
					<el-button type="success" v-print="'#container2E'">打 印</el-button>
				</span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts" name="basetable">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, Plus, View } from '@element-plus/icons-vue';
// import { fetchData } from '../api/index';
import { onMounted } from 'vue'
import {
  Iphone,
  Location,
  OfficeBuilding,
  Tickets,
  User,
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'; // 导入useRouter
import axios from 'axios'

import { useUserInfo } from "@/store/userInfo";
import { useBaseUrl } from "@/store/baseUrl";

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

  console.log(token);

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



//获取后端数据库的数据
const fetchData = async () => {
  try {

    const response= await axiosInstance.get('/Collections');
    //const response = await axios.get(' http://42.192.39.198:5000/api/Collections');
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
  identificationComments: string;
  exhibitionHallId: string;
  warehouseId: string;
  containerId: string;
  remark: string;
}
//请求数据
const query = reactive({
  name: '',         //文物姓名
  id: '',           //文物id
  collectionType: ' ',        //文物类别
  era: ' ',         //文物的朝代
  status: ' ',      //藏品状态
  excavation_site: ' ',    //出土地
  excavation_date: ' ',   //出土日期
  collectTime: '',	//收藏的时间
  pageIndex: 1,      //所在页面
  pageSize: 10,       //总页面
  storageInfo: {
    currentStatus: '',
    protectionLevel: ''
  },
  value: '',
});
//文物展示表格的数据
const tableData = ref<TableItem[]>([]);
const pageTotal = ref(0);
let filteredData = ref<TableItem[]>([]); // 保存筛选的数据

// 获取表格数据
const getData = () => {
  fetchData().then(res => {
    console.log(res);
    //过滤掉“待鉴定”的文物

    filteredData.value = res.filter(item => item.storageInfo.currentStatus == '修缮中');

    for (var i = 0; i < filteredData.value.length; i++) {
      //对每一个文物截取有效时间显示
      var T = filteredData.value[i].collectInfo.collectTime;
      var dest = '';
      console.log(T)
      for (var j = 0; j < T.length; j++) {
        if (T[j] == 'T')
          break;
        dest += T[j];
      }
      filteredData.value[i].collectInfo.collectTime = dest;
      //检查文物的名字是否已知，如果是已知的则直接显示，如果是未知的就显示
    }

    filteredData.value = filteredData.value.filter(item =>
        String(item.collectionId).includes(query.value) ||
        item.collectionType.includes(query.value) ||
        item.era.includes(query.value) ||
        item.storageInfo.currentStatus.includes(query.value) ||
        item.collectInfo.collectTime.includes(query.value)||
        item.name.includes(query.value)
    );


    tableData.value = filteredData.value;
    console.log(tableData.value);


    // console.log(res[0].collectionId);
    // pageTotal.value = res.data.pageTotal || 50;
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
const saveDelete = async (index: number) => {
  try {
    const deletedItemId = tableData.value[index].collectionId;
    await axiosInstance.delete(`http://42.192.39.198:5000/api/Collections/${deletedItemId}`);
    ElMessage.success('数据删除成功');
  } catch (error) {
    ElMessage.error('数据删除失败');
  }
};
// 处理删除操作
const handleDelete = (index: number) => {
  // 二次确认删除
  ElMessageBox.confirm('确定要删除吗？', '提示', {
    type: 'warning',customClass: 'my-message-box'
  })
      .then(() => {
        ElMessage.success('删除成功');
        // 在这里调用 saveDelete 并传递要删除的数据索引
        saveDelete(index);
        tableData.value.splice(index, 1);
      })
      .catch(() => { });
};

// 表格编辑时弹窗和保存
const editVisible = ref(false);
// 表格查看详细资料时弹窗和保存
const viewVisible = ref(false);
const view2WarehouseVisible = ref(false);
const view2ExhibitionVisible = ref(false);
//表单填写的内容
let form = reactive({
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
  warehouseId: '',
  containerId: ''
});
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
  textureType: ''
});

//处理编辑操作
let idx: number = -1;
//获取当前系统时间
let time: string = "";
//打开编辑框
const handleEdit = (index: number, row: any) => {
  //将目前表格中的内容先同步到编辑框内
  form.area = row.area;
  form.collectInfo = {
    collectionId: row.collectInfo.collectionId,
    source: row.collectInfo.source,
    collectMuseum: row.collectInfo.collectMuseum,
    generalRegistrationId: row.collectInfo.generalRegistrationId,
    collectTime: row.collectInfo.collectTime,
    collectionLevel: row.collectInfo.collectionLevel
  };
  form.collectionId = row.collectionId;
  form.collectionPhoto = row.collectionPhoto;
  form.collectionType = row.collectionType;
  form.completeness = row.completeness;
  form.completenessType = row.completenessType;
  form.dimensionInfo = {
    collectionId: row.dimensionInfo.collectionId,
    dimension: row.dimensionInfo.dimension,
    dimensionUnit: row.dimensionInfo.dimensionUnit,
    weight: row.dimensionInfo.weight,
    weightUnit: row.dimensionInfo.weightUnit,
    realQuantity: row.dimensionInfo.realQuantity,
    traditionalQuantity: row.dimensionInfo.traditionalQuantity
  };
  form.era = row.era;
  form.identificationComments = row.identificationComments;
  form.identificationDate = row.identificationDate;
  form.identificationStaffName = row.identificationStaffName;
  form.name = row.name;
  form.remark = row.remark;
  form.storageInfo = {
    currentStatus: row.storageInfo.currentStatus,
    protectionLevel: row.storageInfo.protectionLevel
  };
  form.originalName = row.originalName;
  form.textureType = row.textureType;
  form.exhibitionHallId = row.exhibitionHallId;
  form.warehouseId = row.warehouseId;
  form.containerId=row.containerId;
  editVisible.value = true;
  idx = index
};

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
  viewVisible.value = true;
};

const handleDetails2Exhibition = (index: number, row: any) => {
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
  view2ExhibitionVisible.value = true;
  print.time=getCurrentTime();
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
  print.time=getCurrentTime();
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

//将数据上传到数据库中
const uploadData = async () => {
  console.log(tableData.value[idx])
  try {

    const response= await axiosInstance.put('/Collections/' + tableData.value[idx].collectionId, tableData.value[idx]);
    //const response = await axios.put('http://42.192.39.198:5000/api/Collections/' + tableData.value[idx].collectionId, tableData.value[idx]);
    ElMessage.success('数据上传成功');
    getData();
  } catch (error) {
    ElMessage.error('数据上传失败');
  }
};

let radio = ref(3);
//存储编辑的内容
const saveEdit = async () => {
  editVisible.value = false;
  //遇事不决console.log
  console.log('saveEdit')
  console.log(tableData.value[idx].collectionId)
  console.log(radio)
  // ElMessage.success(`修改第 ${idx + 1} 行成功`);
  tableData.value[idx].name = form.name;        //将修改的文物姓名同步到表格当中
  tableData.value[idx].collectionType = form.collectionType;        //将修改的文物的种类同步到表格当中
  tableData.value[idx].era = form.era;          //将修改的文物的朝代同步到表格当中
  // tableData.value[idx].status = form.status;      //将修改的文物的状态同步到表格当中
  // tableData.value[idx].hall_name = form.hall_name;      //将修改的文物的展厅名称同步到表格当中
  if (radio.value == 1) {
    tableData.value[idx].storageInfo.currentStatus = "在展";
    tableData.value[idx].exhibitionHallId = form.exhibitionHallId;
  }
  else if (radio.value == 2) {
    tableData.value[idx].storageInfo.currentStatus = "在库";
    tableData.value[idx].warehouseId = form.warehouseId;
    tableData.value[idx].containerId = form.containerId;
  }
  else if (radio.value == 3)
    tableData.value[idx].storageInfo.currentStatus = "待鉴定";
  else if (radio.value == 4)
    tableData.value[idx].storageInfo.currentStatus = "修缮中";

  radio.value = 3;

  tableData.value[idx].storageInfo.protectionLevel = form.storageInfo.protectionLevel;
  tableData.value[idx].textureType = form.textureType;
  tableData.value[idx].area = form.area;
  tableData.value[idx].collectInfo.source = form.collectInfo.source;
  tableData.value[idx].completeness = form.completeness;
  tableData.value[idx].dimensionInfo.dimension = form.dimensionInfo.dimension;
  tableData.value[idx].dimensionInfo.weight = form.dimensionInfo.weight;
  tableData.value[idx].dimensionInfo.traditionalQuantity = form.dimensionInfo.traditionalQuantity;
  tableData.value[idx].dimensionInfo.realQuantity = form.dimensionInfo.realQuantity;
  tableData.value[idx].identificationComments = form.identificationComments
  tableData.value[idx].remark = form.remark
  console.log(tableData.value);

  // Update frontend table data
  // tableData.value[idx] = updatedData;
  ElMessage.success(`修改第 ${idx + 1} 行成功`);  //弹出弹窗提示用户修改成功
  uploadData();

};
//关闭“查看详细信息”的弹窗
const closeView = () => {
  viewVisible.value = false;                    //editVisible.value被用来控制编辑界面或对话框的显示与隐藏
};
const closeView2Warehouse = () => {
  view2WarehouseVisible.value = false;                    //editVisible.value被用来控制编辑界面或对话框的显示与隐藏
};
const closeView2Exhibition = () => {
  view2ExhibitionVisible.value = false;                    //editVisible.value被用来控制编辑界面或对话框的显示与隐藏
};

// 文物种类下拉菜单的属性
interface TypeSelectItem {
  value: string
  index: number
}
const toSelectType = ref<TypeSelectItem[]>([])

//搜索符合条件的选项
const typeQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectType.value.filter(typeCreateFilter(queryString))
      : toSelectType.value
  cb(results)
}
const typeCreateFilter = (queryString: string) => {
  return (restaurant: TypeSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const typeLoadAll = () => {
  return [
    { value: '石器', index: 1 },
    { value: '陶器', index: 2 },
    { value: '石刻、造像', index: 3 },
    { value: '骨角器', index: 4 },
    { value: '俑', index: 5 },
    { value: '铜器', index: 6 },
    { value: '铁器', index: 7 },
    { value: '银器', index: 8 },
    { value: '金器', index: 9 },
    { value: '其他金属器（锡、铅等）', index: 10 },
    { value: '瓷器', index: 11 },
    { value: '玉器', index: 12 },
    { value: '宝石', index: 13 },
    { value: '珐琅', index: 14 },
    { value: '紫砂', index: 15 },
    { value: '玻璃器', index: 16 },
    { value: '书画', index: 17 },
    { value: '图书、文献', index: 18 },
    { value: '甲骨、简牍', index: 19 },
    { value: '文房用具', index: 20 },
    { value: '铭刻、印章、符牌', index: 21 },
    { value: '货币、票据', index: 22 },
    { value: '织绣', index: 23 },
    { value: '竹、木、匏、核、漆器', index: 24 },
    { value: '民间艺术品', index: 25 },
    { value: '家具', index: 26 },
    { value: '仪器、仪表', index: 27 },
    { value: '生产机械', index: 28 },
    { value: '建筑资料', index: 29 },
    { value: '化石', index: 30 },
    { value: '其他', index: 31 },
  ]
}

//处理选择的项，比如说给一个东西赋值
const typeHandleSelect = (item: TypeSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectType.value = typeLoadAll()
})

interface protectLevelSelectItem {
  value: string
  index: number
}
const toSelectprotectLevel = ref<protectLevelSelectItem[]>([])

//搜索符合条件的选项
const protectLevelQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectprotectLevel.value.filter(protectLevelCreateFilter(queryString))
      : toSelectprotectLevel.value
  cb(results)
}
const protectLevelCreateFilter = (queryString: string) => {
  return (restaurant: protectLevelSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const protectLevelLoadAll = () => {
  return [
    { value: '一级', index: 1 },
    { value: '二级', index: 2 },
    { value: '三级', index: 3 },
  ]
}
//处理选择的项，比如说给一个东西赋值
const protectLevelSelect = (item: protectLevelSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectprotectLevel.value = protectLevelLoadAll()
})



interface levelSelectItem {
  value: string
  index: number
}
const toSelectlevel = ref<levelSelectItem[]>([])

//搜索符合条件的选项
const levelQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectlevel.value.filter(levelCreateFilter(queryString))
      : toSelectlevel.value
  cb(results)
}
const levelCreateFilter = (queryString: string) => {
  return (restaurant: levelSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const levelLoadAll = () => {
  return [
    { value: '一级', index: 1 },
    { value: '二级', index: 2 },
    { value: '三级', index: 3 },
  ]
}
//处理选择的项，比如说给一个东西赋值
const levelSelect = (item: levelSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectlevel.value = levelLoadAll()
})


const size = ref('')

// 文物时期下拉菜单的属性
interface EraSelectItem {
  value: string
  index: number
}
const toSelectEra = ref<EraSelectItem[]>([])

//搜索符合条件的选项
const eraQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectEra.value.filter(eraCreateFilter(queryString))
      : toSelectEra.value
  cb(results)
}
const eraCreateFilter = (queryString: string) => {
  return (restaurant: TypeSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const EraloadAll = () => {
  return [
    { value: '史前文明', index: 1 },
    { value: '夏代', index: 2 },
    { value: '商代', index: 3 },
    { value: '周代', index: 4 },
    { value: '春秋战国', index: 5 },
    { value: '秦代', index: 6 },
    { value: '汉代', index: 7 },
    { value: '三国', index: 8 },
    { value: '魏晋南北朝', index: 9 },
    { value: '隋代', index: 10 },
    { value: '唐代', index: 11 },
    { value: '五代十国', index: 12 },
    { value: '宋代', index: 13 },
    { value: '元代', index: 14 },
    { value: '明代', index: 15 },
    { value: '清代', index: 16 },
    { value: '民国', index: 17 },
  ];
};

//处理选择的项，比如说给一个东西赋值
const eraHandleSelect = (item: EraSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectEra.value = EraloadAll()
})

interface textureSelectItem {
  value: string
  index: number
}
const toSelecttexture = ref<textureSelectItem[]>([])

//搜索符合条件的选项
const textureQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelecttexture.value.filter(textureCreateFilter(queryString))
      : toSelecttexture.value
  cb(results)
}
const textureCreateFilter = (queryString: string) => {
  return (restaurant: textureSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const textureloadAll = () => {
  return [
    { value: '无机质类', index: 1 },
    { value: '有机质类', index: 2 },
    { value: '复合材料类', index: 3 },
    { value: '组合材料类', index: 4 },
  ]
}

//处理选择的项，比如说给一个东西赋值
const textureHandleSelect = (item: textureSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelecttexture.value = textureloadAll()
})

interface weightUnitSelectItem {
  value: string
  index: number
}
const toSelectweightUnit = ref<weightUnitSelectItem[]>([])

//搜索符合条件的选项
const weightUnitQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectweightUnit.value.filter(weightUnitCreateFilter(queryString))
      : toSelectweightUnit.value
  cb(results)
}
const weightUnitCreateFilter = (queryString: string) => {
  return (restaurant: weightUnitSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const weightUnitloadAll = () => {
  return [
    { value: '克', index: 1 },
    { value: '千克', index: 2 },
    { value: '两', index: 3 },
  ]
}

//处理选择的项，比如说给一个东西赋值
const weightUnitHandleSelect = (item: weightUnitSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectweightUnit.value = weightUnitloadAll()
})


interface sourceSelectItem {
  value: string
  index: number
}
const toSelectsource = ref<sourceSelectItem[]>([])

//搜索符合条件的选项
const sourceQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectsource.value.filter(sourceCreateFilter(queryString))
      : toSelectsource.value
  cb(results)
}
const sourceCreateFilter = (queryString: string) => {
  return (restaurant: sourceSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const sourceloadAll = () => {
  return [
    { value: '旧藏', index: 1 },
    { value: '拨交', index: 2 },
    { value: '移交', index: 3 },
    { value: '交换', index: 4 },
    { value: '拣选', index: 5 },
    { value: '捐赠', index: 6 },
    { value: '收购', index: 7 },
    { value: '征集', index: 8 },
    { value: '采集', index: 9 },
    { value: '发掘', index: 10 },
    { value: '寄存', index: 11 },
    { value: '制作', index: 12 },
    { value: '其他', index: 13 }
  ]
}

//处理选择的项，比如说给一个东西赋值
const sourceHandleSelect = (item: sourceSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectsource.value = sourceloadAll()
})

interface completenessTypeSelectItem {
  value: string
  index: number
}
const toSelectcompletenessType = ref<completenessTypeSelectItem[]>([])

//搜索符合条件的选项
const completenessTypeQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectcompletenessType.value.filter(completenessTypeCreateFilter(queryString))
      : toSelectcompletenessType.value
  cb(results)
}
const completenessTypeCreateFilter = (queryString: string) => {
  return (restaurant: completenessTypeSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const completenessTypeloadAll = () => {
  return [
    { value: '完', index: 1 },
    { value: '残', index: 2 },
    { value: '缺', index: 3 },
    { value: '失', index: 4 },
  ]
}

//处理选择的项，比如说给一个东西赋值
const completenessTypeHandleSelect = (item: sourceSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectcompletenessType.value = completenessTypeloadAll()
})

interface traditionalQuantityUnitSelectItem {
  value: string
  index: number
}
const toSelecttraditionalQuantityUnit = ref<traditionalQuantityUnitSelectItem[]>([])

//搜索符合条件的选项
const traditionalQuantityUnitQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelecttraditionalQuantityUnit.value.filter(traditionalQuantityUnitCreateFilter(queryString))
      : toSelecttraditionalQuantityUnit.value
  cb(results)
}
const traditionalQuantityUnitCreateFilter = (queryString: string) => {
  return (restaurant: traditionalQuantityUnitSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const traditionalQuantityUnitloadAll = () => {
  return [
    { value: '个', index: 1 },
    { value: '副', index: 2 },
    { value: '套', index: 3 },
    { value: '对', index: 4 },
    { value: '封', index: 5 },
    { value: '只', index: 6 },
    { value: '件', index: 7 }, //默认
    { value: '双', index: 8 }
  ]
}

//处理选择的项，比如说给一个东西赋值
const traditionalQuantityUnitHandleSelect = (item: sourceSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelecttraditionalQuantityUnit.value = traditionalQuantityUnitloadAll()
})

interface realQuantityUnitSelectItem {
  value: string
  index: number
}
const toSelectrealQuantityUnit = ref<realQuantityUnitSelectItem[]>([])

//搜索符合条件的选项
const realQuantityUnitQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectrealQuantityUnit.value.filter(realQuantityUnitCreateFilter(queryString))
      : toSelectrealQuantityUnit.value
  cb(results)
}
const realQuantityUnitCreateFilter = (queryString: string) => {
  return (restaurant: realQuantityUnitSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const realQuantityUnitloadAll = () => {
  return [
    { value: '个', index: 1 },
    { value: '副', index: 2 },
    { value: '套', index: 3 },
    { value: '对', index: 4 },
    { value: '封', index: 5 },
    { value: '只', index: 6 },
    { value: '件', index: 7 }, //默认
    { value: '双', index: 8 }
  ]
}

//处理选择的项，比如说给一个东西赋值
const realQuantityUnitHandleSelect = (item: sourceSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectrealQuantityUnit.value = realQuantityUnitloadAll()
})

interface dimensionUnitSelectItem {
  value: string
  index: number
}
const toSelectdimensionUnit = ref<dimensionUnitSelectItem[]>([])

//搜索符合条件的选项
const dimensionUnitQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? toSelectdimensionUnit.value.filter(dimensionUnitCreateFilter(queryString))
      : toSelectdimensionUnit.value
  cb(results)
}
const dimensionUnitCreateFilter = (queryString: string) => {
  return (restaurant: dimensionUnitSelectItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

//可选择的选项
const dimensionUnitloadAll = () => {
  return [
    { value: '毫米', index: 1 },//默认
    { value: '厘米', index: 2 },
    { value: '米', index: 3 },
  ]
}

//处理选择的项，比如说给一个东西赋值
const dimensionUnitHandleSelect = (item: sourceSelectItem) => {
  console.log(item)
}

onMounted(() => {
  toSelectdimensionUnit.value = dimensionUnitloadAll()
})



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
.my-message-box {
  /* 自定义样式 */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
