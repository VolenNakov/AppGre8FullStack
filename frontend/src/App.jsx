/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Button,
  Container,
  ImageList,
  IconButton,
  ImageListItem,
  ImageListItemBar,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import "./App.css";

const ImageGallery = ({ images, deleteImage }) => (
  <ImageList sx={{ width: 1200, height: 700 }} cols={3} gap={12}>
    {images.map((image) => (
      <ImageListItem key={image.id} gap={5}>
        <img src={image.src} alt={image.title} loading="lazy" />
        <ImageListItemBar
          sx={{ color: "black" }}
          title={image.title}
          subtitle={<span>Description: {image.description}</span>}
          actionIcon={
            <IconButton onClick={() => deleteImage(image.id)} aria-label={`delete ${image.title}`}>
              <DeleteIcon />
            </IconButton>
          }
          position="below"
        />
      </ImageListItem>
    ))}
  </ImageList>
);

const UploadDialog = ({ showDialog, handleClose, handleImageSelect, handleTitleChange, handleDescriptionChange, uploadFile }) => (
  <Dialog open={showDialog} onClose={handleClose}>
    <DialogTitle>Upload image</DialogTitle>
    <DialogContent>
      <form
        id="uploadImage"
        onSubmit={(e) => {
          e.preventDefault();
          uploadFile();
        }}>
        <TextField
          onChange={handleTitleChange}
          autoFocus
          required
          margin="dense"
          id="title"
          name="title"
          label="Title"
          type="text"
          fullWidth
          variant="standard"
        />
        <TextField
          onChange={handleDescriptionChange}
          required
          margin="dense"
          id="description"
          name="description"
          label="Description"
          type="text"
          fullWidth
          variant="standard"
        />
        <TextField
          onChange={handleImageSelect}
          inputProps={{ accept: "image/*" }}
          required
          margin="dense"
          id="image"
          name="image"
          label="Image"
          type="file"
          fullWidth
          variant="standard"
        />
      </form>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Cancel</Button>
      <Button type="submit" form="uploadImage">
        Upload
      </Button>
    </DialogActions>
  </Dialog>
);

function App() {
  const [page, setPage] = useState(1);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageTitle, setImageTitle] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [showDialog, setShowDialog] = useState(false);

  const fetchImages = async (page) => {
    const res = await axios.post("http://127.0.0.1:3000/images/", { pageNumber: page });
    const { images, paging } = res.data;

    setImages(images.map((image) => ({ ...image, src: `http://127.0.0.1:3000/image/${image.id}` })));
    setTotalPages(paging.pageCount);
  };

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("image", selectedImage, selectedImage.name);
    formData.append("title", imageTitle);
    formData.append("description", imageDescription);

    await axios.post("http://127.0.0.1:3000/upload", formData);
    fetchImages(page);
    setShowDialog(false);
  };

  const deleteImage = async (id) => {
    await axios.delete(`http://127.0.0.1:3000/${id}`);
    fetchImages(page);
  };

  const changePage = (event, value) => {
    setPage(value);
  };

  useEffect(() => {
    fetchImages(page);
  }, [page]);

  return (
    <Container>
      <ImageGallery images={images} deleteImage={deleteImage} />
      <Button component="label" variant="outlined" onClick={() => setShowDialog(true)} startIcon={<UploadFileIcon />} sx={{ marginRight: "1rem" }}>
        Upload Image
      </Button>
      <Pagination count={totalPages} page={page} size="large" variant="outlined" shape="rounded" onChange={changePage} />
      <UploadDialog
        showDialog={showDialog}
        handleClose={() => setShowDialog(false)}
        handleImageSelect={(e) => setSelectedImage(e.target.files[0])}
        handleTitleChange={(e) => setImageTitle(e.target.value)}
        handleDescriptionChange={(e) => setImageDescription(e.target.value)}
        uploadFile={uploadFile}
      />
    </Container>
  );
}

export default App;
