import { useState } from "react";
import backgroundImage from "./images/background.jpg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./styles/YourIndex.css";

interface Finding {
  id: number;
  imageUrl: string;
  location: string;
  date: Date;
}

export default function YourIndex() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowUploadForm(true);
    }
  };

  const handleSubmit = () => {
    if (selectedImage && location && date) {
      const newFinding: Finding = {
        id: findings.length + 1,
        imageUrl: previewUrl!,
        location,
        date,
      };
      setFindings([...findings, newFinding]);
      setShowUploadForm(false);
      setSelectedImage(null);
      setLocation("");
      setDate(new Date());
      setPreviewUrl(null);
    }
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
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
}; 