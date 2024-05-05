
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import RecordRTC from 'recordrtc';
import dataJson from '/public/data.json';
let dataJsonReversed = dataJson.reverse();
// console.log(dataJsonReversed);

let scene, camera, renderer, controls;

let cameraTravelProgress = 0.0;
let startCameraSpeed = 0.05;
let distanceTravelCamera;
let cameraSpeed = startCameraSpeed;
let textureLoader = new THREE.TextureLoader();
let canvas;


let animationFrameId;
let isRecording = false;
let isAnimating = false; // Flag to check if animation is already running
let canvasRecorder;

let stoppedCameraPosition;
let stoppedCameraTravelProgress;

let startCameraPosition
let endCameraPosition 
let targetPositions = []; // Array to store target camera positions
let currentTargetIndex = 0; // Index of the current target  bar



let planes  = []; // Array to  store planes
let textures  = []; // Array to store textures for each plane 
let texts = [];
let bars = [];
let hasUploadedImgs = false; // Flag to check if images have been uploaded
let user_textures = []; // Array to store uploaded textures

const aspectRatio = window.innerWidth / window.innerHeight; // Assuming a 16:9 aspect ratio

const loader = new FontLoader();

// Load multiple font files
const fontFiles = [
  '/gentilis_bold.typeface.json',
  '/gentilis_regular.typeface.json',
  '/helvetiker_bold.typeface.json',
  '/helvetiker_regular.typeface.json',
];

const loadedFonts = [];

// Load each font file
fontFiles.forEach((fontFile, index) => {
  loader.load(fontFile, function(font) {
    loadedFonts[index] = font;

    // Check if all fonts are loaded
    if (loadedFonts.length === fontFiles.length) {
      // All fonts are loaded, create the bars and images
	  init(dataJsonReversed);
	//   animate();
    //   createBarsAndImages(dataJsonReversed);
	//   ();

    }
  });
});

  

function startCapturing() {
	console.log("startCapturing");
	const rendererCanvas = renderer.domElement;
	const stream = rendererCanvas.captureStream(60);
  
	canvasRecorder = new RecordRTC(stream, {
	  type: 'video',
	  disableLogs: true,
	  mimeType: 'video/webm',
	  numberOfAudioChannels: 2,
	  bitrate: 1024 * 4096
	});
	canvasRecorder.startRecording();
}


function stopCapturing() {
	console.log("stopCapturing");
	canvasRecorder.stopRecording(() => {
	  const blob = canvasRecorder.getBlob();
	  const url = URL.createObjectURL(blob);
	  const a = document.createElement('a');
	  a.href = url;
	  a.download = 'recording.webm';
	  a.click();
	  window.URL.revokeObjectURL(url);
	});
  }
  




// document.addEventListener('DOMContentLoaded', function() {

// });




function continueAnimation() {
    isAnimating = true;
    // Restore the camera position and progress from the stored values
    camera.position.copy(stoppedCameraPosition);
    cameraTravelProgress = stoppedCameraTravelProgress;
    cameraSpeed = startCameraSpeed; // Reset the camera speed

    animate(); // Directly call animate to resume the animation
	// requestAnimationFrame(animate);

    console.log("continueAnimation",isAnimating);
}


// Modify the stopAnimation function
function stopAnimation() {
	console.log("stopAnimation", animationFrameId);
	// cancelAnimationFrame(animationFrameId);
	isAnimating = false;
	// Store the current camera position and progress
	stoppedCameraPosition = camera.position.clone();
	stoppedCameraTravelProgress = cameraTravelProgress;
	console.log("stopAnimation",isAnimating);

  }



function handleCsvUpload() {
	const csvInput = document.getElementById('csvUpload');
	const file = csvInput.files[0];
	const reader = new FileReader();
  
	reader.onload = function(e) {
	  const csvData = e.target.result;
	  processData(csvData);
	  hasUploadedImgs = true;
	};
  
	reader.readAsText(file);
  }


  function processData(csvData) {
	const csvRows = csvData.split('\n');
	const headers = csvRows[0].split(',');
	const jsonData = [];
  
	for (let i = 1; i < csvRows.length; i++) {
	  const row = csvRows[i].split(',');
	  const rowData = {};
  
	  for (let j = 0; j < headers.length; j++) {
		rowData[headers[j]] = row[j];
	  }
  
	  jsonData.push(rowData);
	}
  
	console.log(jsonData);

	removeBarsAndImages();
	createBarsAndImages(jsonData);
	// You can also save the JSON string to a file using fs.writeFile() if running in Node.js
}

function removeBarsAndImages() {

	texts.forEach(text => {
        scene.remove(text); // Remove the text mesh from the scene
        text.geometry.dispose(); // Dispose of the geometry
        text.material.dispose(); // Dispose of the material
    });
    texts = []; // Clear the array

	bars.forEach(bar => {
		scene.remove(bar);
		bar.geometry.dispose();
		bar.material.dispose();
	});
	bars = [];

	planes.forEach(plane => {
		scene.remove(plane);
		plane.geometry.dispose();
		plane.material.dispose();
	});
	planes = [];

	textures.forEach(texture => {
		texture.dispose();
	});
	textures = [];


}
  

function init(dataJsonReversed) {
	isAnimating = true

	
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xffffff); // Set background color to blue

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	// renderer.setSize(1920, 1080); // Set the desired video resolution
	
	document.body.appendChild(renderer.domElement);
	canvas = renderer.domElement;
	


	// controls = new OrbitControls(camera, renderer.domElement);

	 // Adding lights
	const pointLight = new THREE.PointLight(0xffffff, 1, 100);
	pointLight.castShadow = true;

	pointLight.position.set(10, 10, 10);
	scene.add(pointLight);








	const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
	scene.add(ambientLight);

	const axesHelper = new THREE.AxesHelper( 5 );
	scene.add( axesHelper );

	const gridHelper = new THREE.GridHelper(10, 10);
	scene.add(gridHelper);

	createBarsAndImages(dataJsonReversed);
	animate()
}

async function animate() {
	console.log("animate called",isAnimating); // Debugging line

	  async function step() {
		if (isAnimating) {

			requestAnimationFrame(step);
			// if (isRecording) {
			// }
			// if (cameraTravelProgress < distanceTravelCamera) {
			if (currentTargetIndex < targetPositions.length) {

				let targetPosition = targetPositions[currentTargetIndex];
				// console.log(targetPosition,"targetPosition");
				camera.position.lerp(targetPosition, cameraSpeed);
				if (camera.position.distanceTo(targetPosition) < 0.01) { // Adjust threshold as needed
					currentTargetIndex = (currentTargetIndex + 1) ; //  Move to next target or loop
					// console.log(currentTargetIndex,"currentTargetIndex");
				}

				// camera.position.lerpVectors(startCameraPosition, endCameraPosition, cameraTravelProgress);
				// cameraTravelProgress += cameraSpeed;
			} else if (isRecording) {
				await stopCapturing();
				isRecording = false;
			}
			renderer.render(scene, camera);
		}
	  }
	  await step();
}





document.getElementById('startAnimation').addEventListener('click', function() {
	console.log("startAnimation called"); // Debugging line
	// cameraTravelProgress = 0;
	// cameraSpeed = startCameraSpeed;
	// isAnimating = true;
	// startCameraPosition = targetPositions[0];
	currentTargetIndex = 0;

	// requestAnimationFrame(animate);
  });


  
// // stopButton.addEventListener('click', removeBarsAndImages);
// document.getElementById('stopAnimation').addEventListener('click',function() {
// 	stopAnimation()
// });


// // In your JavaScript file
// const continueAnimationButton = document.getElementById('continueAnimationButton');
// // Add an event listener for the continueAnimation button
// continueAnimationButton.addEventListener('click', continueAnimation);



// Get the single  button element
const playPauseButton = document.getElementById('playPauseButton'); // Assuming you've changed the ID in your HTML
const pauseIcon = playPauseButton.querySelector('svg[viewBox="0 0 320 512"]');
const playIcon = playPauseButton.querySelector('svg[viewBox="0 0 384 512"]');

// Initially hide the play icon
playIcon.style.display = 'none';

// Add a click  event listener to the button
playPauseButton.addEventListener('click', function() {
  if (isAnimating) {
    stopAnimation();
	pauseIcon.style.display = 'none';
    playIcon.style.display =  'inline'; //
     // Change the button's appearance to indicate "Play" (e.g., change text or icon)
  } else {
     continueAnimation();
	 playIcon.style.display = 'none';
    pauseIcon.style.display = 'inline'; 
  }
});

document.getElementById('startRecordingAll').addEventListener('click', async function() {
	cameraTravelProgress = 0;
	cameraSpeed = startCameraSpeed;
	isRecording = true;
	
	await startCapturing();
	// requestAnimationFrame(animate);
});


document.getElementById('startRecording').addEventListener('click', async function() {
	// isRecording = true;
	await startCapturing();
	// requestAnimationFrame(animate);
  });


  // startButton.addEventListener('click', startCapturing);
document.getElementById('stopRecording').addEventListener('click',async function() {
	await stopCapturing();
});



// Event listener for file upload 
document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

	// Event listener for setting the image
// document.getElementById('setImage').addEventListener('click', updateTexture); 

document.getElementById('uploadCsv').addEventListener('click', handleCsvUpload);


  
// In your main.js file
const fullscreenButton  = document.getElementById('fullscreenButton');
fullscreenButton.addEventListener('click', toggleFullScreen); 

function toggleFullScreen() {
	if (!document.fullscreenElement) {
	  if (canvas.requestFullscreen) { 
		canvas.requestFullscreen (); 
	  } else if (canvas.webkitRequestFullscreen) { /* Safari */
		canvas.webkitRequestFullscreen();
	  } else if (canvas.msRequestFullscreen) { /* IE11 */
		canvas. msRequestFullscreen();
	  }
	} else {
	  if (document.exitFullscreen) {
		document.exitFullscreen();
	  } else if (document.webkitExitFullscreen) { /* Safari */
		document.webkitExitFullscreen();
	  } else if (document.msExitFullscreen ) { /* IE11 */
		document.msExitFullscreen();
	  }
	}
  }

function createBarsAndImages(dataJsonReversed) {
	let reverseIndex = dataJsonReversed.length;




	// Add a vertical plane as 1
	const backgroundGeometry = new THREE.PlaneGeometry(30, 20);
	const loader = new THREE.TextureLoader();
	const backgroundTexture = loader.load('/textures/city4.png');
	const backgroundMaterial = new THREE.MeshBasicMaterial({
		map: backgroundTexture,
		side: THREE.DoubleSide
		});


	const background1 = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
	background1.rotation.y = Math.PI;
	background1.position.set(0, 10, -3); 
	scene.add(background1); 


	// Adding a floor
	const planeGeometry = new THREE.PlaneGeometry(100, 100);
	const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xff69b4, side: THREE.DoubleSide });
	const plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.receiveShadow = true ; // Allow the plane to receive shadows
	plane.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
	scene.add(plane); 

	
	distanceTravelCamera = dataJsonReversed.length 
	let startPos = 30;
	let numBackgrounds = Math.round(reverseIndex/10)


	for (let i = 0; i < numBackgrounds; i++) {
		console.log("numBackgrounds",numBackgrounds);
		// Add three more backgrounds to the right 
		const background2 = background1.clone();  // Clone the first background
		background2.position.x = startPos; // Shift to the right
		scene.add(background2);
		startPos = startPos + 30

		const plane1 = plane.clone();
		plane1.position.x = startPos; // Shift to the right
		scene.add(plane1);
	}




	// const barTexture = textureLoader.load('/textures/mat3.png');
	// console.log(dataJsonReversed,"dataJsonReversed")
	dataJsonReversed.forEach((barInfo, i) => {
		let barHeight = barInfo.number*0.10;



		const shape = new THREE.Shape();
		const radius = 0.1; // Adjust this value for the desired corner roundness
		const width  = 1;
		const height = barHeight;
		const depth = 1;
	
		// Top face
		shape.moveTo(-width / 2 + radius, height / 2);
		shape.lineTo (width / 2 - radius, height / 2);
		shape.quadraticCurveTo(width / 2, height / 2, width / 2, height / 2 - radius);
		shape.lineTo (width / 2, -height / 2 + radius);
		shape.quadraticCurveTo(width / 2, -height / 2, width / 2 - radius, -height / 2);
		shape.lineTo(-width / 2 + radius, -height / 2 );
		shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2, -height / 2 + radius);
		shape.lineTo(-width / 2, height / 2 - radius);
		shape.quadraticCurveTo(-width / 2 , height / 2, -width / 2 + radius, height / 2);
	
		// Extrude the shape to create the 3D geometry
		const extrudeSettings = {
		  steps: 2,
		  depth: depth,
		  bevelEnabled: true,
		   bevelThickness: radius,
		  bevelSize: radius,
		  bevelOffset: 0,
		  bevelSegments: 1
		};
		const barGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		barGeometry.computeVertexNormals(); // Compute vertex normals for proper shading


		 // Create a custom vertex shader to round the corners
		 const vertexShader = `
		 uniform float radius;
		 uniform vec3 size;
	 
		 varying vec3 vPosition;
	 
		 void main() {
		   vPosition = position;
	 
		   vec3 pos = position;
		   vec3 absPos = abs(pos);
	 
		   if (absPos.x > size.x - radius) {
			 pos.x = sign(pos.x) * (size.x - radius + (absPos.x - (size.x - radius)) * smoothstep(0.0, radius, absPos.x - (size.x - radius)));
		   }
		   if (absPos.y > size.y - radius) {
			 pos.y = sign(pos.y) * (size.y - radius + (absPos.y - (size.y - radius)) * smoothstep(0.0, radius, absPos.y - (size.y - radius)));
		   }
		   if (absPos.z > size.z - radius) {
			 pos.z = sign(pos.z) * (size.z - radius + (absPos.z - (size.z - radius)) * smoothstep(0.0, radius, absPos.z - (size.z - radius)));
		   }
	 
		   gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
		 }
	   `;
		// const barMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue color
		const barMaterial = new THREE.ShaderMaterial({
			uniforms: {
			  radius: { value: radius },
			  size: { value: new THREE.Vector3(width / 2, height / 2, depth / 2) },
			  colorA: { value: new THREE.Color(0xE8D4C9) }, // Blue color
			  colorB: { value: new THREE.Color(0x967E76) }, // Red color
			  colorC: { value: new THREE.Color(0x452825) }  // Green color
			// colorA: { value: new THREE.Color(0xdc3545) }, // Blue color
			// colorB: { value: new THREE.Color(0x28a745) }, // Red color
			// colorC: { value: new THREE.Color(0x007bff) }  // Green color
			},
			vertexShader: vertexShader,
			fragmentShader: `
			  uniform vec3 colorA;
			  uniform vec3 colorB;
			  uniform vec3 colorC;
		  
			  varying vec3 vPosition;
		  
			  void main() {
				vec3 color = mix(colorA, colorB, vPosition.y / ${height.toFixed(2)});
				color = mix(color, colorC, vPosition.x / ${width.toFixed(2)});
				gl_FragColor = vec4(color, 1.0);
			  }
			`,
			side: THREE.DoubleSide
		  });

		// barTexture.wrapS = THREE.RepeatWrapping;
		// barTexture.wrapT = THREE.RepeatWrapping;
		// barTexture.repeat.set(1, barHeight / depth); // Adjust the texture repeat based on bar dimensions
	
		
		// const barMaterial = new THREE.MeshBasicMaterial({ map: barTexture });
		const bar = new THREE.Mesh(barGeometry, barMaterial);

		bar.position.set(i * 2 - 4, barHeight / 2, 0);
		scene.add(bar);
		bars.push(bar);



		let realBarPosFrontZ = bar.position.z + 1.11
		// Create a vertical plane next to each bar
		// const planeGeometry = new THREE.PlaneGeometry(1, 1);
		const width1 = 1;
		const height1 = 1;
		const radius1 = 0.2; // Adjust this value to control the roundness of the corners
		const segments = 32; // Adjust this value for smoother curves

		const roundedRectGeometry = RoundedRectangle(width1, height1, radius1, segments);

			// Load the texture and apply it to the imageMaterial
		const imageMaterial = new THREE.MeshBasicMaterial();

		if (hasUploadedImgs) {
			console.log("user_textures",user_textures);
			console.log(barInfo.img_name,"barInfo.img_name");

			const matchingTexture = user_textures.find(textureA => textureA.name === barInfo.img_name);

			console.log("matchingTexture",matchingTexture);
			// matchingTexture.minFilter  = THREE.LinearFilter; // For shrinking the texture
			// matchingTexture.magFilter = THREE.LinearFilter; // For magnifying  the texture 
			// // OR 
			// matchingTexture.anisotropy =  renderer.capabilities.getMaxAnisotropy(); // For anisotropic filtering 
			// matchingTexture.generateMipmaps =  true;

			if(matchingTexture && matchingTexture.texture){
				console.log(matchingTexture.texture,"matchingTexture.texture");

				imageMaterial.map = matchingTexture.texture;

				imageMaterial.needsUpdate = true;
			
				const planeMaterial = new THREE. MeshBasicMaterial({ map: matchingTexture.texture });
				const planeImage = new THREE.Mesh(roundedRectGeometry, planeMaterial);
				planeImage.position.set(bar.position.x, bar.position.y + barHeight / 2 - 0.5, realBarPosFrontZ );
				planeImage.rotation.y = 0;
				planes.push(planeImage);
				scene.add(planeImage);

			}
		}
		else{
			console.log("textures.length else",textures.length);
			textureLoader.load(`/images/${barInfo.img_name}`, function(texture) {
				texture.minFilter  = THREE.LinearFilter; // For shrinking the texture
				texture.magFilter = THREE.LinearFilter; // For magnifying  the texture 
				// OR 
				texture.anisotropy =  renderer.capabilities.getMaxAnisotropy(); // For anisotropic filtering 
				texture.generateMipmaps =  true;
				// console.log(texture,"texture");
				imageMaterial.map = texture;
				imageMaterial.needsUpdate = true;


				const planeMaterial = new THREE.MeshBasicMaterial({ map: texture }); // Create a unique material for each plane
				const planeImage = new THREE.Mesh(roundedRectGeometry ,  planeMaterial); 
				// planeImage.position.set(bar.position.x, bar.position.y, bar.position.z + 0.51); // Adjust position as needed
				planeImage.position.set(bar.position.x, bar.position.y + barHeight/2 - 0.5, realBarPosFrontZ); // Adjust position as needed

				planeImage.rotation.y = 0; // Rotate to make the plane face forward
				planes.push(planeImage); // Add the plane to  the planes array
				scene.add(planeImage);

			});
		}

  
		const titles = [
		  { title: barInfo.title1, color: 0xffffff, size: 0.1, font: loadedFonts[0] },
		  { title: barInfo.title2, color: 0xffffff, size: 0.08, font: loadedFonts[1] },
		  { title: barInfo.title3, color: 0xffffff, size: 0.05, font: loadedFonts[2] },
		  { title: barInfo.title4, color: 0xffffff, size: 0.1, font: loadedFonts[3] },
		];
	  
		titles.forEach((title, index) => {
			const matLite = new THREE.MeshBasicMaterial({
			  color: title.color,
			  transparent: true,
			  opacity: 1,
			  side: THREE.DoubleSide,
			});
	  
			if (title.font) {
			const shapes = title.font.generateShapes(title.title, title.size);
			const geometry = new THREE.ShapeGeometry(shapes);
			geometry.computeBoundingBox();
			const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
			geometry.translate(xMid, 0, 0);
	  
			const text = new THREE.Mesh(geometry, matLite);
			text.position.set(bar.position.x, bar.position.y + (barHeight/2) - 2 + (index * 0.2), realBarPosFrontZ);
	  
			texts.push(text);
			scene.add(text);
			}
		  });


		reverseIndex--;
		

		let targetPosition = new THREE.Vector3(bar.position.x, barHeight-1, 3); // Adjust Y offset as needed
		targetPositions.push(targetPosition);


	})

	startCameraPosition = targetPositions[0];
	// endCameraPosition = new THREE.Vector3(2, 3, 3);


	// console.log("targetPosition", targetPositions);
	camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
	// // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.copy(startCameraPosition);

	camera.rotation.set(0, Math.PI*2, 0); // Rotate -90 degrees around the Y-axis

   
}






function handleImageUpload(event) {
	const files =  event.target.files; // Get the list of uploaded files 
  
	// Process each uploaded file
	for ( const file of files) {
	  const reader  = new FileReader();
  
	  reader.onload = function(e) {
		const image = new Image();
		image.src =  e.target.result;  
		let name = file.name;
		image.onload = function() { 
				
		  const texture = new THREE.Texture(this); 
		  texture.needsUpdate = true; 
		  console.log(name,"name");
		  user_textures.push({"name":name,"texture":texture}); // Store the loaded texture
  
		// If there are enough planes for the uploaded textures, update the materials
		//    if (planes.length >= textures.length) {
		// 	updateTexture(); 
		//   }else{
			
		// 	console.log("Not enough planes for the uploaded textures",textures.length, planes.length);
		//   }
		hasUploadedImgs = true;
		};
	  }; 
  
	  reader.readAsDataURL(file);
	}
  }
  



function RoundedRectangle( w, h, r, s ) { // width, height, radius corner, smoothness  
	
	// helper const's
	const wi = w / 2 - r;		// inner width
	const hi = h / 2 - r;		// inner height
	const w2 = w / 2;			// half width
	const h2 = h / 2;			// half height
	const ul = r / w;			// u left
	const ur = ( w - r ) / w;	// u right
	const vl = r / h;			// v low
	const vh = ( h - r ) / h;	// v high
	
	let positions = [
	
		-wi, -h2, 0,  wi, -h2, 0,  wi, h2, 0,
		-wi, -h2, 0,  wi,  h2, 0, -wi, h2, 0,
		-w2, -hi, 0, -wi, -hi, 0, -wi, hi, 0,
		-w2, -hi, 0, -wi,  hi, 0, -w2, hi, 0,
		 wi, -hi, 0,  w2, -hi, 0,  w2, hi, 0,
		 wi, -hi, 0,  w2,  hi, 0,  wi, hi, 0
		
	];
	
	let uvs = [
		
		ul,  0, ur,  0, ur,  1,
		ul,  0, ur,  1, ul,  1,
		 0, vl, ul, vl, ul, vh,
		 0, vl, ul, vh,  0, vh,
		ur, vl,  1, vl,  1, vh,
		ur, vl,  1, vh,	ur, vh 
		
	];
	
	let phia = 0; 
	let phib, xc, yc, uc, vc, cosa, sina, cosb, sinb;
	
	for ( let i = 0; i < s * 4; i ++ ) {
	
		phib = Math.PI * 2 * ( i + 1 ) / ( 4 * s );
		
		cosa = Math.cos( phia );
		sina = Math.sin( phia );
		cosb = Math.cos( phib );
		sinb = Math.sin( phib );
		
		xc = i < s || i >= 3 * s ? wi : - wi;
		yc = i < 2 * s ? hi : -hi;
	
		positions.push( xc, yc, 0, xc + r * cosa, yc + r * sina, 0,  xc + r * cosb, yc + r * sinb, 0 );
		
		uc =  i < s || i >= 3 * s ? ur : ul;
		vc = i < 2 * s ? vh : vl;
		
		uvs.push( uc, vc, uc + ul * cosa, vc + vl * sina, uc + ul * cosb, vc + vl * sinb );
		
		phia = phib;
			
	}
	
	const geometry = new THREE.BufferGeometry( );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );
	geometry.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvs ), 2 ) );
	
	return geometry;
	
}




