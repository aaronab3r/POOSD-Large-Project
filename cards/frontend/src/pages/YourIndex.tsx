// Cards endpoint, deleteCard, uploadCard, editCard


import { useState } from "react";
import backgroundImage from "./images/background.jpg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./styles/YourIndex.css";
import { retrieveToken, storeToken } from "../tokenStorage";
import { jwtDecode } from "jwt-decode";
import { JWTPayLoad } from "./interfaces/interfaces";

interface Finding {
  id: number;
  imageUrl: string;
  location: string;
  date: Date;
  keywords: string[];
}

interface Styles {
  container: React.CSSProperties;
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
  modalButtons: React.CSSProperties;
  confirmButton: React.CSSProperties;
  cancelButton: React.CSSProperties;
  helperText: React.CSSProperties;
}

export default function YourIndex() {

  // Load the JWT to get the UserID
  // If we cannot load a JWT then the user is not logged in, and shouldn't be able to view this site
  var userId = -1
  try{
    const jwtToken = retrieveToken() as any;

    const decoded = jwtDecode(jwtToken) as JWTPayLoad;
    storeToken(jwtToken);

    userId = decoded.userId;
  }
  catch(e: any)
  {
    alert(e.toString() )
    return; // exit the page
    // might be a better idea to print out an error, then send the user back to the login page
  }

  // what we need for image upload
    // previewUrl
    // location
    // date
    // keywords (keywordsArray in handleSubmit)
    // userId
    // generate a CardId (id in handlesubmit seems to do this)
    // a Date for CreatedAt and UpdatedAt
      // both of these variables for upload will be set to "new Date()"


  // what we need for image edit
    // new location
    // UpdateAt date (also just "new Date()")
    // new keywords
    // everything else stays the same

  // what we need for Get Image
    // CardId (as a parameter?)

  // what we need for search cards
    // location
    // tags (keywordsArray)
    // firstName (?)
    // lastName (?)
      // firstName and lastName should probably also be included in image upload if these are here

    // at least one of these must be provided


  // what we need for Edit cards
    // CardId (passed as a parameter in the endpoint?)
    // userId
    // tags
    // date
    // location
    // new image file (?)


  // what we need for Delete card
    // CardId

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowUploadForm(true);
    }
  };

  const handleSubmit = () => {
    if (location && date && keywords) {
      const keywordsArray = keywords.split(',').map(keyword => keyword.trim());
      const newFinding: Finding = {
        id: editingFinding ? editingFinding.id : findings.length + 1,
        imageUrl: editingFinding ? editingFinding.imageUrl : previewUrl!,
        location,
        date,
        keywords: keywordsArray,
      };

      if (editingFinding) {
        setFindings(prevFindings => 
          prevFindings.map(finding => 
            finding.id === editingFinding.id ? newFinding : finding
          ).sort((a, b) => b.date.getTime() - a.date.getTime())
        );
        setEditingFinding(null);
      } else {
        if (!selectedImage) return; // Only require image for new findings
        setFindings(prevFindings => 
          [...prevFindings, newFinding].sort((a, b) => b.date.getTime() - a.date.getTime())
        );
      }

      setShowUploadForm(false);
      setSelectedImage(null);
      setLocation("");
      setDate(new Date());
      setPreviewUrl(null);
      setKeywords("");
    }
  };

  const handleEditClick = (finding: Finding) => {
    setEditingFinding(finding);
    setLocation(finding.location);
    setDate(finding.date);
    setKeywords(finding.keywords.join(', '));
    setShowUploadForm(true);
  };

  const handleDeleteClick = (id: number) => {
    setFindingToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (findingToDelete !== null) {
      setFindings(prevFindings => 
        prevFindings.filter(finding => finding.id !== findingToDelete)
      );
      setShowDeleteConfirm(false);
      setFindingToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setFindingToDelete(null);
  };

  return (
    <div style={styles.container}>
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

      {showUploadForm && (
        <div style={styles.formContainer}>
          <h2 style={styles.subHeading}>Add Details</h2>
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
            <button onClick={handleSubmit} style={styles.submitButton}>
              Save Finding
            </button>
          </div>
        </div>
      )}

      <div style={styles.findingsGrid}>
        {findings.map((finding) => (
          <div key={finding.id} style={styles.findingCard}>
            <img
              src={finding.imageUrl}
              alt={`Finding ${finding.id}`}
              style={{ ...styles.findingImage, objectFit: "cover" as const }}
            />
            <div style={styles.findingDetails}>
              <p style={styles.detailText}>Location: {finding.location}</p>
              <p style={styles.detailText}>
                Date: {finding.date.toLocaleDateString()}
              </p>
              <p style={styles.detailText}>
                Keywords: {finding.keywords.join(', ')}
              </p>
              <div style={styles.buttonContainer}>
                <button 
                  onClick={() => handleEditClick(finding)}
                  style={styles.editButton}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteClick(finding.id)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDeleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this finding?</p>
            <div style={styles.modalButtons}>
              <button onClick={handleDeleteConfirm} style={styles.confirmButton}>
                Yes, Delete
              </button>
              <button onClick={handleDeleteCancel} style={styles.cancelButton}>
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
    minHeight: "100vh",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "20px",
  },
  heading: {
    fontSize: "40px",
    color: "white",
    textAlign: "center" as "center",
    marginBottom: "30px",
  },
  uploadSection: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
  },
  fileInput: {
    display: "none",
  },
  uploadButton: {
    padding: "10px 20px",
    backgroundColor: "yellow",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    display: "inline-block",
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: "20px",
    borderRadius: "15px",
    maxWidth: "500px",
    margin: "0 auto 30px",
  },
  subHeading: {
    marginBottom: "20px",
    textAlign: "center" as "center",
  },
  form: {
    display: "flex",
    flexDirection: "column" as "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as "column",
    gap: "5px",
  },
  label: {
    fontWeight: "bold",
  },
  input: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  datePickerWrapper: {
    width: "100%",
  },
  submitButton: {
    padding: "10px",
    backgroundColor: "yellow",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  findingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    padding: "20px",
  },
  findingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  },
  findingImage: {
    width: "100%",
    height: "200px",
  },
  findingDetails: {
    padding: "15px",
  },
  detailText: {
    margin: "5px 0",
    fontSize: "14px",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  editButton: {
    padding: "8px 16px",
    backgroundColor: "#4285f4",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    flex: 1,
  },
  deleteButton: {
    padding: "8px 16px",
    backgroundColor: "#ff4444",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    flex: 1,
  },
  modalOverlay: {
    position: "fixed" as "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center" as "center",
    maxWidth: "400px",
    width: "90%",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
  },
  confirmButton: {
    padding: "8px 16px",
    backgroundColor: "#ff4444",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "8px 16px",
    backgroundColor: "#ccc",
    color: "black",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  helperText: {
    margin: "5px 0",
    fontSize: "14px",
  },
}; 