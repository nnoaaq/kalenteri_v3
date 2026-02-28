import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrapin tyylit käyttöön
import "./App.css";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { MdErrorOutline } from "react-icons/md";
import { CiCircleCheck } from "react-icons/ci";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { useState } from "react";
import { useEffect } from "react";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);
  const [showError, setShowError] = useState(false);
  const [pdf, setPdf] = useState(false);
  const [calendar, setCalendar] = useState("mari");
  const apiServer = "http://localhost:3000";

  let errorMessages = {
    tokens: "Palvelinvirhe tokenien haussa",
    pdf: "Valitse PDF-tiedosto",
    pdfText: "Virhe tiedoston käsittelyssä",
    workDays: "Tiedostosta ei löytynyt työpäiviä",
  };
  useEffect(() => {
    const checkTokens = async () => {
      const tokensExistsRes = await fetch(
        apiServer + "/authenticate/verifyTokensExists",
      );
      setIsAuthenticated(tokensExistsRes.ok); // true/false vastaus
    };
    checkTokens();
    let params = new URLSearchParams(document.location.search);

    if (params.has("error")) {
      setError(params.get("error"));
      setShowError(true);
    }
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
  async function verifyFormSubmit(e) {
    // Tarkistetaan että tiedot löytyvät, ja lähetetään eteenpäin
    // (button on disabled jos ei voi lähettää, mutta tarkistetaan silti)
    e.preventDefault();
    const submittedPdf = pdf;
    const choosenCalendar = calendar;
    if (!submittedPdf) {
      window.location.href = "/?error=pdf";
      return;
    }
    setShowError(false);
    const data = new FormData();
    data.append("file", submittedPdf);
    data.append("choosenCalendar", choosenCalendar);
    // Valmiina lähetykseen
    try {
      const sentPdf = await fetch(apiServer + "/pdf/add", {
        method: "POST",
        body: data,
      });
      if (!sentPdf.ok) window.location.href = "/?error=workDays";
      const addedWorkDays = await sentPdf.json(); // Palautetut tiedot = lista lisätyistä työpäivistä
      console.log(addedWorkDays); // LISTA LISÄTYISTÄ TYÖPÄIVISTÄ date,lines kentät
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <Container
      className="d-flex flex-column justify-content-center align-items-center h-100 "
      fluid
    >
      <Card className="p-4 shadow-sm">
        {showError && (
          <Alert
            className="d-flex justify-content-between align-items-center"
            variant="warning"
          >
            {errorMessages[error]}
            <IoMdCloseCircleOutline
              size={20}
              color="red"
              onClick={() => setShowError(false)}
            />
          </Alert>
        )}
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
            <Form.Control
              required
              type="file"
              onChange={(e) => setPdf(e.target.files[0])}
            ></Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Valitse kalenteri</Form.Label>
            <Form.Select onChange={(e) => setCalendar(e.target.value)}>
              <option value="mari">Mari</option>
              <option value="noa">Noa</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="d-grid gap-2 mt-2">
            <Button
              disabled={!isAuthenticated}
              onClick={(e) => verifyFormSubmit(e)}
              type="submit"
            >
              Tallenna
            </Button>
          </Form.Group>
        </Form>
      </Card>
    </Container>
  );
}

export default App;
