window.App.init = ->
  window.App.viewAngle     = 0
  window.App.startTime     = Date.now()
  window.App.time          = Date.now()
  window.App.bodyAngle     = Math.PI
  window.App.bodyVerticalAngle     = 0
  window.App.bodyAxis      = new THREE.Vector3(0, 1, 0)
  window.App.bodyPosition  = new THREE.Vector3(0, 15, 0)
  window.App.velocity      = new THREE.Vector3()
  window.App.speed         = 1.0

  App.initScene()
  App.initGeometry()
  App.initLights()
  
  oculusBridge = new OculusBridge({
    "debug" : true,
    "onOrientationUpdate" : (quatValues) ->
      # set debug display info
      for key, value of quatValues
        $("#o#{key.toUpperCase()}").text(value.toFixed(2))
        App.data["o#{key.toUpperCase()}"] = value

      # Do first-person style controls (like the Tuscany demo) using the rift and keyboard.
      # TODO: Don't instantiate new objects in here, these should be re-used to avoid garbage collection.

      # make a quaternion for the the body angle rotated about the Y axis.
      quat = new THREE.Quaternion()
      quat.setFromAxisAngle(App.bodyAxis, -App.bodyAngle)

      # make a quaternion for the current orientation of the Rift
      quatCam = new THREE.Quaternion(quatValues.x, quatValues.y, quatValues.z, quatValues.w)

      # multiply the body rotation by the Rift rotation.
      quat.multiply(quatCam)

      # Make a vector pointing along the Z axis and rotate it accoring to the combined look/body angle.
      xzVector = new THREE.Vector3(0, 0, 1)
      xzVector.applyQuaternion(quat)

      # Compute the X/Z angle based on the combined look/body angle.  This will be used for FPS style movement controls
      # so you can steer with a combination of the keyboard and by moving your head.
      App.viewAngle = Math.atan2(xzVector.z, xzVector.x) + Math.PI

      # Apply the combined look/body angle to the camera.
      App.camera.quaternion.copy(quat)
        
    "onConfigUpdate"      : (config) ->
      App.riftCam.setHMD(config)
    "onConnect"           : ->
      App.useRift = true
      $('#hud .oculus .disconnected').fadeOut(250)
      $('#hud .oculus .connected').fadeIn(250)
      $('body').addClass('useRift')
    "onDisconnect"        : ->
      App.useRift = false
      $('#hud .oculus .disconnected').fadeIn(250)
      $('#hud .oculus .connected').fadeOut(250)
      $('body').removeClass('useRift')
  })
  oculusBridge.connect()
  window.App.riftCam = new THREE.OculusRiftEffect(App.renderer);

window.App.initScene = ->
  window.App.clock = new THREE.Clock();
  mouse = new THREE.Vector2(0, 0);

  windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
  aspectRatio = window.innerWidth / window.innerHeight;
  
  window.App.scene = new THREE.Scene();  

  window.App.camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.01, 10000);
  App.camera.useQuaternion = true;
  App.camera.eulerOrder = "YXZ";
  App.camera.fov *= 5/3.0;
  App.camera.updateProjectionMatrix();

  App.camera.position.set(100, 15, 100);
  App.camera.lookAt(App.scene.position);

  # Initialize the renderer
  window.App.renderer = new THREE.WebGLRenderer({antialias:true})
  App.renderer.setClearColor(0x000000)
  App.renderer.setSize(window.innerWidth, window.innerHeight)

  App.scene.fog = new THREE.Fog(0x000000, 250, 750)

  element = document.getElementById('viewport')
  element.appendChild(App.renderer.domElement)

window.App.initLights = ->
  ambient = new THREE.AmbientLight(0xffffff)
  App.scene.add(ambient)

  window.App.headlights = new THREE.PointLight( 0xffffff, 0.9, 300 )
  App.headlights.position.set( 0, 0, 10 )
  App.shipParent.add(App.headlights)

window.App.initGeometry = ->
  # add some asteroids.
  window.App.boxes = []
  for i in [0..250]
    App.addBox()

  window.App.shots = []

  window.App.shipParent = new THREE.Object3D();
  App.shipParent.eulerOrder = "YXZ";
  App.scene.add(App.shipParent)


  shipTexture = new THREE.ImageUtils.loadTexture( "/assets/textures/ship.png" );
  shipTexture.wrapS = shipTexture.wrapT = THREE.RepeatWrapping; 
  shipTexture.repeat.set( 1, 1 );
  shipTexture.anisotropy = 32;
  material = new THREE.MeshLambertMaterial( { map: shipTexture, transparent:true, opacity:1.0, color: 0x000000 } );
  # material = new THREE.MeshLambertMaterial({color: 0x445566, ambient: 0x151515, opacity: 0.0})
  window.App.ship = new THREE.Mesh( new THREE.CubeGeometry(1,1,1), material)
  App.ship.eulerOrder = "YXZ";

  App.ship.geometry.vertices[0].x += 1;
  App.ship.geometry.vertices[0].z += 10;
  App.ship.geometry.vertices[1].x += 3;
  App.ship.geometry.vertices[1].z -= 10;
  App.ship.geometry.vertices[4].x -= 3;
  App.ship.geometry.vertices[4].z -= 10;
  App.ship.geometry.vertices[5].x -= 1;
  App.ship.geometry.vertices[5].z += 10;
  App.ship.position.set(0,-3,0)
  App.shipParent.add(App.ship)

  # targeting reticule
  targetTexture = new THREE.ImageUtils.loadTexture( "/assets/textures/targeting.png" );
  targetTexture.wrapS = targetTexture.wrapT = THREE.RepeatWrapping; 
  targetTexture.repeat.set( 1, 1 );
  targetTexture.anisotropy = 32;
  targetMaterial = new THREE.MeshLambertMaterial( { map: targetTexture, transparent:true, opacity:0.75 } );
  targetGeometry = new THREE.PlaneGeometry(0.25, 0.25, 1, 1);
  
  window.App.target = new THREE.Mesh(targetGeometry, targetMaterial)
  # App.target.eulerOrder = "YXZ";
  App.target.side = THREE.DoubleSide;
  App.target.position.set(0.0,-0.02,3)
  App.target.rotation.y = +Math.PI;
  App.shipParent.add(App.target);

  # walls
  floorTexture = new THREE.ImageUtils.loadTexture( "/assets/textures/tile.jpg" );
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
  floorTexture.repeat.set( 5000, 1 );
  floorTexture.anisotropy = 32;
  floorMaterial = new THREE.MeshLambertMaterial( { map: floorTexture, transparent:true, opacity:0.5 } );
  floorGeometry = new THREE.PlaneGeometry(1000000, 500, 1, 1);
  
  floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.position.set(0,-250,500000-500)
  floor.side = THREE.DoubleSide;
  floor.rotation.x = -Math.PI / 2;
  floor.rotation.z = +Math.PI / 2;
  App.scene.add(floor);
  floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.position.set(0,250,500000-500)
  floor.side = THREE.DoubleSide;
  floor.rotation.x = +Math.PI / 2;
  floor.rotation.z = +Math.PI / 2;
  App.scene.add(floor);
  floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.position.set(250,0,500000-500)
  floor.side = THREE.DoubleSide;
  floor.rotation.y = -Math.PI / 2;
  App.scene.add(floor);
  floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.position.set(-250,0,500000-500)
  floor.side = THREE.DoubleSide;
  floor.rotation.y = +Math.PI / 2;
  App.scene.add(floor);

window.App.addBox = (options = {}) ->
  if Math.random() > 0.3
    material = new THREE.MeshLambertMaterial({ color: Math.round(Math.random() * 16777215), ambient: 0x151515 })
  else
    material = new THREE.MeshPhongMaterial({ color: Math.round(Math.random() * 16777215), ambient: 0x151515, specular: 0xffffff })
    
  height = Math.random() * 25 + 5
  width = height + (Math.random() * 6 - 3)
  
  rand = Math.random()
  if rand < 0.5
    box = new THREE.Mesh( new THREE.CubeGeometry(width, height, width), material)
  else if rand < 0.96
    box = new THREE.Mesh( new THREE.SphereGeometry(height), material)
  else
    box = new THREE.Mesh( new THREE.TorusGeometry(height * 2.5, 3 + Math.random() * height / 2, 8, 4 ), material)

  zCoord = App.camera.position.z
  if options.aheadOnly
    zCoord += 500 + 250*Math.random()
  else
    zCoord = Math.random()*1000 - 250

  box.position.set(Math.random() * 600 - 300, Math.random() * 600 - 300, zCoord)
  box.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
  
  App.boxes.push(box)
  App.scene.add(box)

window.App.fire = () ->
  material = new THREE.MeshLambertMaterial({ color: 0x00ff00, ambient: 0x00ff00 })
  shot = new THREE.Mesh( new THREE.CubeGeometry(1, 1, 4), material)
  shot.position.set(-1, -4, 5)
  App.shots.push(shot)
  App.shipParent.add(shot) 

  shot = new THREE.Mesh( new THREE.CubeGeometry(1, 1, 4), material)
  shot.position.set(1, -4, 5)
  App.shots.push(shot)
  App.shipParent.add(shot)

  shot_sound = document.getElementById('shot_sound')
  shot_sound.pause()
  shot_sound.volume = 0.3
  shot_sound.currentTime = 0.0
  shot_sound.play()


window.App.updateInput = (delta) ->
  step        = 40 * delta * App.speed
  turn_speed  = 0.03 * delta

  # Update ship position
  if App.data.cY
    App.bodyAngle += App.data.cY * turn_speed
  if App.data.cZ
    App.bodyVerticalAngle += App.data.cZ * turn_speed

  App.bodyPosition.x += Math.sin(App.bodyAngle) * step;
  App.bodyPosition.y -= Math.sin(App.bodyVerticalAngle) * step;
  App.bodyPosition.z -= Math.cos(App.bodyAngle) * step;
  
  App.camera.position.set(App.bodyPosition.x, App.bodyPosition.y, App.bodyPosition.z)
  App.camera.rotation.x += -App.bodyVerticalAngle

  App.shipParent.position.set(
    App.bodyPosition.x,
    App.bodyPosition.y,
    App.bodyPosition.z)
  App.shipParent.rotation.y = -App.bodyAngle - Math.PI
  App.shipParent.rotation.x = App.bodyVerticalAngle


window.App.animate = ->
  delta = App.clock.getDelta()
  App.time += delta;

  if App.controllerConnected or true
    App.updateInput(delta);

    for box in App.boxes
      box.rotation.x += delta * 0.4
      box.rotation.y -= delta * 0.2
      box.rotation.z += delta * 0.3
      if not (box.position.z > App.camera.position.z - 200)
        App.scene.remove(box)
        App.addBox({aheadOnly: true})

    for shot in App.shots
      shot.position.z += delta * 800
      if not Math.abs(shot.position.z - App.camera.position.z) < 1000
        App.scene.remove(shot)

    App.boxes = App.boxes.filter (box) -> box.position.z > App.camera.position.z - 200
  else
    App.updateInput(0.0) # don't move

  requestAnimationFrame(App.animate)
  if App.useRift
    App.riftCam.render(App.scene, App.camera)
  else
    # adjust camera to point forwards
    # make a quaternion for the the body angle rotated about the Y axis.
    quat = new THREE.Quaternion()
    quat.setFromAxisAngle(App.bodyAxis, -App.bodyAngle)

    # make a quaternion for the current orientation of the Rift
    # quatCam = new THREE.Quaternion(quatValues.x, quatValues.y, quatValues.z, quatValues.w)

    # multiply the body rotation by the Rift rotation.
    # quat.multiply(quatCam)

    # Make a vector pointing along the Z axis and rotate it accoring to the combined look/body angle.
    xzVector = new THREE.Vector3(0, 0, 1)
    xzVector.applyQuaternion(quat)

    # Compute the X/Z angle based on the combined look/body angle.  This will be used for FPS style movement controls
    # so you can steer with a combination of the keyboard and by moving your head.
    App.viewAngle = Math.atan2(xzVector.z, xzVector.x) + Math.PI

    # Apply the combined look/body angle to the camera.
    App.camera.quaternion.copy(quat)
    App.camera.rotation.x += -App.bodyVerticalAngle

    App.renderer.render(App.scene, App.camera)


window.onload = ->
  App.init()
  App.animate()