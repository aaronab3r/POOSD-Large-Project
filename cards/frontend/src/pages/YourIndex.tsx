import React, { useState, useEffect } from "react";
import backgroundImage from "./images/background.jpg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./styles/YourIndex.css";
import { retrieveToken, storeToken } from "../tokenStorage";
import { jwtDecode } from "jwt-decode";
import { JWTPayLoad } from "./interfaces/interfaces";
import { buildPath } from "../components/Path";
import { useNavigate } from "react-router-dom";

interface Finding {
  id: number;
  imageUrl: string;
  location: string;
  date: Date;
  keywords: string[];
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

export default function YourIndex() {
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
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [keywords, setKeywords] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [findingToDelete, setFindingToDelete] = useState<number | null>(null);
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);
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

  async function addCard(e: React.FormEvent<HTMLElement>): Promise<void> {
    e.preventDefault();

    if (!selectedImage || !location || !date) {
      alert("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('userId', userId.toString());
    formData.append('tags', keywords);
    formData.append('date', date.toISOString());
    formData.append('location', location);

    try {
      const response = await fetch(buildPath('api/cards'), {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header - browser will set it with boundary for FormData
      });

      const result = await response.json();
      
      if (result.error) {
        alert("Error: " + result.error);
      } else {
        // Add the new card to the findings state with the returned image URL
        const newFinding: Finding = {
          id: result.cardId,
          imageUrl: result.imageUrl,
          location,
          date: date || new Date(),
          keywords: keywords.split(',').map(keyword => keyword.trim())
        };
        
        setFindings(prevFindings => 
          [...prevFindings, newFinding].sort((a, b) => b.date.getTime() - a.date.getTime())
        );
        
        // Reset the form
        setShowUploadForm(false);
        setSelectedImage(null);
        setLocation("");
        setDate(new Date());
        setPreviewUrl(null);
        setKeywords("");
      }
    } catch (error: unknown) {
      alert("Error submitting finding: " + (error instanceof Error ? error.toString() : String(error)));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEditSubmit(): Promise<void> {
    if (!location || !date || !keywords) {
      alert("Please fill all required fields");
      return;
    }

    if (!editingFinding) {
      alert("No finding selected for editing");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    if (selectedImage) {
      formData.append('image', selectedImage);
    }
    
    formData.append('userId', userId.toString());
    formData.append('tags', keywords);
    formData.append('date', date.toISOString());
    formData.append('location', location);

    try {
      const response = await fetch(buildPath(`api/cards/${editingFinding.id}`), {
        method: 'PUT',
        body: formData
      });

      const result = await response.json();
      
      if (!result.success) {
        alert("Error updating finding: " + result.error);
      } else {
        // Update the finding in state
        const updatedFinding: Finding = {
          id: editingFinding.id,
          imageUrl: result.imageUrl || editingFinding.imageUrl,
          location,
          date: date || new Date(),
          keywords: keywords.split(',').map(keyword => keyword.trim())
        };
        
        setFindings(prevFindings => 
          prevFindings.map(finding => 
            finding.id === editingFinding.id ? updatedFinding : finding
          ).sort((a, b) => b.date.getTime() - a.date.getTime())
        );
        
        // Reset form
        setEditingFinding(null);
        setShowUploadForm(false);
        setSelectedImage(null);
        setLocation("");
        setDate(new Date());
        setPreviewUrl(null);
        setKeywords("");
      }
    } catch (error) {
      alert("Error updating finding: " + String(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteConfirm(): Promise<void> {
    if (findingToDelete === null) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(buildPath(`api/cards/${findingToDelete}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (result.success) {
        setFindings(prevFindings => 
          prevFindings.filter(finding => finding.id !== findingToDelete)
        );
      } else {
        alert("Error deleting finding: " + result.error);
      }
      
      setShowDeleteConfirm(false);
      setFindingToDelete(null);
    } catch (error) {
      alert("Error deleting finding: " + String(error));
    } finally {
      setIsLoading(false);
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowUploadForm(true);
    }
  };

  const handleSubmit = () => {
    if (editingFinding) {
      handleEditSubmit();
    } else {
      addCard(new Event('submit') as unknown as React.FormEvent<HTMLElement>);
    }
  };

  const handleEditClick = (finding: Finding) => {
    setEditingFinding(finding);
    setLocation(finding.location);
    setDate(finding.date);
    setKeywords(finding.keywords.join(', '));
    setPreviewUrl(finding.imageUrl);
    setShowUploadForm(true);
  };

  const handleDeleteClick = (id: number) => {
    setFindingToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setFindingToDelete(null);
  };

  if (userId === -1) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Your Findings</h1>
        
        <div style={styles.uploadSection}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={styles.fileInput}
            id="image-upload"
          />
          <label htmlFor="image-upload" style={styles.uploadButton}>
            Upload Findings
          </label>
        </div>
      </div>

      {showUploadForm && (
        <div style={styles.formContainer}>
          <h2 style={styles.subHeading}>
            {editingFinding ? "Edit Finding" : "Add Details"}
          </h2>
          
          {previewUrl && (
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{ 
                  maxWidth: "100%", 
                  maxHeight: "200px", 
                  objectFit: "contain",
                  borderRadius: "8px",
                  border: "2px solid #3b82f6"
                }} 
              />
            </div>
          )}
          
          <div style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Location:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={styles.input}
                placeholder="Enter location"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Date:</label>
              <div style={styles.datePickerWrapper}>
                <DatePicker
                  selected={date}
                  onChange={(date: Date | null) => setDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className="date-picker-input"
                />
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Keywords:</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                style={styles.input}
                placeholder="Enter keywords separated by commas (e.g., fish, coral, reef)"
              />
              <p style={styles.helperText}>Separate keywords with commas</p>
            </div>
            <button 
              onClick={handleSubmit} 
              style={{
                ...styles.submitButton,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer"
              }}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : editingFinding ? "Update Finding" : "Save Finding"}
            </button>
          </div>
        </div>
      )}

      {isLoading && !showUploadForm && (
        <div style={{ textAlign: "center", padding: "20px", color: "#ffffff" }}>
          Loading your findings...
        </div>
      )}

      <div style={styles.findingsGrid}>
        {findings.length === 0 && !isLoading ? (
          <div style={{ 
            gridColumn: "1 / -1", 
            textAlign: "center", 
            padding: "40px", 
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: "10px"
          }}>
            <p>You haven't uploaded any findings yet. Use the "Upload Findings" button to get started!</p>
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
                    onClick={() => handleEditClick(finding)}
                    style={styles.editButton}
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(finding.id)}
                    style={styles.deleteButton}
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showDeleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Confirm Delete</h3>
            <p style={styles.modalText}>Are you sure you want to delete this finding?</p>
            <div style={styles.modalButtons}>
              <button 
                onClick={handleDeleteConfirm} 
                style={styles.confirmButton}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Yes, Delete"}
              </button>
              <button 
                onClick={handleDeleteCancel} 
                style={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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