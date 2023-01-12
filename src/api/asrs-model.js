import request from '@/utils/request'

export function queryPointList(data) {
  return request({
    url: '/model-points',
    method: 'get',
    params: data
  })
}
