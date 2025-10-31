import React, { useEffect, useMemo, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Avatar,
  Stack,
  Typography,
  Dialog,
  DialogContent,
} from "@mui/material";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const previewSrc = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return user?.profilePic || "";
  }, [file, user]);

  const loadMe = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
      setUsername(res.data.username || "");
      setEmail(res.data.email || "");
    } catch (e) {}
  };

  useEffect(() => {
    loadMe();
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("username", username);
      fd.append("email", email);
      if (file) fd.append("profilePic", file);
      const res = await API.put("/auth/me", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data);
      setFile(null);
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 3 }}>
        <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textAlign: "center" }}>
            Your Profile
          </Typography>
          <Stack spacing={2} alignItems="center" sx={{ width: "100%" }}>
            <Avatar
              src={user?.profilePic}
              sx={{ width: 96, height: 96, cursor: previewSrc ? "pointer" : "default" }}
              onClick={() => previewSrc && setPreviewOpen(true)}
            >
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ width: "100%", maxWidth: "400px" }}>
              <TextField
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="outlined"
                size="small"
                component="label"
                fullWidth
              >
                {file ? "Change Selected Picture" : "Upload New Picture"}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </Button>
              {file && (
                <Typography
                  variant="caption"
                  display="block"
                  textAlign="center"
                  sx={{ mt: 1 }}
                >
                  Selected: {file.name}
                </Typography>
              )}
              <Button
                variant="contained"
                onClick={onSave}
                disabled={saving}
                fullWidth
                sx={{ mt: 2 }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
      <Footer />
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          {previewSrc ? (
            <img
              src={previewSrc}
              alt="Profile preview"
              style={{ width: "100%", height: "auto", display: "block" }}
              onLoad={() => {
                if (file) URL.revokeObjectURL(previewSrc);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Profile;
