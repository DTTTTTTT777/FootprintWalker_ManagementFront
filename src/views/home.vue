<template>
  <Header />
  <Sidebar />
  <div class="content-box" :class="{ 'content-collapse': sidebarStatus.collapse }">
    <Tags/>
    <div class="content">
      <router-view v-slot="{ Component }">
        <transition name="move" mode="out-in">
          <!--<keep-alive :include="tags.nameList">-->
            <div :key="$route.path">
              <component :is="Component"></component>
            </div>
          <!--</keep-alive>-->
        </transition>
      </router-view>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSidebarStore } from '../store/sidebar';
import { useTagsStore } from '../store/tags';
import Header from '../components/header.vue';
import Sidebar from '../components/sidebar.vue';
import Tags from '../components/tags.vue';

const sidebarStatus = useSidebarStore();
const tagsStatus = useTagsStore();
</script>
