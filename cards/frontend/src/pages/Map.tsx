import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import "./styles/Map.css";
import 'mapbox-gl/dist/mapbox-gl.css';

function Map() {
  // Add proper TypeScript type annotations to refs
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [addingPoint, setAddingPoint] = useState(false);
  const [newFeatures, setNewFeatures] = useState<any[]>([]);

  useEffect(() => {
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || '';
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/as152079/cm99fbzlm004l01s8heuh0ii9',
      center: [-84, 28], // starting position [lng, lat]
      zoom: 5 // starting zoom
    });

    // Wait for the map to load before adding interactions
    mapRef.current.on('load', () => {
      // Assuming your style has a layer with points
      const pointsLayerId = 'fishnettiles';
      
      // Add click event to the points layer
      // Line Changed, this was before: mapRef.current!.on('click', pointsLayerId, (e) => {
      mapRef.current!.on('click', pointsLayerId, (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
        if (addingPoint) return; // Skip if we're in adding point mode
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        if (feature.geometry.type === 'Point') {
          const coordinates = feature.geometry.coordinates.slice();
          const title = feature.properties?.title;
          const description = feature.properties?.description;
          
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }
          
          new mapboxgl.Popup()
            .setLngLat(coordinates as mapboxgl.LngLatLike)
            .setHTML(`<h3>${title}</h3><p>${description}</p>`)
            .addTo(mapRef.current!);
        }
      });
      
      // Add click event to the map for adding new points
      // Line Changed, this was before: mapRef.current!.on('click', (e) => {
      mapRef.current!.on('click', (e: mapboxgl.MapMouseEvent) => {
        if (!addingPoint) return;
        
        // Create a form popup for the user to enter point details
        const popup = new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <h3>Add New Point</h3>
            <form id="new-point-form">
              <label>Title:<br><input type="text" id="point-title"></label><br>
              <label>Description:<br><textarea id="point-description"></textarea></label><br>
              <button type="submit">Save Point</button>
            </form>
          `)
          .addTo(mapRef.current!);
        
        // Handle form submission
        document.getElementById('new-point-form')?.addEventListener('submit', (event) => {
          event.preventDefault();
          
          const title = (document.getElementById('point-title') as HTMLInputElement).value;
          const description = (document.getElementById('point-description') as HTMLTextAreaElement).value;
          
          // Create a new feature
          const newFeature = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [e.lngLat.lng, e.lngLat.lat]
            },
            properties: {
              title,
              description
            }
          };
          
          // Add to our local state
          setNewFeatures(prev => [...prev, newFeature]);
          
          // Update the Mapbox dataset
          updateMapboxDataset(newFeature);
          
          // Close the popup and exit adding mode
          popup.remove();
          setAddingPoint(false);
        });
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
  }, [addingPoint, newFeatures]);

  // Function to update Mapbox dataset
  const updateMapboxDataset = async (feature: any) => {
    try {
      // You'll need your dataset ID and access token
      const datasetId = 'cm90axaec075j1np8mlh63syt';
      const accessToken = process.env.REACT_APP_MAPBOX_SECRET_TOKEN || '';
      const username = 'as152079'; // Your Mapbox username
      
      // Generate a unique ID for the feature
      const featureId = `point-${Date.now()}`;
      
      // API endpoint for adding a feature to a dataset
      const url = `https://api.mapbox.com/datasets/v1/${username}/${datasetId}/features/${featureId}?access_token=${accessToken}`;
      
      // Send the feature to Mapbox
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feature)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update dataset: ${response.statusText}`);
      }
      
      console.log('Feature added successfully');
      
      // Optionally, trigger the export to a tileset
      exportDatasetToTileset(datasetId);
    } catch (error) {
      console.error('Error updating dataset:', error);
    }
  };

  // Function to export dataset to a tileset
  const exportDatasetToTileset = async (datasetId: string) => {
    try {
      const accessToken = process.env.REACT_APP_MAPBOX_SECRET_TOKEN || '';
      const username = 'as152079'; // Your Mapbox username
      const tilesetId = 'as152079.cm90axaec075j1np8mlh63syt-2dcjb';
      
      // API endpoint for publishing a dataset to a tileset
      const url = `https://api.mapbox.com/uploads/v1/${username}?access_token=${accessToken}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tileset: `${tilesetId}`,
          url: `mapbox://datasets/${username}/${datasetId}`,
          name: 'FishNetTiles'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to export dataset: ${response.statusText}`);
      }
      
      console.log('Dataset exported to tileset successfully');
    } catch (error) {
      console.error('Error exporting dataset:', error);
    }
  };

  return (
    <>
      <div id='map-container' ref={mapContainerRef}/>
      <button 
        onClick={() => setAddingPoint(!addingPoint)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1,
          padding: '10px',
          backgroundColor: addingPoint ? '#ff6b6b' : '#4dabf7',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {addingPoint ? 'Cancel' : 'Add Point'}
      </button>
      {addingPoint && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '10px',
          zIndex: 1,
          padding: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '4px'
        }}>
          Click on the map to add a new point
        </div>
      )}
    </>
  )
}

export default Map