export function move(agv, name, src, dest, pos, t) {
  const srcX = Number(src.x)
  const srcY = Number(src.y)
  const srcZ = Number(src.z)
  const destX = Number(dest.x)
  const destY = Number(dest.y)
  const destZ = Number(dest.z)
  if (srcX === destX && srcY !== destY && srcZ === destZ) {
    if (srcY - destY === 1) {
      preMoveFront(agv, pos, t)
    } else if (srcY - destY === -1) {
      preMoveBehind(agv, pos, t)
    }
  } else if (srcX !== destX && srcY === destY && srcZ === destZ) {
    if (srcX - destX === 1) {
      preMoveRight(agv, pos, t)
    } else if (srcX - destX === -1) {
      preMoveLeft(agv, pos, t)
    }
  } else if (srcX === destX && srcY === destY && srcZ !== destZ) {
    // // if (srcZ - destZ === 1) {
    // //   // elevator move to same layer and agv move to elevator, elevator move DOWN
    // //   // with agv and bin, agv move to destZ
    // // } else if (srcZ - destZ === -1) {
    // //   // elevator move to same layer and agv move to elevator, elevator move UP
    // //   // with agv and bin, agv move to destZ
    // // }
    // // 有上下移动
    // console.log('上下移动')
    //
    // // 1.移动elevator到起点所在层
    // window.moveElevatorTo(src)
    //
    // // 2.移动agv到elevator上
    // window.setAGVOnElevator(agv)
    //
    // // 3.移动elevator到终点所在层
    // window.moveElevatorTo(dest)
    //
    // // 4.将agv和bin从elevator上卸载
    // window.unloadAGVAndBin(agv)
    //
    // // 5.移动agv到终点
    // window.setAGVCoord(agv, name, dest)
    // // window.setBinCoord(dest)
  }
}
export function preMoveFront(agv, pos, tween) {
  let rank = pos.rank
  const column = pos.column
  const layer = pos.layer
  rank = rank - 1 < 1 ? 1 : (rank - 1 / 2) // 因为是预判，所以只移动一半距离，当小车真正到达下一个点时才更新位置
  moveAGV(agv, column, layer, rank, tween)
}
export function preMoveBehind(agv, pos, tween, stickNumber) {
  let rank = pos.rank
  const column = pos.column
  const layer = pos.layer
  rank = rank + 1 > stickNumber - 1 ? stickNumber - 1 : rank + 1 / 2
  moveAGV(agv, column, layer, rank, tween)
}

export function preMoveLeft(agv, pos, tween, rackNumber) {
  const rank = pos.rank
  let column = pos.column
  const layer = pos.layer
  column = column + 1 > rackNumber ? rackNumber : column + 1 / 2
  moveAGV(agv, column, layer, rank, tween)
}

export function preMoveRight(agv, pos, tween) {
  const rank = pos.rank
  let column = pos.column
  const layer = pos.layer
  column = column - 1 < 1 ? 1 : column - 1 / 2
  moveAGV(agv, column, layer, rank, tween)
}

function moveAGV(agv, column, layer, rank, tween) {
  tween.to(window.getAGVPosition(column, layer, rank), 5000)
    .onComplete(() => {})
    .start()
}
