<template>
  <div class="upload-section">
    <el-form-item label="活动图片" prop="adImages">
      <el-upload
          v-model:file-list="fileList"
          class="upload-demo"
          :action="uploadUrl"
          name="smfile"
          :headers="uploadHeaders"
          :on-success="handleSuccess"
          :on-error="handleError"
          :before-upload="beforeUpload"
          :limit="10"
          :on-exceed="handleExceed"
          list-type="picture-card"
          prop="proofInfo">
        <i class="el-icon-plus"></i>
      </el-upload>
      <div class="image-preview" v-if="fileList.length > 0">
        <el-image
            v-for="(file, index) in fileList"
            :key="index"
            class="collection-img"
            :src="file.url"
            :fit="'cover'">
        </el-image>
      </div>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'ImageUpload',
  props: {
    uploadUrl: {
      type: String,
      default: '/foreignImage/upload'
    },
    uploadHeaders: {
      type: Object,
      default: () => ({ Authorization: 'kydXBqSSWZNb12Q25q6OmXGGSKwajXXk' })
    },
    initialFiles: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      fileList: this.initialFiles
    };
  },
  methods: {
    handleSuccess(response, file, fileList) {
      // 处理上传成功的逻辑
    },
    handleError(err, file, fileList) {
      // 处理上传错误的逻辑
    },
    beforeUpload(file) {
      // 上传之前的钩子函数
    },
    handleExceed(files, fileList) {
      // 文件超出限制时的钩子函数
    }
  }
};
</script>

<style scoped>
.upload-section {
  /* 样式 */
}

.collection-img {
  /* 图片样式 */
}
</style>
