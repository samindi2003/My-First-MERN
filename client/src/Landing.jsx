import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-transparent text-center">
      <div className="p-5" style={{ maxWidth: "500px" }}>
        <h1 className="display-4 fw-bold mb-5 text-primary">
            My First MERN Project  🚀    
        </h1>
        <Link 
          to="/login" 
          className="btn btn-primary btn-lg px-5 py-2 fw-bold shadow-sm"
        >
          Login to continue
        </Link>
      </div>
    </div>
  );
}

export default Landing;