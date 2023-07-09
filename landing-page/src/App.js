import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import axios from 'axios';
const MapComponent = () => {
  const [markers, setMarkers] = useState([]);
  const [maxMarkReached, setMaxMarkReached] = useState(false);
  const [map, setMap] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  let poly = null;
  let clickListener = null;

  const mapRef = useRef(null);
  const imageRef = useRef(null);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

  const captureScreenshot = () => {
    html2canvas(mapRef.current).then((canvas) => {
      const imgData = canvas.toDataURL();
      setScreenshot(imgData);
    });
  };

  const addLatLng = (event) => {
    if (markers.length >= 4) {
      return;
    }

    
    const name = prompt('Enter a name:');
    if (!name) {
      alert('Name is required!');
      return;
    }

    const photo = prompt('Enter the URL of the uploaded photo:');
    if (!photo) {
      alert('Photo URL is required!');
      return;
    }

    const description = prompt('Enter a description:');
    if (!description) {
      alert('Description is required!');
      return;
    }

   
    const marker = new window.google.maps.Marker({
      position: event.latLng,
      map: map,
      icon: {
        url: photo,
        scaledSize: new window.google.maps.Size(50, 50),
      },
    });

    
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div><h3>Name:${name}</h3><img src="${photo}" width="100" height="100" /><p>Description:${description}</p></div>`,
    });

    marker.addListener('mouseover', () => {
      infoWindow.open(map, marker);
    });
    marker.addListener('mouseout', () => {
        infoWindow.close();
      });
    
    setMarkers((prevMarkers) => {
      const newMarkers = [...prevMarkers, marker];
      if (newMarkers.length === 4) {
        const lineCoordinates = newMarkers.map((marker) => marker.getPosition());
        poly.setPath([...lineCoordinates, newMarkers[0].getPosition()]);
        setMaxMarkReached(true);
        window.google.maps.event.removeListener(clickListener);
      } else if (newMarkers.length > 1) {
        const lineCoordinates = newMarkers.map((marker) => marker.getPosition());
        const prevMarker = newMarkers[newMarkers.length - 2];
        const line = new window.google.maps.Polyline({
          path: [prevMarker.getPosition(), marker.getPosition()],
          strokeColor: '#000000',
          strokeOpacity: 1.0,
          strokeWeight: 3,
          map: map,
        });
        poly.setPath([...lineCoordinates, marker.getPosition()]);
      }
      return newMarkers;
    });
  };

  
  const handleScreenshotClick = (event) => {
    if (!screenshot) {
      return;
    }

    const image = new Image();
    image.src = screenshot;
    image.onload = () => {
      const rect = imageRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setCoordinates({ x, y });
    };
  };
 

  const handleSaveClick = () => {
    axios.post('http://localhost:5000/api/save_coordinates', { x: coordinates.x, y: coordinates.y })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  };
  


  
  useEffect(() => {
    if (typeof window !== 'undefined') {
     
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBt--52_MWeDdDWJZc2HHM-6slB3HPbP_I&callback=initMap&v=weekly`;
      script.async = true;
      script.defer = true;

      window.initMap = () => {
        setMap(
          new window.google.maps.Map(document.getElementById('map'), {
            zoom: 7,
            center: { lat: 41.879, lng: -87.624 },
          })
        );
      };

      document.head.appendChild(script);
    }

    return () => {
      if (typeof window !== 'undefined') {
        const script = document.querySelector("script[src^='https://maps.googleapis.com/maps/api/js']");
        if (script) {
          document.head.removeChild(script);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (map) {
      poly = new window.google.maps.Polyline({
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: map,
      });

      clickListener = map.addListener('click', addLatLng);

      return () => {
        window.google.maps.event.removeListener(clickListener);
      };
    }
  }, [map]);

  return (
    <div>
      <div id="map" style={{ height: '100vh' }} ref={mapRef}></div>
      {maxMarkReached && <p>Maximum mark limit reached!</p>}
      <button onClick={captureScreenshot}>View</button>
      {screenshot && <img src={screenshot} alt="Screenshot" ref={imageRef} onClick={handleScreenshotClick} />}
      <div>
        <h2>Clicked Coordinates:</h2>
        <p>X: {coordinates.x}</p>
        <p>Y: {coordinates.y}</p>
        <button onClick={handleSaveClick}>Save</button>
      </div>
    </div>
  );
};

export default MapComponent;
