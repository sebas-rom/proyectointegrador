import { useEffect, useState } from "react";
import { auth, upload } from "../Contexts/Session/Firebase.tsx";
import noAvatar from "../assets/noAvatar.webp";
import Cropper from "react-easy-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@mui/material";
import "./MyAccount.css";
import CircularProgress from "@mui/material/CircularProgress";
import { useError } from "../Contexts/Error/ErrorContext.tsx";
import Slider from "@mui/material/Slider";

function MyAccount() {
  const currentUser = auth.currentUser;
  const { showError } = useError();
  // State variables
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Cropping state variables
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [croppedImage, setCroppedImage] = useState(null);

  // Effect to update photoURL when currentUser changes
  useEffect(() => {
    if (currentUser?.photoURL) {
      setPhotoURL(currentUser.photoURL);
    }
  }, [currentUser]);

  // Handle crop completion
  const onCropComplete = (_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Handle file selection
  const handleChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
      setLoading(true);
    }
  };

  // Get cropped image asynchronously
  const getCroppedImg = async () => {
    try {
      const croppedImageBlob = await getCroppedImgBlob(
        photo,
        croppedAreaPixels
      );
      setCroppedImage(croppedImageBlob);
      return croppedImageBlob;
    } catch (error) {
      console.error("Error getting cropped image:", error);
    }
  };

  // Get cropped image blob
  const getCroppedImgBlob = (image, croppedAreaPixels) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(image);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const { width, height } = croppedAreaPixels;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(
          img,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          width,
          height
        );

        // Use the WebP format for better compression
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/webp",
          0.9
        ); // Adjust the quality parameter if needed
      };

      img.onerror = (error) => reject(error);
    });
  };

  // Handle click for uploading cropped image
  const handleClick = async () => {
    if (croppedAreaPixels) {
      const tempCrop = await getCroppedImg();

      try {
        // Set uploading state to true when upload starts
        setUploading(true);

        // Wait for the upload to complete before updating the UI
        await upload(tempCrop, currentUser);

        // Update photoURL after successful upload
        const updatedUser = auth.currentUser;
        setPhotoURL(updatedUser.photoURL);
      } catch (error) {
        showError("Error uploading file", error.code);
        // Handle the error and update the UI accordingly
      } finally {
        // Set uploading state to false when upload completes (whether successful or not)
        setUploading(false);

        // Reset state
        setCrop({ x: 0, y: 0 });
        setCroppedAreaPixels(null);
        setZoom(1);
        setPhoto(null);
      }
    } else {
      // Handle case when no cropping has been performed
      console.warn("No cropping has been performed.");
    }
  };

  // Handle click for cancel button
  const handleCancel = () => {
    // Reset state when cancel button is clicked
    setPhoto(null);
    setLoading(false);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
    setZoom(1);
    setCroppedImage(null);
  };
  // Render component
  return (
    <>
      {/* File selection button */}
      <Button variant="contained" component="label">
        Change photo
        <input type="file" hidden onChange={handleChange} />
      </Button>

      {/* Cropper and controls */}
      {photo && (
        <>
          {uploading && (
            <div className="overlay">
              <CircularProgress size={50} />
            </div>
          )}
          <div className="crop-container">
            <Cropper
              image={URL.createObjectURL(photo)}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="controls">
            <Button onClick={handleCancel} color="secondary" variant="outlined">
              X
            </Button>

            <Slider
              value={zoom}
              min={1}
              max={4}
              step={0.05}
              aria-labelledby="Zoom"
              onChange={(_e, value) => setZoom(Number(value))}
              className="zoom-slider"
              sx={{ margin: "0 20px", maxWidth: "40%" }}
            />

            <Button onClick={handleClick} variant="contained" color="primary">
              Ok
            </Button>
          </div>
        </>
      )}

      {/* Display user's avatar */}
      <img
        src={
          croppedImage
            ? URL.createObjectURL(croppedImage)
            : photoURL || noAvatar
        }
        alt="Avatar"
        className="avatarBigImg"
      />
    </>
  );
}

export default MyAccount;
