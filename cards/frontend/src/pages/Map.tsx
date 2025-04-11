import { useNavigate } from "react-router";
import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import "./styles/Map.css";

function Map() {
  // Add proper TypeScript type annotations to refs
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const logOut = () => 
  {
      navigate("/login");
  };

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/as152079/cm97o7sgy004c01qp3h800htc',
      center: [-84, 28], // starting position [lng, lat]
      zoom: 6 // starting zoom
    });

    // Wait for the map to load before adding interactions
    mapRef.current.on('load', () => {
      // Assuming your style has a layer with points
      // Replace 'your-points-layer-id' with the actual layer ID from your style
      const pointsLayerId = 'fishnettiles';
      
      // Add click event to the points layer
      mapRef.current!.on('click', pointsLayerId, (e) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        // Copy coordinates array
        // Type assertion to tell TypeScript this is a Point geometry
        // You can replace 'Point' with the actual geometry type you're using
        if (feature.geometry.type === 'Point') {
          const coordinates = feature.geometry.coordinates.slice();
          const firstName = feature.properties?.firstName; // example: RickL
          const keywords = feature.properties?.keywords; // example: something
          const imageUrl = feature.properties?.imageUrl // example: https://fish-net.s3.amazonaws.com/images/1744217317357_gibi.jpg
          const date = feature.properties?.date // example: 4/9/2025
          
          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }
          
          // Create and add the popup
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="display: flex; align-items: center; width: auto; position: relative; top: 10px;">
                <div style="flex: 1; padding-right: 15px;">
                  <h3 style="margin: 5px 0; color: #222222;">${firstName}</h3>
                  <p style="margin: 5px 0; color: #222222;">${date}</p>
                  <p style="margin: 5px 0; color: #222222;">${keywords}</p>
                </div>
                <div style="flex: 1;">
                  <img src="${imageUrl}" alt="${firstName}'s image" style="max-height: 100px; width: auto; border-radius: 5px;  color: #222222;" />
                </div>
              </div>
            `)
            .addTo(mapRef.current!);


        }
      });
      
      // Change cursor to pointer when hovering over points
      mapRef.current!.on('mouseenter', pointsLayerId, () => {
        mapRef.current!.getCanvas().style.cursor = 'pointer';
      });
      
      // Change cursor back when leaving points
      mapRef.current!.on('mouseleave', pointsLayerId, () => {
        mapRef.current!.getCanvas().style.cursor = '';
      });
    });

    return () => {
      mapRef.current?.remove()
    }
  }, [])

  const styleNavbar = {
    header: {
        width: '100%',
        height: '70px', 
        backgroundColor: '#0097b2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed' as 'fixed',
        top: 0,
        left: 0,
        zIndex: 10,
    },
    buttons1: {
      width: "200px",
      height: "65px",
      left: "50px",
      background: 'none',
      fontSize: "25px",
      textAlign: 'center' as 'center',
      border: 'black',
    },
  }

  return (
    <>
      <div style={styleNavbar.header}>
          <button style={styleNavbar.buttons1} onClick={() => navigate("/your-index")}>Gallery</button>
          <button style={styleNavbar.buttons1} onClick={() => navigate("/following-page")}>Discover</button>
          <button style={styleNavbar.buttons1} onClick={logOut}>
              Log Out
                </button>
        </div>
      <div id='map-container' ref={mapContainerRef}/>
    </>
  )
}

export default Map
