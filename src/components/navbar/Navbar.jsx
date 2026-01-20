import * as React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";

// Stylesheets
import "./Navbar.css";

// TODO: Replace logo with our own logo.

// TODO: Replace Nav links with our own nav links.
const pages = [];
const settings = ["Profile", "Account", "Dashboard"];

function Navbar() {
  const navigate = useNavigate();
  const { user, setUser, setJwt } = useAuth ? useAuth() : { user: null };
    // Logout handler
    const handleLogout = () => {
      if (setUser) setUser(null);
      if (setJwt) setJwt(null);
      handleCloseUserMenu();
      // Optionally, redirect to home or login page
      window.location.href = "/";
    };
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // console.log("Hello World");

  return (
    <AppBar position="static" sx={{ backgroundColor: "#0B2C4A" }}>
      {/* <Container maxWidth="xl"> */}
      <Toolbar disableGutters className="tool-bar">
        <img
          src="/images/image.png"
          alt="logo"
          style={{ height: 64, marginRight: 16, cursor: "pointer", display: { xs: "none", md: "flex" } }}
          onClick={() => navigate("/")}
        />
        <Typography
          variant="subtitle1"
          noWrap
          component="span"
          onClick={() => navigate("/")}
          sx={{
            mr: 2,
            display: { xs: "none", md: "flex" },
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
            cursor: "pointer",
            fontSize: { md: "1.25rem", lg: "1.35rem" },
          }}
        >
          GroundCTRL
        </Typography>

        <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            {/* No nav links */}
          </Menu>
        </Box>
        <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
        <Typography
          variant="subtitle1"
          noWrap
          component="span"
          onClick={() => navigate("/")}
          sx={{
            mr: 2,
            display: { xs: "flex", md: "none" },
            flexGrow: 1,
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
            cursor: "pointer",
            fontSize: { xs: "1.08rem", sm: "1.18rem" },
          }}
        >
          LOGO
        </Typography>
        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
          {/* No nav links */}
        </Box>
        <Box sx={{ flexGrow: 0 }}>
          {user ? (
            <>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  {/* Show user's first initial if available, else fallback */}
                  <Avatar sx={{ bgcolor: "#1976d2" }}>
                    {user && user.firstName ? user.firstName[0].toUpperCase() : "U"}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography sx={{ textAlign: "center" }}>{setting}</Typography>
                  </MenuItem>
                ))}
                <MenuItem onClick={handleLogout}>
                  <Typography sx={{ textAlign: "center", color: "red" }}>Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          ) : null}
        </Box>
      </Toolbar>
      {/* </Container> */}
    </AppBar>
  );
}
export default Navbar;
