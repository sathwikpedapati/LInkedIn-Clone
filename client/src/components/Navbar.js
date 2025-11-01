import React, { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from "@mui/material";
import API from "../api";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Fetch current user details when Navbar mounts
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        // Ignore fetch errors (e.g., missing or expired token)
      }
    };
    fetchMe();
  }, []);

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      color="primary"
      elevation={2}
      sx={{
        backgroundColor: "#1976d2", // Default MUI blue shade
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
        }}
      >
        {/* === Logo / App Name === */}
        <Typography
          variant="h6"
          component={RouterLink}
          to="/feed"
          color="inherit"
          sx={{
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "1.1rem",
            letterSpacing: 0.8,
          }}
        >
          LinkedIn
        </Typography>

        {/* === Spacer === */}
        <Box sx={{ flexGrow: 1 }} />

        {/* === User Section === */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {/* Profile Avatar */}
          <Avatar
            component={RouterLink}
            to="/profile"
            src={user?.profilePic}
            alt={user?.username || "User"}
            sx={{
              width: 34,
              height: 34,
              bgcolor: "secondary.main",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Button
            color="inherit"
            component={RouterLink}
            to={`/feed?userId=${user?._id || user?.id || ""}`}
            sx={{
              fontSize: "0.85rem",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            My Posts
          </Button>

          {/* Logout Button */}
          <Button
            color="inherit"
            onClick={logout}
            sx={{
              fontSize: "0.85rem",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
