
      import './style.css';

			import * as THREE from 'three';
      import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
      import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
      import * as TWEEN from '@tweenjs/tween.js'

			let camera, scene, renderer, controls;
      

			init();
			animate();

			function init() {

				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
				camera.position.y = 1.85; //Camera height
        //Initial camera position
        camera.position.x = -3.07;
        camera.position.z = 6.39;

        //Initial camera lookAt
        const target = new THREE.Vector3();
        target.x = -8.77;
        target.y = 1.85;
        target.z = 5.6;
        camera.lookAt(target);

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x808080); // Gris moyen
        scene.fog = new THREE.Fog(0x808080, 0, 750); // Gris moyen pour le brouillard        
        

				const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
				light.position.set( 0.5, 1, 0.75 );
				scene.add( light );

        let isUserInteracting = false;
        let onMouseDownMouseX = 0;
        let onMouseDownMouseY = 0;
        let lon = 0;
        let onMouseDownLon = 0;
        let lat = 0;
        let onMouseDownLat = 0;
        let delayThreshold = 200; // Adjust the delay threshold (in milliseconds) as needed
        let delayTimer;
        let isDragging = false;
        let isClicked;

        function onDocumentMouseDown(event) {
          event.preventDefault();
          isClicked = performance.now();
          isUserInteracting = true;

          onMouseDownMouseX = event.clientX;
          onMouseDownMouseY = event.clientY;
          onMouseDownLon = lon;
          onMouseDownLat = lat;
          }

        function onDocumentMouseMove(event) {
          if (isUserInteracting === true) {
            controls.enabled = false;
            lon = (onMouseDownMouseX - event.clientX) * 0.1 + onMouseDownLon;
            lat = (event.clientY - onMouseDownMouseY) * 0.1 + onMouseDownLat;
            lat = Math.max(-85, Math.min(85, lat));
            const target = new THREE.Vector3(0, 0, -1);
            const phi = THREE.MathUtils.degToRad(90 - lat);
            const theta = THREE.MathUtils.degToRad(lon);
            const radius = 10;
            target.x = radius * Math.sin(phi) * Math.cos(theta);
            target.y = radius * Math.cos(phi);
            target.z = radius * Math.sin(phi) * Math.sin(theta);
            camera.lookAt(target);
          }
        }

        function onDocumentMouseUp() {
            isUserInteracting = false;
            controls.enabled = true;

            if (performance.now() - isClicked < delayThreshold) {
            const mouse = new THREE.Vector2();
            const raycaster = new THREE.Raycaster();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);
            if (isDragging == false) {
              if (intersects.length > 0) {
                const { point } = intersects[0];
                moveCameraToPoint(point);
                console.log(point);
              }
            }
          }
        }

        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);

        function moveCameraToPoint(point) {
          const distance = camera.position.distanceTo(point);
        
          const tween = new TWEEN.Tween(camera.position)
            .to({ x: point.x, y: 1.5, z: point.z }, distance * 100) // Adjust the duration as needed
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        }

				// scene
        var loader = new GLTFLoader();
        loader.load('assets/apartment.glb', function (gltf) {
          gltf.scene.scale.set(1, 1, 1);
          gltf.scene.position.set(0, 0, 0);
          gltf.scene.eulerOrder = "ZYX";
          scene.add(gltf.scene);
        }, undefined, function (error) {
          console.error(error);
        });

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

        controls = new OrbitControls( camera, renderer.domElement );
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2;
        controls.enableZoom = false;


			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}

      window.addEventListener( 'resize', onWindowResize );

			}

      function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();
        renderer.render(scene, camera);
      }
      