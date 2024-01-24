import React, { useEffect, useState } from "react";
import { auth, upload } from "../Contexts/Session/Firebase.tsx";
import noAvatar from "../assets/noAvatar.webp";
import Cropper from "react-easy-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@mui/material";
import "./MyAccount.css";
import getCroppedImg from "./CropImage.js";

function MyAccount() {
  const currentUser = auth.currentUser;

  const [imageUploaded, setImageUploaded] = useState(false);
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [zoom, setZoom] = useState(1);

  const [croppedImage, setCroppedImage] = useState(null);

  useEffect(() => {
    if (currentUser?.photoURL) {
      setPhotoURL(currentUser.photoURL);
    }
  }, [currentUser]);

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    // console.log(croppedArea, croppedAreaPixels);
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
      setLoading(true);
    }
  };

  // const handleClick = async () => {
  //   // Perform cropping here before uploading
  //   await upload(croppedImage, currentUser, setLoading);
  //   setImageUploaded(true);
  //   setLoading(false);
  // };

  const handleClick = async () => {
    if (photo) {
      try {
        const croppedImage = await getCroppedImg(photo, croppedAreaPixels, 0);
        console.log("donee", { croppedImage });
        setCroppedImage(croppedImage);

        // Upload the cropped image
        await upload(croppedImage, currentUser, setLoading);

        // Update the imageUploaded state
        setImageUploaded(true);
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleImageLoaded = (image) => {
    // You can perform additional actions when the image is loaded
    console.log("Image loaded:", image);
  };

  return (
    <>
      <Button variant="contained" component="label">
        Select File
        <input type="file" hidden onChange={handleChange} />
      </Button>
      <Button disabled={!loading} onClick={handleClick} variant="outlined">
        Upload
      </Button>

      {photo && !imageUploaded && (
        <>
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
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="zoom-range"
            />
            <Button onClick={handleClick} variant="contained" color="primary">
              Commit and Upload
            </Button>
          </div>
        </>
      )}

      <img
        src={
          croppedImage
            ? URL.createObjectURL(croppedImage)
            : photoURL || noAvatar
        }
        alt="Avatar"
        className="avatarNewBigImg"
      />
    </>
  );
}

export default MyAccount;
