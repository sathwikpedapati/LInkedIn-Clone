import React, { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from "@mui/material";
import API from "../api";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch (_) {}
    };
    fetchMe();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar position="sticky" color="primary" elevation={2}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
        }}
      >
        <Typography
          variant="h6"
          component={RouterLink}
          to="/feed"
          color="inherit"
          sx={{
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "1rem",
            letterSpacing: 0.5,
          }}
        >
          LinkedIn
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Avatar
            component={RouterLink}
            to="/profile"
            src={user?.profilePic}
            sx={{
              width: 32,
              height: 32,
              mr: 1,
              bgcolor: "secondary.main",
              fontSize: "0.9rem",
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>

          <Button
            color="inherit"
            component={RouterLink}
            to={`/feed?userId=${user?._id || user?.id || ""}`}
            sx={{
              fontSize: "0.8rem",
              textTransform: "none",
              mr: 1,
            }}
          >
            My Posts
          </Button>

          <Button
            color="inherit"
            onClick={logout}
            sx={{
              fontSize: "0.8rem",
              textTransform: "none",
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
