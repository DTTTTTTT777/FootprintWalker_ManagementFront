export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function joinCampuses(campuses) {
  const campusNames = {
    'SIPING': '四平路校区',
    'JIADING': '嘉定校区',
    'HUXI': '沪西校区',
    'HUBEI': '沪北校区',
    // 添加其他校区的映射
  };
  return campuses.map(campus => campusNames[campus] || campus).join(', ');
}


export function formatActivityStatus(status) {
  // 格式化活动状态
  const statusMap = {
    PUBLISHED: '已发布',
    DRAFT: '草稿',
    PENDING_REVIEW: '待审核',
    RETROSPECTIVE: '往期回顾',
    REJECTED : '已驳回',
  };
  return statusMap[status] || status;
}

export function getStatusType(status) {
  switch (status) {
    case 'PUBLISHED':
      return 'success'; // 绿色
    case 'DRAFT':
      return 'info'; // 蓝色
    case 'PENDING_REVIEW':
      return 'warning'; // 黄色
    case 'REJECTED':
      return 'danger'; // 红色
    case 'RETROSPECTIVE':
      return 'primary'; // 淡蓝色
    default:
      return 'default'; // 默认灰色
  }
}
