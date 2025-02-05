import request from '@/utils/request'

// 获取说说列表
export function getMoments(params) {
  return request({
    url: '/moments',
    method: 'get',
    params
  })
}

// 发布说说
export function publishMoment(data) {
  return request({
    url: '/moments',
    method: 'post',
    data
  })
}

// 点赞说说
export function likeMoment(id) {
  return request({
    url: `/moments/${id}/like`,
    method: 'post'
  })
}

// 评论说说
export function commentMoment(id, data) {
  return request({
    url: `/moments/${id}/comments`,
    method: 'post',
    data
  })
}

// 上传图片
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 