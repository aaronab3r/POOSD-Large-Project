import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { JWTPayLoad, Finding } from "./interfaces/interfaces";
import { retrieveToken, storeToken } from "../tokenStorage";
import { jwtDecode } from "jwt-decode";
import { buildPath } from "../components/Path";
import backgroundImage from  "./images/FollowingBG.png";


type image = 
{
    id: number;
    imageUrl: string;
    location: string;
    date: string;
    tags: string;
}


interface Styles {
  container: React.CSSProperties;
  header: React.CSSProperties;
  heading: React.CSSProperties;
  uploadSection: React.CSSProperties;
  fileInput: React.CSSProperties;
  uploadButton: React.CSSProperties;
  formContainer: React.CSSProperties;
  subHeading: React.CSSProperties;
  form: React.CSSProperties;
  inputGroup: React.CSSProperties;
  label: React.CSSProperties;
  input: React.CSSProperties;
  datePickerWrapper: React.CSSProperties;
  submitButton: React.CSSProperties;
  findingsGrid: React.CSSProperties;
  findingCard: React.CSSProperties;
  findingImage: React.CSSProperties;
  findingDetails: React.CSSProperties;
  detailText: React.CSSProperties;
  buttonContainer: React.CSSProperties;
  editButton: React.CSSProperties;
  deleteButton: React.CSSProperties;
  modalOverlay: React.CSSProperties;
  modalContent: React.CSSProperties;
  modalTitle: React.CSSProperties;
  modalText: React.CSSProperties;
  modalButtons: React.CSSProperties;
  confirmButton: React.CSSProperties;
  cancelButton: React.CSSProperties;
  helperText: React.CSSProperties;
}

export default function Following()
{
    // Load the JWT to get the UserID
    // If we cannot load a JWT then the user is not logged in, and shouldn't be able to view this site
    const [userId, setUserId] = useState<number>(-1);
    const [firstName, setFirstName] = useState<string>('');
    // ^ this exists only for line 93 to get the logged in user's cards shown
    const navigate = useNavigate();
    
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

    const [findings, setFindings] = useState<Finding[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Fetch user's findings when component mounts
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
                {filteredImages.map((img, index) => (
                    <div key={index} style={styleFollow.findingCard}>
                        <div style={styles.findingsGrid}>
                            {findings.length === 0 && !isLoading ? (
                                <div style={{ 
                                    gridColumn: "1 / -1", 
                                    textAlign: "center", 
                                    padding: "40px", 
                                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                                    borderRadius: "10px"
                                }}>
                                    <p>No Images Found</p>
                            </div>
                            ) : (
                                findings.map((finding) => (
                                    <div key={finding.id} style={styles.findingCard}>
                                        <img
                                            src={finding.imageUrl}
                                            alt={`Finding ${finding.id}`}
                                            style={{ ...styles.findingImage, objectFit: "cover" as const }}
                                        />
                                        <div style={styles.findingDetails}>
                                            <p style={styles.detailText}><strong>Location:</strong> {finding.location}</p>
                                            <p style={styles.detailText}>
                                                <strong>Date:</strong> {finding.date.toLocaleDateString()}
                                            </p>
                                            <p style={styles.detailText}>
                                                <strong>Keywords:</strong> {finding.keywords.join(', ')}
                                            </p>
                                            <div style={styles.buttonContainer}>
                                                <button 
                                                    style={styles.editButton}
                                                    disabled={isLoading}
                                                >
                                                    Like
                                                </button>
                                                <button 
                                                    style={styles.deleteButton}
                                                    disabled={isLoading}
                                                >
                                                    Comment
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
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


const styles: Styles = {
    container: {
      display: "flex",
      flexDirection: "column" as "column",
      alignItems: "center",
      width: "100vw",
      minHeight: "100vh",
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      paddingBottom: "40px",
    },
    header: {
      width: "100%",
      display: "flex",
      flexDirection: "column" as "column",
      alignItems: "center",
      padding: "30px 0",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      marginBottom: "30px",
    },
    heading: {
      fontSize: "45px",
      color: "#fff",
      textAlign: "center" as "center",
      marginBottom: "20px",
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
      fontWeight: "bold",
    },
    uploadSection: {
      display: "flex",
      justifyContent: "center",
    },
    fileInput: {
      display: "none",
    },
    uploadButton: {
      padding: "12px 30px",
      backgroundColor: "#1a365d",
      color: "#ffffff",
      borderRadius: "30px",
      cursor: "pointer",
      fontSize: "18px",
      display: "inline-block",
      fontWeight: "bold",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      transition: "transform 0.2s, box-shadow 0.2s",
      border: "2px solid #ffffff",
    },
    formContainer: {
      backgroundColor: "rgba(30, 41, 59, 0.85)",
      padding: "30px",
      borderRadius: "15px",
      maxWidth: "550px",
      margin: "0 auto 30px",
      width: "90%",
      boxShadow: "0 6px 16px rgba(0, 0, 0, 0.3)",
      color: "#ffffff",
    },
    subHeading: {
      marginBottom: "20px",
      textAlign: "center" as "center",
      fontSize: "28px",
      fontWeight: "bold",
      color: "#ffffff",
    },
    form: {
      display: "flex",
      flexDirection: "column" as "column",
      gap: "20px",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column" as "column",
      gap: "8px",
    },
    label: {
      fontWeight: "bold",
      fontSize: "16px",
      color: "#ffffff",
    },
    input: {
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #3b82f6",
      fontSize: "16px",
      backgroundColor: "#ffffff",
      color: "#333333",
      fontWeight: "normal",
    },
    datePickerWrapper: {
      width: "100%",
    },
    submitButton: {
      padding: "14px",
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "18px",
      fontWeight: "bold",
      marginTop: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transition: "background-color 0.3s",
    },
    findingsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: "25px",
      padding: "20px",
      width: "95%",
      maxWidth: "1600px",
    },
    findingCard: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    findingImage: {
      width: "100%",
      height: "220px",
    },
    findingDetails: {
      padding: "20px",
    },
    detailText: {
      margin: "8px 0",
      fontSize: "16px",
      color: "#333",
    },
    buttonContainer: {
      display: "flex",
      gap: "12px",
      marginTop: "15px",
    },
    editButton: {
      padding: "10px 16px",
      backgroundColor: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      flex: 1,
      fontWeight: "bold",
      transition: "background-color 0.3s",
    },
    deleteButton: {
      padding: "10px 16px",
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      flex: 1,
      fontWeight: "bold",
      transition: "background-color 0.3s",
    },
    modalOverlay: {
      position: "fixed" as "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "#ffffff",
      padding: "30px",
      borderRadius: "12px",
      textAlign: "center" as "center",
      maxWidth: "450px",
      width: "90%",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    },
    modalTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "15px",
      color: "#1e293b",
    },
    modalText: {
      fontSize: "18px",
      marginBottom: "20px",
      color: "#334155",
    },
    modalButtons: {
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      marginTop: "25px",
    },
    confirmButton: {
      padding: "12px 20px",
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      transition: "background-color 0.3s",
    },
    cancelButton: {
      padding: "12px 20px",
      backgroundColor: "#64748b",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      transition: "background-color 0.3s",
    },
    helperText: {
      margin: "0",
      fontSize: "14px",
      color: "#cbd5e1",
      fontStyle: "italic",
    },
  };