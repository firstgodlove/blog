import request from '@/utils/request'

/**
 * 上传文件
 */
export function uploadFileApi(data) {
  return request({
    url: `/file/upload`,
    method: 'post',
    data
  })
} 

/**
 * 删除文件
 */
export function deleteFileApi(url) {
  return request({
    url: `/file/delete`,
    method: 'get',
    params: {
      url
    }
  })
}