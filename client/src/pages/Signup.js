import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";

const Signup = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("username", form.username);
      fd.append("email", form.email);
      fd.append("password", form.password);
      if (file) fd.append("profilePic", file);
      const res = await API.post("/auth/signup", fd, { headers: { "Content-Type": "multipart/form-data" } });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/feed";
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 409) {
        setError(msg || "Email already in use");
      } else if (msg) {
        setError(msg);
      } else {
        setError("Failed to sign up. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 3,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Avatar
          sx={{
            m: "auto",
            bgcolor: "primary.main",
            width: 56,
            height: 56,
          }}
        >
          <PersonAddAlt1Icon fontSize="medium" />
        </Avatar>

        <Typography variant="h5" sx={{ mt: 2, mb: 3, fontWeight: 600 }}>
          Create Account
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            name="username"
            variant="outlined"
            onChange={handleChange}
            value={form.username}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            onChange={handleChange}
            value={form.email}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            onChange={handleChange}
            value={form.password}
            required
          />

          <Button variant="outlined" size="small" component="label" sx={{ mt: 1 }}>
            Upload Profile Picture
            <input hidden type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </Button>
          {file && (
            <Typography variant="caption">Selected: {file.name}</Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, py: 1.2, fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
          </Button>

          <Typography variant="body2">
            Already have an account?{" "}
            <Button variant="text" onClick={() => navigate("/login")}>
              Login
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Signup;

