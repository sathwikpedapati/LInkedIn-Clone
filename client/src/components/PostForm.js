import React, { useState } from "react";
import API from "../api";
import {
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Stack,
} from "@mui/material";

const PostForm = ({ onPostCreated }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    if (file) fd.append("coverImage", file);
    await API.post("/posts", fd, { headers: { "Content-Type": "multipart/form-data" } });
    setForm({ title: "", description: "" });
    setFile(null);
    onPostCreated();
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Create a Post
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="What's on your mind?"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            required
          />

          <Button variant="outlined" component="label">
            Upload Image
            <input hidden type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </Button>
          {file && (
            <Typography variant="caption">Selected: {file.name}</Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ alignSelf: "flex-end", width: "120px" }}
          >
            Post
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default PostForm;
