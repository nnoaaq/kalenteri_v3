import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrapin tyylit käyttöön
import "./App.css";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { MdErrorOutline } from "react-icons/md";
import { CiCircleCheck } from "react-icons/ci";
import { useState } from "react";
import { useEffect } from "react";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const apiServer = "http://localhost:3000";
  useEffect(() => {
    const checkTokens = async () => {
      const tokensExistsRes = await fetch(
        apiServer + "/authenticate/verifyTokensExists",
      );
      setIsAuthenticated(tokensExistsRes.ok); // true/false vastaus
    };
    checkTokens();
  }, []); // Sivulle tultaessa tarkistetaan onko tokenit tallennettu
  async function authenticateGoogle() {
    // Siirrytään Googlen sivuille antamaan oikeudet sovellukselle. Taustalla luodaan authUrl sekä onnistuneen kirjautumisen jälkeen tallennetaan saadut tokenit sessioniin
    try {
      const authUrlRes = await fetch(apiServer + "/authenticate/createUrl");
      const authUrl = await authUrlRes.text();
      window.location.href = authUrl;
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <Container
      className="d-flex justify-content-center align-items-center h-100 "
      fluid
    >
      <Card className="p-4 shadow-sm">
        <h3 className="">Tallenna työvuorot kalenteriin</h3>
        <Container className="p-0 border-bottom">
          {isAuthenticated ? (
            <Container className="d-flex justify-content-between p-0 ">
              <p className="mb-1">
                <CiCircleCheck color="green" />
                Yhteys Googleen muodostettu
              </p>
            </Container>
          ) : (
            <Container className="d-flex justify-content-between p-0 ">
              <p className="mb-1">
                <MdErrorOutline color="red" />
                Ei yhteyttä Googleen
              </p>
              <Button
                variant="outline-primary"
                onClick={() => authenticateGoogle()}
              >
                Tunnistaudu
              </Button>
            </Container>
          )}
        </Container>
        <Form>
          <Form.Group>
            <Form.Label>Valitse PDF-tiedosto</Form.Label>
            <Form.Control required type="file"></Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Valitse kalenteri</Form.Label>
            <Form.Select>
              <option value="mari">Mari</option>
              <option value="noa">Noa</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="d-grid gap-2 mt-2">
            <Button disabled={!isAuthenticated}>Tallenna</Button>
          </Form.Group>
        </Form>
      </Card>
    </Container>
  );
}

export default App;
