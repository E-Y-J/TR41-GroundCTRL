import { Container, Navbar } from "react-bootstrap";

import "./Footer.css";

function Footer() {
  return (
    <Container>
      <Navbar expand="lg" className="bg-body-tertiary footer" fixed="bottom">
        <Navbar.Brand className="footer-brand" href="#">
          <img
            src="/images/image.png"
            alt="logo"
            style={{
              height: 32,
              marginRight: 8,
              verticalAlign: "middle",
            }}
          />
          GroundCTRL
        </Navbar.Brand>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 20, color: "#fff" }}>&copy;</span>
        </div>
      </Navbar>
    </Container>
  );
}

export default Footer;
