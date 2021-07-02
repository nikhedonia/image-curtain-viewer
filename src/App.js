import logo from './logo.svg';
import './App.css';
import { useState, useRef, useEffect, useCallback } from 'react';
import {useDropzone} from 'react-dropzone'

const cache = {};

const loadImage = (url) => {
  if(cache[url]) return Promise.resolve(cache[url]);
  var img = new Image();
  cache[url] = img;
  const p = new Promise(done => {
    img.onload = () => {
      done(img);
    };
  });
  img.src = url;
  return p;
}

const setMousePos = (set) => e => {
    const el = e.target;
    const {left, top} = el.getBoundingClientRect()
    const {clientX, clientY} = e;  
    console.log('mousemove', clientX, clientY)    
    set({
      x: clientX-left, 
      y: clientY-top
    });
}

function MyDropzone({onLoad}) {
  const [images, setImages] = useState([]);
  
  const onDrop = useCallback(files => {
    console.log(files);
    
    const loaded = [];

    for (const file of files) {
      const reader = new FileReader();

      reader.onload = () => {
        const data = reader.result
        loaded.push(data);
        if (loaded.length == files.length) {
          setImages([...images, ...loaded]);
        }
      }

      reader.readAsDataURL(file);
    }

  }, []);

  onLoad(images);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return <>
    <div {...getRootProps()} style={{minHeight:"200px"}}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop in two images of same size here ...</p> :
          <p>Drag 'n' drop two images of same size here, or click to select files</p>
      }
    </div>
    <div>{images.map(x=>
      <img 
        src={x} 
        key={x} 
        height={100} 
        width={100} 
        style={{margin: "5px", border: "1px solid black"}} />
    )}</div>
  </>
}


//const lena = "https://upload.wikimedia.org/wikipedia/en/7/7d/Lenna_%28test_image%29.png";
//const lena2 = "https://boofcv.org/images/c/c1/Example_lena_gaussian_blur.jpg"

function App() {
  const [images, setImages] = useState([]);
  const [toggle, setToggle] = useState(0);
  const [{x,y}, set] = useState({x:512,y:512});
  const ref = useRef(null);

    useEffect(()=>{
      if (ref.current && images.length>=2) {
        (async () => {
          const canvas = ref.current;
          const ctx = canvas.getContext("2d");
          const shouldSwap = (toggle % 4) > 1;
          const img1 = await loadImage(images[0]);
          const img2 = await loadImage(images[1]);

          const [a, b] = shouldSwap ? [img1, img2] : [img2, img1]

          ctx.clearRect(0, 0, ref.current.width, ref.current.height);

          const width = Math.max(a.naturalWidth, b.naturalWidth);
          const height = Math.max(a.naturalHeight, b.naturalHeight);

          canvas.width = width;
          canvas.height = height;
          
          if(toggle % 2) {
            ctx.drawImage(a, 
              0, 0, 
              x, height, 
              0, 0, 
              x, height);

            ctx.drawImage(b, 
              x, 0, 
              width, height, 
              x, 0, 
              width, height);
          } else {

            ctx.drawImage(a, 
              0, 0, 
              width, y, 
              0, 0, 
              width, y);

            ctx.drawImage(b, 
              0, y, 
              width, height, 
              0, y, 
              width, height);            
          }
        
        })()
      }
    }, [x,y, toggle]);
  

  return (
    <>
      <h1>Image Viewer</h1>
      <canvas 
        ref={ref}
        width={512}
        height={512}
        style={{border: "solid 1px black", margin: "10px", padding: "10px", background: "black"}}
        onClick={()=>setToggle(toggle+1)}
        onMouseMove={setMousePos(set)}/>
      <MyDropzone onLoad={setImages}/>
    </>
  )
}

export default App;
