// Bootstrap Components
import { Card } from "react-bootstrap";

// Stylesheets
import "./Intro.css";

function Intro() {
  return (
    <Card className="intro-card">
      <Card.Body>
        <Card.Title>Welcome Future Pilots</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Virtual Flight Simulator</Card.Subtitle>
        <Card.Text>
          GroundCTRL is a browser-based training simulator that introduces users to the fundamentals of satellite
          operations through interactive, guided missions. Players manage a virtual Earth-orbiting satellite using a
          simplified mission console, real-time AI guidance, and structured objectives that blend learning with
          gameplay.
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default Intro;
