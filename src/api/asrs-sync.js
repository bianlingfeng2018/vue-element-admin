import request from '@/utils/request'

export function queryVehiclesState(data) {
  return request({
    url: '/vehicles-state',
    method: 'get',
    params: data
  })
}
