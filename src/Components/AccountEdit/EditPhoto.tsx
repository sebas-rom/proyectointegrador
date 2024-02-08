import { useEffect, useState } from "react";
import {
  auth,
  uploadProfilePicture,
} from "../../Contexts/Session/Firebase.tsx";
import noAvatar from "../../assets/noAvatar.webp";
import Cropper from "react-easy-crop";
import { Button, Container } from "@mui/material";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import { useError } from "../../Contexts/Error/ErrorContext.tsx";
import { useTheme } from "@mui/material/styles";
import { useLoading } from "../../Contexts/Loading/LoadingContext.tsx";
import CreateIcon from "@mui/icons-material/Create";

function EditPhoto() {
  // Authentication and theme
  const currentUser = auth.currentUser;
  const theme = useTheme();
  const { showError } = useError();
  const { setLoading } = useLoading();

  // State variables
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL);
  const [photo, setPhoto] = useState(null);

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
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
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
  const handleUpload = async () => {
    if (croppedAreaPixels) {
      const tempCrop = await getCroppedImg();

      try {
        // Set uploading state to true when upload starts
        setLoading(true);

        // Wait for the upload to complete before updating the UI
        await uploadProfilePicture(tempCrop);

        // Update photoURL after a successful upload
        const updatedUser = auth.currentUser;
        setPhotoURL(updatedUser.photoURL);
      } catch (error) {
        showError("Error uploading file", error.code);
        // Handle the error and update the UI accordingly
      } finally {
        // Set uploading state to false when upload completes (whether successful or not)
        setLoading(false);

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
    // Reset state when the cancel button is clicked
    setPhoto(null);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
    setZoom(1);
    setCroppedImage(null);
  };
  return (
    <>
      {/* Cropper and controls */}
      {photo && (
        <>
          <Container
            sx={{
              top: 0,
              left: 0,
              right: 0,
              height: "90%",
              position: "absolute",
              zIndex: 99,
              minWidth: "100%",
            }}
          >
            <Cropper
              image={URL.createObjectURL(photo)}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </Container>

          {/* Controls container */}
          <Container
            sx={{
              bottom: 0,
              left: 0,
              right: 0,
              height: "10%",
              position: "absolute",
              backgroundColor: theme.palette.background.paper,
              zIndex: 99,
              minWidth: "100%",
            }}
          >
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
              height={"100%"}
            >
              {/* Cancel button */}
              <Button
                onClick={handleCancel}
                color="secondary"
                variant="outlined"
              >
                X
              </Button>

              {/* Zoom slider */}
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

              {/* Upload button */}
              <Button
                onClick={handleUpload}
                variant="contained"
                color="primary"
              >
                Ok
              </Button>
            </Stack>
          </Container>
        </>
      )}

      {/* Display user's avatar */}

      <Stack
        direction="column"
        alignItems="center"
        spacing={2}
        position="relative"
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={
              croppedImage
                ? URL.createObjectURL(croppedImage)
                : photoURL || noAvatar
            }
            alt="Avatar"
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              objectFit: "contain",
              border: "2px solid lightgray",
            }}
          />

          <Button
            variant="contained"
            component="label"
            sx={{
              borderRadius: "50%",
              maxHeight: "45px",
              maxWidth: "45px",
              minHeight: "45px",
              minWidth: "45px",
              position: "absolute",
              top: 0,
              right: 0,
            }}
          >
            <input type="file" hidden onChange={handleFileChange} />
            <CreateIcon />
          </Button>
        </div>
      </Stack>
    </>
  );
}

export default EditPhoto;
