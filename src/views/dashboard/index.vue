<template>
  <div class="dashboard-container" style="position:relative;">
    <!--    <component :is="currentRole" />-->
    <div class="webgl-container">
      <div
        id="webglDom"
        ref="webglDom"
      />
    </div>
    <el-card class="box-card" shadow="never" style="position: absolute; left: 10px; top: 10px; border: none; background: transparent">
      <el-button-group style="opacity: 0.7">
        <el-button type="default" icon="el-icon-edit" @click="handleSimControl()">仿真控制</el-button>
        <el-button type="default" icon="el-icon-share" @click="handleCreateOrder()">创建任务</el-button>
        <el-button type="default" icon="el-icon-refresh" @click="refresh()">刷新</el-button>
      </el-button-group>
    </el-card>

    <el-drawer
      title="我是标题"
      :visible.sync="drawer"
      :direction="direction"
    >
      <span>我来啦!</span>
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import adminDashboard from './admin'
// import editorDashboard from './editor'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import {
  getAmbientLight, getBase, getBin, getBoard,
  getCamera, getControl, getConveyor, getDirectLight,
  getFloor, getHouse, getRack, getRackGroup,
  getRenderer, getScene, getShuttle, getStick
} from '@/views/dashboard/js/Common'

export default {
  name: 'Dashboard',
  // components: { adminDashboard, editorDashboard },
  data() {
    return {
      currentRole: 'adminDashboard',
      // 抽屉
      drawer: false,
      direction: 'ltr'
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  created() {
  },
  mounted() {
    this.$nextTick(this.init)
  },
  methods: {
    // 工具
    handleSimControl() {

    },
    handleCreateOrder() {

    },
    refresh() {
      this.$router.go(0)
    },
    // 抽屉
    // handleClose(done) {
    //   this.$confirm('确认关闭？')
    //     .then(_ => {
    //       done()
    //     })
    //     .catch(_ => {})
    // },
    init() {
      // 变量
      const debug = true
      let modelLoaded = false
      let canMoveByCircle = true

      //
      let fraction = 0
      const upRGV = new THREE.Vector3(1, 0, 0)
      const upTestBin = new THREE.Vector3(0, 0, 1)
      const axis = new THREE.Vector3()

      // 创建场景
      const scene = getScene(THREE)
      const camera = getCamera(THREE)
      const renderer = getRenderer(THREE)
      document.getElementById('webglDom').appendChild(renderer.domElement)

      // controls
      const controls = getControl(new OrbitControls(camera, renderer.domElement))

      // lights
      const directLight1 = getDirectLight(THREE, 200, 200, 200)
      const directLight2 = getDirectLight(THREE, -200, 200, -200)
      scene.add(directLight1)
      scene.add(directLight2)
      const ambientLight = getAmbientLight(THREE)
      scene.add(ambientLight)

      // 纹理
      const rackTxLoader = new THREE.TextureLoader()
      const rackTx = rackTxLoader.load('/static/textures/rack_board.jpg')
      const binTx = rackTxLoader.load('/static/textures/bin.png')
      const stickTx = rackTxLoader.load('/static/textures/stick.png')

      // 地板
      const floorWidth = 800
      const floorHeight = 400
      const floorMesh = getFloor(THREE, floorWidth, floorHeight)
      scene.add(floorMesh)

      // 库区
      const houseVisible = false
      const houseWidth = 400
      const houseHeight = 200
      const houseDepth = 400
      const houseMesh = getHouse(THREE, houseVisible, houseWidth, houseHeight, houseDepth)
      scene.add(houseMesh)

      // 货架组
      const rackGroupVisible = false
      const rackVisible = false
      const heightInterval = 50
      const depthInterval = 50
      const rackNumber = 5
      const boardNumber = 5
      const stickNumber = 6

      const rackWidth = 50
      const rackHeight = (boardNumber - 1) * heightInterval
      const rackDepth = (stickNumber - 1) * depthInterval

      const boardWidth = rackWidth
      const boardHeight = 2
      const boardDepth = rackDepth

      const stickD = 5

      const rackGroupMargin = 80
      const baseHeight = 10

      const rackGroupX = -(rackGroupMargin + rackWidth * rackNumber / 2)
      const rackGroupY = rackHeight / 2 + baseHeight
      const rackGroupZ = 0
      const rackGroupMesh = getRackGroup(THREE, rackGroupX, rackGroupY, rackGroupZ, rackGroupVisible, rackWidth * rackNumber, rackHeight, rackDepth)
      scene.add(rackGroupMesh)
      for (let i = 0; i < rackNumber; i++) {
        // 货架列
        const x = rackGroupMesh.position.x + rackWidth * rackNumber / 2 - rackWidth * (i + 1) + rackWidth / 2
        const y = rackGroupMesh.position.y
        const z = rackGroupMesh.position.z
        const rackMesh = getRack(THREE, x, y, z, rackVisible, rackWidth, rackHeight, rackDepth)
        scene.add(rackMesh)

        // 货架列内的层
        for (let j = 0; j < boardNumber; j++) {
          const x = rackMesh.position.x
          const y = j * heightInterval + baseHeight
          const z = rackMesh.position.z
          const boardMesh = getBoard(THREE, x, y, z, boardWidth, boardHeight, boardDepth, rackTx)
          scene.add(boardMesh)
        }

        // 货架列内的立杆
        for (let j = 0; j < stickNumber; j++) {
          addStick(rackMesh, rackWidth, rackHeight, rackDepth, stickD, j, depthInterval, 'left')
          addStick(rackMesh, rackWidth, rackHeight, rackDepth, stickD, j, depthInterval, 'right')
        }
      }

      // 提升机
      const elevatorWidth = 50
      const elevatorHeight = boardHeight
      const elevatorDepth = depthInterval
      const elevatorX = rackGroupMesh.position.x + rackWidth * rackNumber / 2 + 27.5
      const elevatorY = rackGroupMesh.position.y - rackHeight / 2
      const elevatorZ1 = rackGroupMesh.position.z + rackDepth / 2 - (1) * depthInterval + depthInterval / 2
      const elevatorZ2 = rackGroupMesh.position.z + rackDepth / 2 - (stickNumber - 1) * depthInterval + depthInterval / 2
      const elevatorMesh1 = getConveyor(THREE, elevatorX, elevatorY, elevatorZ1, elevatorWidth, elevatorHeight, elevatorDepth)
      const elevatorMesh2 = getConveyor(THREE, elevatorX, elevatorY, elevatorZ2, elevatorWidth, elevatorHeight, elevatorDepth)
      scene.add(elevatorMesh1)
      scene.add(elevatorMesh2)

      // 传送带
      const conveyorWidth = 100
      const conveyorHeight = boardHeight
      const conveyorDepth = depthInterval
      const conveyorX = rackGroupMesh.position.x + rackWidth * rackNumber / 2 + 106
      const conveyorY = rackGroupMesh.position.y - rackHeight / 2
      const conveyorZ1 = rackGroupMesh.position.z + rackDepth / 2 - (1) * depthInterval + depthInterval / 2
      const conveyorZ2 = rackGroupMesh.position.z + rackDepth / 2 - (stickNumber - 1) * depthInterval + depthInterval / 2
      const conveyorMesh1 = getConveyor(THREE, conveyorX, conveyorY, conveyorZ1, conveyorWidth + stickD, conveyorHeight, conveyorDepth + stickD)
      const conveyorMesh2 = getConveyor(THREE, conveyorX, conveyorY, conveyorZ2, conveyorWidth + stickD, conveyorHeight, conveyorDepth + stickD)
      scene.add(conveyorMesh1)
      scene.add(conveyorMesh2)

      // base
      const baseMesh1 = getBase(THREE,
        rackGroupMesh.position.x + rackWidth * rackNumber / 2,
        rackGroupMesh.position.y - rackHeight / 2 - baseHeight / 2,
        rackGroupMesh.position.z + rackDepth / 2,
        stickD, baseHeight, stickD)
      const baseMesh2 = getBase(THREE,
        rackGroupMesh.position.x + rackWidth * rackNumber / 2,
        rackGroupMesh.position.y - rackHeight / 2 - baseHeight / 2,
        rackGroupMesh.position.z - rackDepth / 2,
        stickD, baseHeight, stickD)
      const baseMesh3 = getBase(THREE,
        rackGroupMesh.position.x - rackWidth * rackNumber / 2,
        rackGroupMesh.position.y - rackHeight / 2 - baseHeight / 2,
        rackGroupMesh.position.z - rackDepth / 2,
        stickD, baseHeight, stickD)
      const baseMesh4 = getBase(THREE,
        rackGroupMesh.position.x - rackWidth * rackNumber / 2,
        rackGroupMesh.position.y - rackHeight / 2 - baseHeight / 2,
        rackGroupMesh.position.z + rackDepth / 2,
        stickD, baseHeight, stickD)
      const baseMesh5 = getBase(THREE,
        conveyorMesh1.position.x + conveyorWidth / 2,
        conveyorMesh1.position.y - baseHeight / 2,
        conveyorMesh1.position.z + depthInterval / 2,
        stickD, baseHeight, stickD)
      const baseMesh6 = getBase(THREE,
        conveyorMesh1.position.x + conveyorWidth / 2,
        conveyorMesh1.position.y - baseHeight / 2,
        conveyorMesh1.position.z - depthInterval / 2,
        stickD, baseHeight, stickD)
      const baseMesh7 = getBase(THREE,
        conveyorMesh1.position.x - conveyorWidth / 2,
        conveyorMesh1.position.y - baseHeight / 2,
        conveyorMesh1.position.z - depthInterval / 2,
        stickD, baseHeight, stickD)
      const baseMesh8 = getBase(THREE,
        conveyorMesh1.position.x - conveyorWidth / 2,
        conveyorMesh1.position.y - baseHeight / 2,
        conveyorMesh1.position.z + depthInterval / 2,
        stickD, baseHeight, stickD)
      const baseMesh9 = getBase(THREE,
        conveyorMesh2.position.x + conveyorWidth / 2,
        conveyorMesh2.position.y - baseHeight / 2,
        conveyorMesh2.position.z + depthInterval / 2,
        stickD, baseHeight, stickD)
      const baseMesh10 = getBase(THREE,
        conveyorMesh2.position.x + conveyorWidth / 2,
        conveyorMesh2.position.y - baseHeight / 2,
        conveyorMesh2.position.z - depthInterval / 2,
        stickD, baseHeight, stickD)
      const baseMesh11 = getBase(THREE,
        conveyorMesh2.position.x - conveyorWidth / 2,
        conveyorMesh2.position.y - baseHeight / 2,
        conveyorMesh2.position.z - depthInterval / 2,
        stickD, baseHeight, stickD)
      const baseMesh12 = getBase(THREE,
        conveyorMesh2.position.x - conveyorWidth / 2,
        conveyorMesh2.position.y - baseHeight / 2,
        conveyorMesh2.position.z + depthInterval / 2,
        stickD, baseHeight, stickD)
      scene.add(baseMesh1)
      scene.add(baseMesh2)
      scene.add(baseMesh3)
      scene.add(baseMesh4)
      scene.add(baseMesh5)
      scene.add(baseMesh6)
      scene.add(baseMesh7)
      scene.add(baseMesh8)
      scene.add(baseMesh9)
      scene.add(baseMesh10)
      scene.add(baseMesh11)
      scene.add(baseMesh12)

      // 环轨
      const v1 = new THREE.Vector3(100, 0, -100)
      const v2 = new THREE.Vector3(100, 0, 100)
      const v3 = new THREE.Vector3(300, 0, 100)
      const v4 = new THREE.Vector3(300, 0, -100)
      const v41_1 = new THREE.Vector3(290, 0, -200)
      const v41_2 = new THREE.Vector3(110, 0, -200)
      const v23_1 = new THREE.Vector3(110, 0, 200)
      const v23_2 = new THREE.Vector3(290, 0, 200)
      const railMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })

      const line1 = new THREE.CubicBezierCurve3(v4, v41_1, v41_2, v1)
      const line2 = new THREE.LineCurve3(v1, v2)
      const line3 = new THREE.CubicBezierCurve3(v2, v23_1, v23_2, v3)
      const line4 = new THREE.LineCurve3(v3, v4)
      const curvePath = new THREE.CurvePath()
      curvePath.curves.push(line1, line2, line3, line4)
      const curvePathGeometry = new THREE.BufferGeometry().setFromPoints(curvePath.getPoints(1000))
      const curvePathLine = new THREE.Line(curvePathGeometry, railMaterial)
      scene.add(curvePathLine)

      // 穿梭车
      const initColumn = 1; const initLayer = 1; const initRank = 1
      const shuttleW = 40
      const shuttleH = 5
      const shuttleD = 40
      // const shuttle1 = addShuttle(1, 1, 1, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, shuttleW, shuttleH, shuttleD)
      const testShuttle = addShuttle(initColumn, initLayer, initRank, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, shuttleW, shuttleH, shuttleD)

      // 货架上的货物
      const binD = 30
      // const bin1 = addBin(1, 1, 1, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH);
      // const bin2 = addBin(2, 2, 5, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH);

      // 入库、出库点堆积的货物
      const inputBinX = v4.x + 50
      const inputBinY1 = v4.y + binD / 2
      const inputBinZ1 = v4.z - binD / 2
      const binMeshInput1 = getBin(THREE, inputBinX, inputBinY1, inputBinZ1, binD, binD, binD, binTx)
      const inputBinZ2 = v4.z + binD / 2
      const binMeshInput2 = getBin(THREE, inputBinX, inputBinY1, inputBinZ2, binD, binD, binD, binTx)
      const inputBinY2 = v4.y + binD / 2 + binD
      const inputBinZ3 = v4.z
      const binMeshInput3 = getBin(THREE, inputBinX, inputBinY2, inputBinZ3, binD, binD, binD, binTx)
      scene.add(binMeshInput1)
      scene.add(binMeshInput2)
      scene.add(binMeshInput3)
      const inputBinZ4 = v3.z - binD / 2
      const binMeshOutput1 = getBin(THREE, inputBinX, inputBinY1, inputBinZ4, binD, binD, binD, binTx)
      const inputBinZ5 = v3.z + binD / 2
      const binMeshOutput2 = getBin(THREE, inputBinX, inputBinY1, inputBinZ5, binD, binD, binD, binTx)
      scene.add(binMeshOutput1)
      scene.add(binMeshOutput2)

      // 测试货物
      const testBinX = inputBinX
      const testBinY = inputBinY1
      const testBinZ = inputBinZ1
      const testBinMesh = getBin(THREE, 0, 0, 0, binD, binD, binD, binTx)
      updateObjPosition(testBinMesh, testBinX, testBinY, testBinZ)
      const testBinInitQuaternion = testBinMesh.quaternion.clone()
      scene.add(testBinMesh)

      // updateCurvePathPosition(testBinMesh, curvePath, 0, axis, upTestBin, testBinY);

      // 测试移动入库
      function testPuttingIn() {
        // 从传送带移动到提升机
        const firstTween = new TWEEN.Tween(
          {
            x: conveyorX,
            y: conveyorY + boardHeight / 2 + binD / 2,
            z: conveyorZ2
          })
          .to({
            x: elevatorX,
            y: elevatorY + boardHeight / 2 + binD / 2,
            z: elevatorZ2
          }, 2000)
          .onUpdate(function(coords) {
            testBinMesh.position.x = coords.x
            testBinMesh.position.y = coords.y
            testBinMesh.position.z = coords.z
          })
        // .easing(TWEEN.Easing.Linear.None)
        // .delay(100);

        // 提升机上升
        const secondTween = new TWEEN.Tween({ y: elevatorMesh2.position.y })
        secondTween.to({ y: elevatorY + heightInterval }, 2000)
          .onUpdate(function(coords) {
            elevatorMesh2.position.y = coords.y
          })
        // 货物上升
        const thirdTween = new TWEEN.Tween(testBinMesh.position)
        thirdTween.to({
          y: elevatorY + boardHeight / 2 + heightInterval + binD / 2
        }, 2000)
        // 穿梭车接货物
        const twn8 = new TWEEN.Tween(testShuttle.position).to(getPositionOfShuttle(
          1, 2, 5, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH), 2000)
        // 穿梭车移动到目的地
        const twn9 = new TWEEN.Tween(testShuttle.position).to(getPositionOfShuttle(
          1, 2, 4, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH), 2000)
        const twn10 = new TWEEN.Tween(testShuttle.position).to(getPositionOfShuttle(
          2, 2, 4, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH), 2000)
        const twn11 = new TWEEN.Tween(testShuttle.position).to(getPositionOfShuttle(
          3, 2, 4, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH), 2000)
        // 货物移动到目的地
        const fourthTween = new TWEEN.Tween(testBinMesh.position).to(getPositionOfBin(
          1, 2, 5, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH), 2000)
        const fifthTween = new TWEEN.Tween(testBinMesh.position).to(getPositionOfBin(
          1, 2, 4, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH), 2000)
        const sixTween = new TWEEN.Tween(testBinMesh.position).to(getPositionOfBin(
          2, 2, 4, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH), 2000)
        const seventhTween = new TWEEN.Tween(testBinMesh.position).to(getPositionOfBin(
          3, 2, 4, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH), 2000)

        firstTween.chain(secondTween)
        secondTween.onStart(function() {
          thirdTween.start()
        })
        thirdTween.chain(twn8)
        twn8.chain(fourthTween)
        fourthTween.onComplete(function() {
          twn9.start()
        })
        twn9.chain(twn10)
        twn10.chain(twn11)
        fourthTween.chain(fifthTween)
        fifthTween.chain(sixTween)
        sixTween.chain(seventhTween)

        firstTween.start()
      }

      //
      animate()

      // load model
      const loader = new GLTFLoader()
      let RGV
      const initF = 0.75
      loader.load('/static/models/agv/scene.gltf', function(gltf) {
        RGV = gltf.scene
        RGV.scale.set(0.05, 0.05, 0.05)
        RGV.position.set(100, 0, 0)
        scene.add(RGV)

        modelLoaded = true

        // 初始化RGV在环轨上的位置及方向
        updateCurvePathPosition(RGV, curvePath, initF, axis, upRGV, 0)
      }, undefined, function(error) {
        console.error(error)
      })

      // axes
      const axesHelper = new THREE.AxesHelper(1000)
      scene.add(axesHelper)

      // 监听窗口改变
      window.addEventListener('resize', onWindowResize)

      function animate() {
        if (debug) {
          if (modelLoaded && canMoveByCircle) {
            // 自动移动环形穿梭车
            fraction += 0.001
            // if (fraction > 1) fraction = 0;
            if (fraction < 0.3) {
              updateCurvePathPosition(RGV, curvePath, fraction, axis, upRGV, 0)
              updateCurvePathPosition(testBinMesh, curvePath, fraction, axis, upTestBin, testBinY + baseHeight)
            } else {
              canMoveByCircle = false
              testPuttingIn()
            }
          }
        }

        //
        requestAnimationFrame(animate)
        TWEEN.update()
        renderer.render(scene, camera)

        //
        controls.update()
      }

      function updateObjPosition(obj, x, y, z, q) {
        obj.position.x = x
        obj.position.y = y
        obj.position.z = z
        if (q != null) {
          obj.quaternion.copy(q)
        }
      }

      function updateCurvePathPosition(obj, curvePath, fraction, axis, up, yOffset) {
        if (fraction > 1) fraction = 0
        const newPosition = curvePath.getPoint(fraction)
        const tangent = curvePath.getTangent(fraction)
        newPosition.y = yOffset
        obj.position.copy(newPosition)
        axis.crossVectors(up, tangent).normalize()
        const radians = Math.acos(up.dot(tangent))
        obj.quaternion.setFromAxisAngle(axis, radians)
      }

      function addStick(rackMesh, rackWidth, rackHeight, rackDepth, stickD, j, numberDepth, side) {
        const stickHeight = rackHeight
        const x_ = rackMesh.position.x
        const y_ = rackMesh.position.y
        const z_ = rackMesh.position.z
        const x = side === 'left'
          ? x_ - rackWidth / 2
          : x_ + rackWidth / 2
        const y = y_
        const z = z_ + rackDepth / 2 - j * numberDepth
        const binMesh = getStick(THREE, stickD, stickHeight, x, y, z, stickTx)
        scene.add(binMesh)
      }

      function addShuttle(column, layer, rank, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, shuttleW, shuttleH, shuttleD) {
        const initX = rackGroupMesh.position.x + rackWidth * rackNumber / 2 - rackWidth * column + rackWidth / 2
        const initY = rackGroupMesh.position.y - heightInterval * (boardNumber - 1) / 2 + heightInterval * (layer - 1) + shuttleH / 2
        const initZ = rackGroupMesh.position.z + depthInterval * (stickNumber - 1) / 2 - depthInterval * rank + depthInterval / 2
        const shuttleMesh = getShuttle(THREE, initX, initY, initZ, shuttleW, shuttleH, shuttleD)
        scene.add(shuttleMesh)
        return shuttleMesh
      }

      // function addBin(column, layer, rank, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH) {
      //   const initX = rackGroupMesh.position.x + rackWidth * rackNumber / 2 - rackWidth * column + rackWidth / 2
      //   const initY = rackGroupMesh.position.y - heightInterval * (boardNumber - 1) / 2 + heightInterval * (layer - 1) + binD / 2 + shuttleH
      //   const initZ = rackGroupMesh.position.z + depthInterval * (stickNumber - 1) / 2 - depthInterval * rank + depthInterval / 2
      //   const binMesh = getBin(THREE, initX, initY, initZ, binD, binD, binD, binTx)
      //   scene.add(binMesh)
      //   return binMesh
      // }

      function getPositionOfBin(column, layer, rank, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH) {
        const initX = rackGroupMesh.position.x + rackWidth * rackNumber / 2 - rackWidth * column + rackWidth / 2
        const initY = rackGroupMesh.position.y - heightInterval * (boardNumber - 1) / 2 + heightInterval * (layer - 1) + binD / 2 + shuttleH
        const initZ = rackGroupMesh.position.z + depthInterval * (stickNumber - 1) / 2 - depthInterval * rank + depthInterval / 2
        return {
          x: initX,
          y: initY,
          z: initZ
        }
      }

      function getPositionOfShuttle(column, layer, rank, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH) {
        const initX = rackGroupMesh.position.x + rackWidth * rackNumber / 2 - rackWidth * column + rackWidth / 2
        const initY = rackGroupMesh.position.y - heightInterval * (boardNumber - 1) / 2 + heightInterval * (layer - 1) + shuttleH / 2
        const initZ = rackGroupMesh.position.z + depthInterval * (stickNumber - 1) / 2 - depthInterval * rank + depthInterval / 2
        return {
          x: initX,
          y: initY,
          z: initZ
        }
      }

      function onWindowResize() {
        camera.aspect = document.documentElement.clientWidth / document.documentElement.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight)
      }

      // Java调用Javascript
      let curF = initF
      let RGVRunning = false
      let timer
      let RGVLoaded = false
      let ElevatorLoaded = false
      let ElevatorLoadedShutter = false
      let ElevatorLoadedBin = false
      let ElevatorRunning = false
      window.onMoveForward = function onMoveForward() {
        if (RGVRunning) {
          clearInterval(timer)
          RGVRunning = false
        } else {
          timer = setInterval(function() {
            curF += 0.001
            if (curF >= 1.0) {
              curF = 0.0
            }
            updateCurvePathPosition(RGV, curvePath, curF, axis, upRGV, 0)
            if (RGVLoaded) {
              updateCurvePathPosition(testBinMesh, curvePath, curF, axis, upTestBin, testBinY + baseHeight)
            }
          }, 20)
          RGVRunning = true
        }
      }

      window.onMoveBack = function onMoveBack() {
        if (RGVRunning) {
          clearInterval(timer)
          RGVRunning = false
        } else {
          timer = setInterval(function() {
            curF -= 0.001
            if (curF <= 0.0) {
              curF = 1.0
            }
            updateCurvePathPosition(RGV, curvePath, curF, axis, upRGV, 0)
            if (RGVLoaded) {
              updateCurvePathPosition(testBinMesh, curvePath, curF, axis, upTestBin, testBinY + baseHeight)
            }
          }, 20)
          RGVRunning = true
        }
      }

      window.onLoadForRGV = function onLoadForRGV() {
        if (!RGVRunning) {
          console.log(RGV.quaternion)
          updateObjPosition(testBinMesh, RGV.position.x, testBinY + baseHeight, RGV.position.z, RGV.quaternion)
        }
        RGVLoaded = true
      }

      window.onUnloadForRGV = function onUnloadForRGV() {
        RGVLoaded = false
        updateObjPosition(testBinMesh, testBinX, testBinY, testBinZ, testBinInitQuaternion)
      }

      window.onUnloadToConveyorForRGV = function onUnloadToConveyorForRGV() {
        RGVLoaded = false
        const pos = {
          x: conveyorX,
          y: conveyorY + boardHeight / 2 + binD / 2,
          z: conveyorZ2
        }
        updateObjPosition(testBinMesh, pos.x, pos.y, pos.z, testBinInitQuaternion)
        const t1 = new TWEEN.Tween(pos)
          .to({
            x: elevatorX + elevatorWidth / 2 + binD / 2,
            y: elevatorY + boardHeight / 2 + binD / 2,
            z: elevatorZ2
          }, 2000)
          .onUpdate(function(coords) {
            testBinMesh.position.x = coords.x
            testBinMesh.position.y = coords.y
            testBinMesh.position.z = coords.z
          })
        // // 提升机上升
        // const t2 = new TWEEN.Tween({y: elevatorY});
        // t2.to({y: elevatorY + heightInterval}, 2000)
        //     .onUpdate(function (coords) {
        //         elevatorMesh2.position.y = coords.y
        //     })
        // // 货物上升
        // const t3 = new TWEEN.Tween(testBinMesh.position)
        // t3.to({
        //     y: elevatorY + boardHeight / 2 + heightInterval + binD / 2
        // }, 2000)
        // t1.chain(t2)
        // t2.onStart(function () {
        //     t3.start()
        // })
        t1.start()
      }

      // 提升机加载货物、卸载货物
      window.onLoadForElevator = function onLoadForElevator() {
        updateObjPosition(testBinMesh, elevatorMesh2.position.x, elevatorMesh2.position.y + boardHeight / 2 + binD / 2,
          elevatorMesh2.position.z, elevatorMesh2.quaternion)
        ElevatorLoaded = true
      }

      window.onUnloadForElevator = function onUnloadForElevator() {
        ElevatorLoaded = false
      }
      // 提升机上升、下降
      window.onElevatorUp = function() {
        if (ElevatorRunning) {
          console.log('ElevatorRunning, can not move up.')
          return
        }
        ElevatorRunning = true
        const curY = elevatorMesh2.position.y
        const targetY = elevatorMesh2.position.y + heightInterval
        const t = new TWEEN.Tween({ y: curY })
        t.to({ y: targetY }, 2000)
          .onUpdate(function(coords) {
            elevatorMesh2.position.y = coords.y
          })
        t.start()
        if (ElevatorLoaded) {
          new TWEEN.Tween(testBinMesh.position).to({ y: targetY + boardHeight / 2 + binD / 2 }, 2000).start()
        }
        if (ElevatorLoadedShutter && ElevatorLoadedBin) {
          new TWEEN.Tween(testBinMesh.position).to({ y: targetY + boardHeight / 2 + shuttleH + binD / 2 }, 2000).start()
          new TWEEN.Tween(testShuttle.position).to({ y: targetY + boardHeight / 2 }, 2000).start()
        }
        if (ElevatorLoadedShutter) {
          new TWEEN.Tween(testShuttle.position).to({ y: targetY + boardHeight / 2 }, 2000).start()
        }
        ElevatorRunning = false
      }
      window.onElevatorDown = function() {
        if (ElevatorRunning) {
          console.log('ElevatorRunning, can not move up.')
          return
        }
        ElevatorRunning = true
        const curY = elevatorMesh2.position.y
        const targetY = elevatorMesh2.position.y - heightInterval
        const t = new TWEEN.Tween({ y: curY })
        t.to({ y: targetY }, 2000)
          .onUpdate(function(coords) {
            elevatorMesh2.position.y = coords.y
          })
        t.start()
        if (ElevatorLoaded) {
          new TWEEN.Tween(testBinMesh.position).to({ y: targetY + boardHeight / 2 + binD / 2 }, 2000).start()
        }
        if (ElevatorLoadedShutter && ElevatorLoadedBin) {
          new TWEEN.Tween(testBinMesh.position).to({ y: targetY + boardHeight / 2 + shuttleH + binD / 2 }, 2000).start()
          new TWEEN.Tween(testShuttle.position).to({ y: targetY + boardHeight / 2 }, 2000).start()
        }
        if (ElevatorLoadedShutter) {
          new TWEEN.Tween(testShuttle.position).to({ y: targetY + boardHeight / 2 }, 2000).start()
        }
        ElevatorRunning = false
      }

      // AGV
      let AGVLoaded = false
      let column = initColumn
      let layer = initLayer
      let rank = initRank
      window.onMoveFront = function onMoveFront() {
        rank = rank - 1 < 1 ? 1 : rank - 1
        moveAGVAndBin(column, layer, rank)
      }

      window.onMoveBehind = function onMoveBehind() {
        rank = rank + 1 > stickNumber - 1 ? stickNumber - 1 : rank + 1
        moveAGVAndBin(column, layer, rank)
      }

      window.onMoveLeft = function onMoveLeft() {
        column = column + 1 > rackNumber ? rackNumber : column + 1
        moveAGVAndBin(column, layer, rank)
      }

      window.onMoveRight = function onMoveRight() {
        column = column - 1 < 1 ? 1 : column - 1
        moveAGVAndBin(column, layer, rank)
      }

      window.onLoadForAGV = function onLoadForAGV() {
        updateObjPosition(testBinMesh, testShuttle.position.x, testShuttle.position.y + shuttleH / 2 + binD / 2, testShuttle.position.z, null)
        AGVLoaded = true
      }

      window.onUnloadForAGV = function onUnloadForAGV() {
        AGVLoaded = false
      }

      // 执行RouteStep
      function updateAGVPosition(c, l, r) {
        column = c
        layer = l
        rank = r
      }
      window.unloadAGVAndBin = function() {
        ElevatorLoadedShutter = false
        ElevatorLoadedBin = false
      }
      window.setAGVOnElevator = function() {
        const { x, y, z } = elevatorMesh2.position
        updateObjPosition(testShuttle, x, y + boardHeight / 2, z)
        ElevatorLoadedShutter = true
        if (AGVLoaded) {
          updateObjPosition(testBinMesh, x, y + boardHeight / 2 + shuttleH + binD / 2, z)
          ElevatorLoadedBin = true
        }
      }
      window.setAGVCoord = function(pos) {
        console.log(pos)
        const srcX = Number(pos.x)
        const srcY = Number(pos.y)
        const srcZ = Number(pos.z)
        // 重置位置相关参数
        const c = srcX + 1
        const l = srcZ + 1
        const r = srcY + 1
        updateAGVPosition(c, l, r)
        const { x, y, z } = getAGVPosition(c, l, r)
        updateObjPosition(testShuttle, x, y, z)

        if (AGVLoaded) {
          // setBinCoord(pos)
        }
      }
      window.setBinCoord = function(pos) {
        console.log(pos)
        const srcX = Number(pos.x)
        const srcY = Number(pos.y)
        const srcZ = Number(pos.z)
        // 重置位置相关参数
        const c = srcX + 1
        const l = srcZ + 1
        const r = srcY + 1
        updateAGVPosition(c, l, r)
        const { x, y, z } = getAGVPosition(c, l, r)
        updateObjPosition(testBinMesh, x, y + shuttleH / 2 + binD / 2, z)
      }
      window.move = function move(src, dest) {
        console.log(src)
        console.log(dest)
        const srcX = Number(src.x)
        const srcY = Number(src.y)
        const srcZ = Number(src.z)
        const destX = Number(dest.x)
        const destY = Number(dest.y)
        const destZ = Number(dest.z)
        if (srcX === destX && srcY !== destY && srcZ === destZ) {
          if (srcY - destY === 1) {
            // onMoveFront()
          } else if (srcY - destY === -1) {
            // onMoveBehind()
          }
        } else if (srcX !== destX && srcY === destY && srcZ === destZ) {
          if (srcX - destX === 1) {
            // onMoveRight()
          } else if (srcX - destX === -1) {
            // onMoveLeft()
          }
        } else if (srcX === destX && srcY === destY && srcZ !== destZ) {
          if (srcZ - destZ === 1) {
            // elevator move to same layer and agv move to elevator, elevator move DOWN
            // with agv and bin, agv move to destZ
          } else if (srcZ - destZ === -1) {
            // elevator move to same layer and agv move to elevator, elevator move UP
            // with agv and bin, agv move to destZ
          }
        }
      }
      window.operate = function operate(operate) {
        console.log(operate)
        switch (operate) {
          case 'Load':
            // onLoadForAGV()
            break
          case 'Unload':
            // onUnloadForAGV()
            break
          default:
            break
        }
      }
      window.getElevatorLayer = function() {
        const y = elevatorMesh2.position.y
        console.log('elevator2 y = {}', y)
        const layer = (y - baseHeight) / heightInterval
        console.log('elevator2 layer = {}', layer)
        return layer
      }

      function moveAGVAndBin(column, layer, rank) {
        new TWEEN.Tween(testShuttle.position).to(getAGVPosition(column, layer, rank), 2000).start()
        if (AGVLoaded) {
          new TWEEN.Tween(testBinMesh.position).to(getBinPosition(column, layer, rank), 2000).start()
        }
      }

      function getAGVPosition(column, layer, rank) {
        return getPositionOfShuttle(column, layer, rank, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH)
      }

      function getBinPosition(column, layer, rank) {
        return getPositionOfBin(column, layer, rank, rackGroupMesh, rackWidth, heightInterval, depthInterval, rackNumber, boardNumber, stickNumber, binD, shuttleH)
      }
    }
  }
}
</script>
<style scoped>
#webglDom,
.webgl-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
