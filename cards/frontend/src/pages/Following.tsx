import { useNavigate } from "react-router";
import React, { useState, useEffect } from 'react';
import backgroundImage from  "./images/FollowingBG.png";
import { retrieveToken, storeToken } from "../tokenStorage";
import { jwtDecode } from "jwt-decode";
import { JWTPayLoad, Finding } from "./interfaces/interfaces";
import { buildPath } from "../components/Path";


export default function Following()
{
    const navigate = useNavigate();
    const [userId, setUserId] = useState<number>(-1);
    const [firstName, setFirstName] = useState<string>('');

    const [findings, setFindings] = useState<Finding[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Get the ID of the user logged in
    useEffect(() => {
        try {
          const jwtToken = retrieveToken() as any;
          const decoded = jwtDecode(jwtToken) as JWTPayLoad;
          storeToken(jwtToken);
          setUserId(decoded.userId);
          setFirstName(decoded.firstName);
        } catch (e: any) {
          alert("Please log in to view this page");
          // Redirect to login page
          navigate('/');
        }
      }, []);

    // Load all pictures that don't belong to the user
    useEffect(() => {
    async function fetchUserFindings() {
        if (userId === -1) return;
        
        setIsLoading(true);
        try {
        const response = await fetch(buildPath(`api/cards/search?firstName=${firstName}`), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
            const formattedFindings: Finding[] = data.map(card => ({
            id: card.CardID,
            imageUrl: card.ImageUrl,
            location: card.Location,
            date: new Date(card.Date),
            keywords: card.Tags
            }));
            
            setFindings(formattedFindings.sort((a, b) => b.date.getTime() - a.date.getTime()));
        }
        } catch (error) {
        console.error("Error fetching findings:", error);
        } finally {
        setIsLoading(false);
        }
    }
    
    if (userId !== -1) {
        fetchUserFindings();
    }
    }, [userId]);

    const [query, setQuery] = useState('');

    const logOut = () => 
    {
        navigate("/login");
    };
   

  
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.toLowerCase();
        setQuery(input);

        // send the Query to the search api

        // set findings to what the api returns
            // the second useEffect has an example
    };

    return (
        <div style={styleFollow.background}>
            <div style={styleFollow.header}>
                <button style={styleFollow.buttons1} onClick={() => navigate("/your-index")}>Gallery</button>
                <button style={styleFollow.buttons1} onClick={() => navigate("/map")}>Map</button>
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
                {findings.map((finding) => (
                    <div key={finding.id}>
                    <img
                      src={finding.imageUrl}
                      alt={`Finding ${finding.id}`}
                    />
                    <div>
                      <p><strong>Location:</strong> {finding.location}</p>
                      <p>
                        <strong>Date:</strong> {finding.date.toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Keywords:</strong> {finding.keywords.join(', ')}
                      </p>
                      <div>
                        <button 
                          //onClick={() => handleEditClick(finding)}
                          disabled={isLoading}
                        >
                          Edit
                        </button>
                        <button 
                          //onClick={() => handleDeleteClick(finding.id)}
                          disabled={isLoading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
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