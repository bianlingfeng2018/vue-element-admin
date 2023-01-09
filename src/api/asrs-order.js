import request from '@/utils/request'

export function testapi(data) {
  return request({
    url: '/test/hello',
    method: 'get',
    params: data
  })
}
