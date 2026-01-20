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
          gameplay. Designed for space enthusiasts, students, and new operators, the platform provides visual feedback,
          step-by-step tutorials, and progress tracking. The simulator runs in modern desktop browsers and aims to
          make satellite operations education engaging, accessible, and beginner-friendly.
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default Intro;
