import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box component="footer" sx={{ mt: 4, py: 3, textAlign: "center", color: "text.secondary" }}>
      <Typography variant="body2">© {new Date().getFullYear()} LinkedIn Clone</Typography>
    </Box>
  );
};

export default Footer;
