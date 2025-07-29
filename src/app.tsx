import { Button, Select } from "@canva/app-ui-kit";
import { upload } from "@canva/asset";
import { addElementAtPoint } from "@canva/design";
import { useState } from "react";
import * as styles from "styles/components.css";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export const App = () => {
  // Set default platform and type
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [selectedType, setSelectedType] = useState("Post");
  const [showPreview, setShowPreview] = useState(true);

  // Map each platform and type to a different image URL
  const platformTypeImages = {
    Instagram: {
      Post: "https://i.ibb.co/xKB5QFKH/Instagram-Post.png",
      Story: "https://i.ibb.co/rGDS6cBZ/Instagram-Story.png",
      Reel: "https://i.ibb.co/jPLgHhW0/Instagram-Reel.png",
    },
    Twitter: {
      Post: "https://i.ibb.co/PsdFrzVB/Twitter-Post.png",
      Cover: "https://i.ibb.co/wj0R63R/Twitter-Cover.png",
    },
    Linkedin: {
      Post: "https://i.ibb.co/1B6GwL1/Linked-In-Post.png",
      Video: "https://i.ibb.co/jPLgHhW0/Instagram-Reel.png",
      Cover: "https://i.ibb.co/WNvY8VFm/Linked-In-Banner.png",
    },
  };

  const socialMediaOptions = [
    {
      value: "Instagram",
      label: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "18px",
          }}
        >
          <FaInstagram style={{ color: "#E4405F", fontSize: "24px" }} />
          <span style={{ fontWeight: "bold" }}>Instagram</span>
        </div>
      ),
    },
    {
      value: "Linkedin",
      label: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "18px",
          }}
        >
          <FaLinkedin style={{ color: "#1877F2", fontSize: "24px" }} />
          <span style={{ fontWeight: "bold" }}>LinkedIn</span>
        </div>
      ),
    },
    {
      value: "Twitter",
      label: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "18px",
          }}
        >
          <FaXTwitter style={{ color: "#1DA1F2", fontSize: "24px" }} />
          <span style={{ fontWeight: "bold" }}>X</span>
        </div>
      ),
    },
  ];

  const handlePlatformChange = (value) => {
    setSelectedPlatform(value);
    setSelectedType(""); // Reset type when changing platform
    setShowPreview(false); // Reset preview when changing platform
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setShowPreview(true);
  };

  const handleAddToDesign = async () => {
    const imageUrl = platformTypeImages[selectedPlatform][selectedType];
    try {
      console.log("Uploading image:", imageUrl);
      const result = await upload({
        type: "image",
        mimeType: "image/png",
        url: imageUrl,
        thumbnailUrl: imageUrl
      });
      console.log("Upload result:", result);

      if (!result || !result.ref) {
        throw new Error("Invalid upload result");
      }

      await addElementAtPoint({
        type: "image",
        ref: result.ref,
        altText: {
          text: `Uploaded ${selectedType} image for ${selectedPlatform}`,
          decorative: false,
        },  
      });
      console.log("Image added to design");
    } catch (error) {
      console.error("Error adding image:", error);
    }
  };

  return (
    <div className={styles.scrollContainer}>
      <div className={styles}>
        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "15px",
          }}
        >
          Select Platform
        </p>
        <div className={styles.dropdownContainer}>
          <Select
            label="Select Platform"
            value={selectedPlatform}
            options={socialMediaOptions}
            onChange={handlePlatformChange}
          />
        </div>

        {selectedPlatform && (
          <div className={styles.buttonContainer}>
            {Object.keys(platformTypeImages[selectedPlatform]).map((type) => (
              <Button
                key={type}
                className={styles.button}
                onClick={() => handleTypeSelect(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        )}

        {showPreview && selectedPlatform && selectedType && (
          <div className={styles.previewContainer}>
            <img
              src={platformTypeImages[selectedPlatform][selectedType]}
              alt="Preview"
              className={styles.previewImage}
            />
            <Button
              className={styles.addButton}
              onClick={handleAddToDesign}
              style={{
                marginTop: "26px",
                padding: "12px 24px",
                backgroundColor: "#3498DB",
                color: "#0910",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              Add to Design
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
