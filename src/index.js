import ReactDOM from 'react-dom/client';
import './style.css';
import React, { Fragment, useEffect, useState } from 'react';
import { createApi } from "unsplash-js";

import { FastAverageColor } from 'fast-average-color';
const fac = new FastAverageColor();

const api = [];

api[0] = createApi({
  //accessKey: API-KEY
});

api[1] = createApi({
  //accessKey: API-KEY
});

const PhotoComp = ({photo, id}) => {
  // const [color, colorSetter] = useState(null);
  
  
  // useEffect(() => {
  //   if (color) {
  //     document.body.style.backgroundColor = color;
  //   }
  // }, [color]);

  if (!photo) {
    return null;
  }

  const { user, urls } = photo;

  return (
    <>
      <img className={"img-container"} id={id} src={urls["full"]} alt={user.name}/>
      <a style={{display: 'block'}}
        className="credit"
        href={`https://unsplash.com/@${user.username}`}
      >
        {user.name}
      </a>
    </>
  );
};

const Body = () => {
  const [data, setData] = useState([null, null]); // Array for two images
  const [selectedTag, setTag] = useState(0); // 0 or 1 to track which image is visible
  const [colors, setColor] = useState(["#000000", "#000000"]);
  
  const fetchImage = (tagId) => {
    return api[tagId].photos
      .getRandom({
        count: 1,
        orientation: 'landscape',
      })
      .then((result) => {
        setData((prevState) => {
          const newData = [...prevState];
          newData[tagId] = result; // Update the image for the given tagId
          return newData;
        });
      })
      .catch(() => {
        console.log('error in fetch!');
      });
  };

  const changeColor = (tagId) =>{ 
    data[tagId].response.map(photo =>{
      fac.getColorAsync(photo.urls["small"])
        .then(color => {
          console.log(color.rgba);
          setColor((prevStat) =>{
            const colors = [...prevStat];
            colors[tagId] = color.rgba;
            return colors;
        });
      })
    })
  }



  useEffect(()=>{
    fetchImage(selectedTag)
  });

  useEffect(() => {
    const hiddenTag = selectedTag === 0 ? 1 : 0;
    const timeoutId = setTimeout(() => {
      fetchImage(hiddenTag); // Actualiza la imagen despues de 3 segundo
    }, 3000);
    
    return () => clearTimeout(timeoutId); // Cleanup timeout
  }, [selectedTag]);
  

  useEffect(()=>{
    const hiddenTag = selectedTag === 0 ? 1 : 0;
    if (data[hiddenTag] != null){
      changeColor(hiddenTag);
    }
  }, [data]);
  

  useEffect(() => {
  const interval = setInterval(() => {
    setTag((prevTag) => (prevTag === 0 ? 1 : 0)); // Switch the visible tag every 20 seconds
  }, 36000);

    return () => clearInterval(interval); // Cleanup
  }, []);
  

  return (
    <div id="feed">
    <div
      style={{
        backgroundColor: colors[0],
        opacity: selectedTag === 0 ? 1 : 0,
        //opacity: 1,
        transition: 'opacity 2s',
        position: 'absolute',
        height: '100vh',
        width: '100%',
      }}
    >
      {data[0] ?(
        data[0].response.map(photo => (
          <PhotoComp photo={photo} id={"image_0"} />
        ))
      ) : (
        <PhotoComp photo={data[0]} id={"image_0"} />
      )}

    </div>

    <div
      style={{
        backgroundColor: colors[1],
        opacity: selectedTag === 1 ? 1 : 0,
        transition: 'opacity 2s',
        position: 'absolute',
        height: '100vh',
        width: '100%',
      }}
    >

      {data[1] ?(
        data[1].response.map(photo => (
          <PhotoComp photo={photo} id={"image_1"} />
        ))
      ) : (
        <PhotoComp photo={data[1]} id={"image_1"} />
      )}

    </div>
  </div>
  );
};

const Home = () => {
  return (
    <Body />
  );
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Home />
);