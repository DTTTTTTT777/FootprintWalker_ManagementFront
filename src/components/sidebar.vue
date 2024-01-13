<template>
  <div class="sidebar">
    <el-menu 
            class="sidebar-el-menu"
            :default-active="onRoutes"
            :collapse="sidebar.collapse"
            unique-opened
            router>
      <template v-for="item in items">
        <template v-if="item.subs">
          <el-sub-menu :index="item.index" :key="item.index" v-permiss="item.permiss">
            <template #title>
              <el-icon>
                <component :is="item.icon"></component>
              </el-icon>
              <span>{{ item.title }}</span>
            </template>
            <template v-for="subItem in item.subs">
              <el-sub-menu
                  v-if="subItem.subs"
                  :index="subItem.index"
                  :key="subItem.index"
                  v-permiss="item.permiss"
              >
                <template #title>{{ subItem.title }}</template>
                <el-menu-item v-for="(threeItem, i) in subItem.subs" :key="i" :index="threeItem.index">
                  {{ threeItem.title }}
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item v-else :index="subItem.index" v-permiss="item.permiss">
                {{ subItem.title }}
              </el-menu-item>
            </template>
          </el-sub-menu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index" v-permiss="item.permiss">
            <el-icon>
              <component :is="item.icon"></component>
            </el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useSidebarStore} from '@/store/sidebar';
import {useRoute} from 'vue-router';

const items = [

  {
    icon: 'Odometer',
    index: '/announcement_system',
    title: '公告板块',
    // permiss: ['User']
    subs: [
      {
        index: '/notification',
        title: '通知',
        // permiss: ['Archaeologist'],
      },
      {
        index: '/file_management',
        title: '文件管理',
        // permiss: ['Archaeologist'],
      },
    ]
  },
  {
    icon: 'Calendar',
    title: '财务板块',
    index: '/finance_system',
    subs: [
      {
        index: '/finance_management',
        title: '财务信息管理',
        // permiss: ['Archaeologist'],
      },
      {
        index: '/reimbursement_management',
        title: '报销处理',
        // permiss: ['Archaeologist'],
      },
      // {
      //   index: '/reimbursement_apply',
      //   title: '报销申请',
      //   // permiss: ['Archaeologist'],
      // },
      {
        index: '/my_reimbursement_apply',
        title: '我的报销申请',
        // permiss: ['Archaeologist'],
      },
    ]
  },


  {
    icon: 'goods',
    index: '/activity_system',
    title: '活动管理',
    // permiss: ['CollectionManager','Archaeologist','CollectionResearcher'],
    subs: [
      {
        index: '/activity_add',
        title: '新增活动',
        // permiss: ['Archaeologist'],
      },
      {
        index: '/activity_management',
        title: '活动管理',
        // permiss: ['CollectionManager'],
      },
      {
        index: '/activity_reflextion',
        title: '活动推送管理',
        // permiss: ['CollectionRepair'],
      },
      {
        index: '/activity_reimbursement',
        title: '活动审核',
        // permiss: ['CollectionRepair'],
      },
      
    ],
  },
  {
    icon:'User',
    index: '/Human_Management',
    title: '人事管理',
    // permiss: ['StaffAdmin'],
  },
  // {
  //   icon: 'more',
  //   index: '2',
  //   title: '展厅',
  //   // permiss: ['ExhibitionHallAdmin','SystemAdmin'],
  //   subs: [
  //     {
  //       index: '/table',
  //       title: '展厅信息',
  //       // permiss: ['ExhibitionHallAdmin','SystemAdmin'],
  //     },
  //     {
  //       index: '/collections',
  //       title: '展品详情',
  //       // permiss: ['ExhibitionHallAdmin',"SystemAdmin"],
  //     },
  //
  //   ],
  // },
  // {
  //   icon: 'lock',
  //   index:'storage',
  //   title:'仓库管理',
  //   // permiss:['WarehouseAdmin',"SystemAdmin"],
  // },
  // {
  //   icon: 'Calendar',
  //   index: '3',
  //   title: '日常信息',
  //   // permiss: ["RoutineAdmin", "SystemAdmin"],
  //   subs:[
  //     {
  //       index: '/activity',
  //       title: '活动',
  //       // permiss: ['RoutineAdmin',"SystemAdmin"],
  //     },
  //     {
  //       index: '/statistics',
  //       title: '门票信息',
  //       // permiss: ["RoutineAdmin", "SystemAdmin"],
  //     }
  //   ]
  // },
  // {
  //   icon:'EditPen',
  //   index:'/feedbacks',
  //   title:'反馈信息管理',
  //   // permiss: ["FeedbackAdmin", "SystemAdmin"],
  // },
  // {
  //   icon:'Present',
  //   index:'/products',
  //   title:'文创产品信息管理',
  //   // permiss:['ProductAdmin',"SystemAdmin"],
  // },
  //
  // {
  //   icon: "rank",
  //   index: "/ccard",
  //   title: "个人中心",
  //   // permiss: ['User',"SystemAdmin"],
  // },
 
];

const route = useRoute();
const onRoutes = computed(() => {
  return route.path;
});

const sidebar = useSidebarStore();
</script>

<style scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 0;
  top: 70px;
  bottom: 0;
  overflow-y: scroll;
}

.sidebar::-webkit-scrollbar {
  width: 0;
}

.sidebar-el-menu:not(.el-menu--collapse) {
  width: 250px;
}

.sidebar > ul {
  height: 100%;
}

/* 设置一级菜单和二级菜单的背景颜色 */
.el-sub-menu .el-menu-item {
  background-color: #f1f3fe !important;
}
/* 设置选鼠标指针浮动在一级菜单的设置 */
.el-menu-item:hover{
  background-color: #f1f3fe !important;;
}
/* 设置当前被选中的一级菜单 */
.el-menu-item.is-active {  
  color: #fff !important;  
  background: rgb(137, 139, 165) !important;  
}  
</style>
