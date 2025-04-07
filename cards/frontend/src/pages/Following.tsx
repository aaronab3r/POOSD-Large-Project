import { useNavigate } from "react-router";
import React, { useState } from 'react';
import backgroundImage from  "./images/FollowingBG.png";


type image = 
{
    id: number;
    imageUrl: string;
    location: string;
    date: string;
    tags: string;
}

export default function Following()
{
    const navigate = useNavigate();
    
    const images: image[] = [
        {
            id: 8392,
            imageUrl: 'hadjhad',
            tags: 'sunset',
            date: '2025-04-01',
            location: 'Hawaii',
        },
        {
            id: 8392,
            imageUrl: 'hadjhad',
            tags: 'city',
            date: '2025-03-15',
            location: 'New York',
        },
        {
            id: 8392,
            imageUrl: 'hadjhad',
            tags: 'city',
            date: '2025-03-15',
            location: 'New York',
          },
        // more images...
      ];

    const [query, setQuery] = useState('');
    const [filteredImages, setFilteredImages] = useState<image[]>(images);

    const logOut = () => 
    {
        navigate("/login");
    };
   

  
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.toLowerCase();
        setQuery(input);

        const results = images.filter((img) => 
            img.tags.toLowerCase().includes(input) || 
            img.date.includes(input) || 
            img.location.toLowerCase().includes(input)
        );

        setFilteredImages(results);
    };

    return (
        <div style={styleFollow.background}>
            <div style={styleFollow.header}>
                <button style={styleFollow.buttons1} onClick={() => navigate("/YourIndex")}>Gallery</button>
                <button style={styleFollow.buttons1} onClick={() => navigate("/YourIndex")}>Map</button>
                <button style={styleFollow.buttons1} onClick={logOut}>
                    Log Out
                </button>
            </div>
            <div style={styleFollow.titleDiv}>
                <h1 style={styleFollow.title}>Dive Deeper</h1>
            </div>
            <div style={styleFollow.searchBarDiv}> 
                <input type="text" value={query} onChange={handleSearch} placeholder="Discover..." style={styleFollow.searchBar}/>
                {/*  add search button */}
            </div>
            <div style={styleFollow.resultBox}> {/*change highlight */}
            <div style={styleFollow.findingsGrid}>
                {filteredImages.map((img, index) => (
                    <div key={index} style={styleFollow.findingCard}>
                    <img
                        src={img.imageUrl}
                        alt={`Image ${index}`}
                        style={{ ...styleFollow.findingImage, objectFit: "cover" as const }}
                    />
                    </div>
                ))}
                </div>
            </div>   
        </div>
    );
}


const styleFollow = {
    background: {
        position: 'fixed' as 'fixed',
        top: 0,
        left: 0,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100vw',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
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
    titleDiv: {
        position: 'fixed' as 'fixed',
        marginTop: "-640px",
    },
    title: {
        fontSize: "40px",
        color: 'white',
        textAlign: 'center' as 'center',
    },
    searchBarDiv: {
        marginTop: "-465px",
        height: "200x",
        width: "1600px",
    },
    searchBar: {
        height: "60px",
        width: "1000px",
        backgroundColor: "rgba(255, 255, 255, 10)", // optional visual
        border: "3px solid black",
        borderRadius: "35px",
        marginTop: "-480px",
        fontSize: "18px",
    },
    resultBox: {
        marginTop: "240px",
        position: 'fixed' as 'fixed',
        height: "600px",
        width: "1600px",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        border: "2px solid black",
    },
    findingsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "20px",
        padding: "20px",
      },
      findingCard: {
        width: "300px",
        height: "300px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      },
      findingImage: {
        width: "100%",
        height: "200px",
      },
   
}