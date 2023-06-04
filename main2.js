
import './style.css';

			import * as THREE from 'three';
      		import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
			import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

			let camera, scene, renderer, controls;

			let glbObject;

			let raycaster;

			let moveForward = false;
			let moveBackward = false;
			let moveLeft = false;
			let moveRight = false;
			let canJump = false;
      		let speedCoefficient = 20; //the higher the slower

			let prevTime = performance.now();
			const velocity = new THREE.Vector3();
			const direction = new THREE.Vector3();

			init();
			animate();

			function init() {

				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.y = 1.5; //Camera height

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0xffffff );
				scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

				const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
				light.position.set( 0.5, 1, 0.75 );
				scene.add( light );

				controls = new PointerLockControls( camera, document.body );

				const blocker = document.getElementById( 'blocker' );
				const instructions = document.getElementById( 'instructions' );

				instructions.addEventListener( 'click', function () {
					controls.lock();
				} );

				controls.addEventListener( 'lock', function () {
					instructions.style.display = 'none';
					blocker.style.display = 'none';
				} );

				controls.addEventListener( 'unlock', function () {
					blocker.style.display = 'block';
					instructions.style.display = '';
				} );

				scene.add( controls.getObject() );

				const onKeyDown = function ( event ) {
					switch ( event.code ) {
						case 'ArrowUp':
						case 'KeyW':
							moveForward = true;
							break;

						case 'ArrowLeft':
						case 'KeyA':
							moveLeft = true;
							break;

						case 'ArrowDown':
						case 'KeyS':
							moveBackward = true;
							break;

						case 'ArrowRight':
						case 'KeyD':
							moveRight = true;
							break;

						case 'Space':
							if ( canJump === true ) velocity.y += 350;
							canJump = false;
							break;
					}
				};

				const onKeyUp = function ( event ) {
					switch ( event.code ) {
						case 'ArrowUp':
						case 'KeyW':
							moveForward = false;
							break;

						case 'ArrowLeft':
						case 'KeyA':
							moveLeft = false;
							break;

						case 'ArrowDown':
						case 'KeyS':
							moveBackward = false;
							break;

						case 'ArrowRight':
						case 'KeyD':
							moveRight = false;
							break;
					}
				};

				document.addEventListener( 'keydown', onKeyDown );
				document.addEventListener( 'keyup', onKeyUp );

				raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

				// scene
        		var loader = new GLTFLoader();
				loader.load('assets/studio.glb', function (gltf) {
				// Downscale of 1000
				gltf.scene.scale.set(1, 1, 1);
				gltf.scene.position.set(0, 0, 0);
				gltf.scene.eulerOrder = "ZYX";
				scene.add(gltf.scene);
				glbObject = gltf.scene;
				}, undefined, function (error) {
				console.error(error);
				});

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				window.addEventListener( 'resize', onWindowResize );

				onWindowResize();

			}

			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}

			function animate() {

				requestAnimationFrame( animate );

				const time = performance.now();

				if ( controls.isLocked === true ) {

					raycaster.ray.origin.copy( controls.getObject().position );
					raycaster.ray.origin.y -= 10;

					// Lancer un rayon depuis la position de la caméra vers le bas pour détecter les collisions
					raycaster.setFromCamera( new THREE.Vector2( 0, 0 ), camera );

					// Récupérer tous les objets intersectés par le rayon
					const intersects = raycaster.intersectObjects( [glbObject], true );

					// Vérifier s'il y a une collision
					if ( intersects.length > 0 ) {
						// Si une collision est détectée, vous pouvez effectuer une action ici
						// Par exemple, arrêter le mouvement de la caméra en réinitialisant la vélocité :
						velocity.set(0, 0, 0);
					}

					const delta = ( time - prevTime ) / 1000;

					velocity.x -= velocity.x * speedCoefficient * delta;
					velocity.z -= velocity.z * speedCoefficient * delta;

					velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

					direction.z = Number( moveForward ) - Number( moveBackward );
					direction.x = Number( moveRight ) - Number( moveLeft );
					direction.normalize(); // this ensures consistent movements in all directions

					if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
					if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

					controls.moveRight( - velocity.x * delta );
					controls.moveForward( - velocity.z * delta );


				}

				prevTime = time;
				renderer.render( scene, camera );
			}