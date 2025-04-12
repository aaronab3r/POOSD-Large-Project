import { useNavigate } from "react-router";
import React, { useState, useEffect } from 'react';
import backgroundImage from "./images/FollowingBG.jpg";
import { retrieveToken, storeToken } from "../tokenStorage";
import { jwtDecode } from "jwt-decode";
import { JWTPayLoad, Finding } from "./interfaces/interfaces";
import { buildPath } from "../components/Path";

export default function Following() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<number>(-1);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'firstName' | 'lastName' | 'location' | 'tags'>('firstName');

  // Get the ID of the user logged in
  useEffect(() => {
    try {
      const jwtToken = retrieveToken() as any;
      const decoded = jwtDecode(jwtToken) as JWTPayLoad;
      storeToken(jwtToken);
      setUserId(decoded.userId);
    } catch (e: any) {
      alert("Please log in to view this page");
      // Redirect to login page
      navigate('/');
    }
  }, []);

  // Load all cards that don't belong to the user when userId changes or page loads
  useEffect(() => {
    if (userId === -1) return; // Don't run if userId hasn't been set
    
    // Only load all cards when the page loads (no search query)
    if (!searchQuery) {
      fetchAllCards();
    }
  }, [userId]); // Add userId as a dependency so this runs when userId is set

  // Function to fetch all cards not belonging to the user
  const fetchAllCards = async () => {
    if (userId === -1) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(buildPath(`api/cards/search?userId=${userId}`), {
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
      } else {
        // Handle case where data is not an array (could be an object with message and cards array)
        if (data.cards && Array.isArray(data.cards)) {
          const formattedFindings: Finding[] = data.cards.map((card: { CardID: Number; ImageUrl: string; Location: string; Date: string; Tags: string[]; }) => ({
            id: card.CardID,
            imageUrl: card.ImageUrl,
            location: card.Location,
            date: new Date(card.Date),
            keywords: card.Tags
          }));
          setFindings(formattedFindings.sort((a, b) => b.date.getTime() - a.date.getTime()));
        } else {
          setFindings([]);
        }
      }
    } catch (error) {
      console.error("Error fetching findings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setSearchQuery(input);
    
    // If search box is cleared, show all cards not belonging to the user
    if (!input.trim()) {
      fetchAllCards();
      return;
    }
    
    // Debounce the search execution (optional)
    const timeoutId = setTimeout(() => {
      executeSearch(input);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  // Execute search based on current search type and query
  const executeSearch = async (query: string) => {
    if (!query.trim() || userId === -1) return;
    
    setIsLoading(true);
    try {
      // Build the search URL based on the selected search type
      let searchUrl = buildPath(`api/cards/search?userId=${userId}&`);
      
      // Add the appropriate search parameter based on search type
      searchUrl += `${searchType}=${encodeURIComponent(query)}`;
      
      const response = await fetch(searchUrl, {
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
      } else {
        // Handle case where data is not an array
        if (data.cards && Array.isArray(data.cards)) {
          const formattedFindings: Finding[] = data.cards.map((card: { CardID: Number; ImageUrl: string; Location: string; Date: string; Tags: string[]; }) => ({
            id: card.CardID,
            imageUrl: card.ImageUrl,
            location: card.Location,
            date: new Date(card.Date),
            keywords: card.Tags
          }));
          setFindings(formattedFindings.sort((a, b) => b.date.getTime() - a.date.getTime()));
        } else {
          setFindings([]);
        }
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(e.target.value as 'firstName' | 'lastName' | 'location' | 'tags');
    
    // Re-execute search with new type if there's an active query
    if (searchQuery.trim()) {
      executeSearch(searchQuery);
    }
  };

  const logOut = () => {
    navigate("/");
  };

  return (
    <div style={styleFollow.background}>
      <div style={styleFollow.header}>
        <button style={styleFollow.buttons1} onClick={() => navigate("/your-gallery")}>Gallery</button>
        <button style={styleFollow.buttons1} onClick={() => navigate("/map")}>Map</button>
        <button style={styleFollow.buttons1} onClick={logOut}>Log Out</button>
      </div>
      
      <div style={styleFollow.titleDiv}>
        <h1 style={styleFollow.title}>Dive Deeper</h1>
      </div>
      
      <div style={styleFollow.searchBarDiv}>
        <div style={styleFollow.searchContainer}>
          <select 
            value={searchType} 
            onChange={handleSearchTypeChange}
            style={styleFollow.searchTypeSelect}
          >
            <option value="first name" style={styleFollow.optionText}>First Name</option>
            <option value="last name" style={styleFollow.optionText}>Last Name</option>
            <option value="location" style={styleFollow.optionText}>Location</option>
            <option value="tags" style={styleFollow.optionText}>Tags</option>
          </select>
          
          <input 
            type="text" 
            value={searchQuery} 
            onChange={handleSearchInputChange} 
            placeholder={`Search by ${searchType}...`} 
            style={styleFollow.searchBar}
          />
        </div>
      </div>
      
      <div style={styleFollow.resultBox}>
        {isLoading ? (
          <div style={styleFollow.loadingMessage}>Loading...</div>
        ) : findings.length === 0 ? (
          <div style={styleFollow.noResults}>No findings match your search criteria</div>
        ) : (
          <div style={styleFollow.findingsGrid}>
            {findings.map((finding) => (
              <div key={finding.id} style={styleFollow.findingCard}>
                <img
                  src={finding.imageUrl}
                  alt={`Finding ${finding.id}`}
                  style={styleFollow.findingImage}
                />
                <div style={styleFollow.findingDetails}>
                  <p style={styleFollow.cardText}>
                    <strong style={styleFollow.cardLabel}>Location:</strong> {finding.location}
                  </p>
                  <p style={styleFollow.cardText}>
                    <strong style={styleFollow.cardLabel}>Date:</strong> {finding.date.toLocaleDateString()}
                  </p>
                  <p style={styleFollow.cardText}>
                    <strong style={styleFollow.cardLabel}>Keywords:</strong> {finding.keywords.join(', ')}
                  </p>
                  <div style={styleFollow.buttonContainer}>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
    cursor: 'pointer',
    color: '#ffffff' // Black text for better visibility
    //fontWeight: 'bold'
  },
  titleDiv: {
    position: 'fixed' as 'fixed',
    marginTop: "-640px",
  },
  title: {
    fontSize: "40px",
    color: '#ffffff', // White text for the main title
    textAlign: 'center' as 'center',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' // Text shadow for better visibility
  },
  searchBarDiv: {
    marginTop: "-465px",
    height: "200px",
    width: "1600px",
    display: 'flex',
    justifyContent: 'center'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    justifyContent: 'center'
  },
  searchTypeSelect: {
    height: "60px",
    width: "150px",
    backgroundColor: "rgba(255, 255, 255, 0.9)", // More opaque for better readability
    border: "3px solid #000000",
    borderRadius: "15px",
    fontSize: "16px",
    padding: "0 10px",
    color: "#000000", // Black text for contrast
    fontWeight: "500" // Semi-bold for better visibility
  },
  optionText: {
    color: "#000000", // Black text for the dropdown options
    backgroundColor: "#ffffff" // White background for options
  },
  searchBar: {
    height: "60px",
    width: "850px",
    backgroundColor: "rgba(255, 255, 255, 0.9)", // More opaque for better readability
    border: "3px solid #000000",
    borderRadius: "35px",
    fontSize: "18px",
    padding: "0 20px",
    color: "#000000" // Black text for better visibility
  },
  resultBox: {
    marginTop: "240px",
    position: 'fixed' as 'fixed',
    height: "600px",
    width: "1600px",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker and more opaque for better contrast
    border: "2px solid #000000",
    overflowY: 'auto' as 'auto',
    padding: '20px',
    borderRadius: '10px' // Rounded corners
  },
  findingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    padding: "20px",
  },
  findingCard: {
    width: "300px",
    backgroundColor: "rgba(255, 255, 255, 0.95)", // Very opaque for better readability
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", // Stronger shadow for depth
    border: "1px solid #000000" // Black border for definition
  },
  findingImage: {
    width: "100%",
    height: "200px",
    objectFit: 'cover' as 'cover'
  },
  findingDetails: {
    padding: '15px',
    backgroundColor: "#ffffff" // White background for card details
  },
  cardText: {
    color: "#000000", // Black text for card details
    fontSize: "16px",
    margin: "8px 0"
  },
  cardLabel: {
    color: "#006080", // Dark teal color for labels
    fontWeight: "bold"
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px'
  },
  actionButton: {
    padding: '8px 20px',
    backgroundColor: '#0097b2',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' // Shadow for buttons
  },
  loadingMessage: {
    textAlign: 'center' as 'center',
    fontSize: '22px',
    marginTop: '40px',
    color: '#ffffff', // White text
    fontWeight: 'bold',
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)' // Text shadow for better visibility
  },
  noResults: {
    textAlign: 'center' as 'center',
    fontSize: '22px',
    marginTop: '40px',
    color: '#ffffff', // White text
    fontWeight: 'bold',
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)' // Text shadow for better visibility
  }
};