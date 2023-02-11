export function getScene(THREE) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xcccccc)
  return scene
}

export function getCamera(THREE) {
  const camera = new THREE.PerspectiveCamera(75, document.documentElement.clientWidth / document.documentElement.clientHeight, 0.1, 2000)
  camera.position.set(0, 500, 0)
  return camera
}

export function getRenderer(THREE) {
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight)
  return renderer
}

export function getDirectLight(THREE, x, y, z) {
  const directLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directLight.position.set(x, y, z)
  return directLight
}

export function getAmbientLight(THREE) {
  const ambientLight = new THREE.AmbientLight(0x222222)
  return ambientLight
}

export function getControl(controls) {
  controls.listenToKeyEvents(window) // optional

  // controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

  controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05

  controls.screenSpacePanning = false

  controls.minDistance = 100
  controls.maxDistance = 500

  controls.maxPolarAngle = Math.PI / 2
  return controls
}

export function getFloor(THREE, floorWidth, floorHeight) {
  const geometry = new THREE.PlaneGeometry(floorWidth, floorHeight, 1, 1)
  const material = new THREE.MeshPhongMaterial({ color: 0x818891, emissive: 0x000000, side: THREE.DoubleSide })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = Math.PI / 2
  return mesh
}

export function getHouse(THREE, houseVisible, houseWidth, houseHeight, houseDepth) {
  const house = new THREE.BoxGeometry(houseWidth, houseHeight, houseDepth, 1, 1, 1)
  const houseMaterial = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: 0.1
  })
  const houseMesh = new THREE.Mesh(house, houseMaterial)
  houseMesh.position.set(-houseWidth / 2, houseHeight / 2, 0)
  houseMesh.visible = houseVisible
  return houseMesh
}

export function getRackGroup(THREE, x, y, z, visible, w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d, 1, 1, 1)
  const m = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: 0.5
  })
  const mesh = new THREE.Mesh(g, m)
  mesh.position.set(x, y, z)
  mesh.visible = visible
  return mesh
}

export function getRack(THREE, x, y, z, rackVisible, rackWidth, rackHeight, rackDepth) {
  const rack = new THREE.BoxGeometry(rackWidth, rackHeight, rackDepth, 1, 1, 1)
  const rackMaterial = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: 0.2
  })
  const rackMesh = new THREE.Mesh(rack, rackMaterial)
  rackMesh.position.set(x, y, z)
  rackMesh.visible = rackVisible
  return rackMesh
}

export function getBoard(THREE, x, y, z, boardWidth, boardHeight, boardDepth, rackTx) {
  const board = new THREE.BoxGeometry(boardWidth, boardHeight, boardDepth, 1, 1, 1)
  const boardMaterial = new THREE.MeshPhongMaterial({
    color: 0xAFB1B3,
    emissive: 0x000000,
    side: THREE.DoubleSide,
    map: rackTx
  })
  const boardMesh = new THREE.Mesh(board, boardMaterial)
  boardMesh.position.set(x, y, z)
  return boardMesh
}

export function getStick(THREE, stickD, stickHeight, x, y, z, stickTx) {
  const stick = new THREE.BoxGeometry(stickD, stickHeight, stickD, 1, 1, 1)
  const binMaterial = new THREE.MeshPhongMaterial({
    color: 0xAFB1B3,
    emissive: 0x000000,
    side: THREE.DoubleSide,
    map: stickTx
  })
  const stickMesh = new THREE.Mesh(stick, binMaterial)
  stickMesh.position.set(x, y, z)
  return stickMesh
}

export function getConveyor(THREE, x, y, z, w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d, 1, 1, 1)
  const m = new THREE.MeshPhongMaterial({
    color: 0xAFB1B3,
    emissive: 0x000000,
    side: THREE.DoubleSide
  })
  const mesh = new THREE.Mesh(g, m)
  mesh.position.set(x, y, z)
  return mesh
}

export function getBase(THREE, x, y, z, w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d, 1, 1, 1)
  const m = new THREE.MeshPhongMaterial({
    color: 0xAFB1B3,
    emissive: 0x000000,
    side: THREE.DoubleSide
  })
  const mesh = new THREE.Mesh(g, m)
  mesh.position.set(x, y, z)
  return mesh
}

export function getBin(THREE, x, y, z, binWidth, binHeight, binDepth, binTx) {
  const bin = new THREE.BoxGeometry(binWidth, binHeight, binDepth, 1, 1, 1)
  const binMaterial = new THREE.MeshPhongMaterial({
    color: 0xAFB1B3,
    emissive: 0x000000,
    side: THREE.DoubleSide,
    map: binTx
  })
  const binMesh = new THREE.Mesh(bin, binMaterial)
  binMesh.position.set(x, y, z)
  return binMesh
}

export function getShuttle(THREE, x, y, z, w, h, d, c) {
  const geometry = new THREE.BoxGeometry(w, h, d, 1, 1, 1)
  const material = new THREE.MeshPhongMaterial({
    color: c,
    emissive: 0x000000,
    side: THREE.DoubleSide
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(x, y, z)
  return mesh
}
export function getRGV(THREE, x, y, z, w, h, d, c) {
  const geometry = new THREE.BoxGeometry(w, h, d, 1, 1, 1)
  const material = new THREE.MeshPhongMaterial({
    color: c,
    emissive: 0x000000,
    side: THREE.DoubleSide
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(x, y, z)
  return mesh
}
export function getPointText(THREE, textGeo, font, size, height, x, y, z, materials) {
  // const materials = new THREE.MeshStandardMaterial({
  //   color: color,
  //   transparent: true,
  //   opacity: 0.6
  // })

  // textGeo.computeBoundingBox()

  // const mesh = new THREE.Mesh(textGeo, materials)
  // mesh.position.set(x, y, z)
  // mesh.rotation.x = -Math.PI / 2.0
  // mesh.rotation.y = 0

  // 这里必须先绕x轴旋转，再进行位移
  textGeo.rotateX(-Math.PI / 2.0)
  textGeo.translate(x, y, z)

  return textGeo
}
