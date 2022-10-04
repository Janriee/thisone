const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
 
]).then(startVideo)

async function startVideo() {
  const LabeledFaceDescritors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(LabeledFaceDescritors, 0.6)
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    
    
  }, 100)
})
results.forEach((result, i) => {
  const box = detection.detection.box
  const drawBox = new faceapi.draw.DrawBox(box, {label: result.toString() })
  drawBox.draw(canvas)
})

function loadLabeledImages() {
  const labels = ['John Rhiel Orbigo']

  return Promise.all(
    labels.map(async label =>{
      const descriptions = []
      for (let i =1;  i  <= 1; i++){
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/Janriee/Campst/main/capstone/labeled_images/${label}/${i}.jpg?token=GHSAT0AAAAAABZQSBBKVDQEGW6AYRLNFMVCYZ37NWQ`)
       
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
       descriptions.push(detections.descriptor)
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
